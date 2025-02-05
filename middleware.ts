// Ref: https://next-auth.js.org/configuration/nextjs#advanced-usage
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    if (process.env.NODE_ENV === "development") {
      console.log("Token in middleware:", request.nextauth?.token);
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Authorize if the token exists
    },
  }
);

export const config = { matcher: ["/dashboard"] };
