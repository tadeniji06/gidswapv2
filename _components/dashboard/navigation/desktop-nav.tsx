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
import { motion } from "framer-motion";

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

	// Framer Motion variants
	const navContainer = {
		hidden: {},
		visible: {
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const navItem = {
		hidden: { opacity: 0, y: -10 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.25, ease: "easeOut" },
		},
	};

	return (
		<nav className='hidden md:flex sticky top-0 z-50 bg-white dark:bg-[#1a1d29] items-center justify-between px-8 py-4 border-b border-gray-300 dark:border-neutral-800 shadow-sm'>
			{/* Left: Logo + Nav Links */}
			<div className='flex items-center gap-10'>
				{/* Logo */}
				<div className='flex-shrink-0'>
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

				{/* Navigation */}
				<motion.div
					className='flex items-center gap-6'
					variants={navContainer}
					initial='hidden'
					animate='visible'
				>
					{navLinks.map((link) => {
						const isActive = activeLink === link.name;
						return (
							<motion.div key={link.name} variants={navItem}>
								<Link href={link.href}>
									<Button
										variant='ghost'
										onClick={() => onLinkClick(link.name)}
										className={`
                      flex items-center gap-2 text-gray-700 dark:text-gray-200
                      hover:text-blue-600 dark:hover:text-blue-400
                      px-4 py-2 rounded-lg transition
                      ${
												isActive
													? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
													: "bg-transparent"
											}
                    `}
									>
										<link.icon className='w-5 h-5' />
										<span>{link.name}</span>
									</Button>
								</Link>
							</motion.div>
						);
					})}
				</motion.div>
			</div>

			{/* Right: Theme toggle + Logout */}
			<div className='flex items-center gap-3'>
				{/* Theme toggle */}
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
				<Button
					variant='outline'
					onClick={handleLogout}
					className='
            px-6 py-2 rounded-lg
            text-red-600 hover:text-red-500
            bg-transparent dark:bg-transparent
            border border-red-600 dark:border-red-500
            hover:bg-red-50 dark:hover:bg-red-900/20
            transition
          '
				>
					Logout
				</Button>
			</div>
		</nav>
	);
}
