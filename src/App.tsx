import type { RouteRecord } from "vite-react-ssg";
import Layout from "@/components/Layout";
import Index from "./pages/Index";

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <Layout />,
    entry: "src/components/Layout.tsx",
    children: [
      { index: true, Component: Index, entry: "src/pages/Index.tsx" },
      {
        path: "portfolio",
        lazy: () => import("./pages/Portfolio").then((m) => ({ Component: m.default })),
        entry: "src/pages/Portfolio.tsx",
      },
      {
        path: "par-mani",
        lazy: () => import("./pages/ParMani").then((m) => ({ Component: m.default })),
        entry: "src/pages/ParMani.tsx",
      },
      {
        path: "kontakti",
        lazy: () => import("./pages/Kontakti").then((m) => ({ Component: m.default })),
        entry: "src/pages/Kontakti.tsx",
      },
      {
        path: "privatuma-politika",
        lazy: () =>
          import("./pages/PrivatumaPolitika").then((m) => ({ Component: m.default })),
        entry: "src/pages/PrivatumaPolitika.tsx",
      },
      {
        path: "*",
        lazy: () => import("./pages/NotFound").then((m) => ({ Component: m.default })),
        entry: "src/pages/NotFound.tsx",
      },
    ],
  },
];

export default routes;
