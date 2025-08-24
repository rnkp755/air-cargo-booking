"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, User, CreditCard, Plane, ArrowRight } from "lucide-react"
import type { CreateBookingRequest } from "@/lib/api"
import { storeBooking } from "@/lib/storage"

interface BookingFormData {
  // Cargo details
  pieces: number
  weightKg: number
  cargoType: string
  description: string

  // Customer details
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string

  // Additional details
  specialInstructions: string
}

export default function NewBookingClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState<BookingFormData>({
    pieces: 1,
    weightKg: 1,
    cargoType: "",
    description: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    specialInstructions: "",
  })

  const [routeInfo, setRouteInfo] = useState<{
    origin: string
    destination: string
    flightIds: string[]
    routeType: string
  } | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const origin = searchParams.get("origin")
    const destination = searchParams.get("destination")
    const flightIds = searchParams.get("flightIds")?.split(",") || []
    const routeType = searchParams.get("routeType") || "direct"

    if (origin && destination && flightIds.length > 0) {
      setRouteInfo({ origin, destination, flightIds, routeType })
    } else {
      router.push("/routes")
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!routeInfo) return

    // Validation
    if (!formData.customerName || !formData.customerEmail || !formData.cargoType) {
      setError("Please fill in all required fields")
      return
    }

    if (formData.pieces < 1 || formData.weightKg < 1) {
      setError("Pieces and weight must be at least 1")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const bookingRequest: CreateBookingRequest = {
        origin: routeInfo.origin,
        destination: routeInfo.destination,
        flightInstanceIds: routeInfo.flightIds,
        pieces: formData.pieces,
        weightKg: formData.weightKg,
      }

      // const response = await createBooking(bookingRequest)

      // Dummy response for testing UI
      const response = {
        success: true,
        data: {
          refId: `BK${Date.now().toString().slice(-6)}`,
          origin: routeInfo.origin,
          destination: routeInfo.destination,
          pieces: formData.pieces,
          weightKg: formData.weightKg,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        },
      }

      if (response.success) {
        // Store booking in localStorage
        storeBooking({
          refId: response.data.refId,
          origin: response.data.origin,
          destination: response.data.destination,
          pieces: response.data.pieces,
          weightKg: response.data.weightKg,
          status: response.data.status,
          createdAt: response.data.createdAt,
        })

        // Redirect to booking detail page
        router.push(`/booking/${response.data.refId}`)
      } else {
        setError("Failed to create booking. Please try again.")
      }
    } catch (err) {
      setError("Failed to create booking. Please try again.")
      console.error("Booking error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!routeInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading booking form...</p>
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
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Booking</h1>
            <p className="text-muted-foreground">Complete your cargo booking details</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Cargo Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Cargo Details
                    </CardTitle>
                    <CardDescription>Provide information about your shipment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pieces">Number of Pieces *</Label>
                        <Input
                          id="pieces"
                          type="number"
                          min="1"
                          value={formData.pieces}
                          onChange={(e) => setFormData({ ...formData, pieces: Number.parseInt(e.target.value) || 1 })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weightKg">Total Weight (kg) *</Label>
                        <Input
                          id="weightKg"
                          type="number"
                          min="1"
                          step="0.1"
                          value={formData.weightKg}
                          onChange={(e) =>
                            setFormData({ ...formData, weightKg: Number.parseFloat(e.target.value) || 1 })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cargoType">Cargo Type *</Label>
                      <Select
                        value={formData.cargoType}
                        onValueChange={(value) => setFormData({ ...formData, cargoType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select cargo type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Cargo</SelectItem>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="textiles">Textiles</SelectItem>
                          <SelectItem value="machinery">Machinery</SelectItem>
                          <SelectItem value="automotive">Automotive Parts</SelectItem>
                          <SelectItem value="pharmaceuticals">Pharmaceuticals</SelectItem>
                          <SelectItem value="perishables">Perishables</SelectItem>
                          <SelectItem value="documents">Documents</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Cargo Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of your cargo"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Details
                    </CardTitle>
                    <CardDescription>Your contact and shipping information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">Full Name *</Label>
                        <Input
                          id="customerName"
                          value={formData.customerName}
                          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerEmail">Email Address *</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          value={formData.customerEmail}
                          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerPhone">Phone Number</Label>
                        <Input
                          id="customerPhone"
                          type="tel"
                          value={formData.customerPhone}
                          onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerAddress">Address</Label>
                      <Textarea
                        id="customerAddress"
                        placeholder="Your complete address"
                        value={formData.customerAddress}
                        onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Special Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Special Instructions</CardTitle>
                    <CardDescription>Any additional requirements or notes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Special handling instructions, delivery notes, etc."
                      value={formData.specialInstructions}
                      onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                      rows={4}
                    />
                  </CardContent>
                </Card>

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full" size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Create Booking
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Route Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    Route Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Route Type</span>
                    <Badge variant={routeInfo?.routeType === "direct" ? "default" : "secondary"}>
                      {routeInfo?.routeType === "direct" ? "Direct" : "Transit"}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">From</span>
                      <span className="font-medium">{routeInfo?.origin}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">To</span>
                      <span className="font-medium">{routeInfo?.destination}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Flight(s)</span>
                    <div className="space-y-1">
                      {routeInfo?.flightIds.map((flightId, index) => (
                        <div key={flightId} className="text-sm font-mono bg-muted/50 p-2 rounded">
                          Flight {index + 1}: {flightId.slice(0, 8)}...
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
