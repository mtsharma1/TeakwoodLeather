import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"

const UserAvatarSkeleton = () => {
   return (
      <>
         <Skeleton className="h-8 w-8 rounded-lg bg-slate-400" />
         <div className="grid flex-1 gap-1">
            <Skeleton className="h-4 w-24 bg-slate-400" />
            <Skeleton className="h-3 w-32 bg-slate-400" />
         </div>
      </>
   )
}

export default function UserAvatar() {
   const { data: session, status } = useSession()
   const [userData, setUserData] = useState<{name?: string, email?: string, image?: string} | null>(null)
   
   useEffect(() => {
     if (session?.user) {
       setUserData({
         name: session.user.name || undefined,
         email: session.user.email || undefined,
         image: session.user.image || undefined
       })
     }
   }, [session])

   // Show skeleton while loading OR if we don't have user data yet
   if (status === "loading" || !userData?.name) {
      return <UserAvatarSkeleton />
   }

   const { name, email, image } = userData

   return (
      <>
         <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={image || ""} alt={name} className="text-black" />
            <AvatarFallback className="rounded-lg text-black">
               {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
         </Avatar>
         <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Hello, {name}</span>
            <span className="truncate text-xs">{email}</span>
         </div>
      </>
   )
}