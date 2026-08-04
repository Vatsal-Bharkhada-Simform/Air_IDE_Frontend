import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CircleNotch, ArrowRight, Code } from "@phosphor-icons/react";

import { useLoginUserMutation } from "../store/api/api";
import { useApiDispatch } from "../store/store";
import { setToken } from "../store/slices/authSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const loginSchema = z.object({
	email: z.email({ message: "Invalid email address" }),
	password: z.string().min(1, { message: "Password is required" }),
});

export function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const from = (location.state as { from?: Location })?.from?.pathname ?? "/";
	const dispatch = useApiDispatch();
	const [loginUser, { isLoading }] = useLoginUserMutation();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
	});

	async function onSubmit(values: z.infer<typeof loginSchema>) {
		try {
			setServerError(null);
			const response = await loginUser(values).unwrap();
			if (response.success) {
				dispatch(setToken(response.data.token));
				navigate(from, { replace: true });
			}
		} catch (error: any) {
			setServerError(
				error.data?.message ||
					"Authentication failed. Check your credentials."
			);
		}
	}

	return (
		<div className="min-h-[100dvh] flex bg-[oklch(0.087_0.018_270)] overflow-hidden">
			{/* ── Left panel: brand identity ───────────────────────────── */}
			<div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">
				{/* Ambient glow orbs */}
				<div
					className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full opacity-[0.12]"
					style={{
						background:
							"radial-gradient(circle, oklch(0.62 0.24 275) 0%, transparent 70%)",
						filter: "blur(60px)",
					}}
				/>
				<div
					className="absolute bottom-0 right-0 w-[360px] h-[360px] rounded-full opacity-[0.07]"
					style={{
						background:
							"radial-gradient(circle, oklch(0.72 0.2 145) 0%, transparent 70%)",
						filter: "blur(80px)",
					}}
				/>

				{/* Grid overlay */}
				<div
					className="absolute inset-0 pointer-events-none opacity-[0.025]"
					style={{
						backgroundImage:
							"linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
						backgroundSize: "40px 40px",
					}}
				/>

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

				{/* Headline */}
				<div className="relative z-10 animate-fade-up delay-75">
					<p className="text-[oklch(0.62_0.24_275)] text-xs uppercase tracking-[0.18em] mb-5 font-mono">
						[ Collaborative IDE ]
					</p>
					<h1
						className="text-5xl xl:text-6xl font-bold tracking-tight leading-[0.95] text-[oklch(0.94_0.008_270)]"
						style={{ fontFamily: "var(--font-display)" }}
					>
						Code together.
						<br />
						<span
							className="text-[oklch(0.62_0.24_275)]"
							style={{
								textShadow:
									"0 0 40px oklch(0.62 0.24 275 / 0.4)",
							}}
						>
							Ship faster.
						</span>
					</h1>
					<p className="mt-6 text-[oklch(0.56_0.012_270)] text-sm leading-relaxed max-w-sm">
						Real-time collaborative code editing with live cursors,
						shared sessions, and instant sync across your team.
					</p>
				</div>

				{/* Telemetry strip */}
				<div className="relative z-10 animate-fade-up delay-150">
					<div
						className="inline-flex items-center gap-4 px-4 py-3 rounded-lg"
						style={{
							background: "oklch(1 0 0 / 0.03)",
							border: "1px solid oklch(1 0 0 / 0.06)",
						}}
					>
						<div className="flex items-center gap-1.5">
							<span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.72_0.2_145)] animate-live-pulse" />
							<span className="text-xs font-mono text-[oklch(0.56_0.012_270)] uppercase tracking-widest">
								Live Sessions
							</span>
						</div>
						<div className="h-3 w-px bg-[oklch(1_0_0/0.08)]" />
						<span className="text-xs font-mono text-[oklch(0.56_0.012_270)] uppercase tracking-widest">
							Yjs CRDT
						</span>
						<div className="h-3 w-px bg-[oklch(1_0_0/0.08)]" />
						<span className="text-xs font-mono text-[oklch(0.56_0.012_270)] uppercase tracking-widest">
							Monaco Editor
						</span>
					</div>
				</div>
			</div>

			{/* ── Right panel: login form ───────────────────────────────── */}
			<div className="flex flex-1 items-center justify-center p-6 lg:p-12 relative">
				{/* Subtle right-side border on desktop */}
				<div className="absolute left-0 top-0 bottom-0 w-px bg-[oklch(1_0_0/0.06)] hidden lg:block" />

				{/* Mobile brand mark */}
				<div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
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
				<div className="w-full max-w-sm animate-fade-up">
					{/* Outer shell */}
					<div
						className="rounded-2xl p-px"
						style={{
							background:
								"linear-gradient(135deg, oklch(1 0 0 / 0.1) 0%, oklch(1 0 0 / 0.03) 100%)",
						}}
					>
						{/* Inner core */}
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
							<div className="mb-8">
								<p className="text-xs font-mono uppercase tracking-[0.15em] text-[oklch(0.62_0.24_275)] mb-2">
									[ AUTH ]
								</p>
								<h2
									className="text-2xl font-bold text-[oklch(0.94_0.008_270)] tracking-tight"
									style={{
										fontFamily: "var(--font-display)",
									}}
								>
									Welcome back
								</h2>
								<p className="mt-1 text-sm text-[oklch(0.56_0.012_270)]">
									Sign in to your workspace
								</p>
							</div>

							<form
								onSubmit={handleSubmit(onSubmit)}
								className="space-y-5"
							>
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
									<Input
										id="password"
										type="password"
										placeholder="••••••••"
										autoComplete="current-password"
										{...register("password")}
									/>
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
									className="w-full h-10 gap-2 text-sm font-medium"
									disabled={isLoading}
								>
									{isLoading ? (
										<>
											<CircleNotch
												size={16}
												className="animate-spin"
											/>
											Authenticating...
										</>
									) : (
										<>
											Sign in
											<ArrowRight
												size={15}
												weight="bold"
												className="ml-auto"
											/>
										</>
									)}
								</Button>
							</form>

							{/* Footer link */}
							<p className="mt-6 text-center text-xs font-mono text-[oklch(0.45_0.01_270)] uppercase tracking-wider">
								No account?{" "}
								<Link
									to="/auth/signup"
									className="text-[oklch(0.62_0.24_275)] hover:text-[oklch(0.72_0.24_275)] transition-colors"
								>
									Create one
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
