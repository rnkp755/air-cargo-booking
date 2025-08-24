import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { NavigationButton } from "@/components/navigation-button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Plane, Home, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />

			<main className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
				<div className="container mx-auto text-center max-w-2xl animate-fade-in">
					{/* 404 Icon */}
					<div className="mb-8">
						<div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
							<Plane className="h-12 w-12 text-primary transform rotate-45" />
						</div>
						<h1 className="text-6xl font-bold text-primary mb-4">
							404
						</h1>
						<h2 className="text-3xl font-bold mb-4">
							Flight Not Found
						</h2>
						<p className="text-lg text-muted-foreground mb-8">
							Sorry, the page you're looking for seems to have
							taken off to a different destination. It might have
							been moved, deleted, or you may have entered an
							incorrect URL.
						</p>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
						<NavigationButton
							href="/"
							size="lg"
							className="text-lg px-8 transition-colors hover:shadow-accent-foreground"
						>
							<Home className="w-5 h-5 mr-2" />
							Go Home
						</NavigationButton>
						<NavigationButton
							href="/routes"
							variant="outline"
							size="lg"
							className="text-lg px-8 bg-transparent hover:bg-secondary hover:text-foreground transition-colors"
						>
							<Search className="w-5 h-5 mr-2" />
							Search Routes
						</NavigationButton>
					</div>

					{/* Helpful Links */}
					<Card className="text-left hover:shadow-lg transition-all duration-300">
						<CardHeader>
							<CardTitle className="flex items-center">
								<ArrowLeft className="w-5 h-5 mr-2 text-primary" />
								Where would you like to go?
							</CardTitle>
							<CardDescription>
								Here are some popular destinations you might be
								looking for
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<Link
									href="/"
									className="flex items-center p-3 rounded-lg hover:bg-muted/50 transition-colors group"
								>
									<Home className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary" />
									<div>
										<div className="font-medium group-hover:text-primary">
											Home
										</div>
										<div className="text-sm text-muted-foreground">
											Main landing page
										</div>
									</div>
								</Link>
								<Link
									href="/routes"
									className="flex items-center p-3 rounded-lg hover:bg-muted/50 transition-colors group"
								>
									<Search className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary" />
									<div>
										<div className="font-medium group-hover:text-primary">
											Search Routes
										</div>
										<div className="text-sm text-muted-foreground">
											Find cargo routes
										</div>
									</div>
								</Link>
								<Link
									href="/my-bookings"
									className="flex items-center p-3 rounded-lg hover:bg-muted/50 transition-colors group"
								>
									<Plane className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary" />
									<div>
										<div className="font-medium group-hover:text-primary">
											My Bookings
										</div>
										<div className="text-sm text-muted-foreground">
											Track your shipments
										</div>
									</div>
								</Link>
								<Link
									href="/routes"
									className="flex items-center p-3 rounded-lg hover:bg-muted/50 transition-colors group"
								>
									<Plane className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary transform rotate-45" />
									<div>
										<div className="font-medium group-hover:text-primary">
											Book Shipment
										</div>
										<div className="text-sm text-muted-foreground">
											Create new booking
										</div>
									</div>
								</Link>
							</div>
						</CardContent>
					</Card>

					{/* Contact Information */}
					<div className="mt-8 text-sm text-muted-foreground">
						<p>
							Still can't find what you're looking for?
							<span className="text-primary ml-1 hover:underline cursor-pointer">
								Contact our support team
							</span>
						</p>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
