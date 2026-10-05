"use client";
import Image from "next/image";
import { Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/Authstore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export function MobileNav() {
	const { theme, setTheme } = useTheme();
	const { logout } = useAuthStore();
	const router = useRouter();

	const handleLogout = () => {
		logout();
		router.push("/");
		toast.info("Logged out");
	};

	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	return (
		<nav
			className='
        md:hidden sticky top-0 z-50 
        bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80
        flex items-center justify-between
        px-4 py-3
        border-b border-border
        shadow-sm
      '
		>
			{/* Logo */}
			<div className='flex items-center gap-2'>
				{mounted && theme === "dark" ? (
					<Image
						src='/images/gidsfull.png'
						alt='Logo'
						width={100}
						height={40}
						className='select-none'
					/>
				) : (
					<Image
						src='/images/Gidswaplogo.png'
						alt='Logo'
						width={100}
						height={40}
						className='select-none'
					/>
				)}
			</div>

			{/* Right controls */}
			<div className='flex items-center gap-3'>
				{/* Theme Toggle */}
				<button
					onClick={() =>
						setTheme(theme === "dark" ? "light" : "dark")
					}
					className='
            w-9 h-9 rounded-full flex items-center justify-center
            bg-muted
            text-muted-foreground
            hover:text-foreground hover:bg-muted/80
            transition-colors
          '
				>
					{!mounted ? (
						<div className="w-5 h-5" />
					) : theme === "dark" ? (
						<Sun className='w-5 h-5' />
					) : (
						<Moon className='w-5 h-5' />
					)}
				</button>

				{/* Logout */}
				<button
					onClick={handleLogout}
					className='
            w-9 h-9 rounded-full flex items-center justify-center
            bg-muted
            text-muted-foreground
            hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10
            transition-colors
          '
				>
					<LogOut className='w-5 h-5' />
				</button>
			</div>
		</nav>
	);
}
