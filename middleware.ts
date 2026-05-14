import { auth } from "@/auth"
import { NextResponse } from "next/server"

const USER_ACCESS_ENABLED = false

export default auth((req) => {
  if (!USER_ACCESS_ENABLED) {
    return NextResponse.next()
  }

  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const publicPaths = ["/_login", "/_signup", "/login", "/signup"]
  const isPublicPath = publicPaths.some((path) => nextUrl.pathname.startsWith(path))
  const isAuthApi = nextUrl.pathname.startsWith("/api/auth")
  const isNextAsset = nextUrl.pathname.startsWith("/_next")
  const isStaticAsset = nextUrl.pathname.startsWith("/images") || nextUrl.pathname.startsWith("/fonts")
  const isFavicon = nextUrl.pathname === "/favicon.ico"

  if (isPublicPath || isAuthApi || isNextAsset || isStaticAsset || isFavicon) {
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
}
