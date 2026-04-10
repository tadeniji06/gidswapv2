"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";

interface OtpVerificationStepProps {
	email: string;
	onVerify: (otp: string) => void;
	onResend: () => void;
	loading: boolean;
}

export default function OtpVerificationStep({ email, onVerify, onResend, loading }: OtpVerificationStepProps) {
	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	const handleChange = (index: number, value: string) => {
		if (value.length > 1) value = value.slice(-1);
		if (!/^\d*$/.test(value)) return;

		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);

		// Move to next input
		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace" && !otp[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const isComplete = otp.every((digit) => digit !== "");

	return (
		<div className='flex flex-col items-center space-y-6 py-4'>
			<div className='text-center space-y-2'>
				<h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Verify your email</h3>
				<p className='text-sm text-gray-500 dark:text-gray-400'>
					We've sent a 6-digit code to <span className='font-medium text-blue-600'>{email}</span>
				</p>
			</div>

			<div className='flex gap-2 sm:gap-4'>
				{otp.map((digit, index) => (
					<input
						key={index}
						ref={(el) => (inputRefs.current[index] = el)}
						type='text'
						inputMode='numeric'
						maxLength={1}
						value={digit}
						onChange={(e) => handleChange(index, e.target.value)}
						onKeyDown={(e) => handleKeyDown(index, e)}
						className='w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-500 rounded-xl outline-none transition-all text-gray-900 dark:text-white'
					/>
				))}
			</div>

			<div className='w-full space-y-4 pt-4'>
				<Button
					onClick={() => onVerify(otp.join(""))}
					disabled={!isComplete || loading}
					className='w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl'
				>
					{loading ? <Loader2 className='w-5 h-5 animate-spin' /> : "Verify Account"}
				</Button>

				<button
					onClick={onResend}
					disabled={loading}
					type='button'
					className='w-full text-sm text-center text-blue-600 dark:text-blue-400 hover:underline'
				>
					Didn't receive the code? Resend
				</button>
			</div>
		</div>
	);
}
