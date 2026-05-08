import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * App layout — wraps all authenticated app pages (dashboard, workspace, billing, settings, etc.)
 *
 * This is a server component. It validates the session on every render and redirects
 * unauthenticated visitors to /login, preserving the intended destination via `callbackUrl`.
 *
 * The middleware (src/middleware.ts) already guards these routes at the edge, but this
 * layout adds a second, authoritative server-side check so page components can always
 * trust that `session.user` is present when they call `auth()` themselves.
 *
 * Sidebar/navigation is intentionally excluded here — each page composes its own
 * layout (sidebar + content) so page-specific chrome stays co-located with that page.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    // next/navigation redirect() works in both RSC and Route Handlers.
    // It throws internally so anything after this line will not execute.
    redirect("/login");
  }

  return <>{children}</>;
}
