"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

// Simple debounce utility
function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}
import { Loader2, Search, CalendarIcon, Check } from "lucide-react";
import type { RouteSearchRequest } from "@/lib/api";
import { searchAirports as apiSearchAirports } from "@/lib/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Airport {
	code: string;
	name: string;
	timezone: string;
}

interface SearchFormProps {
	searchData: RouteSearchRequest;
	onSearchDataChange: (data: RouteSearchRequest) => void;
	date: Date | undefined;
	onDateChange: (date: Date | undefined) => void;
	loading: boolean;
	error: string | null;
	onSubmit: (e: React.FormEvent) => void;
}

export default function SearchForm({
	searchData,
	onSearchDataChange,
	date,
	onDateChange,
	loading,
	error,
	onSubmit,
}: SearchFormProps) {
	// Internal state for dropdown management
	const [originOpen, setOriginOpen] = useState(false);
	const [destinationOpen, setDestinationOpen] = useState(false);
	const [originSuggestions, setOriginSuggestions] = useState<Airport[]>([]);
	const [destinationSuggestions, setDestinationSuggestions] = useState<
		Airport[]
	>([]);
	const [originLoading, setOriginLoading] = useState(false);
	const [destinationLoading, setDestinationLoading] = useState(false);

	// State for keyboard navigation
	const [originSelectedIndex, setOriginSelectedIndex] = useState(-1);
	const [destinationSelectedIndex, setDestinationSelectedIndex] =
		useState(-1);

	// State for display values (what user sees in input)
	const [originDisplayValue, setOriginDisplayValue] = useState("");
	const [destinationDisplayValue, setDestinationDisplayValue] = useState("");

	// Helper function to extract airport code from display text
	const extractCodeFromDisplay = (displayValue: string): string => {
		// If it's in format "ABC - Name", extract "ABC"
		// If it's just "ABC", return as is
		// If it's something else, take first 3 characters if they look like code
		if (displayValue.includes(" - ")) {
			return displayValue.split(" - ")[0].trim();
		}
		// Check if first 3 chars are uppercase letters (airport code pattern)
		if (
			displayValue.length >= 3 &&
			/^[A-Z]{3}/.test(displayValue.slice(0, 3))
		) {
			return displayValue.slice(0, 3);
		}
		return displayValue.toUpperCase();
	};

	// Debounced search function
	const searchAirports = useCallback(
		debounce(async (query: string, type: "origin" | "destination") => {
			if (query.length < 2) {
				if (type === "origin") {
					setOriginSuggestions([]);
				} else {
					setDestinationSuggestions([]);
				}
				return;
			}

			try {
				if (type === "origin") {
					setOriginLoading(true);
				} else {
					setDestinationLoading(true);
				}

				const response = await apiSearchAirports(query);
				const airports: Airport[] = response.data;

				if (type === "origin") {
					setOriginSuggestions(airports);
				} else {
					setDestinationSuggestions(airports);
				}
			} catch (error) {
				console.error("Error searching airports:", error);
				if (type === "origin") {
					setOriginSuggestions([]);
				} else {
					setDestinationSuggestions([]);
				}
			} finally {
				if (type === "origin") {
					setOriginLoading(false);
				} else {
					setDestinationLoading(false);
				}
			}
		}, 300),
		[]
	);

	// Handle airport selection
	const handleSelectAirport = (
		airport: Airport,
		type: "origin" | "destination"
	) => {
		const displayValue = formatAirportDisplay(airport);

		if (type === "origin") {
			setOriginDisplayValue(displayValue);
			onSearchDataChange({ ...searchData, origin: airport.code });
			setOriginOpen(false);
			setOriginSelectedIndex(-1);
			setOriginSuggestions([]);
		} else {
			setDestinationDisplayValue(displayValue);
			onSearchDataChange({ ...searchData, destination: airport.code });
			setDestinationOpen(false);
			setDestinationSelectedIndex(-1);
			setDestinationSuggestions([]);
		}
	};

	// Handle input changes
	const handleOriginInputChange = (value: string) => {
		setOriginDisplayValue(value);
		const extractedCode = extractCodeFromDisplay(value);
		onSearchDataChange({ ...searchData, origin: extractedCode });

		// Search for airports
		if (value.trim()) {
			setOriginOpen(true);
			searchAirports(value.trim(), "origin");
		} else {
			setOriginOpen(false);
			setOriginSuggestions([]);
		}
		setOriginSelectedIndex(-1);
	};

	const handleDestinationInputChange = (value: string) => {
		setDestinationDisplayValue(value);
		const extractedCode = extractCodeFromDisplay(value);
		onSearchDataChange({ ...searchData, destination: extractedCode });

		// Search for airports
		if (value.trim()) {
			setDestinationOpen(true);
			searchAirports(value.trim(), "destination");
		} else {
			setDestinationOpen(false);
			setDestinationSuggestions([]);
		}
		setDestinationSelectedIndex(-1);
	};

	// Helper function to format airport display
	const formatAirportDisplay = (airport: Airport): string => {
		return `${airport.code} - ${airport.name}`;
	};

	// Initialize display values from searchData
	useEffect(() => {
		if (searchData.origin && !originDisplayValue) {
			// If searchData has a code but display value is empty, format it
			const airport = originSuggestions.find(
				(a) => a.code === searchData.origin
			);
			if (airport) {
				setOriginDisplayValue(formatAirportDisplay(airport));
			} else {
				setOriginDisplayValue(searchData.origin);
			}
		}
	}, [searchData.origin, originSuggestions, originDisplayValue]);

	useEffect(() => {
		if (searchData.destination && !destinationDisplayValue) {
			// If searchData has a code but display value is empty, format it
			const airport = destinationSuggestions.find(
				(a) => a.code === searchData.destination
			);
			if (airport) {
				setDestinationDisplayValue(formatAirportDisplay(airport));
			} else {
				setDestinationDisplayValue(searchData.destination);
			}
		}
	}, [
		searchData.destination,
		destinationSuggestions,
		destinationDisplayValue,
	]);

	// Auto-scroll to selected item
	useEffect(() => {
		if (originSelectedIndex >= 0) {
			const element = document.getElementById(
				`origin-item-${originSelectedIndex}`
			);
			if (element) {
				element.scrollIntoView({
					block: "nearest",
					behavior: "smooth",
				});
			}
		}
	}, [originSelectedIndex]);

	useEffect(() => {
		if (destinationSelectedIndex >= 0) {
			const element = document.getElementById(
				`destination-item-${destinationSelectedIndex}`
			);
			if (element) {
				element.scrollIntoView({
					block: "nearest",
					behavior: "smooth",
				});
			}
		}
	}, [destinationSelectedIndex]);

	const handleDateSelect = (selectedDate: Date | undefined) => {
		if (selectedDate) {
			onDateChange(selectedDate);
			onSearchDataChange({
				...searchData,
				departure_date: format(selectedDate, "yyyy-MM-dd"),
			});
		}
	};

	// Helper function to handle keyboard navigation for origin
	const handleOriginKeyDown = (e: React.KeyboardEvent) => {
		if (!originOpen || originSuggestions.length === 0) {
			if (e.key === "Escape") {
				setOriginOpen(false);
			}
			return;
		}

		const maxIndex = Math.min(originSuggestions.length - 1, 7); // Show max 8 items (0-7)

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setOriginSelectedIndex((prev) =>
					prev < maxIndex ? prev + 1 : 0
				);
				break;
			case "ArrowUp":
				e.preventDefault();
				setOriginSelectedIndex((prev) =>
					prev > 0 ? prev - 1 : maxIndex
				);
				break;
			case "Enter":
				e.preventDefault();
				if (
					originSelectedIndex >= 0 &&
					originSelectedIndex <= maxIndex
				) {
					const selectedAirport =
						originSuggestions[originSelectedIndex];
					const displayText = formatAirportDisplay(selectedAirport);
					setOriginDisplayValue(displayText);
					handleSelectAirport(selectedAirport, "origin");
					setOriginOpen(false);
					setOriginSelectedIndex(-1);
				}
				break;
			case "Escape":
				e.preventDefault();
				setOriginOpen(false);
				setOriginSelectedIndex(-1);
				break;
		}
	};

	// Helper function to handle keyboard navigation for destination
	const handleDestinationKeyDown = (e: React.KeyboardEvent) => {
		if (!destinationOpen || destinationSuggestions.length === 0) {
			if (e.key === "Escape") {
				setDestinationOpen(false);
			}
			return;
		}

		const maxIndex = Math.min(destinationSuggestions.length - 1, 7); // Show max 8 items (0-7)

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setDestinationSelectedIndex((prev) =>
					prev < maxIndex ? prev + 1 : 0
				);
				break;
			case "ArrowUp":
				e.preventDefault();
				setDestinationSelectedIndex((prev) =>
					prev > 0 ? prev - 1 : maxIndex
				);
				break;
			case "Enter":
				e.preventDefault();
				if (
					destinationSelectedIndex >= 0 &&
					destinationSelectedIndex <= maxIndex
				) {
					const selectedAirport =
						destinationSuggestions[destinationSelectedIndex];
					const displayText = formatAirportDisplay(selectedAirport);
					setDestinationDisplayValue(displayText);
					handleSelectAirport(selectedAirport, "destination");
					setDestinationOpen(false);
					setDestinationSelectedIndex(-1);
				}
				break;
			case "Escape":
				e.preventDefault();
				setDestinationOpen(false);
				setDestinationSelectedIndex(-1);
				break;
		}
	};

	return (
		<Card className="mb-8">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Search className="h-5 w-5" />
					Route Search
				</CardTitle>
				<CardDescription>
					Enter your shipment details to find available routes
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={onSubmit} className="space-y-4">
					{/* First row: Origin and Destination */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="origin">Origin Airport</Label>
							<div className="relative">
								<Input
									id="origin"
									placeholder="Type airport code or name..."
									value={originDisplayValue}
									onChange={(e) => {
										const newValue = e.target.value;
										setOriginDisplayValue(newValue);
										setOriginSelectedIndex(-1); // Reset selection when typing

										// Extract code and update parent state
										const extractedCode =
											extractCodeFromDisplay(newValue);
										handleOriginInputChange(newValue);

										if (newValue.length > 0) {
											setOriginOpen(true);
										} else {
											setOriginOpen(false);
										}
									}}
									onFocus={() => {
										if (originDisplayValue.length > 0) {
											setOriginOpen(true);
										}
									}}
									onBlur={(e) => {
										// Small delay to allow selection of dropdown items
										setTimeout(() => {
											setOriginOpen(false);
											setOriginSelectedIndex(-1);
										}, 150);
									}}
									onKeyDown={handleOriginKeyDown}
									className="pr-8"
								/>
								<Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

								{/* Custom Dropdown */}
								{originOpen && originSuggestions.length > 0 && (
									<div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
										<div className="max-h-60 overflow-auto p-1">
											{originSuggestions
												.slice(0, 8)
												.map((airport, index) => (
													<div
														key={airport.code}
														id={`origin-item-${index}`}
														onMouseDown={(e) => {
															// Prevent input blur when clicking
															e.preventDefault();
														}}
														onMouseEnter={() => {
															setOriginSelectedIndex(
																index
															);
														}}
														onClick={() => {
															handleSelectAirport(
																airport,
																"origin"
															);
														}}
														className={cn(
															"flex items-center justify-between p-2 cursor-pointer rounded-sm",
															index ===
																originSelectedIndex
																? "bg-accent text-accent-foreground"
																: "hover:bg-accent hover:text-accent-foreground"
														)}
													>
														<div className="flex flex-col">
															<span className="font-medium">
																{airport.code}
															</span>
															<span className="text-sm text-muted-foreground truncate">
																{airport.name}
															</span>
														</div>
														{searchData.origin ===
															airport.code && (
															<Check className="h-4 w-4 text-primary" />
														)}
													</div>
												))}
										</div>
									</div>
								)}
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="destination">
								Destination Airport
							</Label>
							<div className="relative">
								<Input
									id="destination"
									placeholder="Type airport code or name..."
									value={destinationDisplayValue}
									onChange={(e) => {
										const newValue = e.target.value;
										setDestinationDisplayValue(newValue);
										setDestinationSelectedIndex(-1); // Reset selection when typing

										// Extract code and update parent state
										const extractedCode =
											extractCodeFromDisplay(newValue);
										handleDestinationInputChange(newValue);

										if (newValue.length > 0) {
											setDestinationOpen(true);
										} else {
											setDestinationOpen(false);
										}
									}}
									onFocus={() => {
										if (
											destinationDisplayValue.length > 0
										) {
											setDestinationOpen(true);
										}
									}}
									onBlur={(e) => {
										// Small delay to allow selection of dropdown items
										setTimeout(() => {
											setDestinationOpen(false);
											setDestinationSelectedIndex(-1);
										}, 150);
									}}
									onKeyDown={handleDestinationKeyDown}
									className="pr-8"
								/>
								<Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

								{/* Custom Dropdown */}
								{destinationOpen &&
									destinationSuggestions.length > 0 && (
										<div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
											<div className="max-h-60 overflow-auto p-1">
												{destinationSuggestions
													.slice(0, 8)
													.map((airport, index) => (
														<div
															key={airport.code}
															id={`destination-item-${index}`}
															onMouseDown={(
																e
															) => {
																// Prevent input blur when clicking
																e.preventDefault();
															}}
															onMouseEnter={() => {
																setDestinationSelectedIndex(
																	index
																);
															}}
															onClick={() => {
																handleSelectAirport(
																	airport,
																	"destination"
																);
															}}
															className={cn(
																"flex items-center justify-between p-2 cursor-pointer rounded-sm",
																index ===
																	destinationSelectedIndex
																	? "bg-accent text-accent-foreground"
																	: "hover:bg-accent hover:text-accent-foreground"
															)}
														>
															<div className="flex flex-col">
																<span className="font-medium">
																	{
																		airport.code
																	}
																</span>
																<span className="text-sm text-muted-foreground truncate">
																	{
																		airport.name
																	}
																</span>
															</div>
															{searchData.destination ===
																airport.code && (
																<Check className="h-4 w-4 text-primary" />
															)}
														</div>
													))}
											</div>
										</div>
									)}
							</div>
						</div>
					</div>

					{/* Second row: Date */}
					<div className="space-y-2">
						<Label>Departure Date</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										"w-full justify-start text-left font-normal",
										!date &&
											"text-muted-foreground hover:bg-secondary hover:text-foreground"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{date ? format(date, "PPP") : "Pick a date"}
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-auto p-0"
								align="start"
							>
								<Calendar
									mode="single"
									selected={date}
									onSelect={handleDateSelect}
									disabled={(date) => date < new Date()}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>

					{/* Third row: Search Button */}
					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={loading}
							className="px-8"
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Searching...
								</>
							) : (
								<>
									<Search className="mr-2 h-4 w-4" />
									Search Routes
								</>
							)}
						</Button>
					</div>
				</form>
				{error && (
					<p className="text-destructive text-sm mt-4">{error}</p>
				)}
			</CardContent>
		</Card>
	);
}
