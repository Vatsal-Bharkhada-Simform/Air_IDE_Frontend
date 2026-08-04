import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Eye,
	EyeSlash,
	CircleNotch,
	ArrowRight,
	Check,
	X,
	Code,
} from "@phosphor-icons/react";

import { useSignupUserMutation } from "../store/api/api";
import { useApiDispatch } from "../store/store";
import { setToken } from "../store/slices/authSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

// ── Schema ──────────────────────────────────────────────────────────────────

const signupSchema = z.object({
	username: z
		.string()
		.min(1, { message: "Username is required." })
		.min(3, { message: "Username must be between 3 and 30 characters." })
		.max(30, { message: "Username must be between 3 and 30 characters." })
		.regex(/^[a-zA-Z0-9_]+$/, {
			message:
				"Username can only contain letters, numbers, and underscores.",
		}),
	email: z.email({ message: "Please provide a valid email address." }),
	password: z
		.string()
		.min(1, { message: "Password is required." })
		.min(8, { message: "Password must be at least 8 characters long." })
		.regex(/[A-Z]/, {
			message: "Password must contain at least one uppercase letter.",
		})
		.regex(/[a-z]/, {
			message: "Password must contain at least one lowercase letter.",
		})
		.regex(/[0-9]/, {
			message: "Password must contain at least one number.",
		}),
});

type SignupValues = z.infer<typeof signupSchema>;

