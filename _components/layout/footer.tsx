"use client";
import Image from "next/image";
import { Moon, Sun, Mail, ArrowUp, ShieldCheck } from "lucide-react";
import { useTheme } from "next-themes";
import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import Link from "next/link";
import { motion } from "framer-motion";
import Newsletter from "../sections/Newsletter";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	// Render a placeholder or neutral state during hydration
	if (!mounted) {
		return <div className="flex h-11 items-center justify-between gap-2 rounded-full bg-blue-900/20 backdrop-blur-md border border-blue-400/20 p-1 w-full max-w-[200px]" />;
	}

	return (
		<div
			className={`flex h-11 items-center justify-between gap-2 rounded-full bg-blue-900/20 backdrop-blur-md border border-blue-400/20 p-1 transition-all w-full max-w-[200px] `}
		>
			<button
				onClick={() => setTheme("system")}
				className={`flex cursor-pointer items-center justify-center rounded-full transition-all duration-300 h-9 px-4 ${
					theme === "system"
						? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
						: "text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
				}`}
				title='Switch to auto mode'
			>
				<span className='text-sm font-medium'>Auto</span>
			</button>
			<button
				onClick={() => setTheme("light")}
				className={`flex cursor-pointer items-center justify-center rounded-full transition-all duration-300 h-9 w-9 ${
					theme === "light"
						? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
						: "text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
				}`}
				title='Switch to light mode'
			>
				<Sun className='size-5' />
			</button>
			<button
				onClick={() => setTheme("dark")}
				className={`flex cursor-pointer items-center justify-center rounded-full transition-all duration-300 h-9 w-9 ${
					theme === "dark"
						? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
						: "text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
				}`}
				title='Switch to dark mode'
			>
				<Moon className='size-5' />
			</button>
		</div>
	);
}

export default function Footer() {
	const date = new Date().getFullYear();
	const path = usePathname();
	const hideFooter = path?.startsWith("/dashboard");

	const socialLinks = [
		{
			href: "https://www.tiktok.com/gidswap",
			icon: FaTiktok,
			label: "TikTok",
		},
		{
			href: "mailto:support@gidswap.com",
			icon: MdOutlineEmail,
			label: "Email",
		},
		{
			href: "https://www.instagram.com/gidswap",
			icon: FaInstagram,
			label: "Instagram",
		},
		{
			href: "wa.me/+2349038958941",
			icon: FaWhatsapp,
			label: "WhatsApp",
		},
	];

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<footer
			className={`${hideFooter ? "hidden" : "block"} relative overflow-hidden bg-[#0a0c12] pt-20 pb-10 mt-20 border-t border-white/5`}
		>
			{/* Luxury Background Elements */}
			<div className='absolute inset-0 pointer-events-none'>
				<div className='absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse' />
				<div className='absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]' />
			</div>

			<div className='relative z-10 mx-auto max-w-7xl px-6'>
				<div className='grid grid-cols-1 lg:grid-cols-4 gap-12 mb-20'>
					{/* Brand Column */}
					<div className='lg:col-span-2 space-y-8'>
						<Link href="/" className='inline-block hover:scale-105 transition-transform duration-300'>
							<Image
								src='/images/gidsfull.png'
								width={140}
								height={50}
								className='object-contain brightness-0 invert'
								priority
								alt='gidswap logo'
							/>
						</Link>
						<p className='text-muted-foreground text-lg leading-relaxed max-w-md font-medium'>
							The next generation of cross-chain liquidity. 
              Trade assets instantly with institutional-grade security and zero friction.
						</p>
            
            <div className='flex gap-4'>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link 
                    key={social.label}
                    href={social.href}
                    className='w-12 h-12 rounded-2xl glass-panel flex items-center justify-center text-muted-foreground hover:text-white hover:border-primary/50 hover:shadow-[0_0_15px_rgba(100,150,255,0.2)] transition-all duration-300 group'
                  >
                    <Icon className='size-5 group-hover:scale-110 transition-transform' />
                  </Link>
                );
              })}
            </div>
					</div>

					{/* Links Columns */}
					<div className='space-y-6'>
						<h4 className='text-white font-bold tracking-widest uppercase text-xs opacity-50'>Platform</h4>
						<ul className='space-y-4'>
							{['Swap', 'Markets', 'Rates', 'Dashboard'].map((item) => (
								<li key={item}>
									<Link href={`/${item.toLowerCase()}`} className='text-muted-foreground hover:text-primary transition-colors font-medium'>
										{item}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div className='space-y-6'>
						<h4 className='text-white font-bold tracking-widest uppercase text-xs opacity-50'>Preferences</h4>
						<ThemeToggle />
            <div className='flex items-center gap-2 mt-4'>
              <div className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
              <p className='text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-50'>
                All Systems Operational
              </p>
            </div>
					</div>
				</div>

				{/* Disclaimer Section */}
				<div className='mb-12 glass-panel p-8 rounded-3xl border-white/5'>
					<h5 className='text-xs font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2'>
						<ShieldCheck className='size-4 text-primary' /> Risk Disclosure
					</h5>
					<p className='text-[11px] text-muted-foreground leading-relaxed text-justify font-medium opacity-80'>
						Gidswap is a decentralized interface facilitating
						cryptocurrency exchanges. Crypto-to-crypto swaps are
						processed securely through the FixedFloat API. While we
						prioritize the use of secure protocols and vetted
						partners, cryptocurrency investments and transactions
						carry inherent market risks. The term "secure" refers to
						our implementation of industry-standard encryption and
						non-custodial workflows, not a guarantee against user
						error or broader network failures. Gidswap does not act as
						a custodian of your funds.
					</p>
				</div>

				{/* Bottom Bar */}
				<div className='pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6'>
					<div className='flex flex-col md:flex-row items-center gap-6 text-xs text-muted-foreground font-bold uppercase tracking-widest'>
						<span className='opacity-40 tracking-normal'>© {date} Gidswap Protocol</span>
						<Link
							href='https://www.fixedfloat.com'
							target='_blank'
							className='hover:text-white transition-colors'
						>
							Infrastructure by FixedFloat
						</Link>
					</div>

					<button
						onClick={scrollToTop}
						className='group flex items-center gap-2 px-6 py-3 glass-panel rounded-full text-xs font-black uppercase tracking-widest hover:border-primary/50 transition-all duration-300'
					>
						<span>To the moon</span>
						<ArrowUp className='size-4 group-hover:-translate-y-1 transition-transform' />
					</button>
				</div>
			</div>

			{/* Bottom Glow Effect */}
			<div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent' />
		</footer>
	);
}
