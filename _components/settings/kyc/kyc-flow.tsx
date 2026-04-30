"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
	Camera,
	RefreshCw,
	X,
	ShieldCheck,
	CheckCircle,
	AlertCircle,
	ChevronLeft,
	User,
	ScanFace,
	BadgeCheck,
} from "lucide-react";
import { kycService } from "@/lib/services/kyc";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

interface KycFlowProps {
	onComplete: () => void;
	onCancel: () => void;
}

type Step = "id" | "camera" | "processing" | "result" | "error";

// Map known Dojah API errors to user-friendly messages
const mapDojahError = (raw: string): string => {
	const lower = raw.toLowerCase();
	if (lower.includes("bvn not found") || lower.includes("wrong bvn"))
		return "The BVN you entered could not be found. Please double-check it and try again.";
	if (lower.includes("wrong nin") || lower.includes("nin not found"))
		return "The NIN you entered is incorrect. Please verify and try again.";
	if (lower.includes("selfie") || lower.includes("face") || lower.includes("match"))
		return "Your face did not match the ID provided. Please retake your selfie in good lighting.";
	if (lower.includes("authorized") || lower.includes("secret key"))
		return "Verification service is temporarily unavailable. Please try again later.";
	return raw || "Verification failed. Please try again.";
};

const stepVariants = {
	enter: { opacity: 0, x: 40 },
	center: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -40 },
};