interface PasswordRule {
	id: string;
	label: string;
	test: (v: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
	{ id: "len", label: "8+ chars", test: (v) => v.length >= 8 },
	{
		id: "upper",
		label: "Uppercase",
		test: (v) => /[A-Z]/.test(v),
	},
	{
		id: "lower",
		label: "Lowercase",
		test: (v) => /[a-z]/.test(v),
	},
	{ id: "digit", label: "Number", test: (v) => /[0-9]/.test(v) },
];

// ── Component ────────────────────────────────────────────────────────────────

export function SignUpPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const from = (location.state as { from?: Location })?.from?.pathname ?? "/";
	const dispatch = useApiDispatch();
	const [signupUser, { isLoading }] = useSignupUserMutation();
	const [serverError, setServerError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [passwordValue, setPasswordValue] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignupValues>({
		resolver: zodResolver(signupSchema),
		mode: "onTouched",
	});

	async function onSubmit(values: SignupValues) {
		try {
			setServerError(null);
			const response = await signupUser(values).unwrap();
			if (response.success) {
				dispatch(setToken(response.data.token));
				navigate(from, { replace: true });
			}
		} catch (error: any) {
			setServerError(
				error.data?.message || "Registration failed. Please try again."
			);
		}
	}

	const passedRules = PASSWORD_RULES.filter((r) => r.test(passwordValue));
	const passwordTouched = passwordValue.length > 0;

	return (
		<div className="min-h-[100dvh] flex bg-[oklch(0.087_0.018_270)] overflow-hidden">
			{/* ── Left panel: form ─────────────────────────────────────────── */}
			<div className="flex flex-1 items-center justify-center p-6 lg:p-12 relative">
				{/* Ambient glow */}
				<div
					className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.09]"
					style={{
						background:
							"radial-gradient(circle, oklch(0.72 0.2 145) 0%, transparent 70%)",
						filter: "blur(80px)",
					}}
				/>

				{/* Grid overlay */}
				<div
					className="absolute inset-0 pointer-events-none opacity-[0.02]"
					style={{
						backgroundImage:
							"linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
						backgroundSize: "40px 40px",
					}}
				/>

				{/* Mobile brand mark */}
				<div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden z-10">
					<div
						className="flex h-7 w-7 items-center justify-center rounded-md"
						style={{
							background: "oklch(0.62 0.24 275)",
							boxShadow: "0 0 14px oklch(0.62 0.24 275 / 0.3)",
						}}
					>
						<Code size={14} weight="bold" className="text-white" />
					</div>
					<span
						className="text-base font-bold tracking-tight"
						style={{ fontFamily: "var(--font-display)" }}
					>
						Air{" "}
						<span style={{ color: "oklch(0.62 0.24 275)" }}>
							IDE
						</span>
					</span>
				</div>

				{/* Form card — Double-Bezel */}
				<div className="w-full max-w-sm relative z-10 animate-fade-up">
					<div
						className="rounded-2xl p-px"
						style={{
							background:
								"linear-gradient(135deg, oklch(1 0 0 / 0.1) 0%, oklch(1 0 0 / 0.03) 100%)",
						}}
					>
						<div
							className="rounded-[calc(1rem-1px)] p-8"
							style={{
								background: "oklch(0.12 0.016 270 / 0.95)",
								backdropFilter: "blur(24px)",
								boxShadow:
									"inset 0 1px 0 oklch(1 0 0 / 0.08), inset 0 -1px 0 oklch(0 0 0 / 0.15), 0 32px 80px oklch(0 0 0 / 0.5)",
							}}
						>
							{/* Header */}
							<div className="mb-7">
								<p className="text-xs font-mono uppercase tracking-[0.15em] text-[oklch(0.72_0.2_145)] mb-2">
									[ NEW USER ]
								</p>
								<h2
									className="text-2xl font-bold text-[oklch(0.94_0.008_270)] tracking-tight"
									style={{
										fontFamily: "var(--font-display)",
									}}
								>
									Create your account
								</h2>
								<p className="mt-1 text-sm text-[oklch(0.56_0.012_270)]">
									Start collaborating in seconds
								</p>
							</div>

							<form
								onSubmit={handleSubmit(onSubmit)}
								className="space-y-4"
							>
								{/* Username */}
								<div className="space-y-1.5">
									<Label
										htmlFor="username"
										className="text-xs font-mono uppercase tracking-wider text-[oklch(0.56_0.012_270)]"
									>
										Username
									</Label>
									<Input
										id="username"
										type="text"
										placeholder="your_handle"
										autoComplete="username"
										{...register("username")}
									/>
									{errors.username ? (
										<p className="text-xs font-mono text-[oklch(0.65_0.22_22)] mt-1">
											{errors.username.message}
										</p>
									) : (
										<p className="text-xs font-mono text-[oklch(0.42_0.01_270)] mt-1">
											3–30 chars · letters, numbers,
											underscores
										</p>
									)}
								</div>

								{/* Email */}
								<div className="space-y-1.5">
									<Label
										htmlFor="email"
										className="text-xs font-mono uppercase tracking-wider text-[oklch(0.56_0.012_270)]"
									>
										Email
									</Label>
									<Input
										id="email"
										type="email"
										placeholder="name@example.com"
										autoComplete="email"
										{...register("email")}
									/>
									{errors.email && (
										<p className="text-xs font-mono text-[oklch(0.65_0.22_22)] mt-1">
											{errors.email.message}
										</p>
									)}
								</div>

								{/* Password */}
								<div className="space-y-1.5">
									<Label
										htmlFor="password"
										className="text-xs font-mono uppercase tracking-wider text-[oklch(0.56_0.012_270)]"
									>
										Password
									</Label>
									<div className="relative">
										<Input
											id="password"
											type={
												showPassword
													? "text"
													: "password"
											}
											placeholder="••••••••"
											autoComplete="new-password"
											className="pr-10"
											{...register("password", {
												onChange: (e) =>
													setPasswordValue(
														e.target.value
													),
											})}
										/>
										<button
											type="button"
											onClick={() =>
												setShowPassword((v) => !v)
											}
											className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.01_270)] hover:text-[oklch(0.72_0.012_270)] transition-colors"
											aria-label={
												showPassword
													? "Hide password"
													: "Show password"
											}
										>
											{showPassword ? (
												<EyeSlash size={15} />
											) : (
												<Eye size={15} />
											)}
										</button>
									</div>

									{/* Strength bar — 4 segments */}
									{passwordTouched && (
										<div className="flex gap-1 pt-1">
											{PASSWORD_RULES.map((_, i) => {
												const filled =
													i < passedRules.length;
												const all =
													passedRules.length ===
													PASSWORD_RULES.length;
												const half =
													passedRules.length >= 2;
												const color = all
													? "oklch(0.72 0.2 145)"
													: half
														? "oklch(0.78 0.18 85)"
														: "oklch(0.65 0.22 22)";
												return (
													<div
														key={i}
														className="h-[3px] flex-1 rounded-full transition-all duration-300"
														style={{
															background: filled
																? color
																: "oklch(1 0 0 / 0.08)",
														}}
													/>
												);
											})}
										</div>
									)}

									{/* Rule checklist */}
									{passwordTouched && (
										<ul className="grid grid-cols-2 gap-1 pt-1">
											{PASSWORD_RULES.map((rule) => {
												const ok =
													rule.test(passwordValue);
												return (
													<li
														key={rule.id}
														className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors"
														style={{
															color: ok
																? "oklch(0.72 0.2 145)"
																: "oklch(0.42 0.01 270)",
														}}
													>
														{ok ? (
															<Check
																size={10}
																weight="bold"
															/>
														) : (
															<X
																size={10}
																weight="bold"
															/>
														)}
														{rule.label}
													</li>
												);
											})}
										</ul>
									)}

									{errors.password && (
										<p className="text-xs font-mono text-[oklch(0.65_0.22_22)] mt-1">
											{errors.password.message}
										</p>
									)}
								</div>

								{/* Server error */}
								{serverError && (
									<div
										className="flex items-start gap-2 rounded-md px-3 py-2.5 text-xs font-mono"
										style={{
											background:
												"oklch(0.65 0.22 22 / 0.08)",
											border: "1px solid oklch(0.65 0.22 22 / 0.25)",
											color: "oklch(0.75 0.18 22)",
										}}
									>
										<span className="shrink-0 mt-px">
											ERR
										</span>
										<span>{serverError}</span>
									</div>
								)}

								{/* Submit */}
								<Button
									type="submit"
									className="w-full h-10 gap-2 text-sm font-medium mt-1"
									disabled={isLoading}
								>
									{isLoading ? (
										<>
											<CircleNotch
												size={16}
												className="animate-spin"
											/>
											Creating account...
										</>
									) : (
										<>
											Create account
											<ArrowRight
												size={15}
												weight="bold"
												className="ml-auto"
											/>
										</>
									)}
								</Button>
							</form>

							<p className="mt-6 text-center text-xs font-mono text-[oklch(0.45_0.01_270)] uppercase tracking-wider">
								Have an account?{" "}
								<Link
									to="/auth/login"
									className="text-[oklch(0.62_0.24_275)] hover:text-[oklch(0.72_0.24_275)] transition-colors"
								>
									Sign in
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* ── Right panel: brand identity (mirrored) ───────────────── */}
			<div className="hidden lg:flex lg:w-[48%] relative flex-col justify-between p-12 overflow-hidden">
				{/* Ambient glow orbs */}
				<div
					className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.1]"
					style={{
						background:
							"radial-gradient(circle, oklch(0.62 0.24 275) 0%, transparent 70%)",
						filter: "blur(60px)",
					}}
				/>
				<div
					className="absolute top-1/4 left-0 w-[300px] h-[300px] rounded-full opacity-[0.06]"
					style={{
						background:
							"radial-gradient(circle, oklch(0.72 0.2 145) 0%, transparent 70%)",
						filter: "blur(80px)",
					}}
				/>

				{/* Grid */}
				<div
					className="absolute inset-0 pointer-events-none opacity-[0.025]"
					style={{
						backgroundImage:
							"linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
						backgroundSize: "40px 40px",
					}}
				/>

				{/* Left border */}
				<div className="absolute left-0 top-0 bottom-0 w-px bg-[oklch(1_0_0/0.06)]" />

				{/* Brand mark */}
				<div className="relative z-10 flex items-center gap-3 animate-fade-in">
					<div
						className="flex h-9 w-9 items-center justify-center rounded-lg"
						style={{
							background:
								"linear-gradient(135deg, oklch(0.62 0.24 275), oklch(0.52 0.22 275))",
							boxShadow:
								"inset 0 1px 0 oklch(1 0 0 / 0.15), 0 0 20px oklch(0.62 0.24 275 / 0.3)",
						}}
					>
						<Code size={18} weight="bold" className="text-white" />
					</div>
					<span
						className="text-xl font-bold tracking-tight"
						style={{ fontFamily: "var(--font-display)" }}
					>
						Air{" "}
						<span style={{ color: "oklch(0.62 0.24 275)" }}>
							IDE
						</span>
					</span>
				</div>

				{/* Copy */}
				<div className="relative z-10 animate-fade-up delay-75">
					<p className="text-[oklch(0.72_0.2_145)] text-xs uppercase tracking-[0.18em] mb-5 font-mono">
						[ Join the network ]
					</p>
					<h1
						className="text-5xl xl:text-6xl font-bold tracking-tight leading-[0.95] text-[oklch(0.94_0.008_270)]"
						style={{ fontFamily: "var(--font-display)" }}
					>
						Build with
						<br />
						<span
							className="text-[oklch(0.62_0.24_275)]"
							style={{
								textShadow:
									"0 0 40px oklch(0.62 0.24 275 / 0.4)",
							}}
						>
							your team.
						</span>
					</h1>
					<p className="mt-6 text-[oklch(0.56_0.012_270)] text-sm leading-relaxed max-w-sm">
						Create a workspace, invite collaborators, and start
						coding together. No setup, no friction.
					</p>
				</div>

				{/* Features strip */}
				<div className="relative z-10 space-y-2 animate-fade-up delay-150">
					{[
						{ label: "Live cursors", status: "ACTIVE" },
						{ label: "CRDT sync", status: "STABLE" },
						{ label: "File sharing", status: "ACTIVE" },
					].map(({ label, status }) => (
						<div
							key={label}
							className="flex items-center justify-between px-4 py-2.5 rounded-lg"
							style={{
								background: "oklch(1 0 0 / 0.03)",
								border: "1px solid oklch(1 0 0 / 0.06)",
							}}
						>
							<span className="text-xs font-mono text-[oklch(0.56_0.012_270)] uppercase tracking-wider">
								{label}
							</span>
							<span
								className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded"
								style={{
									background: "oklch(0.72 0.2 145 / 0.1)",
									color: "oklch(0.72 0.2 145)",
									border: "1px solid oklch(0.72 0.2 145 / 0.2)",
								}}
							>
								{status}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
