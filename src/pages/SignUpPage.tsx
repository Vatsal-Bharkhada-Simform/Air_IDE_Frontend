import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";

import { useSignupUserMutation } from "../store/api/api";
import { useApiDispatch } from "../store/store";
import { setToken } from "../store/slices/authSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../components/ui/card";

// ── Schema mirrors auth.validator.js signupRules exactly ──────────────────────

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

// ── Password rule descriptors (shown as checklist under the input) ─────────────

interface PasswordRule {
	id: string;
	label: string;
	test: (v: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
	{ id: "len", label: "At least 8 characters", test: (v) => v.length >= 8 },
	{
		id: "upper",
		label: "One uppercase letter (A–Z)",
		test: (v) => /[A-Z]/.test(v),
	},
	{
		id: "lower",
		label: "One lowercase letter (a–z)",
		test: (v) => /[a-z]/.test(v),
	},
	{ id: "digit", label: "One number (0–9)", test: (v) => /[0-9]/.test(v) },
];

// ── Password strength score → colour ──────────────────────────────────────────

function strengthColor(passed: number, total: number) {
	if (passed === 0) return "bg-muted";
	if (passed < total / 2) return "bg-destructive";
	if (passed < total) return "bg-yellow-500";
	return "bg-emerald-500";
}

// ── Component ─────────────────────────────────────────────────────────────────

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
				error.data?.message || "An error occurred during sign up"
			);
		}
	}

	const passedRules = PASSWORD_RULES.filter((r) => r.test(passwordValue));
	const passwordTouched = passwordValue.length > 0;

	return (
		<div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
			<Card className="w-full max-w-md shadow-lg border-zinc-200 dark:border-zinc-800">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold tracking-tight text-center">
						Create an account
					</CardTitle>
					<CardDescription className="text-center">
						Enter your details below to create your account
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-4"
					>
						{/* ── Username ── */}
						<div className="space-y-2">
							<Label htmlFor="username">Username</Label>
							<Input
								id="username"
								type="text"
								placeholder="johndoe"
								autoComplete="username"
								{...register("username")}
							/>
							{errors.username && (
								<p className="text-sm font-medium text-destructive">
									{errors.username.message}
								</p>
							)}
							<p className="text-xs text-muted-foreground">
								3–30 characters, letters, numbers and
								underscores only.
							</p>
						</div>

						{/* ── Email ── */}
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="name@example.com"
								autoComplete="email"
								{...register("email")}
							/>
							{errors.email && (
								<p className="text-sm font-medium text-destructive">
									{errors.email.message}
								</p>
							)}
						</div>

						{/* ── Password ── */}
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									autoComplete="new-password"
									className="pr-10"
									{...register("password", {
										onChange: (e) =>
											setPasswordValue(e.target.value),
									})}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
									aria-label={
										showPassword
											? "Hide password"
											: "Show password"
									}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>

							{/* Strength bar */}
							{passwordTouched && (
								<div className="flex gap-1 pt-0.5">
									{PASSWORD_RULES.map((_, i) => (
										<div
											key={i}
											className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
												i < passedRules.length
													? strengthColor(
															passedRules.length,
															PASSWORD_RULES.length
														)
													: "bg-muted"
											}`}
										/>
									))}
								</div>
							)}

							{/* Rule checklist */}
							{passwordTouched && (
								<ul className="space-y-1 pt-1">
									{PASSWORD_RULES.map((rule) => {
										const ok = rule.test(passwordValue);
										return (
											<li
												key={rule.id}
												className={`flex items-center gap-1.5 text-xs transition-colors ${
													ok
														? "text-emerald-600 dark:text-emerald-400"
														: "text-muted-foreground"
												}`}
											>
												{ok ? (
													<Check className="h-3 w-3 shrink-0" />
												) : (
													<X className="h-3 w-3 shrink-0" />
												)}
												{rule.label}
											</li>
										);
									})}
								</ul>
							)}

							{/* Zod error (shown after first submit attempt) */}
							{errors.password && (
								<p className="text-sm font-medium text-destructive">
									{errors.password.message}
								</p>
							)}
						</div>

						{/* ── Server error ── */}
						{serverError && (
							<div className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive">
								{serverError}
							</div>
						)}

						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating account...
								</>
							) : (
								"Sign up"
							)}
						</Button>
					</form>
				</CardContent>

				<CardFooter className="flex flex-col space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-2">
					<div className="text-sm text-center text-muted-foreground">
						Already have an account?{" "}
						<Link
							to="/auth/login"
							className="text-primary hover:underline font-medium"
						>
							Log in
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
