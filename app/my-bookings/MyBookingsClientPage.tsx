"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Search, Calendar, MapPin, Weight, ArrowRight, Plus, Filter } from "lucide-react"
import { getStoredBookings, type StoredBooking } from "@/lib/storage"

export default function MyBookingsClientPage() {
  const [bookings, setBookings] = useState<StoredBooking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<StoredBooking[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load bookings from localStorage
    const storedBookings = getStoredBookings()
    setBookings(storedBookings)
    setFilteredBookings(storedBookings)
    setLoading(false)
  }, [])

  useEffect(() => {
    // Filter bookings based on search term and status
    let filtered = bookings

    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.refId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.destination.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status.toLowerCase() === statusFilter.toLowerCase())
    }

    setFilteredBookings(filtered)
  }, [bookings, searchTerm, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "active":
        return "default"
      case "in_transit":
      case "departed":
        return "secondary"
      case "delivered":
      case "arrived":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getUniqueStatuses = () => {
    const statuses = [...new Set(bookings.map((booking) => booking.status))]
    return statuses.sort()
  }

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
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
                <p className="text-muted-foreground">
                  {bookings.length === 0
                    ? "No bookings found"
                    : `${bookings.length} booking${bookings.length === 1 ? "" : "s"} total`}
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
                <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You haven't made any cargo bookings yet. Start by searching for routes and creating your first
                  booking.
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
              {/* Filters */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filter Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="search" className="text-sm font-medium">
                        Search
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="search"
                          placeholder="Search by reference ID, origin, or destination"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="status" className="text-sm font-medium">
                        Status
                      </label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          {getUniqueStatuses().map((status) => (
                            <SelectItem key={status} value={status.toLowerCase()}>
                              {status.replace("_", " ").toUpperCase()}
                            </SelectItem>
                          ))}
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
                      <h3 className="text-lg font-semibold mb-2">No Matching Bookings</h3>
                      <p className="text-muted-foreground">
                        No bookings match your current search criteria. Try adjusting your filters.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredBookings.map((booking) => (
                    <Card key={booking.refId} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-muted-foreground" />
                                <span className="font-mono text-sm font-medium">{booking.refId}</span>
                              </div>
                              <Badge variant={getStatusColor(booking.status)}>
                                {booking.status.replace("_", " ").toUpperCase()}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm text-muted-foreground">Route</p>
                                  <p className="font-medium">
                                    {booking.origin} → {booking.destination}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm text-muted-foreground">Pieces</p>
                                  <p className="font-medium">{booking.pieces}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Weight className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm text-muted-foreground">Weight</p>
                                  <p className="font-medium">{booking.weightKg} kg</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm text-muted-foreground">Created</p>
                                  <p className="font-medium">{formatDate(booking.createdAt)}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="ml-6">
                            <Button asChild variant="outline">
                              <Link href={`/booking/${booking.refId}`}>
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

              {/* Summary Stats */}
              {filteredBookings.length > 0 && (
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                    <CardDescription>Overview of your filtered bookings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{filteredBookings.length}</p>
                        <p className="text-sm text-muted-foreground">Total Bookings</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {filteredBookings.reduce((sum, booking) => sum + booking.pieces, 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Pieces</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {filteredBookings.reduce((sum, booking) => sum + booking.weightKg, 0)} kg
                        </p>
                        <p className="text-sm text-muted-foreground">Total Weight</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {[...new Set(filteredBookings.map((b) => `${b.origin}-${b.destination}`))].length}
                        </p>
                        <p className="text-sm text-muted-foreground">Unique Routes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
