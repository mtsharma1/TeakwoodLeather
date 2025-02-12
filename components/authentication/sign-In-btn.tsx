import { useFormStatus } from "react-dom"
import { Button } from "../ui/button"

export const SignInButton = ({ label }: { label: string }) => {
   const { pending } = useFormStatus()

   return (
      <>
         <Button type="submit" disabled={pending} className="w-full">
            {label}
         </Button>
      </>
   )
}