import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'

// Define the protected paths as regex patterns
const protectedPaths = [
  /^\/shipping/,
  /^\/payment/,
  /^\/place-order/,
  /^\/profile/,
  /^\/order\/.+$/, // Matches paths like /order/<id>
  /^\/admin/,
]

// Define the NextAuth configuration
const authConfig = {
  providers: [],
  callbacks: {
    authorized({ request, auth }: any) {
      const { pathname } = request.nextUrl

      // Check if the current pathname matches any of the protected paths
      if (protectedPaths.some((pattern) => pattern.test(pathname))) {
        // Allow access only if the user is authenticated
        return !!auth
      }

      // Allow access to other paths
      return true
    },
  },
} satisfies NextAuthConfig

// Export the middleware
export const { auth: middleware } = NextAuth(authConfig)

// Export middleware configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
