"use client";
import { Button } from "@/src/components/ui/button";
import Image from "next/image";
import { Sun, Moon, LucideProps } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { useAuthStore } from "@/store/Authstore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface NavLink {
	name: string;
	icon: ForwardRefExoticComponent<
		Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
	>;
	href: string;
}

interface DesktopNavProps {
	navLinks: NavLink[];
	activeLink: string;
	onLinkClick: (linkName: string) => void;
}

export function DesktopNav({
	navLinks,
	activeLink,
	onLinkClick,
}: DesktopNavProps) {
	const { theme, setTheme } = useTheme();
	const router = useRouter();
	const { logout } = useAuthStore();

	const handleLogout = () => {
		logout();
		router.push("/");
		toast.info("Logged out");
	};

	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

  // During SSR and initial hydration, we render a placeholder for theme-dependent bits
  // to prevent mismatch between server-rendered HTML and client state.

	return (
		<nav className='hidden md:flex sticky top-0 z-50 glass-panel border-b border-white/5 shadow-sm items-center justify-between px-8 py-4 transition-all duration-300'>
			{/* Left: Logo + Nav Links */}
			<div className='flex items-center gap-10'>
				{/* Logo */}
				<div className='flex-shrink-0 cursor-pointer hover:scale-105 transition-transform'>
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

				{/* Navigation */}
				<div className='flex items-center gap-4 bg-background/30 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md'>
					{navLinks.map((link) => {
						const isActive = activeLink === link.name;
						return (
							<div key={link.name}>
								<Link href={link.href}>
									<Button
										variant='ghost'
										onClick={() => onLinkClick(link.name)}
										className={`
                      flex items-center gap-2 text-sm font-semibold tracking-wide
                      px-5 py-2.5 rounded-xl transition-all duration-300
                      ${
												isActive
													? "bg-primary text-white shadow-[0_0_15px_rgba(100,150,255,0.3)]"
													: "text-muted-foreground hover:text-white hover:bg-white/5"
											}
                    `}
									>
										<link.icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
										<span>{link.name}</span>
									</Button>
								</Link>
							</div>
						);
					})}
				</div>
			</div>

			{/* Right: Theme toggle + Logout */}
			<div className='flex items-center gap-4'>
				{/* Theme toggle */}
				<button
					onClick={() =>
						setTheme(theme === "dark" ? "light" : "dark")
					}
					className='
            w-10 h-10 rounded-xl flex items-center justify-center
            bg-background/50 border border-white/5
            text-muted-foreground hover:text-white
            hover:bg-white/10 hover:border-white/10
            transition-all duration-300 shadow-sm
          '
				>
					{!mounted ? (
						<div className="w-5 h-5" /> // Empty placeholder until mounted
					) : theme === "dark" ? (
						<Sun className='w-5 h-5' />
					) : (
						<Moon className='w-5 h-5' />
					)}
				</button>

				{/* Logout */}
				<Button
					variant='outline'
					onClick={handleLogout}
					className='
            px-6 py-2.5 rounded-xl font-semibold tracking-wide
            text-red-400 hover:text-white
            bg-red-500/10 border border-red-500/20
            hover:bg-red-500 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]
            transition-all duration-300
          '
				>
					Logout
				</Button>
			</div>
		</nav>
	);
}
