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

	return (
		<nav className='hidden md:flex sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm items-center justify-between px-8 py-4 transition-all'>
			{/* Left: Logo + Nav Links */}
			<div className='flex items-center gap-10'>
				{/* Logo */}
				<div className='flex-shrink-0 cursor-pointer transition-transform'>
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
				<div className='flex items-center gap-2'>
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
                      px-4 py-2 rounded-lg transition-colors
                      ${
												isActive
													? "bg-primary/10 text-primary hover:bg-primary/20"
													: "text-muted-foreground hover:text-foreground hover:bg-muted"
											}
                    `}
									>
										<link.icon className='w-4 h-4' />
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
            w-10 h-10 rounded-lg flex items-center justify-center
            bg-transparent border border-transparent
            text-muted-foreground hover:text-foreground
            hover:bg-muted transition-colors
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
				<Button
					variant='outline'
					onClick={handleLogout}
					className='px-6 py-2 rounded-lg font-semibold tracking-wide text-foreground hover:bg-muted transition-colors'
				>
					Logout
				</Button>
			</div>
		</nav>
	);
}
