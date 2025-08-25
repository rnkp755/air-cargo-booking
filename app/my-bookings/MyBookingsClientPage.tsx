"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Package,
	Search,
	Calendar,
	MapPin,
	Weight,
	ArrowRight,
	Plus,
	Filter,
} from "lucide-react";
import { getMyBookings } from "@/lib/api";
import { useAuth } from "@/lib/auth-client";

interface BookingData {
	id: string;
	refId: string;
	origin: string;
	destination: string;
	pieces: number;
	weightKg: number;
	status: string;
	createdBy?: string | null;
	createdAt: string;
	updatedAt: string;
}

interface CachedBookings {
	data: BookingData[];
	timestamp: number;
}

export default function MyBookingsClientPage() {
	const { user } = useAuth();
	const [bookings, setBookings] = useState<BookingData[]>([]);
	const [filteredBookings, setFilteredBookings] = useState<BookingData[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [limit, setLimit] = useState<number>(50);
	const [loading, setLoading] = useState(true);

	const CACHE_KEY = "aircargo_my_bookings";
	const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

	const loadBookingsFromCache = (): BookingData[] | null => {
		if (typeof window === "undefined") return null;

		try {
			const cached = localStorage.getItem(CACHE_KEY);
			if (!cached) return null;

			const cachedData: CachedBookings = JSON.parse(cached);
			const now = Date.now();

			// Check if cache is still valid (within 30 minutes)
			if (now - cachedData.timestamp < CACHE_DURATION) {
				return cachedData.data;
			} else {
				// Cache expired, remove it
				localStorage.removeItem(CACHE_KEY);
				return null;
			}
		} catch (error) {
			console.error("Error reading bookings from cache:", error);
			localStorage.removeItem(CACHE_KEY);
			return null;
		}
	};

	const saveBookingsToCache = (bookings: BookingData[]) => {
		if (typeof window === "undefined") return;

		try {
			const cacheData: CachedBookings = {
				data: bookings,
				timestamp: Date.now(),
			};
			localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
		} catch (error) {
			console.error("Error saving bookings to cache:", error);
		}
	};

	const fetchBookings = async () => {
		try {
			const response = await getMyBookings(limit);
			if (response.success) {
				// Extract bookings from the nested structure with safety checks
				const bookingsData = Array.isArray(response.data.bookings)
					? response.data.bookings
					: [];
				setBookings(bookingsData);
				setFilteredBookings(bookingsData);
				saveBookingsToCache(bookingsData);
			} else {
				console.error("Failed to fetch bookings:", response.message);
				setBookings([]);
				setFilteredBookings([]);
			}
		} catch (error) {
			console.error("Error fetching bookings:", error);
			setBookings([]);
			setFilteredBookings([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// Try to load from cache first
		const cachedBookings = loadBookingsFromCache();

		if (cachedBookings && Array.isArray(cachedBookings)) {
			// Use cached data
			setBookings(cachedBookings);
			setFilteredBookings(cachedBookings);
			setLoading(false);
		} else {
			// Fetch fresh data from API
			fetchBookings();
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// Refetch when limit changes
	useEffect(() => {
		if (limit) {
			setLoading(true);
			fetchBookings();
		}
	}, [limit]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		// Filter bookings based on search term and status
		let filtered = Array.isArray(bookings) ? bookings : [];

		if (searchTerm) {
			filtered = filtered.filter(
				(booking) =>
					booking.refId
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					booking.origin
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					booking.destination
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					(booking.createdBy &&
						booking.createdBy
							.toLowerCase()
							.includes(searchTerm.toLowerCase()))
			);
		}

		if (statusFilter !== "all") {
			filtered = filtered.filter(
				(booking) =>
					booking.status.toLowerCase() === statusFilter.toLowerCase()
			);
		}

		setFilteredBookings(filtered);
	}, [bookings, searchTerm, statusFilter]);

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "confirmed":
			case "active":
				return "default";
			case "in_transit":
			case "departed":
				return "secondary";
			case "delivered":
			case "arrived":
				return "default";
			case "cancelled":
				return "destructive";
			default:
				return "secondary";
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getUniqueStatuses = () => {
		// Add safety check to ensure bookings is an array
		if (!Array.isArray(bookings)) {
			return [];
		}

		const statuses = [
			...new Set(bookings.map((booking) => booking.status)),
		];
		return statuses.sort();
	};

	if (loading) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<main className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<Package className="h-8 w-8 animate-pulse mx-auto mb-4 text-muted-foreground" />
						<p>Loading your bookings...</p>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<ProtectedRoute fallbackMessage="Please sign in to view your bookings.">
			<div className="min-h-screen flex flex-col">
				<Navbar />

				<main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
					<div className="container mx-auto max-w-6xl">
						<div className="mb-8">
							<div className="flex items-center justify-between">
								<div>
									<h1 className="text-3xl font-bold mb-2">
										{user?.role === "ADMIN" ? "All Bookings" : "My Bookings"}
									</h1>
									<p className="text-muted-foreground">
										{bookings.length === 0
											? "No bookings found"
											: `${bookings.length} booking${
													bookings.length === 1
														? ""
														: "s"
											  } total`}
									</p>
								</div>
								<Button asChild>
									<Link href="/routes">
										<Plus className="mr-2 h-4 w-4" />
										New Booking
									</Link>
								</Button>
							</div>
						</div>

						{bookings.length === 0 ? (
							// Empty State
							<Card>
								<CardContent className="p-12 text-center">
									<Package className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
									<h3 className="text-xl font-semibold mb-2">
										No Bookings Yet
									</h3>
									<p className="text-muted-foreground mb-6 max-w-md mx-auto">
										You haven't made any cargo bookings yet.
										Start by searching for routes and
										creating your first booking.
									</p>
									<Button asChild size="lg">
										<Link href="/routes">
											<Search className="mr-2 h-4 w-4" />
											Search Routes
										</Link>
									</Button>
								</CardContent>
							</Card>
						) : (
							<>
								{/* Summary Stats */}
								{filteredBookings.length > 0 && (
									<Card className="mb-8">
										<CardHeader>
											<CardTitle>Summary</CardTitle>
											<CardDescription>
												Overview of your filtered
												bookings
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
												<div className="text-center">
													<p className="text-2xl font-bold">
														{
															filteredBookings.length
														}
													</p>
													<p className="text-sm text-muted-foreground">
														Total Bookings
													</p>
												</div>
												<div className="text-center">
													<p className="text-2xl font-bold">
														{filteredBookings.reduce(
															(sum, booking) =>
																sum +
																booking.pieces,
															0
														)}
													</p>
													<p className="text-sm text-muted-foreground">
														Total Pieces
													</p>
												</div>
												<div className="text-center">
													<p className="text-2xl font-bold">
														{filteredBookings.reduce(
															(sum, booking) =>
																sum +
																booking.weightKg,
															0
														)}{" "}
														kg
													</p>
													<p className="text-sm text-muted-foreground">
														Total Weight
													</p>
												</div>
												<div className="text-center">
													<p className="text-2xl font-bold">
														{
															[
																...new Set(
																	filteredBookings.map(
																		(b) =>
																			`${b.origin}-${b.destination}`
																	)
																),
															].length
														}
													</p>
													<p className="text-sm text-muted-foreground">
														Unique Routes
													</p>
												</div>
											</div>
										</CardContent>
									</Card>
								)}
								{/* Filters */}
								<Card className="mb-6">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Filter className="h-5 w-5" />
											Filter Bookings
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<div className="space-y-2">
												<label
													htmlFor="search"
													className="text-sm font-medium"
												>
													Search
												</label>
												<div className="relative">
													<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
													<Input
														id="search"
														placeholder="Search by refID, origin, destination or customer"
														value={searchTerm}
														onChange={(e) =>
															setSearchTerm(
																e.target.value
															)
														}
														className="pl-10"
													/>
												</div>
											</div>
											<div className="space-y-2">
												<label
													htmlFor="status"
													className="text-sm font-medium"
												>
													Status
												</label>
												<Select
													value={statusFilter}
													onValueChange={
														setStatusFilter
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Filter by status" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="all">
															All Statuses
														</SelectItem>
														{getUniqueStatuses().map(
															(status) => (
																<SelectItem
																	key={status}
																	value={status.toLowerCase()}
																>
																	{status
																		.replace(
																			"_",
																			" "
																		)
																		.toUpperCase()}
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
											</div>
											<div className="space-y-2">
												<label
													htmlFor="limit"
													className="text-sm font-medium"
												>
													Limit
												</label>
												<Select
													value={limit.toString()}
													onValueChange={(value) =>
														setLimit(
															parseInt(value)
														)
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select limit" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="10">
															10 bookings
														</SelectItem>
														<SelectItem value="50">
															50 bookings
														</SelectItem>
														<SelectItem value="100">
															100 bookings
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Bookings List */}
								<div className="space-y-4">
									{filteredBookings.length === 0 ? (
										<Card>
											<CardContent className="p-8 text-center">
												<Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
												<h3 className="text-lg font-semibold mb-2">
													No Matching Bookings
												</h3>
												<p className="text-muted-foreground">
													No bookings match your
													current search criteria. Try
													adjusting your filters.
												</p>
											</CardContent>
										</Card>
									) : (
										Array.isArray(filteredBookings) &&
										filteredBookings.map((booking) => (
											<Card
												key={booking.refId}
												className="hover:shadow-md transition-shadow"
											>
												<CardContent className="p-6">
													<div className="flex items-center justify-between">
														<div className="flex-1">
															<div className="flex items-center gap-4 mb-4">
																<div className="flex items-center gap-2">
																	<Package className="h-5 w-5 text-muted-foreground" />
																	<span className="font-mono text-sm font-medium">
																		{
																			booking.refId
																		}
																	</span>
																</div>
																<Badge
																	variant={getStatusColor(
																		booking.status
																	)}
																>
																	{booking.status
																		.replace(
																			"_",
																			" "
																		)
																		.toUpperCase()}
																</Badge>
																{user?.role ===
																	"ADMIN" &&
																	booking.createdBy && (
																		<div className="flex items-center gap-2 ml-auto">
																			<span className="text-xs text-muted-foreground">
																				Created
																				by:
																			</span>
																			<span className="text-xs font-medium bg-secondary px-2 py-1 rounded">
																				{
																					booking.createdBy
																				}
																			</span>
																		</div>
																	)}
															</div>

															<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
																<div className="flex items-center gap-2">
																	<MapPin className="h-4 w-4 text-muted-foreground" />
																	<div>
																		<p className="text-sm text-muted-foreground">
																			Route
																		</p>
																		<p className="font-medium">
																			{
																				booking.origin
																			}{" "}
																			→{" "}
																			{
																				booking.destination
																			}
																		</p>
																	</div>
																</div>

																<div className="flex items-center gap-2">
																	<Package className="h-4 w-4 text-muted-foreground" />
																	<div>
																		<p className="text-sm text-muted-foreground">
																			Pieces
																		</p>
																		<p className="font-medium">
																			{
																				booking.pieces
																			}
																		</p>
																	</div>
																</div>

																<div className="flex items-center gap-2">
																	<Weight className="h-4 w-4 text-muted-foreground" />
																	<div>
																		<p className="text-sm text-muted-foreground">
																			Weight
																		</p>
																		<p className="font-medium">
																			{
																				booking.weightKg
																			}{" "}
																			kg
																		</p>
																	</div>
																</div>

																<div className="flex items-center gap-2">
																	<Calendar className="h-4 w-4 text-muted-foreground" />
																	<div>
																		<p className="text-sm text-muted-foreground">
																			Created
																		</p>
																		<p className="font-medium">
																			{formatDate(
																				booking.createdAt
																			)}
																		</p>
																	</div>
																</div>
															</div>
														</div>

														<div className="ml-6">
															<Button
																asChild
																variant="outline"
															>
																<Link
																	href={`/booking/${booking.refId}`}
																>
																	View Details
																	<ArrowRight className="ml-2 h-4 w-4" />
																</Link>
															</Button>
														</div>
													</div>
												</CardContent>
											</Card>
										))
									)}
								</div>
							</>
						)}
					</div>
				</main>

				<Footer />
			</div>
		</ProtectedRoute>
	);
}
