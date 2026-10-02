import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  // GitHub Pages serves project sites under a subpath (e.g. /repo-name/).
  // Vite exposes it via BASE_URL; default builds use "/" so basepath stays default.
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");

  const router = createRouter({
    routeTree,
    context: { queryClient },
    ...(base ? { basepath: base } : {}),
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
