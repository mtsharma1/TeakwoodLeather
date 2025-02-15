"use client"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { SignInButton } from "./sign-In-btn"
import { signInCred } from "@/action/auth"
import { useState } from "react"
import { useRouter } from "next/navigation"
import logoSvg from '../assets/logo.svg'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [error, setError] = useState<string>("")
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setError("")
    try {
      const result = await signInCred(formData)
      if (result?.success) {
        // Redirect to dashboard or home page
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" action={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome to Teakwood Leather</h1>
                <p className="text-balance text-muted-foreground pt-2">
                  Login to your account
                </p>
              </div>
              {error && (
                <div className="text-sm text-red-500 text-center">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input className="bg-gray-200 text-black"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@company.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                {/* <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div> */}
                <Input id="password" className="bg-gray-200 text-black"name="password" type="password" required />
              </div>
              <SignInButton label="Login" />
              {/* <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div> */}
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <Image
              height={400}
              width={400}
              src={logoSvg}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
      <a href="http://www.teakwoodleathers.com/" target="_black" referrerPolicy="no-referrer">Teakwood Leather & Travel Private Limited, @ Established since 1989</a>
      </div>
    </div>
  )
}