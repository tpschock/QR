import { NextRequest, NextResponse } from "next/server";

// Gates only the property directory ("/") behind a simple username/password
// prompt — individual property pages ("/<slug>") are never touched by this
// matcher, so QR codes keep working with no login required.
export function middleware(request: NextRequest) {
  const user = process.env.DIRECTORY_USER;
  const password = process.env.DIRECTORY_PASSWORD;

  // If the credentials aren't configured, leave the directory open rather
  // than accidentally locking everyone (including you) out.
  if (!user || !password) {
    return NextResponse.next();
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    const [providedUser, providedPassword] = atob(auth.slice(6)).split(":");
    if (providedUser === user && providedPassword === password) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Property Directory"' },
  });
}

export const config = {
  matcher: "/",
};
