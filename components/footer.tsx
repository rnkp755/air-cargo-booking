import { Plane } from "lucide-react";
import Link from "next/link";

export function Footer() {
	return (
		<footer className="border-t bg-background px-8">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					<div className="space-y-4">
						<Plane className="h-6 w-6 text-primary" />
						<h3 className="text-lg font-semibold">AirCargo Pro</h3>
						<p className="text-sm text-muted-foreground">
							Professional air cargo booking platform for fast,
							reliable global shipping solutions.
						</p>
					</div>
					<div className="space-y-4">
						<h4 className="text-sm font-semibold">Services</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<Link
									href="/routes"
									className="hover:text-foreground transition-colors"
								>
									Route Search
								</Link>
							</li>
							<li>
								<Link
									href="/booking"
									className="hover:text-foreground transition-colors"
								>
									Cargo Booking
								</Link>
							</li>
							<li>
								<Link
									href="/tracking"
									className="hover:text-foreground transition-colors"
								>
									Shipment Tracking
								</Link>
							</li>
						</ul>
					</div>
					<div className="space-y-4">
						<h4 className="text-sm font-semibold">Support</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<Link
									href="/help"
									className="hover:text-foreground transition-colors"
								>
									Help Center
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="hover:text-foreground transition-colors"
								>
									Contact Us
								</Link>
							</li>
							<li>
								<Link
									href="/terms"
									className="hover:text-foreground transition-colors"
								>
									Terms of Service
								</Link>
							</li>
						</ul>
					</div>
					<div className="space-y-4">
						<h4 className="text-sm font-semibold">Company</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<Link
									href="/about"
									className="hover:text-foreground transition-colors"
								>
									About Us
								</Link>
							</li>
							<li>
								<Link
									href="/careers"
									className="hover:text-foreground transition-colors"
								>
									Careers
								</Link>
							</li>
							<li>
								<Link
									href="/privacy"
									className="hover:text-foreground transition-colors"
								>
									Privacy Policy
								</Link>
							</li>
						</ul>
					</div>
				</div>
				<div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
					<p>&copy; 2025 AirCargo Pro. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}
