"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-client";
import { User, Mail, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";

export default function ProfilePage() {
	const { user, isLoading } = useAuth();

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const getRoleBadgeColor = (role: string) => {
		return role === "ADMIN" ? "destructive" : "secondary";
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<main className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">
							Loading profile...
						</p>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	if (!user) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<main className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<h1 className="text-2xl font-bold mb-4">
							Access Denied
						</h1>
						<p className="text-muted-foreground mb-6">
							Please log in to view your profile.
						</p>
						<Button asChild>
							<a href="/auth">Sign In</a>
						</Button>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />

			<main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
				<div className="container mx-auto max-w-4xl">
					{/* Header */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold tracking-tight mb-2">
							Profile
						</h1>
						<p className="text-muted-foreground">
							Manage your account settings and personal
							information.
						</p>
					</div>

					<div className="grid gap-6">
						{/* Profile Information Card */}
						<Card>
							<CardHeader>
								<div>
									<CardTitle className="flex items-center gap-2">
										<User className="h-5 w-5" />
										Personal Information
									</CardTitle>
									<CardDescription>
										Your account details and preferences
									</CardDescription>
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Profile Picture Section */}
								<div className="flex items-center gap-6">
									<div className="relative">
										<div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-xl font-medium text-primary overflow-hidden">
											{user.imageUrl ? (
												<img
													src={user.imageUrl}
													alt={user.name}
													className="h-full w-full object-cover"
												/>
											) : (
												getInitials(user.name)
											)}
										</div>
									</div>
									<div className="flex-1">
										<h3 className="text-lg font-semibold">
											{user.name}
										</h3>
										<p className="text-sm text-muted-foreground">
											{user.email}
										</p>
										<div className="mt-2">
											<Badge
												variant={getRoleBadgeColor(
													user.role
												)}
											>
												{user.role}
											</Badge>
										</div>
									</div>
								</div>

								<Separator />

								{/* Form Fields */}
								<div className="grid gap-4">
									{/* Name Field */}
									<div className="space-y-2">
										<Label
											htmlFor="name"
											className="flex items-center gap-2"
										>
											<User className="h-4 w-4" />
											Full Name
										</Label>
										<div className="px-3 py-2 border rounded-md bg-muted/50">
											{user.name}
										</div>
									</div>

									{/* Email Field */}
									<div className="space-y-2">
										<Label
											htmlFor="email"
											className="flex items-center gap-2"
										>
											<Mail className="h-4 w-4" />
											Email Address
										</Label>
										<div className="px-3 py-2 border rounded-md bg-muted/50 text-muted-foreground">
											{user.email}
											<span className="text-xs ml-2">
												(Cannot be changed)
											</span>
										</div>
									</div>

									{/* Role Field */}
									<div className="space-y-2">
										<Label className="flex items-center gap-2">
											<Shield className="h-4 w-4" />
											Account Role
										</Label>
										<div className="px-3 py-2 border rounded-md bg-muted/50">
											<Badge
												variant={getRoleBadgeColor(
													user.role
												)}
											>
												{user.role}
											</Badge>
											<span className="text-xs text-muted-foreground ml-2">
												(Cannot be changed)
											</span>
										</div>
									</div>

									{/* Created At Field */}
									<div className="space-y-2">
										<Label className="flex items-center gap-2">
											<Calendar className="h-4 w-4" />
											Account Created
										</Label>
										<div className="px-3 py-2 border rounded-md bg-muted/50 text-muted-foreground">
											{format(
												new Date(user.createdAt),
												"PPP 'at' p"
											)}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
