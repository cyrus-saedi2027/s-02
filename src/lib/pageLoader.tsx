import { useEffect, useState, type ComponentType } from "react";

/**
 * A lazily-loaded page that renders synchronously once it has been fetched.
 *
 * `React.lazy` cannot do this, and the difference matters here. Its factory
 * returns a promise, so the first render of a lazy component always suspends
 * for at least a microtask — even when the module is already in the bundler's
 * cache and nothing needs fetching. Inside `flushSync` React cannot wait for a
 * microtask, so it commits the Suspense fallback instead.
 *
 * That is fatal to the shared-element transition. The View Transitions API
 * captures the new state the moment the commit returns; with a fallback
 * committed, what it captured was an empty screen — the browser reported the
 * incoming page as 1539px tall against the 6000px it actually is, and the
 * cover had nowhere to travel to. Preloading the chunk beforehand did not
 * help, because the chunk was never what was missing: `lazy`'s own promise
 * was.
 *
 * So the module is stored when it arrives, and once stored the wrapper returns
 * the real component on its first render with no promise in the way. `preload`
 * is what the shell calls before starting a transition.
 */
export function pageLoader<P extends object>(factory: () => Promise<{ default: ComponentType<P> }>) {
  let Loaded: ComponentType<P> | null = null;
  let pending: Promise<ComponentType<P>> | null = null;

  const preload = () => {
    if (Loaded) return Promise.resolve(Loaded);
    pending ??= factory().then((m) => {
      Loaded = m.default;
      return m.default;
    });
    return pending;
  };

  function Page(props: P) {
    // Re-render once the module lands. Starts at whatever is already loaded,
    // so a page reached a second time never flickers through the placeholder.
    const [Comp, setComp] = useState<ComponentType<P> | null>(() => Loaded);

    useEffect(() => {
      if (Comp) return;
      let live = true;
      void preload().then((c) => live && setComp(() => c));
      return () => {
        live = false;
      };
    }, [Comp]);

    // One screen of nothing rather than a spinner: on a cold load of a deep
    // link the preloader is still up, and a route change is covered by the
    // transition, so this is only ever seen when a chunk is genuinely slow.
    if (!Comp) return <div className="min-h-screen" />;
    return <Comp {...props} />;
  }

  Page.preload = preload;
  return Page;
}
