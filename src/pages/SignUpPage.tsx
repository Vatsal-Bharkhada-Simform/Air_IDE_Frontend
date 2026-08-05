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
	{ id: "upper", label: "Uppercase", test: (v) => /[A-Z]/.test(v) },
	{ id: "lower", label: "Lowercase", test: (v) => /[a-z]/.test(v) },
	{ id: "digit", label: "Number", test: (v) => /[0-9]/.test(v) },
];

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
		<div className="min-h-[100dvh] flex flex-col bg-background p-6 md:p-8">
			{/* ── Centered Card ── */}
			<div className="flex flex-1 items-center justify-center">
				<div className="w-full max-w-4xl bg-card rounded-xl border border-border overflow-hidden flex flex-col lg:grid lg:grid-cols-2 animate-fade-up">
					{/* ── Left Side: Brand/Description ── */}
					<div className="p-8 lg:p-14 flex flex-col justify-start">
						<div className="flex items-center gap-3 mb-10">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
								<Code size={16} weight="bold" />
							</div>
							<span className="text-xl font-bold tracking-tight text-foreground">
								Air
								<span className="text-muted-foreground font-normal">
									IDE
								</span>
							</span>
						</div>

						<h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-[1.1]">
							Build with
							<br />
							<span className="text-muted-foreground">
								your team.
							</span>
						</h1>
						<p className="mt-6 text-muted-foreground text-sm leading-relaxed max-w-[300px]">
							Create a workspace, invite collaborators, and start
							coding together. No setup, no friction.
						</p>
					</div>

					{/* ── Right Side: Form ── */}
					<div className="p-8 lg:p-14 flex flex-col justify-center">
						<div className="mb-8">
							<h2 className="text-2xl font-semibold tracking-tight text-foreground">
								Create account
							</h2>
							<p className="mt-1.5 text-sm text-muted-foreground">
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
									className="text-xs font-medium text-foreground"
								>
									Username
								</Label>
								<Input
									id="username"
									type="text"
									placeholder="your_handle"
									autoComplete="username"
									aria-invalid={!!errors.username}
									{...register("username")}
								/>
								{errors.username ? (
									<p className="text-xs text-accent-red-fg mt-1">
										{errors.username.message}
									</p>
								) : (
									<p className="text-xs text-muted-foreground mt-1">
										3–30 chars · letters, numbers,
										underscores
									</p>
								)}
							</div>

							{/* Email */}
							<div className="space-y-1.5">
								<Label
									htmlFor="email"
									className="text-xs font-medium text-foreground"
								>
									Email
								</Label>
								<Input
									id="email"
									type="email"
									placeholder="name@example.com"
									autoComplete="email"
									aria-invalid={!!errors.email}
									{...register("email")}
								/>
								{errors.email && (
									<p className="text-xs text-accent-red-fg mt-1">
										{errors.email.message}
									</p>
								)}
							</div>

							{/* Password */}
							<div className="space-y-1.5">
								<Label
									htmlFor="password"
									className="text-xs font-medium text-foreground"
								>
									Password
								</Label>
								<div className="relative">
									<Input
										id="password"
										type={
											showPassword ? "text" : "password"
										}
										placeholder="••••••••"
										autoComplete="new-password"
										className="pr-10"
										aria-invalid={!!errors.password}
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
										className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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

								{/* Strength bar */}
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

											let bgClass = "bg-muted";
											if (filled) {
												if (all)
													bgClass =
														"bg-accent-green-fg";
												else if (half)
													bgClass =
														"bg-accent-amber-fg";
												else
													bgClass =
														"bg-accent-red-fg";
											}

											return (
												<div
													key={i}
													className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${bgClass}`}
												/>
											);
										})}
									</div>
								)}

								{/* Rule checklist */}
								{passwordTouched && (
									<ul className="grid grid-cols-2 gap-1 pt-1">
										{PASSWORD_RULES.map((rule) => {
											const ok = rule.test(passwordValue);
											return (
												<li
													key={rule.id}
													className={`flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors ${
														ok
															? "text-accent-green-fg"
															: "text-muted-foreground"
													}`}
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
									<p className="text-xs text-accent-red-fg mt-1">
										{errors.password.message}
									</p>
								)}
							</div>

							{/* Server error */}
							{serverError && (
								<div className="flex items-start gap-2 rounded-md px-3 py-2.5 text-xs text-accent-red-fg bg-accent-red-bg border border-accent-red-bg">
									<span className="shrink-0 font-medium">
										ERR
									</span>
									<span>{serverError}</span>
								</div>
							)}

							{/* Submit */}
							<Button
								type="submit"
								className="w-full gap-2 mt-1"
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

						<p className="mt-8 text-xs text-muted-foreground">
							Have an account?{" "}
							<Link
								to="/auth/login"
								className="text-foreground font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
							>
								Sign in
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
