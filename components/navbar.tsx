"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NavigationButton } from "@/components/navigation-button";
import { NavigationLink } from "@/components/navigation-link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Moon,
	Sun,
	Plane,
	Menu,
	LogIn,
	User,
	LogOut,
	Package,
} from "lucide-react";
import { useAuth } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function Navbar() {
	const { theme, setTheme } = useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const { user, isLoading, logout } = useAuth();
	const router = useRouter();

	const navLinks = [
		{ href: "/routes", label: "Search Routes" },
		{ href: "/my-bookings", label: "My Bookings" },
	];

	const handleLogout = async () => {
		try {
			await logout();
			toast.success("Logged out successfully");
			router.push("/");
		} catch (error) {
			toast.error("Failed to logout");
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 px-8">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center space-x-8">
						<Link
							href="/"
							className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
						>
							<Plane className="h-6 w-6 text-primary" />
							<span className="text-xl font-bold">
								AirCargo Pro
							</span>
						</Link>
						{user && (
							<div className="hidden md:flex items-center space-x-6">
								{navLinks.map((link) => (
									<NavigationLink
										key={link.href}
										href={link.href}
										className="text-sm font-medium hover:text-primary transition-colors relative group"
									>
										{link.label}
										<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
									</NavigationLink>
								))}
							</div>
						)}
					</div>

					<div className="flex items-center space-x-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={() =>
								setTheme(theme === "dark" ? "light" : "dark")
							}
							className="hover:bg-accent transition-colors cursor-pointer"
							aria-label="Toggle theme"
						>
							<Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
							<Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
						</Button>

						{/* Authentication Section */}
						{!isLoading && (
							<>
								{user ? (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												className="relative h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-200 hover:scale-105"
											>
												<div className="flex h-full w-full items-center justify-center text-sm font-medium text-primary">
													{user.imageUrl ? (
														<img
															src={user.imageUrl}
															alt={user.name}
															className="h-full w-full rounded-full object-cover"
														/>
													) : (
														getInitials(user.name)
													)}
												</div>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											className="w-56"
											align="end"
											forceMount
										>
											<DropdownMenuLabel className="font-normal">
												<div className="flex flex-col space-y-1">
													<p className="text-sm font-medium leading-none">
														{user.name}
													</p>
													<p className="text-xs leading-none text-muted-foreground">
														{user.email}
													</p>
													<p className="text-xs leading-none text-muted-foreground capitalize">
														{user.role.toLowerCase()}
													</p>
												</div>
											</DropdownMenuLabel>
											<DropdownMenuSeparator />
											<DropdownMenuItem asChild>
												<Link
													href="/my-bookings"
													className="flex items-center cursor-pointer"
												>
													<Package className="mr-2 h-4 w-4" />
													{user?.role === "ADMIN"
														? "All Bookings"
														: "My Bookings"}
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href="/profile"
													className="flex items-center cursor-pointer"
												>
													<User className="mr-2 h-4 w-4" />
													Profile
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950 cursor-pointer"
												onClick={handleLogout}
											>
												<LogOut className="mr-2 h-4 w-4" />
												Log out
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								) : (
									<NavigationButton
										href="/auth"
										variant="default"
										size="sm"
										className="flex items-center space-x-2 hover:scale-105 transition-transform"
									>
										<LogIn className="h-4 w-4" />
										<span>Login</span>
									</NavigationButton>
								)}
							</>
						)}

						<div className="md:hidden">
							<Sheet open={isOpen} onOpenChange={setIsOpen}>
								<SheetTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										aria-label="Open menu"
									>
										<Menu className="h-5 w-5" />
									</Button>
								</SheetTrigger>
								<SheetContent
									side="right"
									className="w-[300px] sm:w-[400px]"
								>
									<div className="flex flex-col space-y-6 mt-6">
										<Link
											href="/"
											className="flex items-center space-x-2"
											onClick={() => setIsOpen(false)}
										>
											<Plane className="h-6 w-6 text-primary" />
											<span className="text-xl font-bold">
												AirCargo Pro
											</span>
										</Link>

										{user ? (
											<>
												<div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
													<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
														{user.imageUrl ? (
															<img
																src={
																	user.imageUrl
																}
																alt={user.name}
																className="h-full w-full rounded-full object-cover"
															/>
														) : (
															getInitials(
																user.name
															)
														)}
													</div>
													<div className="flex flex-col">
														<span className="text-sm font-medium">
															{user.name}
														</span>
														<span className="text-xs text-muted-foreground">
															{user.email}
														</span>
													</div>
												</div>

												<nav className="flex flex-col space-y-4">
													{navLinks.map((link) => (
														<NavigationLink
															key={link.href}
															href={link.href}
															className="text-lg font-medium hover:text-primary transition-colors py-2"
															onClick={() =>
																setIsOpen(false)
															}
														>
															{link.label}
														</NavigationLink>
													))}
													<NavigationLink
														href="/profile"
														className="text-lg font-medium hover:text-primary transition-colors py-2"
														onClick={() =>
															setIsOpen(false)
														}
													>
														Profile
													</NavigationLink>
													<Button
														variant="ghost"
														className="justify-start text-lg font-medium text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 py-2"
														onClick={() => {
															setIsOpen(false);
															handleLogout();
														}}
													>
														<LogOut className="mr-2 h-5 w-5" />
														Log out
													</Button>
												</nav>
											</>
										) : (
											<>
												<Button
													variant="default"
													className="w-full justify-center"
													asChild
												>
													<Link
														href="/auth"
														onClick={() =>
															setIsOpen(false)
														}
													>
														<LogIn className="mr-2 h-4 w-4" />
														Login
													</Link>
												</Button>

												<nav className="flex flex-col space-y-4">
													<NavigationLink
														href="/"
														className="text-lg font-medium hover:text-primary transition-colors py-2"
														onClick={() =>
															setIsOpen(false)
														}
													>
														Home
													</NavigationLink>
												</nav>
											</>
										)}
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
}
