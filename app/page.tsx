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
import { Plane, Clock, Shield, Globe } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />

			<main className="flex-1">
				{/* Hero Section */}
				<section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-muted/20">
					<div className="container mx-auto text-center animate-fade-in">
						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
							Professional Air Cargo
							<span className="text-primary block">
								Booking Platform
							</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
							Fast, reliable, and secure air cargo booking for
							global shipping solutions. Track your shipments in
							real-time with our professional platform.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<NavigationButton
								href="/routes"
								size="lg"
								className="text-lg px-8 transition-colors hover:shadow-accent-foreground"
							>
								Search Routes
							</NavigationButton>
							<NavigationButton
								href="/my-bookings"
								variant="outline"
								size="lg"
								className="text-lg px-8 bg-transparent hover:bg-secondary hover:text-foreground transition-colors"
							>
								My Bookings
							</NavigationButton>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section className="py-20 px-8 sm:px-6 lg:px-12">
					<div className="container mx-auto">
						<div className="text-center mb-16 animate-fade-in">
							<h2 className="text-3xl font-bold mb-4">
								Why Choose AirCargo Pro?
							</h2>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
								Experience the difference with our professional
								air cargo services
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
							<Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-in">
								<CardHeader>
									<div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 transition-colors hover:bg-primary/20">
										<Clock className="h-6 w-6 text-primary" />
									</div>
									<CardTitle>Fast Delivery</CardTitle>
								</CardHeader>
								<CardContent>
									<CardDescription>
										Express air cargo services with
										guaranteed delivery times and real-time
										tracking.
									</CardDescription>
								</CardContent>
							</Card>

							<Card
								className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-in"
								style={{ animationDelay: "0.1s" }}
							>
								<CardHeader>
									<div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 transition-colors hover:bg-primary/20">
										<Shield className="h-6 w-6 text-primary" />
									</div>
									<CardTitle>Secure Handling</CardTitle>
								</CardHeader>
								<CardContent>
									<CardDescription>
										Professional cargo handling with full
										insurance coverage and security
										protocols.
									</CardDescription>
								</CardContent>
							</Card>

							<Card
								className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-in"
								style={{ animationDelay: "0.2s" }}
							>
								<CardHeader>
									<div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 transition-colors hover:bg-primary/20">
										<Globe className="h-6 w-6 text-primary" />
									</div>
									<CardTitle>Global Network</CardTitle>
								</CardHeader>
								<CardContent>
									<CardDescription>
										Worldwide coverage with direct and
										transit routes to major destinations.
									</CardDescription>
								</CardContent>
							</Card>

							<Card
								className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-in"
								style={{ animationDelay: "0.3s" }}
							>
								<CardHeader>
									<div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 transition-colors hover:bg-primary/20">
										<Plane className="h-6 w-6 text-primary" />
									</div>
									<CardTitle>Real-time Tracking</CardTitle>
								</CardHeader>
								<CardContent>
									<CardDescription>
										Complete visibility of your shipment
										from pickup to delivery with live
										updates.
									</CardDescription>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
					<div className="container mx-auto text-center animate-fade-in">
						<h2 className="text-3xl font-bold mb-4">
							Ready to Ship Your Cargo?
						</h2>
						<p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
							Get started with our professional air cargo booking
							platform today
						</p>
						<NavigationButton
							href="/routes"
							size="lg"
							className="text-lg px-8 hover:bg-primary/90 transition-colors"
						>
							Book Your Shipment
						</NavigationButton>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
}
