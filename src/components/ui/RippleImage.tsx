import { useEffect, useRef, useState } from "react";
import { useMediaQuery, useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

/**
 * A cover that answers the pointer with a ripple.
 *
 * Written as raw WebGL, which is a decision rather than an omission: this site
 * inlines every byte it ships and makes no external requests, so a library
 * would have to be inlined too — a few hundred kilobytes of scene graph for one
 * quad and twenty lines of shader.
 *
 * Three rules hold it inside the safety line, because a cover that fails is a
 * portfolio with a hole in it:
 *
 *   1. The `<img>` is always in the DOM and always painted. The canvas is an
 *      overlay on top of it. If the canvas never appears, never draws, or dies
 *      halfway, what is left is exactly the site as it was.
 *   2. Nothing mounts until the pointer arrives, and everything is torn down
 *      when it leaves — a browser allows a small number of live WebGL contexts
 *      (about sixteen), and a page of covers each holding one would exhaust
 *      them and start killing the oldest.
 *   3. Any failure at all is permanent for that cover: the flag flips and it is
 *      never tried again. A shader that fails to compile fails every time, and
 *      retrying it on every hover would spend the whole frame budget failing.
 *
 * Skipped entirely without a fine pointer (there is no hover to answer) and
 * under a reduced-motion preference.
 */

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  // The quad is drawn in clip space directly, so this is the whole geometry
  // step: two triangles covering the viewport, and the UV is the position
  // mapped from -1..1 into 0..1 with Y flipped for image orientation.
  v_uv = vec2((a_pos.x + 1.0) * 0.5, 1.0 - (a_pos.y + 1.0) * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform vec2 u_mouse;
uniform vec2 u_res;
uniform float u_time;
uniform float u_amp;
varying vec2 v_uv;

void main() {
  vec2 d = v_uv - u_mouse;
  // Corrected by the aspect ratio, or the rings come out as ellipses on a
  // plate that is half as tall as it is wide.
  d.x *= u_res.x / u_res.y;
  float dist = length(d);

  // A ring traveling outward from the pointer, dying off with distance so the
  // far corners of a large cover stay still.
  float wave = sin(dist * 26.0 - u_time * 3.6) * exp(-dist * 4.5);

  // 1e-5 so normalize() is not handed a zero vector at the exact pixel under
  // the pointer, which is NaN and paints as a black dot.
  vec2 dir = normalize(d + 1e-5);
  vec2 uv = v_uv + dir * wave * 0.016 * u_amp;

  gl_FragColor = texture2D(u_tex, uv);
}`;

/** Decoded covers, kept by src — the same cover appears on more than one page. */
const decoded = new Map<string, Promise<HTMLImageElement>>();

function load(src: string) {
  let p = decoded.get(src);
  if (!p) {
    p = new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image();
      // Same-origin either way — a path in the built site, a data: URI in the
      // single file — so this only matters if the art is ever served from a
      // CDN, where without it the texture upload would taint the canvas.
      img.crossOrigin = "anonymous";
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    });
    decoded.set(src, p);
  }
  return p;
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, source);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function RippleImage({
  src,
  alt,
  className,
  imgClassName,
  loading = "lazy",
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  loading?: "lazy" | "eager";
}) {
  const fine = useMediaQuery("(pointer: fine)");
  const calm = useReducedMotion();
  const [live, setLive] = useState(false);
  /** Flipped by any failure, and never flipped back. */
  const broken = useRef(false);
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  /** Pointer in 0..1 across the plate, read by the loop rather than by React. */
  const mouse = useRef({ x: 0.5, y: 0.5 });

  const enabled = fine && !calm;

  useEffect(() => {
    if (!live || !enabled) return;
    const el = canvas.current;
    const box = host.current;
    if (!el || !box) return;

    let raf = 0;
    let disposed = false;
    let gl: WebGLRenderingContext | null = null;
    let tex: WebGLTexture | null = null;
    let prog: WebGLProgram | null = null;
    let buf: WebGLBuffer | null = null;

    const fail = () => {
      broken.current = true;
      setLive(false);
    };

    // A context lost mid-hover is not an error to recover from here: drop back
    // to the image and stop. The plate keeps working because the image never
    // left.
    const onLost = (e: Event) => {
      e.preventDefault();
      fail();
    };
    el.addEventListener("webglcontextlost", onLost);

    (async () => {
      let img: HTMLImageElement;
      try {
        img = await load(src);
      } catch {
        return fail();
      }
      if (disposed) return;

      gl =
        (el.getContext("webgl", { alpha: true, antialias: false, depth: false }) as
          | WebGLRenderingContext
          | null) ?? null;
      if (!gl) return fail();

      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return fail();

      prog = gl.createProgram();
      if (!prog) return fail();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return fail();
      gl.useProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);

      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW
      );
      const loc = gl.getAttribLocation(prog, "a_pos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      // The covers are 1200x800 — not a power of two — so mipmaps and repeat
      // are both off the table. Clamping also means the ripple smears the edge
      // pixel rather than wrapping the far side of the picture into frame.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      } catch {
        return fail();
      }

      const uMouse = gl.getUniformLocation(prog, "u_mouse");
      const uRes = gl.getUniformLocation(prog, "u_res");
      const uTime = gl.getUniformLocation(prog, "u_time");
      const uAmp = gl.getUniformLocation(prog, "u_amp");

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const size = () => {
        const r = box.getBoundingClientRect();
        el.width = Math.max(1, Math.round(r.width * dpr));
        el.height = Math.max(1, Math.round(r.height * dpr));
        gl!.viewport(0, 0, el.width, el.height);
        gl!.uniform2f(uRes, el.width, el.height);
      };
      size();
      const ro = new ResizeObserver(size);
      ro.observe(box);

      const started = performance.now();
      let amp = 0;
      const draw = () => {
        if (disposed || !gl) return;
        // Eased in so the ripple arrives rather than snaps on under the cursor.
        amp += (1 - amp) * 0.08;
        gl.uniform1f(uTime, (performance.now() - started) / 1000);
        gl.uniform1f(uAmp, amp);
        gl.uniform2f(uMouse, mouse.current.x, mouse.current.y);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        raf = requestAnimationFrame(draw);
      };
      draw();

      cleanup = () => {
        ro.disconnect();
      };
    })();

    let cleanup = () => {};

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanup();
      el.removeEventListener("webglcontextlost", onLost);
      if (gl) {
        if (tex) gl.deleteTexture(tex);
        if (buf) gl.deleteBuffer(buf);
        if (prog) gl.deleteProgram(prog);
        // Hand the context back rather than waiting for the collector: the cap
        // is on live contexts, and a page of covers reaches it quickly.
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    };
  }, [live, enabled, src]);

  const track = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mouse.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  return (
    <div
      ref={host}
      className={cn("relative", className)}
      onMouseEnter={(e) => {
        track(e);
        if (enabled && !broken.current) setLive(true);
      }}
      onMouseMove={track}
      onMouseLeave={() => setLive(false)}
    >
      <img src={src} alt={alt} loading={loading} className={imgClassName} />
      {live && (
        <canvas
          ref={canvas}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      )}
    </div>
  );
}
