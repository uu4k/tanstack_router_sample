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
        {/* searchパラメータなしは怒られる */}
        {/* <Link to="/posts"></Link> */}
        <Link to="/posts" search={{ page: 1, sort: "newest" }}>
          posts
        </Link>|
        <Link to="/posts" search={{ page: 2, sort: "newest" }}>
          posts(2page)
        </Link>|
        <Link to="/posts" search={{ page: 1, sort: "oldest" }}>
          posts(oldest)
        </Link>
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

type PostSortOptions = "newest" | "oldest";
type PostSearch = {
  page: number;
  sort: PostSortOptions;
};

const postsIndexRoute = createRoute({
  getParentRoute: () => postsRoute,
  // Notice the single slash `/` here
  path: "/",
  validateSearch: (search: Record<string, unknown>): PostSearch => {
    // validate and parse the search params into a typed state
    return {
      page: Number(search?.page ?? 1),
      sort: (search?.sort as PostSortOptions) || "newest",
    };
  },
  component: () => {
    const { page, sort } = postsIndexRoute.useSearch();
    const startId =
      sort == "newest" ? 1 + (page - 1) * 10 : 100 - (page - 1) * 10;
    return (
      <div>
        {[...Array(10)].map((_, i) => {
          const id = sort == "newest" ? startId + i : startId - i;
          return (
            <>
              <Link to="/posts/$postId" params={{ postId: id.toString() }}>
                {id}
              </Link>
              ,
            </>
          );
        })}
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
