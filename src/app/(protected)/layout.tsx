import QueryProvider from "@/_components/QueryProvider";
import { ThemeProvider } from "@/_components/theme-provider";
import { cookies } from "next/headers"
import { redirect } from "next/navigation";

export default async function ProtectedLayout({children,}: {children: React.ReactNode}) {
    const cookieStore = await cookies()
    const token = cookieStore.get("token");

    if(!token){
        redirect("/")
    }
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
    <main>
      <QueryProvider>
         {children}
      </QueryProvider>
     
    </main>

    </ThemeProvider>

  )
}