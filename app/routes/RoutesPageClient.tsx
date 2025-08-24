"use client"

import type React from "react"
import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Search, Plane, Clock, MapPin, ArrowRight, CalendarIcon, Package, Check } from "lucide-react"
import type { RouteSearchRequest, RouteSearchResponse } from "@/lib/api"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface BookingFormData {
  pieces: string
  weight: string
  flightIds: string[]
  routeType: "direct" | "transit"
}

const DUMMY_AIRPORTS = [
  { code: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai" },
  { code: "BLR", name: "Kempegowda International Airport", city: "Bangalore" },
  { code: "MAA", name: "Chennai International Airport", city: "Chennai" },
  { code: "CCU", name: "Netaji Subhas Chandra Bose International Airport", city: "Kolkata" },
  { code: "HYD", name: "Rajiv Gandhi International Airport", city: "Hyderabad" },
  { code: "DXB", name: "Dubai International Airport", city: "Dubai" },
  { code: "DOH", name: "Hamad International Airport", city: "Doha" },
  { code: "SIN", name: "Singapore Changi Airport", city: "Singapore" },
  { code: "LHR", name: "London Heathrow Airport", city: "London" },
  { code: "JFK", name: "John F. Kennedy International Airport", city: "New York" },
  { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles" },
  { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris" },
  { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt" },
  { code: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam" },
]

export default function RoutesPageClient() {
  const [searchData, setSearchData] = useState<RouteSearchRequest>({
    origin: "",
    destination: "",
    departure_date: "",
  })
  const [date, setDate] = useState<Date>()
  const [results, setResults] = useState<RouteSearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    pieces: "",
    weight: "",
    flightIds: [],
    routeType: "direct",
  })
  const [originOpen, setOriginOpen] = useState(false)
  const [destinationOpen, setDestinationOpen] = useState(false)
  const [originSuggestions, setOriginSuggestions] = useState(DUMMY_AIRPORTS)
  const [destinationSuggestions, setDestinationSuggestions] = useState(DUMMY_AIRPORTS)

  const router = useRouter()

  const filterAirports = (query: string) => {
    if (!query) return DUMMY_AIRPORTS
    return DUMMY_AIRPORTS.filter(
      (airport) =>
        airport.code.toLowerCase().includes(query.toLowerCase()) ||
        airport.name.toLowerCase().includes(query.toLowerCase()) ||
        airport.city.toLowerCase().includes(query.toLowerCase()),
    )
  }

  const handleOriginChange = (value: string) => {
    setSearchData({ ...searchData, origin: value })
    setOriginSuggestions(filterAirports(value))
    if (value.length > 0) {
      setOriginOpen(true)
    }
  }

  const handleDestinationChange = (value: string) => {
    setSearchData({ ...searchData, destination: value })
    setDestinationSuggestions(filterAirports(value))
    if (value.length > 0) {
      setDestinationOpen(true)
    }
  }

  const selectAirport = (airport: (typeof DUMMY_AIRPORTS)[0], field: "origin" | "destination") => {
    if (field === "origin") {
      setSearchData({ ...searchData, origin: airport.code })
      setOriginOpen(false)
    } else {
      setSearchData({ ...searchData, destination: airport.code })
      setDestinationOpen(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchData.origin || !searchData.destination || !searchData.departure_date) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response: RouteSearchResponse = {
        success: true,
        message: "Routes found successfully",
        data: {
          directFlights: [
            {
              id: "flight-001",
              flightNumber: "AI 131",
              airlineName: "Air India",
              origin: searchData.origin,
              destination: searchData.destination,
              departureAt: `${searchData.departure_date}T08:30:00Z`,
              arrivalAt: `${searchData.departure_date}T14:45:00Z`,
              operateDate: searchData.departure_date,
              status: "active",
            },
            {
              id: "flight-002",
              flightNumber: "EK 512",
              airlineName: "Emirates",
              origin: searchData.origin,
              destination: searchData.destination,
              departureAt: `${searchData.departure_date}T16:20:00Z`,
              arrivalAt: `${searchData.departure_date}T22:10:00Z`,
              operateDate: searchData.departure_date,
              status: "active",
            },
          ],
          transitRoute: {
            firstFlight: {
              id: "flight-003",
              flightNumber: "QR 570",
              airlineName: "Qatar Airways",
              origin: searchData.origin,
              destination: "DOH",
              departureAt: `${searchData.departure_date}T10:15:00Z`,
              arrivalAt: `${searchData.departure_date}T13:30:00Z`,
              operateDate: searchData.departure_date,
              status: "active",
            },
            secondFlight: {
              id: "flight-004",
              flightNumber: "QR 1024",
              airlineName: "Qatar Airways",
              origin: "DOH",
              destination: searchData.destination,
              departureAt: `${searchData.departure_date}T16:45:00Z`,
              arrivalAt: `${searchData.departure_date}T20:30:00Z`,
              operateDate: searchData.departure_date,
              status: "active",
            },
            transitAirport: "DOH",
            totalDuration: "10h 15m",
            layoverDuration: "3h 15m",
          },
        },
        timestamp: new Date().toISOString(),
      }

      setResults(response)
    } catch (err) {
      setError("Failed to search routes. Please try again.")
      console.error("Search error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleBookFlight = (flightIds: string[], routeType: "direct" | "transit") => {
    setBookingForm({
      pieces: "",
      weight: "",
      flightIds,
      routeType,
    })
    setShowBookingModal(true)
  }

  const proceedWithBooking = () => {
    if (!bookingForm.pieces || !bookingForm.weight) {
      return
    }

    const params = new URLSearchParams({
      origin: searchData.origin,
      destination: searchData.destination,
      flightIds: bookingForm.flightIds.join(","),
      routeType: bookingForm.routeType,
      pieces: bookingForm.pieces,
      weight: bookingForm.weight,
    })
    router.push(`/booking/new?${params.toString()}`)
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (duration: string) => {
    return duration || "N/A"
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      setSearchData({
        ...searchData,
        departure_date: format(selectedDate, "yyyy-MM-dd"),
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Search Air Cargo Routes</h1>
            <p className="text-muted-foreground">Find the best routes for your cargo shipment</p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Route Search
              </CardTitle>
              <CardDescription>Enter your shipment details to find available routes</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                {/* First row: Origin and Destination */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origin Airport</Label>
                    <Popover open={originOpen} onOpenChange={setOriginOpen}>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <Input
                            placeholder="Type airport code or name..."
                            value={searchData.origin}
                            onChange={(e) => handleOriginChange(e.target.value)}
                            onFocus={() => setOriginOpen(true)}
                            className="pr-8"
                          />
                          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandList>
                            <CommandEmpty>No airports found.</CommandEmpty>
                            <CommandGroup>
                              {originSuggestions.slice(0, 8).map((airport) => (
                                <CommandItem
                                  key={airport.code}
                                  value={`${airport.code}-${airport.name}`}
                                  onSelect={() => selectAirport(airport, "origin")}
                                  className="flex items-center justify-between cursor-pointer"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {airport.code} - {airport.city}
                                    </span>
                                    <span className="text-sm text-muted-foreground truncate">{airport.name}</span>
                                  </div>
                                  {searchData.origin === airport.code && <Check className="h-4 w-4 text-primary" />}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination Airport</Label>
                    <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <Input
                            placeholder="Type airport code or name..."
                            value={searchData.destination}
                            onChange={(e) => handleDestinationChange(e.target.value)}
                            onFocus={() => setDestinationOpen(true)}
                            className="pr-8"
                          />
                          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandList>
                            <CommandEmpty>No airports found.</CommandEmpty>
                            <CommandGroup>
                              {destinationSuggestions.slice(0, 8).map((airport) => (
                                <CommandItem
                                  key={airport.code}
                                  value={`${airport.code}-${airport.name}`}
                                  onSelect={() => selectAirport(airport, "destination")}
                                  className="flex items-center justify-between cursor-pointer"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {airport.code} - {airport.city}
                                    </span>
                                    <span className="text-sm text-muted-foreground truncate">{airport.name}</span>
                                  </div>
                                  {searchData.destination === airport.code && (
                                    <Check className="h-4 w-4 text-primary" />
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Second row: Date */}
                <div className="space-y-2">
                  <Label>Departure Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
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
                  <Button type="submit" disabled={loading} className="px-8">
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
              {error && <p className="text-destructive text-sm mt-4">{error}</p>}
            </CardContent>
          </Card>

          {/* Search Results */}
          {results && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Available Routes</h2>
                <p className="text-muted-foreground mb-6">
                  Found routes from {searchData.origin} to {searchData.destination} on{" "}
                  {new Date(searchData.departure_date).toLocaleDateString()}
                </p>
              </div>

              {/* Direct Flights */}
              {results.data.directFlights && results.data.directFlights.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    Direct Flights
                  </h3>
                  <div className="grid gap-4">
                    {results.data.directFlights.map((flight) => (
                      <Card
                        key={flight.id}
                        className="hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-primary/20 group cursor-pointer"
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* Flight Route Visual */}
                            <div className="flex items-center justify-between">
                              <div className="text-center min-w-[80px]">
                                <p className="text-2xl font-bold text-primary group-hover:text-primary/80 transition-colors">
                                  {flight.origin}
                                </p>
                                <p className="text-sm text-muted-foreground font-medium">
                                  {formatDateTime(flight.departureAt)}
                                </p>
                              </div>
                              <div className="flex-1 mx-8">
                                <div className="flex items-center justify-center relative">
                                  <div className="h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 flex-1 group-hover:via-primary/80 transition-colors"></div>
                                  <div className="absolute bg-background border-2 border-primary rounded-full p-2 group-hover:border-primary/80 group-hover:scale-110 transition-all duration-300">
                                    <Plane className="h-4 w-4 text-primary group-hover:text-primary/80 transition-colors" />
                                  </div>
                                </div>
                                <p className="text-center text-xs text-muted-foreground mt-2">Direct Flight</p>
                              </div>
                              <div className="text-center min-w-[80px]">
                                <p className="text-2xl font-bold text-primary group-hover:text-primary/80 transition-colors">
                                  {flight.destination}
                                </p>
                                <p className="text-sm text-muted-foreground font-medium">
                                  {formatDateTime(flight.arrivalAt)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 pt-4 border-t">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{flight.flightNumber}</span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground">{flight.airlineName}</span>
                              </div>
                              <div className="flex-1"></div>
                              <Button
                                onClick={() => handleBookFlight([flight.id], "direct")}
                                className="px-6 hover:scale-105 transition-transform"
                              >
                                <Package className="mr-2 h-4 w-4" />
                                Book Flight
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Transit Route */}
              {results.data.transitRoute && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Transit Route
                  </h3>
                  <Card className="hover:shadow-lg hover:shadow-slate-500/5 hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-slate-500/20 group cursor-pointer">
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {/* Route Overview */}
                        <div className="flex items-center justify-between pb-4 border-b">
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-500 group-hover:text-slate-400 transition-colors" />
                              <span className="font-medium">
                                Total: {formatDuration(results.data.transitRoute.totalDuration)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-slate-500 group-hover:text-slate-400 transition-colors" />
                              <span className="font-medium">Via {results.data.transitRoute.transitAirport}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>Layover: {formatDuration(results.data.transitRoute.layoverDuration)}</span>
                            </div>
                          </div>
                          <Button
                            onClick={() =>
                              handleBookFlight(
                                [results.data.transitRoute!.firstFlight.id, results.data.transitRoute!.secondFlight.id],
                                "transit",
                              )
                            }
                            className="px-6 hover:scale-105 transition-transform"
                          >
                            <Package className="mr-2 h-4 w-4" />
                            Book Route
                          </Button>
                        </div>

                        {/* Flight Segments */}
                        <div className="space-y-4">
                          {/* First Flight */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-slate-500">Segment 1</h4>
                            <div className="flex items-center justify-between">
                              <div className="text-center min-w-[80px]">
                                <p className="text-xl font-bold">{results.data.transitRoute.firstFlight.origin}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDateTime(results.data.transitRoute.firstFlight.departureAt)}
                                </p>
                              </div>
                              <div className="flex-1 mx-8">
                                <div className="flex items-center justify-center relative">
                                  <div className="h-0.5 bg-gradient-to-r from-slate-500/20 via-slate-500 to-slate-500/20 flex-1 group-hover:via-slate-400 transition-colors"></div>
                                  <div className="absolute bg-background border-2 border-slate-500 rounded-full p-1.5 group-hover:border-slate-400 group-hover:scale-110 transition-all duration-300">
                                    <Plane className="h-3 w-3 text-slate-500 group-hover:text-slate-400 transition-colors" />
                                  </div>
                                </div>
                              </div>
                              <div className="text-center min-w-[80px]">
                                <p className="text-xl font-bold">{results.data.transitRoute.firstFlight.destination}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDateTime(results.data.transitRoute.firstFlight.arrivalAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-foreground">
                                {results.data.transitRoute.firstFlight.flightNumber}
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">
                                {results.data.transitRoute.firstFlight.airlineName}
                              </span>
                            </div>
                          </div>

                          {/* Second Flight */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-slate-500">Segment 2</h4>
                            <div className="flex items-center justify-between">
                              <div className="text-center min-w-[80px]">
                                <p className="text-xl font-bold">{results.data.transitRoute.secondFlight.origin}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDateTime(results.data.transitRoute.secondFlight.departureAt)}
                                </p>
                              </div>
                              <div className="flex-1 mx-8">
                                <div className="flex items-center justify-center relative">
                                  <div className="h-0.5 bg-gradient-to-r from-slate-500/20 via-slate-500 to-slate-500/20 flex-1 group-hover:via-slate-400 transition-colors"></div>
                                  <div className="absolute bg-background border-2 border-slate-500 rounded-full p-1.5 group-hover:border-slate-400 group-hover:scale-110 transition-all duration-300">
                                    <Plane className="h-3 w-3 text-slate-500 group-hover:text-slate-400 transition-colors" />
                                  </div>
                                </div>
                              </div>
                              <div className="text-center min-w-[80px]">
                                <p className="text-xl font-bold">
                                  {results.data.transitRoute.secondFlight.destination}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDateTime(results.data.transitRoute.secondFlight.arrivalAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-foreground">
                                {results.data.transitRoute.secondFlight.flightNumber}
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">
                                {results.data.transitRoute.secondFlight.airlineName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* No Results */}
              {(!results.data.directFlights || results.data.directFlights.length === 0) &&
                !results.data.transitRoute && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Routes Found</h3>
                      <p className="text-muted-foreground">
                        No available routes found for your search criteria. Please try different dates or destinations.
                      </p>
                    </CardContent>
                  </Card>
                )}
            </div>
          )}
        </div>
      </main>

      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Cargo Details
            </DialogTitle>
            <DialogDescription>Please provide your cargo details to proceed with booking.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pieces">Number of Pieces</Label>
              <Input
                id="pieces"
                type="number"
                min="1"
                placeholder="e.g., 5"
                value={bookingForm.pieces}
                onChange={(e) => setBookingForm({ ...bookingForm, pieces: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Total Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                min="0.1"
                step="0.1"
                placeholder="e.g., 150.5"
                value={bookingForm.weight}
                onChange={(e) => setBookingForm({ ...bookingForm, weight: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowBookingModal(false)}>
              Cancel
            </Button>
            <Button onClick={proceedWithBooking} disabled={!bookingForm.pieces || !bookingForm.weight}>
              Continue to Booking
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
