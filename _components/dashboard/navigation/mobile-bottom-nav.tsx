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
			className={`md:hidden p-2 fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border z-50 ${className}`}
		>
			<div className='flex items-center justify-between'>
				{navLinks.map((link) => {
					const Icon = link.icon;
					const isActive = activeLink === link.name;

					return (
						<Link key={link.name} href={link.href} className='flex-1'>
							<Button
								variant='ghost'
								onClick={() => onLinkClick(link.name)}
								className={`
                  w-full flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors rounded-none h-auto
                  bg-transparent hover:bg-transparent active:bg-transparent focus:bg-transparent
                  data-[state=active]:bg-transparent data-[state=open]:bg-transparent
                  data-[state=on]:bg-transparent
                  [-webkit-tap-highlight-color:transparent]
                  outline-none shadow-none
                  focus-visible:ring-0 focus-visible:ring-offset-0
                  ${
										isActive
											? "text-primary"
											: "text-muted-foreground"
									}
                `}
							>
								<Icon
									className={`w-6 h-6 transition-colors ${
										isActive
											? "text-primary"
											: "text-muted-foreground"
									}`}
								/>
								<span>{link.name}</span>
							</Button>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
