// Local storage utilities for managing booking data
export interface StoredBooking {
  refId: string
  origin: string
  destination: string
  pieces: number
  weightKg: number
  status: string
  createdAt: string
}

export const getStoredBookings = (): StoredBooking[] => {
  if (typeof window === "undefined") return []

  try {
    const bookings = localStorage.getItem("aircargo_bookings")
    return bookings ? JSON.parse(bookings) : []
  } catch (error) {
    console.error("Error reading bookings from localStorage:", error)
    return []
  }
}

export const storeBooking = (booking: StoredBooking): void => {
  if (typeof window === "undefined") return

  try {
    const existingBookings = getStoredBookings()
    const updatedBookings = [booking, ...existingBookings.filter((b) => b.refId !== booking.refId)]
    localStorage.setItem("aircargo_bookings", JSON.stringify(updatedBookings))
  } catch (error) {
    console.error("Error storing booking to localStorage:", error)
  }
}

export const removeStoredBooking = (refId: string): void => {
  if (typeof window === "undefined") return

  try {
    const existingBookings = getStoredBookings()
    const updatedBookings = existingBookings.filter((b) => b.refId !== refId)
    localStorage.setItem("aircargo_bookings", JSON.stringify(updatedBookings))
  } catch (error) {
    console.error("Error removing booking from localStorage:", error)
  }
}
