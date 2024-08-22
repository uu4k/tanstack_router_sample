import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import {
  Outlet,
  RouterProvider,
  Link,
  createRouter,
  createRoute,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <div>
        <Link to="/">index</Link>|<Link to="/about">about</Link>|
        <Link to="/posts">posts</Link>
      </div>
      <hr />
      <Outlet />
      {/* developmentだけ出す仕組みがたぶん必要 */}
      <TanStackRouterDevtools />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => {
    return <div>index</div>;
  },
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: () => {
    return <div>about</div>;
  },
});

const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "posts",
});

const postsIndexRoute = createRoute({
  getParentRoute: () => postsRoute,
  // Notice the single slash `/` here
  path: "/",
  component: () => {
    return (
      <div>
        <Link to="/posts/$postId" params={{ postId: "1" }}>
          1
        </Link>
        ,
        <Link to="/posts/$postId" params={{ postId: "2" }}>
          2
        </Link>
      </div>
    );
  },
});

const postIdRoute = createRoute({
  getParentRoute: () => postsRoute,
  path: "$postId",
  // In a loader
  // loader: ({ params }) => fetchPost(params.postId),
  // Or in a component
  component: () => {
    const { postId } = postIdRoute.useParams();
    return <div>Post ID: {postId}</div>;
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  postsRoute.addChildren([postsIndexRoute, postIdRoute]),
]);

const router = createRouter({ routeTree });

// TODO: これ何？
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
