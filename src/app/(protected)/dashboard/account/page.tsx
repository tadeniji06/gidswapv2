"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { useUserStore } from "@/lib/user-store";
import { KycManager } from "@/_components/settings/kyc/kyc-manager";
import { SavedAccountsSection } from "@/_components/settings/saved-accounts-section";
import {
	User,
	Mail,
	Lock,
	Shield,
	Edit3,
	Save,
	X,
	AlertCircle,
	Loader2,
} from "lucide-react";

type EditingField = "name" | "email" | "password" | null;

interface FormData {
	name: string;
	email: string;
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

export default function AccountPage() {
	const {
		user,
		isLoading,
		error,
		fetchUser,
		updateName,
		updateEmail,
		updatePassword,
		clearError,
	} = useUserStore();

	const [editingField, setEditingField] =
		useState<EditingField>(null);
	const [formData, setFormData] = useState<FormData>({
		name: "",
		email: "",
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	// Load user on mount
	useEffect(() => {
		fetchUser();
	}, [fetchUser]);

	// Populate formData when user changes
	useEffect(() => {
		if (user) {
			setFormData((prev) => ({
				...prev,
				name: user.fullName,
				email: user.email,
			}));
		}
	}, [user]);

	const handleEdit = (field: Exclude<EditingField, null>) => {
		setEditingField(field);
		clearError();
	};

	const handleCancel = () => {
		setEditingField(null);
		if (user) {
			setFormData({
				name: user.fullName,
				email: user.email,
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		}
	};

	const handleSave = async () => {
		if (!editingField) return;

		try {
			switch (editingField) {
				case "name":
					await updateName(formData.name);
					break;
				case "email":
					if (!formData.currentPassword) return;
					await updateEmail(formData.currentPassword, formData.email);
					break;
				case "password":
					if (formData.newPassword !== formData.confirmPassword)
						return;
					if (!formData.currentPassword) return;
					await updatePassword(
						formData.currentPassword,
						formData.newPassword,
					);
					setFormData((prev) => ({
						...prev,
						currentPassword: "",
						newPassword: "",
						confirmPassword: "",
					}));
					break;
			}
			setEditingField(null);
		} catch {
			// errors handled by store
		}
	};

	if (isLoading && !user) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Loader2 className='w-8 h-8 animate-spin text-primary' />
			</div>
		);
	}

	return (
		<div className='container mx-auto p-6 max-w-4xl space-y-6'>
			{/* Header */}
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-foreground mb-2'>
					Account
				</h1>
				<p className='text-muted-foreground'>
					Manage your profile, security, and verification settings.
				</p>
			</div>

			{/* Error Alert */}
			{error && (
				<Alert className='border-destructive/50 text-destructive'>
					<AlertCircle className='h-4 w-4' />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* KYC SECTION */}
			<div className='mb-8'>
				<h2 className='text-xl font-semibold mb-4 text-foreground/80'>
					Identity Verification
				</h2>
				<KycManager />
			</div>

			{/* SAVED ACCOUNTS SECTION */}
			<div className='mb-8'>
				<div className='flex items-center justify-between mb-4'>
					<div>
						<h2 className='text-xl font-semibold text-foreground/80'>
							Saved Bank Accounts
						</h2>
						<p className='text-sm text-muted-foreground mt-0.5'>
							Your saved accounts are pre-filled automatically when you initiate a new transaction.
						</p>
					</div>
				</div>
				<SavedAccountsSection />
			</div>

			{/* Profile Card */}
			<Card className='bg-card border-border'>
				<CardHeader>
					<CardTitle className='flex items-center gap-2 text-card-foreground'>
						<User className='w-5 h-5 text-primary' /> Profile
						Information
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-6'>
					{/* Avatar & Basic Info */}
					<div className='flex items-center gap-4 pb-6 border-b border-border'>
						<div className='w-16 h-16 bg-primary rounded-full flex items-center justify-center'>
							<User className='w-8 h-8 text-primary-foreground' />
						</div>
						<div className='flex-1'>
							<h3 className='text-xl font-semibold text-card-foreground'>
								{user?.fullName || "Loading..."}
							</h3>
							<p className='text-muted-foreground'>{user?.email}</p>
						</div>
					</div>

					{/* Name Field */}
					<EditableField
						label='Full Name'
						description='Your display name'
						value={formData.name}
						editing={editingField === "name"}
						onEdit={() => handleEdit("name")}
						onChange={(val) =>
							setFormData((prev) => ({ ...prev, name: val }))
						}
						onSave={handleSave}
						onCancel={handleCancel}
						icon={User}
						disabled={isLoading}
					/>

					{/* Email Field */}
					<EditableField
						label='Email Address'
						description='Your account email'
						value={formData.email}
						editing={editingField === "email"}
						onEdit={() => handleEdit("email")}
						onChange={(val) =>
							setFormData((prev) => ({ ...prev, email: val }))
						}
						onSave={handleSave}
						onCancel={handleCancel}
						icon={Mail}
						extraInputs={[
							{
								placeholder: "Current password",
								value: formData.currentPassword,
								type: "password",
								onChange: (val: string) =>
									setFormData((prev) => ({
										...prev,
										currentPassword: val,
									})),
							},
						]}
						disabled={isLoading}
					/>

					{/* Password Field */}
					<EditableField
						label='Password'
						description='Change your account password'
						value='••••••••'
						editing={editingField === "password"}
						onEdit={() => handleEdit("password")}
						onChange={() => {}}
						onSave={handleSave}
						onCancel={handleCancel}
						icon={Lock}
						extraInputs={[
							{
								placeholder: "Current password",
								value: formData.currentPassword,
								type: "password",
								onChange: (val: string) =>
									setFormData((prev) => ({
										...prev,
										currentPassword: val,
									})),
							},
							{
								placeholder: "New password",
								value: formData.newPassword,
								type: "password",
								onChange: (val: string) =>
									setFormData((prev) => ({
										...prev,
										newPassword: val,
									})),
							},
							{
								placeholder: "Confirm new password",
								value: formData.confirmPassword,
								type: "password",
								onChange: (val: string) =>
									setFormData((prev) => ({
										...prev,
										confirmPassword: val,
									})),
							},
						]}
						disabled={isLoading}
					/>
				</CardContent>
			</Card>

			{/* Account Information */}
			<Card className='bg-card border-border'>
				<CardHeader>
					<CardTitle className='flex items-center gap-2 text-card-foreground'>
						<Shield className='w-5 h-5 text-primary' /> Account
						Information
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<Label className='text-sm font-medium text-card-foreground'>
								Account Created
							</Label>
							<p className='text-sm text-muted-foreground mt-1'>
								{user?.createdAt
									? new Date(user.createdAt).toLocaleDateString()
									: "N/A"}
							</p>
						</div>
						<div>
							<Label className='text-sm font-medium text-card-foreground'>
								Last Login
							</Label>
							<p className='text-sm text-muted-foreground mt-1'>
								{user?.lastLoginAt
									? new Date(user.lastLoginAt).toLocaleDateString()
									: "N/A"}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

/** Reusable EditableField Component */
interface EditableFieldProps {
	label: string;
	description: string;
	value: string;
	editing: boolean;
	onEdit: () => void;
	onChange: (val: string) => void;
	onSave: () => void;
	onCancel: () => void;
	icon: typeof User;
	extraInputs?: {
		placeholder: string;
		value: string;
		type?: string;
		onChange: (val: string) => void;
	}[];
	disabled?: boolean;
}

function EditableField({
	label,
	description,
	value,
	editing,
	onEdit,
	onChange,
	onSave,
	onCancel,
	icon: Icon,
	extraInputs = [],
	disabled = false,
}: EditableFieldProps) {
	return (
		<div className='space-y-3'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<Icon className='w-5 h-5 text-muted-foreground' />
					<div>
						<Label className='text-sm font-medium text-card-foreground'>
							{label}
						</Label>
						<p className='text-sm text-muted-foreground'>
							{description}
						</p>
					</div>
				</div>
				{!editing && (
					<Button
						variant='outline'
						size='sm'
						onClick={onEdit}
						className='border-border hover:bg-accent hover:text-accent-foreground'
					>
						<Edit3 className='w-4 h-4 mr-2' />
						Edit
					</Button>
				)}
			</div>

			{editing ? (
				<div className='space-y-2 ml-8'>
					<Input
						value={value}
						onChange={(e) => onChange(e.target.value)}
						className='bg-input border-border focus:ring-ring'
						placeholder={`Enter ${label.toLowerCase()}`}
					/>
					{extraInputs.map((inp, idx) => (
						<Input
							key={idx}
							value={inp.value}
							onChange={(e) => inp.onChange(e.target.value)}
							type={inp.type || "text"}
							placeholder={inp.placeholder}
							className='bg-input border-border focus:ring-ring'
						/>
					))}
					<div className='flex gap-2'>
						<Button
							onClick={onSave}
							disabled={disabled}
							className='bg-primary hover:bg-primary/90 text-primary-foreground'
						>
							<Save className='w-4 h-4 mr-1' /> Save
						</Button>
						<Button
							variant='outline'
							onClick={onCancel}
							className='border-border hover:bg-secondary bg-transparent'
						>
							<X className='w-4 h-4 mr-1' /> Cancel
						</Button>
					</div>
				</div>
			) : (
				<div className='ml-8'>
					<p className='text-card-foreground font-medium'>{value}</p>
				</div>
			)}
		</div>
	);
}
