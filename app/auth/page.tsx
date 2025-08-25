"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	AlertCircle,
	CheckCircle2,
	Eye,
	EyeOff,
	LogIn,
	UserPlus,
	Plane,
	Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-client";
import { UserLoginInput, UserSignupInput } from "@/types/user";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";

const CUSTOMER_EMAIL = "customer@raushan.info";
const ADMIN_EMAIL = "admin@raushan.info";
const PASSWORD = "Gocomet@12";

interface ValidationErrors {
	name?: string;
	email?: string;
	password?: string;
}

export default function AuthPage() {
	const router = useRouter();
	const { user, isLoading, login, signup } = useAuth();
	const [mode, setMode] = useState<AuthMode>("login");
	const [showPassword, setShowPassword] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [errors, setErrors] = useState<ValidationErrors>({});

	const [loginForm, setLoginForm] = useState<UserLoginInput>({
		email: "",
		password: "",
	});

	const [signupForm, setSignupForm] = useState<UserSignupInput>({
		name: "",
		email: "",
		password: "",
	});

	// Redirect if already authenticated
	useEffect(() => {
		if (!isLoading && user) {
			router.push("/");
		}
	}, [user, isLoading, router]);

	// Show loading if checking auth status
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
			</div>
		);
	}

	// Don't render if user is authenticated (while redirecting)
	if (user) {
		return null;
	}

	const validateForm = (): boolean => {
		const newErrors: ValidationErrors = {};

		if (mode === "signup") {
			if (!signupForm.name || signupForm.name.length < 3) {
				newErrors.name = "Name must be at least 3 characters";
			}
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const currentEmail =
			mode === "login" ? loginForm.email : signupForm.email;
		if (!currentEmail || !emailRegex.test(currentEmail)) {
			newErrors.email = "Please enter a valid email address";
		}

		const currentPassword =
			mode === "login" ? loginForm.password : signupForm.password;
		if (!currentPassword || currentPassword.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setSubmitting(true);
		try {
			const result = await login(loginForm);
			if (result.success) {
				toast.success("Welcome back! Redirecting...");
				router.push("/");
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Login failed. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setSubmitting(true);
		try {
			const result = await signup(signupForm);
			if (result.success) {
				toast.success("Account created successfully! Welcome aboard!");
				router.push("/");
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Signup failed. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	const switchMode = (newMode: AuthMode) => {
		setMode(newMode);
		setErrors({});
		setShowPassword(false);
	};

	const fillCustomerCredentials = () => {
		if (mode === "login") {
			setLoginForm({
				email: CUSTOMER_EMAIL,
				password: PASSWORD,
			});
		} else {
			setSignupForm({
				name: "Customer User",
				email: CUSTOMER_EMAIL,
				password: PASSWORD,
			});
		}
		setErrors({});
		toast.success("Customer credentials filled!");
	};

	const fillAdminCredentials = () => {
		if (mode === "login") {
			setLoginForm({
				email: ADMIN_EMAIL,
				password: PASSWORD,
			});
		} else {
			setSignupForm({
				name: "Admin User",
				email: ADMIN_EMAIL,
				password: PASSWORD,
			});
		}
		setErrors({});
		toast.success("Admin credentials filled!");
	};

	return (
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
			<Navbar />

			<main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-md space-y-8">
					{/* Header */}
					<div className="text-center animate-fade-in">
						<div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group hover:bg-primary/20 transition-colors">
							<Plane className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
						</div>
						<h1 className="text-3xl font-bold tracking-tight text-foreground">
							{mode === "login"
								? "Welcome back"
								: "Join AirCargo Pro"}
						</h1>
						<p className="mt-2 text-muted-foreground">
							{mode === "login"
								? "Sign in to your account to continue"
								: "Create your account to get started"}
						</p>
					</div>

					{/* Auth Card */}
					<Card className="animate-slide-in shadow-2xl hover:shadow-3xl transition-all duration-500 border-0 bg-card/60 backdrop-blur-sm">
						<CardHeader className="space-y-1 pb-6">
							<div className="flex items-center justify-center space-x-1 mb-4">
								<Button
									variant={
										mode === "login" ? "default" : "ghost"
									}
									onClick={() => switchMode("login")}
									className={cn(
										"flex-1 transition-all duration-300",
										mode === "login"
											? "bg-primary text-primary-foreground shadow-md"
											: "hover:bg-muted/50"
									)}
									disabled={submitting}
								>
									<LogIn className="mr-2 h-4 w-4" />
									Sign In
								</Button>
								<Button
									variant={
										mode === "signup" ? "default" : "ghost"
									}
									onClick={() => switchMode("signup")}
									className={cn(
										"flex-1 transition-all duration-300",
										mode === "signup"
											? "bg-primary text-primary-foreground shadow-md"
											: "hover:bg-muted/50"
									)}
									disabled={submitting}
								>
									<UserPlus className="mr-2 h-4 w-4" />
									Sign Up
								</Button>
							</div>
						</CardHeader>

						<CardContent className="space-y-6">
							<form
								onSubmit={
									mode === "login"
										? handleLogin
										: handleSignup
								}
								className="space-y-4"
							>
								{/* Quick Fill Buttons */}
								{mode === "login" ? (
									<div className="flex gap-3 justify-center pb-3">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={fillCustomerCredentials}
											disabled={submitting}
											className="group relative overflow-hidden text-xs px-4 py-2 h-8 border-primary/30 hover:border-primary/60 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 text-primary transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
										>
											<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
											<span className="relative font-medium hover:text-secondary-foreground">
												Fill Customer Credentials
											</span>
										</Button>

										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={fillAdminCredentials}
											disabled={submitting}
											className="group relative overflow-hidden text-xs px-4 py-2 h-8 border-destructive/30 hover:border-destructive/60 bg-gradient-to-r from-destructive/5 to-destructive/10 hover:from-destructive/10 hover:to-destructive/20 text-destructive transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-destructive/25"
										>
											<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
											<span className="relative font-medium hover:text-secondary-foreground">
												Fill Admin Credentials
											</span>
										</Button>
									</div>
								) : (
									<div className="text-center text-sm text-muted-foreground py-2 px-4 bg-muted/30 rounded-lg border border-muted-foreground/20">
										<span className="font-medium">
											Note:
										</span>{" "}
										You can only sign up as Customer
									</div>
								)}

								{mode === "signup" && (
									<div className="space-y-2">
										<Label
											htmlFor="name"
											className="text-sm font-medium"
										>
											Full Name
										</Label>
										<Input
											id="name"
											type="text"
											placeholder="Raushan K Thakur"
											value={signupForm.name}
											onChange={(e) => {
												setSignupForm({
													...signupForm,
													name: e.target.value,
												});
												if (errors.name)
													setErrors({
														...errors,
														name: undefined,
													});
											}}
											className={cn(
												"transition-all duration-200",
												errors.name
													? "border-destructive focus:border-destructive ring-destructive/20"
													: "focus:border-primary"
											)}
											disabled={submitting}
										/>
										{errors.name && (
											<div className="flex items-center space-x-1 text-sm text-destructive animate-fade-in">
												<AlertCircle className="h-4 w-4" />
												<span>{errors.name}</span>
											</div>
										)}
									</div>
								)}

								<div className="space-y-2">
									<Label
										htmlFor="email"
										className="text-sm font-medium"
									>
										Email Address
									</Label>
									<Input
										id="email"
										type="email"
										placeholder="contact@raushan.info"
										value={
											mode === "login"
												? loginForm.email
												: signupForm.email
										}
										onChange={(e) => {
											if (mode === "login") {
												setLoginForm({
													...loginForm,
													email: e.target.value,
												});
											} else {
												setSignupForm({
													...signupForm,
													email: e.target.value,
												});
											}
											if (errors.email)
												setErrors({
													...errors,
													email: undefined,
												});
										}}
										className={cn(
											"transition-all duration-200",
											errors.email
												? "border-destructive focus:border-destructive ring-destructive/20"
												: "focus:border-primary"
										)}
										disabled={submitting}
									/>
									{errors.email && (
										<div className="flex items-center space-x-1 text-sm text-destructive animate-fade-in">
											<AlertCircle className="h-4 w-4" />
											<span>{errors.email}</span>
										</div>
									)}
								</div>

								<div className="space-y-2">
									<Label
										htmlFor="password"
										className="text-sm font-medium"
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
											value={
												mode === "login"
													? loginForm.password
													: signupForm.password
											}
											onChange={(e) => {
												if (mode === "login") {
													setLoginForm({
														...loginForm,
														password:
															e.target.value,
													});
												} else {
													setSignupForm({
														...signupForm,
														password:
															e.target.value,
													});
												}
												if (errors.password)
													setErrors({
														...errors,
														password: undefined,
													});
											}}
											className={cn(
												"pr-10 transition-all duration-200",
												errors.password
													? "border-destructive focus:border-destructive ring-destructive/20"
													: "focus:border-primary"
											)}
											disabled={submitting}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
											onClick={() =>
												setShowPassword(!showPassword)
											}
											disabled={submitting}
										>
											{showPassword ? (
												<EyeOff className="h-4 w-4 text-muted-foreground" />
											) : (
												<Eye className="h-4 w-4 text-muted-foreground" />
											)}
										</Button>
									</div>
									{errors.password && (
										<div className="flex items-center space-x-1 text-sm text-destructive animate-fade-in">
											<AlertCircle className="h-4 w-4" />
											<span>{errors.password}</span>
										</div>
									)}
								</div>

								<Button
									type="submit"
									className="w-full text-base font-medium h-11 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
									disabled={submitting}
								>
									{submitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											{mode === "login"
												? "Signing in..."
												: "Creating account..."}
										</>
									) : (
										<>
											{mode === "login" ? (
												<>
													<LogIn className="mr-2 h-4 w-4" />
													Sign In
												</>
											) : (
												<>
													<UserPlus className="mr-2 h-4 w-4" />
													Create Account
												</>
											)}
										</>
									)}
								</Button>
							</form>

							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<Separator className="w-full" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-card px-2 text-muted-foreground font-medium">
										{mode === "login"
											? "New to AirCargo Pro?"
											: "Already have an account?"}
									</span>
								</div>
							</div>

							<Button
								variant="ghost"
								className="w-full text-primary hover:text-primary/80 hover:bg-primary/5 transition-all duration-200"
								onClick={() =>
									switchMode(
										mode === "login" ? "signup" : "login"
									)
								}
								disabled={submitting}
							>
								{mode === "login"
									? "Create your account now"
									: "Sign in to your existing account"}
							</Button>
						</CardContent>
					</Card>

					{/* Benefits */}
					<div
						className="text-center space-y-4 animate-fade-in"
						style={{ animationDelay: "0.2s" }}
					>
						<div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground">
							<div className="flex items-center justify-center space-x-2">
								<CheckCircle2 className="h-4 w-4 text-primary" />
								<span>Real-time cargo tracking</span>
							</div>
							<div className="flex items-center justify-center space-x-2">
								<CheckCircle2 className="h-4 w-4 text-primary" />
								<span>Global shipping network</span>
							</div>
							<div className="flex items-center justify-center space-x-2">
								<CheckCircle2 className="h-4 w-4 text-primary" />
								<span>Secure & reliable service</span>
							</div>
						</div>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
