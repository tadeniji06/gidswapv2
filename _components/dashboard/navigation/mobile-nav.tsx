"use client";
// import { Button } from "@/src/components/ui/button";
import Image from "next/image";
import { Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/Authstore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function MobileNav() {
	const { theme, setTheme } = useTheme();
	const { logout } = useAuthStore();
	const router = useRouter();

	const handleLogout = () => {
		logout();
		router.push("/");
		toast.info("Logged out");
	};

	return (
		<nav
			className='
        md:hidden sticky top-0 z-50 
        bg-white dark:bg-[#1a1d29]
        flex items-center justify-between
        px-4 py-3
        border-b border-gray-600 dark:border-white
        shadow-sm
      '
		>
			{/* Logo */}
			<div className='flex items-center gap-2'>
				{theme === "dark" ? (
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
            bg-gray-100 dark:bg-neutral-800
            text-gray-600 dark:text-gray-300
            hover:bg-gray-200 dark:hover:bg-neutral-700
            transition
          '
				>
					{theme === "dark" ? (
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
            bg-gray-100 dark:bg-neutral-800
            text-gray-600 dark:text-gray-300
            hover:text-red-500 hover:bg-gray-200 dark:hover:bg-neutral-700
            transition
          '
				>
					<LogOut className='w-5 h-5' />
				</button>
			</div>
		</nav>
	);
}