export function KycFlow({ onComplete, onCancel }: KycFlowProps) {
	const [step, setStep] = useState<Step>("id");
	const [idType, setIdType] = useState<"bvn" | "nin">("bvn");
	const [idValue, setIdValue] = useState("");
	const [selfie, setSelfie] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [cameraReady, setCameraReady] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const streamRef = useRef<MediaStream | null>(null);

	const stopCamera = () => {
		streamRef.current?.getTracks().forEach((t) => t.stop());
		streamRef.current = null;
		setCameraReady(false);
	};

	const startCamera = async () => {
		setError(null);
		setCameraReady(false);
		try {
			if (!navigator.mediaDevices?.getUserMedia)
				throw new Error("NotSupported");
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
			});
			streamRef.current = stream;
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				videoRef.current.onloadedmetadata = () => setCameraReady(true);
				await videoRef.current.play();
			}
		} catch (err: any) {
			const msg =
				err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
					? "Camera access denied. Please allow camera access in your browser settings and retry."
					: err.name === "NotFoundError"
					? "No camera found on this device."
					: err.message === "NotSupported"
					? "Your browser does not support camera access. Please use Chrome or Safari."
					: "Could not start camera. Make sure you're on HTTPS.";
			setError(msg);
		}
	};

	const capturePhoto = () => {
		if (!videoRef.current || !canvasRef.current) return;
		const video = videoRef.current;
		const canvas = canvasRef.current;
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		canvas.getContext("2d")?.drawImage(video, 0, 0);
		setSelfie(canvas.toDataURL("image/jpeg", 0.85));
		stopCamera();
	};

	const retakeSelfie = () => {
		setSelfie(null);
		startCamera();
	};

	const handleVerify = async () => {
		if (!idValue || !selfie) return;
		setStep("processing");
		setError(null);
		try {
			await kycService.verifySelfie({ [idType]: idValue, selfieImage: selfie });
			setStep("result");
			setTimeout(() => onComplete(), 2500);
		} catch (err: any) {
			const rawMsg =
				err.response?.data?.details?.error ||
				err.response?.data?.error ||
				err.response?.data?.message ||
				err.message ||
				"Unknown error";
			setError(mapDojahError(rawMsg));
			setStep("error");
		}
	};

	const resetToId = () => {
		setError(null);
		setSelfie(null);
		setIdValue("");
		setStep("id");
	};

	useEffect(() => {
		if (step === "camera") startCamera();
		return () => stopCamera();
	}, [step]);

	const idValid = idValue.length === 11;

	// Step indicator labels
	const steps = [
		{ key: "id", label: "ID", icon: User },
		{ key: "camera", label: "Selfie", icon: ScanFace },
		{ key: "result", label: "Done", icon: BadgeCheck },
	];
	const currentStepIdx =
		step === "id" ? 0 : step === "camera" ? 1 : step === "processing" ? 1 : 2;

	return (
		<div className="w-full max-w-md mx-auto">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-2">
					<ShieldCheck className="w-5 h-5 text-blue-500" />
					<h2 className="text-lg font-bold text-gray-900 dark:text-white">
						Identity Verification
					</h2>
				</div>
				<button
					onClick={onCancel}
					className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
				>
					<X className="w-4 h-4 text-gray-500" />
				</button>
			</div>

			{/* Step Indicator */}
			{step !== "processing" && step !== "result" && step !== "error" && (
				<div className="flex items-center justify-center gap-2 mb-6">
					{steps.map((s, i) => {
						const Icon = s.icon;
						const isActive = i === currentStepIdx;
						const isDone = i < currentStepIdx;
						return (
							<div key={s.key} className="flex items-center gap-2">
								<div
									className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all duration-300 ${
										isDone
											? "bg-blue-500 text-white"
											: isActive
											? "bg-blue-500 text-white ring-4 ring-blue-500/20"
											: "bg-gray-100 dark:bg-gray-800 text-gray-400"
									}`}
								>
									{isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
								</div>
								<span
									className={`text-xs font-medium hidden sm:block ${
										isActive ? "text-blue-500" : "text-gray-400"
									}`}
								>
									{s.label}
								</span>
								{i < steps.length - 1 && (
									<div
										className={`w-8 h-0.5 rounded-full transition-all duration-500 ${
											i < currentStepIdx ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
										}`}
									/>
								)}
							</div>
						);
					})}
				</div>
			)}

			{/* Step Content */}
			<AnimatePresence mode="wait">
				{/* STEP 1: ID INPUT */}
				{step === "id" && (
					<motion.div
						key="id"
						variants={stepVariants}
						initial="enter"
						animate="center"
						exit="exit"
						transition={{ duration: 0.25 }}
						className="space-y-5"
					>
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
								Select your ID type and enter the number to begin verification.
							</p>
							{/* ID Type Toggle */}
							<div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
								{(["bvn", "nin"] as const).map((type) => (
									<button
										key={type}
										onClick={() => { setIdType(type); setIdValue(""); }}
										className={`py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
											idType === type
												? "bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400"
												: "text-gray-500 dark:text-gray-400 hover:text-gray-700"
										}`}
									>
										{type.toUpperCase()}
									</button>
								))}
							</div>

							<Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
								{idType === "bvn" ? "Bank Verification Number (BVN)" : "National Identification Number (NIN)"}
							</Label>
							<Input
								value={idValue}
								onChange={(e) => setIdValue(e.target.value.replace(/\D/g, "").slice(0, 11))}
								placeholder={`Enter your 11-digit ${idType.toUpperCase()}`}
								maxLength={11}
								inputMode="numeric"
								className="h-12 text-base tracking-widest text-center font-mono bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
							/>
							<p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
								<ShieldCheck className="w-3 h-3" />
								Your data is encrypted and never stored permanently.
							</p>
						</div>

						<Button
							onClick={() => setStep("camera")}
							disabled={!idValid}
							className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-40"
						>
							Continue — Take Selfie
						</Button>
					</motion.div>
				)}

				{/* STEP 2: CAMERA */}
				{step === "camera" && (
					<motion.div
						key="camera"
						variants={stepVariants}
						initial="enter"
						animate="center"
						exit="exit"
						transition={{ duration: 0.25 }}
						className="space-y-4"
					>
						<button
							onClick={() => { stopCamera(); setStep("id"); }}
							className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-1"
						>
							<ChevronLeft className="w-4 h-4" /> Back
						</button>

						{error && (
							<Alert variant="destructive" className="text-sm">
								<AlertCircle className="w-4 h-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<p className="text-sm text-gray-500 dark:text-gray-400 text-center">
							{selfie ? "Looking good? Confirm or retake." : "Position your face in the oval and take a clear selfie."}
						</p>

						{/* Camera / Preview */}
						<div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-900">
							{!selfie ? (
								<>
									<video
										ref={videoRef}
										autoPlay
										playsInline
										muted
										className="w-full h-full object-cover scale-x-[-1]"
									/>
									{/* Oval guide overlay */}
									<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
										<div className="w-48 h-60 rounded-full border-4 border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
									</div>
									{!cameraReady && (
										<div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
											<RefreshCw className="w-8 h-8 text-gray-400 animate-spin mb-2" />
											<span className="text-xs text-gray-400">Starting camera...</span>
										</div>
									)}
								</>
							) : (
								<img src={selfie} alt="Captured selfie" className="w-full h-full object-cover scale-x-[-1]" />
							)}
							<canvas ref={canvasRef} className="hidden" />
						</div>

						{/* Actions */}
						<div className="flex gap-3">
							{selfie ? (
								<>
									<Button variant="outline" onClick={retakeSelfie} className="flex-1 h-11">
										<RefreshCw className="w-4 h-4 mr-2" /> Retake
									</Button>
									<Button onClick={handleVerify} className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-white font-semibold">
										<CheckCircle className="w-4 h-4 mr-2" /> Verify
									</Button>
								</>
							) : (
								<Button
									onClick={capturePhoto}
									disabled={!cameraReady || !!error}
									className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
								>
									<Camera className="w-4 h-4 mr-2" />
									{!cameraReady ? "Waiting for camera..." : "Capture Selfie"}
								</Button>
							)}
						</div>
					</motion.div>
				)}

				{/* STEP 3: PROCESSING */}
				{step === "processing" && (
					<motion.div
						key="processing"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="py-14 flex flex-col items-center justify-center space-y-4 text-center"
					>
						<div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center">
							<RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
						</div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
							Verifying your identity...
						</h3>
						<p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
							We're matching your selfie against official records. This usually takes a few seconds.
						</p>
					</motion.div>
				)}

				{/* STEP 4: SUCCESS */}
				{step === "result" && (
					<motion.div
						key="result"
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ type: "spring", stiffness: 200, damping: 15 }}
						className="py-14 flex flex-col items-center justify-center space-y-4 text-center"
					>
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
							className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center"
						>
							<CheckCircle className="w-10 h-10 text-green-500" />
						</motion.div>
						<h3 className="text-xl font-bold text-green-500">Identity Verified!</h3>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Your identity has been confirmed successfully. Redirecting...
						</p>
					</motion.div>
				)}

				{/* STEP 5: ERROR */}
				{step === "error" && (
					<motion.div
						key="error"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="py-10 flex flex-col items-center justify-center space-y-5 text-center"
					>
						<div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
							<AlertCircle className="w-10 h-10 text-red-500" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
								Verification Failed
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
								{error}
							</p>
						</div>
						<div className="flex gap-3 w-full">
							<Button variant="outline" onClick={resetToId} className="flex-1 h-11">
								Change ID
							</Button>
							<Button
								onClick={() => { setError(null); setSelfie(null); setStep("camera"); }}
								className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white"
							>
								Try Again
							</Button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
