import { auth } from "@/auth"

const publicRoutes = [
  '/login',
  '/signup',
]

export default auth((req) => {
  if (req.auth && publicRoutes.includes(req.nextUrl.pathname)) {
    const newUrl = new URL("/", req.nextUrl.origin)
    return Response.redirect(newUrl)
  }

  if (!req.auth && !publicRoutes.includes(req.nextUrl.pathname)) {
    const newUrl = new URL("/login", req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}