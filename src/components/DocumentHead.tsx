import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { identity, notes, projects, socials } from "@/data/site";

const SITE = (import.meta.env.VITE_SITE_URL ?? "https://zaylamonroe.com").replace(/\/+$/, "");

type Meta = { title: string; description: string; path: string };

const PAGES: Record<string, Omit<Meta, "path">> = {
  "/": {
    title: `${identity.name} — Creative Designer & Developer`,
    description: `${identity.name} is an independent creative designer and developer based in the Netherlands, working across brand, interface and motion.`,
  },
  "/about": {
    title: `About — ${identity.name}`,
    description: `Eight years of design and front-end work from Amsterdam, and what it has added up to.`,
  },
  "/projects": {
    title: `Projects — ${identity.name}`,
    description: `Seven pieces of work, each with the problem it started from and the numbers it moved.`,
  },
  "/playground": {
    title: `Playground — ${identity.name}`,
    description: `Off-cuts, studies, and things made for their own sake.`,
  },
  "/writing": {
    title: `Writing — ${identity.name}`,
    description: `Short technical notes: what broke, what it turned out to be, and what it is worth remembering.`,
  },
  "/contact": {
    title: `Contact — ${identity.name}`,
    description: `Tell me what you are building and where it is stuck. A short call is usually enough to work out whether I am the right person for it.`,
  },
};

/**
 * Keeps the document's title, description, canonical and structured data in
 * step with the route.
 *
 * Worth being straight about what this does and does not buy on a site whose
 * routes live in the hash. A crawler asking for `/#/about` requests `/` — the
 * fragment never reaches a server — so this is not what makes the pages
 * indexable, and nothing here pretends otherwise. What it does do is real:
 * browser tabs, history entries and bookmarks all say which page you are on
 * rather than repeating the site name five times, and a link pasted into a
 * chat app that reads the live document gets the right card. Behind a host
 * that serves the real paths, the same code is already correct.
 *
 * Written straight to the document rather than through a helmet library: this
 * is a handful of tags on one page at a time, and a dependency to manage them
 * would weigh more than the tags do.
 */
export function DocumentHead() {
  const { pathname } = useLocation();
  // Read from the path rather than useParams: this sits above <Routes>, where
  // no route has matched and params are empty. One regex keeps it there, out
  // of the page components, so every route is described in one place.
  const slug = pathname.match(/^\/(?:projects|writing)\/([a-z0-9-]+)$/)?.[1];
  const isNote = pathname.startsWith("/writing/");

  useEffect(() => {
    const note = slug && isNote ? notes.find((n) => n.slug === slug) : undefined;
    const project = slug && !isNote ? projects.find((p) => p.slug === slug) : undefined;

    const meta: Meta = note
      ? {
          title: `${note.title} — ${identity.name}`,
          description: note.standfirst,
          path: `/writing/${note.slug}`,
        }
      : project
      ? {
          title: `${project.title} — ${identity.name}`,
          description: `${project.lede} ${project.blurb}`,
          path: `/projects/${project.slug}`,
        }
      : {
          ...(PAGES[pathname] ?? {
            title: `Page not found — ${identity.name}`,
            description: "There is nothing at this address.",
          }),
          path: pathname,
        };

    document.title = meta.title;
    setMeta("name", "description", meta.description);
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:url", SITE + meta.path);
    setLink("canonical", SITE + meta.path);

    setJsonLd(
      note
        ? {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: note.title,
            description: note.standfirst,
            datePublished: note.date,
            articleSection: note.topic,
            url: SITE + meta.path,
            author: { "@type": "Person", name: identity.name },
          }
        : project
        ? {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: project.title,
            headline: project.lede,
            description: project.blurb,
            dateCreated: project.year,
            keywords: project.tags,
            url: SITE + meta.path,
            creator: { "@type": "Person", name: identity.name, jobTitle: identity.role },
          }
        : {
            "@context": "https://schema.org",
            "@type": "Person",
            name: identity.name,
            jobTitle: identity.role,
            email: `mailto:${identity.email}`,
            url: SITE,
            address: { "@type": "PostalAddress", addressLocality: "Amsterdam", addressCountry: "NL" },
            // The accounts that are actually configured, and only those — an
            // empty string in `sameAs` is a claim to a profile that is not there.
            sameAs: socials.map((s) => s.href).filter(Boolean),
            knowsAbout: ["Brand identity", "Interface design", "Motion design", "Front-end development"],
          }
    );
  }, [pathname, slug, isNote]);

  return null;
}

function setMeta(keyName: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${keyName}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(keyName, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/** One block, replaced each time, so routes never leave their data behind. */
function setJsonLd(data: unknown) {
  const id = "route-jsonld";
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}
