import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Loader2,
	Package,
	Plane,
	MapPin,
	Clock,
	CheckCircle,
	Circle,
	AlertCircle,
	XCircle,
	ChevronDown,
	RefreshCw,
} from "lucide-react";
import {
	cancelBooking,
	departBooking,
	arriveBooking,
	deliverBooking,
	getBookingHistory,
} from "@/lib/api";
import type { BookingHistoryResponse } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-client";

export default function BookingInfoPage({
	booking,
	setBooking,
	refId,
}: {
	booking: BookingHistoryResponse;
	setBooking: any;
	refId: string;
}) {
	const { user } = useAuth();
	const [cancelling, setCancelling] = useState(false);
	const [updatingStatus, setUpdatingStatus] = useState(false);

	const handleCancelBooking = async () => {
		if (
			!booking ||
			!confirm("Are you sure you want to cancel this booking?")
		)
			return;

		setCancelling(true);
		try {
			const response = await cancelBooking(
				refId,
				"Cancelled by customer"
			);

			if (response.success) {
				toast.success("Booking cancelled successfully");
				booking.data.booking.status = "CANCELLED";
				setBooking({ ...booking });
			}
		} catch (err) {
			console.error("Cancel booking error:", err);
			alert("Failed to cancel booking. Please try again.");
		} finally {
			setCancelling(false);
		}
	};

	const handleStatusUpdate = async (newStatus: string) => {
		if (!booking) return;

		const statusConfirmations = {
			DEPARTED: "Mark this booking as departed?",
			ARRIVED: "Mark this booking as arrived?",
			DELIVERED: "Mark this booking as delivered?",
			CANCELLED: "Are you sure you want to cancel this booking?",
		};

		if (
			!confirm(
				statusConfirmations[
					newStatus as keyof typeof statusConfirmations
				]
			)
		) {
			return;
		}

		setUpdatingStatus(true);
		try {
			let response;
			switch (newStatus) {
				case "DEPARTED":
					response = await departBooking(refId);
					break;
				case "ARRIVED":
					response = await arriveBooking(refId);
					break;
				case "DELIVERED":
					response = await deliverBooking(refId);
					break;
				case "CANCELLED":
					response = await cancelBooking(refId, "Cancelled by admin");
					break;
				default:
					throw new Error("Invalid status");
			}

			if (response.success) {
				toast.success(`Booking status updated to ${newStatus}`);
				booking.data.booking.status = newStatus;
				setBooking({ ...booking });

				const bookingHistory = await getBookingHistory(refId);
				setBooking(bookingHistory);
			}
		} catch (err) {
			console.error("Status update error:", err);
			toast.error("Failed to update status. Please try again.");
		} finally {
			setUpdatingStatus(false);
		}
	};

	const getAvailableStatusUpdates = (currentStatus: string) => {
		if (user?.role === "CUSTOMER") return ["CANCELLED"];
		switch (currentStatus.toUpperCase()) {
			case "BOOKED":
				return ["DEPARTED", "CANCELLED"];
			case "DEPARTED":
				return ["ARRIVED", "CANCELLED"];
			case "ARRIVED":
				return ["DELIVERED", "CANCELLED"];
			case "CANCELLED":
				return [];
			case "DELIVERED":
				return [];
			default:
				return [];
		}
	};

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

	const getEventIcon = (eventType: string) => {
		switch (eventType.toLowerCase()) {
			case "booking_created":
			case "confirmed":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "cargo_received":
			case "loaded":
				return <Package className="h-4 w-4 text-blue-500" />;
			case "departed":
			case "in_transit":
				return <Plane className="h-4 w-4 text-orange-500" />;
			case "arrived":
			case "delivered":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "cancelled":
				return <XCircle className="h-4 w-4 text-red-500" />;
			case "delayed":
				return <AlertCircle className="h-4 w-4 text-yellow-500" />;
			default:
				return <Circle className="h-4 w-4 text-muted-foreground" />;
		}
	};

	const formatDateTime = (dateTime: string) => {
		return new Date(dateTime).toLocaleString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
			<div className="container mx-auto max-w-6xl">
				<div className="mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold mb-2">
								Booking Details
							</h1>
							<p className="text-muted-foreground">
								Reference ID: {booking.data.booking.refId}
							</p>
						</div>
						<div className="flex items-center gap-4">
							<Badge
								variant={getStatusColor(
									booking.data.booking.status
								)}
								className="text-sm px-3 py-1"
							>
								{booking.data.booking.status
									.replace("_", " ")
									.toUpperCase()}
							</Badge>

							{/* Update Status Dropdown */}
							{getAvailableStatusUpdates(
								booking.data.booking.status
							).length > 0 && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											disabled={updatingStatus}
											className="gap-2"
										>
											{updatingStatus ? (
												<>
													<Loader2 className="h-4 w-4 animate-spin" />
													Updating...
												</>
											) : (
												<>
													<RefreshCw className="h-4 w-4" />
													Update Status
													<ChevronDown className="h-4 w-4" />
												</>
											)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										{getAvailableStatusUpdates(
											booking.data.booking.status
										).map((status) => (
											<DropdownMenuItem
												key={status}
												onClick={() =>
													handleStatusUpdate(status)
												}
												className="cursor-pointer"
											>
												{status === "CANCELLED" ? (
													<XCircle className="mr-2 h-4 w-4 text-red-500" />
												) : status === "DEPARTED" ? (
													<Plane className="mr-2 h-4 w-4 text-orange-500" />
												) : status === "ARRIVED" ? (
													<MapPin className="mr-2 h-4 w-4 text-blue-500" />
												) : status === "DELIVERED" ? (
													<CheckCircle className="mr-2 h-4 w-4 text-green-500" />
												) : null}
												Mark as {status}
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							)}

							{/* Legacy Cancel Button (keeping for backwards compatibility) */}
							{booking.data.booking.status.toLowerCase() !==
								"delivered" &&
								booking.data.booking.status.toLowerCase() !==
									"cancelled" &&
								getAvailableStatusUpdates(
									booking.data.booking.status
								).length === 0 && (
									<Button
										variant="destructive"
										onClick={handleCancelBooking}
										disabled={cancelling}
									>
										{cancelling ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Cancelling...
											</>
										) : (
											"Cancel Booking"
										)}
									</Button>
								)}
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Booking Information */}
					<div className="lg:col-span-2 space-y-6">
						{/* Booking Summary */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Package className="h-5 w-5" />
									Booking Summary
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<span className="text-sm text-muted-foreground">
											Origin
										</span>
										<p className="font-medium">
											{booking.data.booking.origin}
										</p>
									</div>
									<div className="space-y-2">
										<span className="text-sm text-muted-foreground">
											Destination
										</span>
										<p className="font-medium">
											{booking.data.booking.destination}
										</p>
									</div>
									<div className="space-y-2">
										<span className="text-sm text-muted-foreground">
											Pieces
										</span>
										<p className="font-medium">
											{booking.data.booking.pieces}
										</p>
									</div>
									<div className="space-y-2">
										<span className="text-sm text-muted-foreground">
											Weight
										</span>
										<p className="font-medium">
											{booking.data.booking.weightKg} kg
										</p>
									</div>
									<div className="space-y-2">
										<span className="text-sm text-muted-foreground">
											Created
										</span>
										<p className="font-medium">
											{formatDateTime(
												booking.data.booking.createdAt
											)}
										</p>
									</div>
									<div className="space-y-2">
										<span className="text-sm text-muted-foreground">
											Last Updated
										</span>
										<p className="font-medium">
											{formatDateTime(
												booking.data.booking.updatedAt
											)}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Flight Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Plane className="h-5 w-5" />
									Flight Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{booking.data.flights.map((flight, index) => (
									<div key={flight.flightInstanceId}>
										{index > 0 && (
											<Separator className="my-4" />
										)}
										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<h4 className="font-semibold">
													{booking.data.flights
														.length > 1
														? `Flight ${index + 1}`
														: "Flight Details"}
												</h4>
												<Badge
													variant={getStatusColor(
														flight.status
													)}
												>
													{flight.status
														.replace("_", " ")
														.toUpperCase()}
												</Badge>
											</div>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div className="space-y-2">
													<span className="text-sm text-muted-foreground">
														Flight Number
													</span>
													<p className="font-medium">
														{flight.flightNumber}
													</p>
												</div>
												<div className="space-y-2">
													<span className="text-sm text-muted-foreground">
														Airline
													</span>
													<p className="font-medium">
														{flight.airlineName}
													</p>
												</div>
												<div className="space-y-2">
													<span className="text-sm text-muted-foreground">
														Route
													</span>
													<p className="font-medium">
														{flight.origin} →{" "}
														{flight.destination}
													</p>
												</div>
												<div className="space-y-2">
													<span className="text-sm text-muted-foreground">
														Schedule
													</span>
													<div className="text-sm">
														<p>
															Departure:{" "}
															{formatDateTime(
																flight.departureAt
															)}
														</p>
														<p>
															Arrival:{" "}
															{formatDateTime(
																flight.arrivalAt
															)}
														</p>
													</div>
												</div>
											</div>
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					</div>

					{/* Timeline */}
					<div className="lg:col-span-1">
						<Card className="sticky top-8">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Clock className="h-5 w-5" />
									Shipment Timeline
								</CardTitle>
								<CardDescription>
									Track your cargo's journey
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{booking.data.timeline.length > 0 ? (
										booking.data.timeline.map(
											(event, index) => (
												<div
													key={event.id}
													className="flex gap-3"
												>
													<div className="flex flex-col items-center">
														{getEventIcon(
															event.eventType
														)}
														{index <
															booking.data
																.timeline
																.length -
																1 && (
															<div className="w-px h-8 bg-border mt-2" />
														)}
													</div>
													<div className="flex-1 space-y-1">
														<div className="flex items-center justify-between">
															<p className="font-medium text-sm">
																{event.eventType
																	.replace(
																		"_",
																		" "
																	)
																	.replace(
																		/\b\w/g,
																		(l) =>
																			l.toUpperCase()
																	)}
															</p>
															<span className="text-xs text-muted-foreground">
																{formatDateTime(
																	event.createdAt
																)}
															</span>
														</div>
														{event.location && (
															<p className="text-xs text-muted-foreground flex items-center gap-1">
																<MapPin className="h-3 w-3" />
																{event.location}
															</p>
														)}
														{event.description && (
															<p className="text-xs text-muted-foreground">
																{
																	event.description
																}
															</p>
														)}
													</div>
												</div>
											)
										)
									) : (
										<div className="text-center py-8">
											<Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
											<p className="text-sm text-muted-foreground">
												No timeline events yet
											</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</main>
	);
}
