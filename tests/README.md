# API Integration Tests

This folder contains Vitest-based integration tests for the Air Cargo Booking API.

## Available Tests

### `api-integration.test.ts`

A comprehensive Vitest test suite that covers the complete booking workflow:

1. **Routes API** - Fetch available flights between origin and destination
2. **Direct Flight Booking** - Create booking with a single flight
3. **Transit Route Booking** - Create booking with connecting flights
4. **Booking Lifecycle** - Test departed → arrived status updates
5. **Booking Cancellation** - Test booking cancellation
6. **Booking History** - Verify event timeline tracking
7. **Error Handling** - Test invalid inputs and edge cases

## Running Tests

Make sure your development server is running on `http://localhost:3000`:

```bash
# Start the development server
pnpm dev
```

Then run the tests using Vitest:

```bash
# Run all tests once
pnpm test:run

# Run API tests specifically
pnpm test:api

# Run API tests in watch mode (re-runs on file changes)
pnpm test:api:watch

# Run tests interactively
pnpm test
```

## Test Features

-   **Vitest Framework** - Modern testing with TypeScript support
-   **Proper Test Structure** - Uses describe/test blocks with assertions
-   **Real API Testing** - Makes actual HTTP requests to your running server
-   **Complete Workflow** - Tests the entire booking lifecycle
-   **Error Handling** - Tests both success and failure scenarios
-   **Detailed Assertions** - Uses expect() for proper validation
-   **Test Organization** - Grouped by functionality with clear descriptions

## Test Structure

```typescript
describe("Air Cargo API Integration Tests", () => {
  describe("Routes API", () => {
    test("should fetch available routes successfully", ...)
    test("should validate route response structure", ...)
  })

  describe("Booking Creation", () => {
    test("should create direct flight booking successfully", ...)
    test("should create transit route booking successfully", ...)
  })

  describe("Booking Lifecycle - Complete Flow", () => {
    test("should mark booking as departed", ...)
    test("should mark booking as arrived", ...)
    test("should retrieve complete booking history", ...)
  })

  // ... more test groups
})
```

## Test Flow

```
1. Fetch Routes (DEL → DXB)
   ↓
2. Create Direct Flight Booking
   ↓
3. Mark as Departed → Arrived → View History
   ↓
4. Create Transit Route Booking
   ↓
5. Cancel Booking → View History
   ↓
6. Test Complete Lifecycle Again
   ↓
7. Test Error Scenarios
```

## Vitest Features Used

-   **describe/test blocks** for organized test structure
-   **expect() assertions** for proper validation
-   **beforeAll/afterAll hooks** for setup and cleanup
-   **Conditional skipping** when data isn't available
-   **Error testing** with expect().rejects.toThrow()
-   **TypeScript support** out of the box

## Requirements

-   Development server running on port 3000
-   Database seeded with flight data for DEL-DXB route
-   All API endpoints functional

## Expected Output

```
✓ Routes API > should fetch available routes successfully
✓ Routes API > should validate route response structure
✓ Booking Creation > should create direct flight booking successfully
✓ Booking Creation > should create transit route booking successfully
✓ Booking Lifecycle - Complete Flow > should mark booking as departed
✓ Booking Lifecycle - Complete Flow > should mark booking as arrived
✓ Booking Lifecycle - Complete Flow > should retrieve complete booking history
✓ Booking Cancellation Flow > should cancel transit booking successfully
✓ Booking Cancellation Flow > should retrieve cancelled booking history
✓ Additional Booking Lifecycle Test > should create another booking for complete lifecycle
✓ Additional Booking Lifecycle Test > should complete full booking lifecycle
✓ Error Handling > should handle invalid booking reference
✓ Error Handling > should validate booking input

Test Files  1 passed (1)
Tests  13 passed (13)
```
