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
							Code together.
							<br />
							<span className="text-muted-foreground">
								Ship faster.
							</span>
						</h1>
						<p className="mt-6 text-muted-foreground text-sm leading-relaxed max-w-[300px]">
							Real-time collaborative code editing with live
							cursors, shared sessions, and instant sync across
							your team.
						</p>
					</div>

					{/* ── Right Side: Form ── */}
					<div className="p-8 lg:p-14 flex flex-col justify-center">
						<div className="mb-8">
							<h2 className="text-2xl font-semibold tracking-tight text-foreground">
								Welcome back
							</h2>
							<p className="mt-1.5 text-sm text-muted-foreground">
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
								<Input
									id="password"
									type="password"
									placeholder="••••••••"
									autoComplete="current-password"
									aria-invalid={!!errors.password}
									{...register("password")}
								/>
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
								className="w-full gap-2 mt-2"
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
						<p className="mt-8 text-xs text-muted-foreground">
							No account?{" "}
							<Link
								to="/auth/signup"
								className="text-foreground font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
							>
								Create one
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
