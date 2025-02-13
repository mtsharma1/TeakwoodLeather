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


export function SignupForm({
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
            router.push("/login")
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
                        <h1 className="text-2xl font-bold">Welcome</h1>
                        <p className="text-balance text-muted-foreground">
                           Teakwood
                        </p>
                     </div>
                     {error && (
                        <div className="text-sm text-red-500 text-center">
                           {error}
                        </div>
                     )}
                     <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                           id="name"
                           name="name"
                           type="text"
                           placeholder="Your Name"
                           required
                        />
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                           id="email"
                           name="email"
                           type="email"
                           placeholder="m@example.com"
                           required
                        />
                     </div>
                     <div className="grid gap-2">
                        <div className="flex items-center">
                           <Label htmlFor="password">Password</Label>
                        </div>
                           
                           <Input id="password" name="password" type="password" placeholder="**********" required />
                     </div>
                     <SignInButton label="Signup" />
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
            By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
            and <a href="#">Privacy Policy</a>.
         </div>
      </div>
   )
}