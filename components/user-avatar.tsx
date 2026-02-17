"use server"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

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

export default async function UserAvatar({ userData }: { userData: { name: string, email: string, image: string } }) {

   // Show skeleton while loading OR if we don't have user data yet
   if (!userData?.name) {
      return <UserAvatarSkeleton />
   }

   // const { name, email, image } = userData

   return (
      <div className="flex items-center gap-1">
         {/* <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Hello, {name}</span>
            <span className="truncate text-xs">{email}</span>
         </div>
         <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={image || ""} alt={name} className="text-black" />
            <AvatarFallback className="rounded-lg text-black">
               {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
         </Avatar> */}
      </div>
   )
}