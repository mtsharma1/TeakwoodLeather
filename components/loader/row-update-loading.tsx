import { Loader2 } from "lucide-react"

export function RowUpdateLoader() {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <p className="text-sm font-medium">Updating row...</p>
      </div>
    </div>
  )
}