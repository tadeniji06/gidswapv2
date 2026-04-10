"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { ResponsiveModal } from "./responsive-modal";
import OtpVerificationStep from "../steps/OtpVerificationStep";
import { useAuthStore } from "@/store/Authstore";

export function ForgotPasswordModal() {
	const { isForgotModalOpen, setForgotModalOpen } = useAuthStore();
	const onClose = () => setForgotModalOpen(false);
	const open = isForgotModalOpen;

	const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [resetToken, setResetToken] = useState("");
	const [loading, setLoading] = useState(false);

	const api_url = process.env.NEXT_PUBLIC_PROD_API;

	const handleRequestOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await axios.post(`${api_url}/api/auth/request-otp`, { email });
			toast.success("OTP sent to your email.");
			setStep(2);
		} catch (err: any) {
			toast.error(err.response?.data?.message || "Failed to send OTP.");
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOtp = async (otpCode: string) => {
		setLoading(true);
		try {
			const res = await axios.post(`${api_url}/api/auth/verify-otp`, { email, otp: otpCode });
			setResetToken(res.data.resetToken);
			toast.success("OTP verified!");
			setStep(3);
		} catch (err: any) {
			toast.error(err.response?.data?.message || "Invalid OTP.");
		} finally {
			setLoading(false);
		}
	};

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await axios.post(`${api_url}/api/auth/reset-password`, { resetToken, newPassword });
			toast.success("Password reset successful! You can now login.");
			onClose();
			setStep(1);
			setEmail("");
			setNewPassword("");
		} catch (err: any) {
			toast.error(err.response?.data?.message || "Failed to reset password.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<ResponsiveModal open={open} onClose={onClose} title={step === 1 ? "Forgot Password" : step === 2 ? "Verify OTP" : "New Password"}>
			<div className='space-y-6 py-2'>
				<AnimatePresence mode='wait'>
					{step === 1 && (
						<motion.form
							key='step1'
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							onSubmit={handleRequestOtp}
							className='space-y-4'
						>
							<p className='text-sm text-gray-500 dark:text-gray-400'>
								Enter your email address and we'll send you an OTP to reset your password.
							</p>
							<div className='relative'>
								<Mail className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
								<Input
									type='email'
									placeholder='me@example.com'
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className='pl-10 h-12 bg-gray-50 dark:bg-gray-800'
								/>
							</div>
							<Button type='submit' disabled={loading} className='w-full h-12 bg-blue-600 hover:bg-blue-700'>
								{loading ? <Loader2 className='animate-spin' /> : "Send OTP"}
							</Button>
						</motion.form>
					)}

					{step === 2 && (
						<motion.div
							key='step2'
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
						>
							<OtpVerificationStep
								email={email}
								onVerify={handleVerifyOtp}
								onResend={() => axios.post(`${api_url}/api/auth/request-otp`, { email })}
								loading={loading}
							/>
						</motion.div>
					)}

					{step === 3 && (
						<motion.form
							key='step3'
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							onSubmit={handleResetPassword}
							className='space-y-4'
						>
							<p className='text-sm text-gray-500 dark:text-gray-400'>
								Set a strong new password for your account.
							</p>
							<div className='relative'>
								<Lock className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
								<Input
									type='password'
									placeholder='New Password'
									required
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									className='pl-10 h-12 bg-gray-50 dark:bg-gray-800'
								/>
							</div>
							<Button type='submit' disabled={loading} className='w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold'>
								{loading ? <Loader2 className='animate-spin' /> : "Update Password"}
							</Button>
						</motion.form>
					)}
				</AnimatePresence>
			</div>
		</ResponsiveModal>
	);
}
