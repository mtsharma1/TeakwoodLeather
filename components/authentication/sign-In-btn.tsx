import { useFormStatus } from "react-dom"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"

export const SignInButton = ({
   label,
   className,
}: {
   label: string
   className?: string
}) => {
   const { pending } = useFormStatus()

   return (
      <>
         <Button type="submit" disabled={pending} className={cn("w-full", className)}>
            {label}
         </Button>
      </>
   )
}
