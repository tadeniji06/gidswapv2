"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { LucideProps } from "lucide-react";

export interface NavLink {
	name: string;
	href: string;
	icon: ForwardRefExoticComponent<
		Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
	>;
}

export interface MobileBottomNavProps {
	navLinks: NavLink[];
	activeLink: string;
	onLinkClick: (linkName: string) => void;
	className?: string;
}

export function MobileBottomNav({
	navLinks,
	activeLink,
	onLinkClick,
	className = "",
}: MobileBottomNavProps) {
	return (
		<nav
			className={`md:hidden p-3 fixed bottom-0 left-0 right-0 glass-panel border-t border-white/5 shadow-lg z-50 ${className}`}
		>
			<div className='flex items-center justify-around py-2 px-4'>
				{navLinks.map((link) => {
					const Icon = link.icon;
					const isActive = activeLink === link.name;

					return (
						<Link key={link.name} href={link.href} className='flex-1'>
							<Button
								variant='ghost'
								onClick={() => onLinkClick(link.name)}
								className={`
                  w-full flex flex-col items-center gap-1 py-3 text-xs transition-all rounded-none

                  /* REMOVE ALL GHOST BACKGROUNDS */
                  bg-transparent hover:bg-transparent active:bg-transparent focus:bg-transparent
                  data-[state=active]:bg-transparent data-[state=open]:bg-transparent
                  data-[state=on]:bg-transparent

                  /* REMOVE TAP HIGHLIGHT (the real culprit on mobile) */
                  [-webkit-tap-highlight-color:transparent]

                  /* REMOVE OUTLINES / RINGS */
                  outline-none shadow-none
                  focus-visible:ring-0 focus-visible:ring-offset-0

                  ${
										isActive
											? "text-blue-600 dark:text-blue-400 font-medium"
											: "text-gray-600 dark:text-gray-300"
									}
                  hover:text-blue-600 dark:hover:text-blue-400
                `}
							>
								<Icon
									className={`w-7 h-8 transition-colors ${
										isActive
											? "text-blue-600 dark:text-blue-400"
											: "text-gray-500 dark:text-gray-300"
									}`}
								/>

								<span>{link.name}</span>

								<div
									className={`h-0.5 w-8 mt-1 rounded-full transition-all ${
										isActive
											? "bg-blue-600 dark:bg-blue-400"
											: "bg-transparent"
									}`}
								/>
							</Button>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
