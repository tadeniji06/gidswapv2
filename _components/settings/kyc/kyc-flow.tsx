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
} from "lucide-react";
import { kycService } from "@/lib/services/kyc";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

interface KycFlowProps {
	onComplete: () => void;
	onCancel: () => void;
}

export function KycFlow({ onComplete, onCancel }: KycFlowProps) {
	const [step, setStep] = useState<
		"id" | "camera" | "processing" | "result"
	>("id");
	const [idType, setIdType] = useState<"bvn" | "nin">("bvn");
	const [idValue, setIdValue] = useState("");
	const [selfie, setSelfie] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Clean BVN/NIN input (digits only)
	const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value.replace(/\D/g, "").slice(0, 11);
		setIdValue(val);
	};

	// Start Camera
	const startCamera = async () => {
		setError(null);
		try {
			if (
				!navigator.mediaDevices ||
				!navigator.mediaDevices.getUserMedia
			) {
				throw new Error("Camera API not supported in this browser");
			}

			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "user" },
			});
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				videoRef.current
					.play()
					.catch((e) => console.error("Play error:", e));
			}
		} catch (err: any) {
			console.error("Camera Error:", err);
			if (
				err.name === "NotAllowedError" ||
				err.name === "PermissionDeniedError"
			) {
				setError(
					"Camera access denied. Please enable camera permissions in your browser settings.",
				);
			} else if (err.name === "NotFoundError") {
				setError("No camera device found.");
			} else {
				setError(
					"Could not access camera. Please ensure you are on HTTPS or localhost.",
				);
			}
		}
	};

	// Capture Photo
	const capturePhoto = () => {
		if (videoRef.current && canvasRef.current) {
			const video = videoRef.current;
			const canvas = canvasRef.current;
			const context = canvas.getContext("2d");

			if (context) {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				context.drawImage(video, 0, 0, canvas.width, canvas.height);
				const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
				setSelfie(dataUrl);

				// Stop stream
				const stream = video.srcObject as MediaStream;
				stream?.getTracks().forEach((track) => track.stop());
			}
		}
	};

	// Handle Verify Submission
	const handleVerify = async () => {
		if (!idValue || !selfie) return;

		setStep("processing");
		setError(null);

		try {
			await kycService.verifySelfie({
				[idType]: idValue,
				selfieImage: selfie,
			});
			setStep("result");
			setTimeout(() => onComplete(), 2000); // Wait 2s then close/refresh
		} catch (err: any) {
			console.error(err);
			const msg =
				err.response?.data?.message ||
				err.response?.data?.error ||
				"Verification failed. Please try again.";
			setError(msg);
			setStep("id"); // Go back to start
			setSelfie(null); // Clear selfie
		}
	};

	// Effect to start camera when on step 'camera'
	useEffect(() => {
		if (step === "camera") {
			startCamera();
		}
		return () => {
			// Cleanup stream if unmounting mid-flow
			if (videoRef.current && videoRef.current.srcObject) {
				const stream = videoRef.current.srcObject as MediaStream;
				if (stream.getTracks) {
					stream.getTracks().forEach((track) => track.stop());
				}
			}
		};
	}, [step]);

	return (
		<Card className='w-full max-w-md mx-auto border-border bg-card shadow-lg animate-in fade-in zoom-in duration-300'>
			<CardHeader className='flex flex-row items-center justify-between pb-2'>
				<CardTitle className='text-lg font-semibold flex items-center gap-2'>
					<ShieldCheck className='w-5 h-5 text-primary' /> Identity
					Verification
				</CardTitle>
				<Button
					variant='ghost'
					size='icon'
					onClick={onCancel}
					className='h-8 w-8'
				>
					<X className='w-4 h-4' />
				</Button>
			</CardHeader>

			<CardContent className='space-y-4 pt-4'>
				{error && (
					<Alert variant='destructive' className='mb-4 text-xs'>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* STEP 1: ID INPUT */}
				{step === "id" && (
					<div className='space-y-4'>
						<div className='grid grid-cols-2 gap-2 mb-4'>
							<Button
								variant={idType === "bvn" ? "default" : "outline"}
								onClick={() => {
									setIdType("bvn");
									setIdValue("");
								}}
								className={
									idType === "bvn"
										? "bg-primary text-primary-foreground"
										: "border-border text-foreground hover:bg-accent"
								}
							>
								BVN
							</Button>
							<Button
								variant={idType === "nin" ? "default" : "outline"}
								onClick={() => {
									setIdType("nin");
									setIdValue("");
								}}
								className={
									idType === "nin"
										? "bg-primary text-primary-foreground"
										: "border-border text-foreground hover:bg-accent"
								}
							>
								NIN
							</Button>
						</div>

						<div className='space-y-2'>
							<Label className='text-foreground'>
								Enter your {idType.toUpperCase()}
							</Label>
							<Input
								value={idValue}
								onChange={handleIdChange}
								placeholder={`11-digit ${idType.toUpperCase()}`}
								maxLength={11}
								className='text-lg tracking-widest bg-input border-border focus:ring-secondary/50'
							/>
							<p className='text-xs text-muted-foreground'>
								Your ID is safe and used only for verification.
							</p>
						</div>

						<Button
							onClick={() => setStep("camera")}
							disabled={idValue.length !== 11}
							className='w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4'
						>
							Next: Take Selfie
						</Button>
					</div>
				)}

				{/* STEP 2: CAMERA CAPTURE */}
				{step === "camera" && (
					<div className='space-y-4 text-center'>
						<div className='relative aspect-square bg-muted rounded-xl overflow-hidden border-2 border-dashed border-muted-foreground/30 flex items-center justify-center'>
							{!selfie ? (
								<video
									ref={videoRef}
									autoPlay
									playsInline
									muted
									className='w-full h-full object-cover transform scale-x-[-1]' // Mirror effect
								/>
							) : (
								<img
									src={selfie}
									alt='Captured'
									className='w-full h-full object-cover transform scale-x-[-1]'
								/>
							)}

							<canvas ref={canvasRef} className='hidden' />
						</div>

						<div className='flex gap-3'>
							{error && step === "camera" ? (
								<Button
									onClick={startCamera}
									className='w-full bg-primary'
								>
									Retry Camera
								</Button>
							) : !selfie ? (
								<Button
									onClick={capturePhoto}
									className='w-full bg-primary hover:bg-primary/90'
								>
									<Camera className='w-4 h-4 mr-2' /> Capture
								</Button>
							) : (
								<div className='flex gap-2 w-full'>
									<Button
										variant='outline'
										onClick={() => {
											setSelfie(null);
											startCamera();
										}}
										className='flex-1'
									>
										Retake
									</Button>
									<Button
										onClick={handleVerify}
										className='flex-1 bg-green-600 hover:bg-green-700 text-white'
									>
										Verify Now
									</Button>
								</div>
							)}
						</div>
					</div>
				)}

				{/* STEP 3: PROCESSING */}
				{step === "processing" && (
					<div className='py-12 flex flex-col items-center justify-center space-y-4 text-center'>
						<RefreshCw className='w-12 h-12 text-blue-500 animate-spin' />
						<h3 className='text-lg font-medium text-foreground'>
							Verifying ID...
						</h3>
						<p className='text-sm text-muted-foreground'>
							This matches your selfie against official records.
						</p>
					</div>
				)}

				{/* STEP 4: SUCCESS */}
				{step === "result" && (
					<div className='py-12 flex flex-col items-center justify-center space-y-4 text-center animate-in zoom-in'>
						<div className='w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center'>
							<CheckCircle className='w-10 h-10 text-green-500' />
						</div>
						<h3 className='text-xl font-bold text-green-500'>
							Verified!
						</h3>
						<p className='text-sm text-muted-foreground'>
							Your identity has been confirmed successfully.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
