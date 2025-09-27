"use client"
import { Button } from "@/src/components/ui/button"
import Image from "next/image"
import { Sun, Moon, User2, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuthStore } from "@/store/Authstore"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
export function MobileNav() {
  const { theme, setTheme } = useTheme()
  const {logout} = useAuthStore()
  const router = useRouter();

  const handleLogout = () => {
    logout()
    router.push("/")
    toast.info("Logged out")
  }
  return (
    <nav className="md:hidden sticky top-0 z-50 bg-white dark:bg-[#1a1d29] flex items-center justify-between px-4 py-3 border-b border-gray-200">
      <div className="relative flex items-center gap-2 flex-shrink-0 group">
       {theme === "dark" ?   <Image src="/images/gidsfull.png" alt="Logo" width={100} height={80} /> :   <Image src="/images/Gidswaplogo.png" alt="Logo" width={100} height={80} />}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-gray-400 hover:text-white"
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </Button>
        <button onClick={handleLogout}>
          <LogOut className="w-5 h-5 text-red-500" />
        </button>
      </div>
    </nav>
  )
}
