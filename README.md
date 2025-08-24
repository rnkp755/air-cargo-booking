# Air Cargo Booking System

## 🎯 Technology Stack Decisions

| Technology      | Why It's Preferred                                                                                                                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js 15**  | • Full-stack capabilities with API routes<br>• Built-in optimizations (code splitting, image optimization)<br>• Server-side rendering for better SEO<br>• Excellent TypeScript support                                |
| **TypeScript**  | • Strong type safety prevents runtime errors<br>• Better developer experience with IntelliSense<br>• Enhanced maintainability for large codebases<br>• Industry standard for enterprise applications                  |
| **pnpm**        | • 3x faster than npm, 2x faster than Yarn<br>• Efficient disk space usage with content-addressed storage<br>• Better monorepo support<br>• Strict dependency resolution prevents phantom dependencies                 |
| **Drizzle ORM** | • Type-safe SQL queries with zero runtime overhead<br>• Auto-completion and compile-time query validation<br>• Lightweight compared to Prisma (~90% smaller bundle)<br>• Direct SQL-like syntax for complex queries   |
| **PostgreSQL**  | • ACID compliance for data integrity<br>• Excellent support for complex queries and JSON operations<br>• Horizontal scaling capabilities<br>• Strong ecosystem and performance for enterprise workloads               |
| **Redis**       | • Sub-millisecond response times for caching<br>• Reduces database load for frequently accessed route data<br>• TTL support for dynamic cache invalidation<br>• Distributed locking for concurrent booking operations |

## 📊 Back-of-the-Envelope Calculations

### PostgreSQL Scalability Analysis

**Storage Requirements:**

-   **Flight Instances**: ~500KB per airline per day (assuming 100 flights/day)
-   **Bookings**: ~1KB per booking
-   **Events**: ~200 bytes per event (3-5 events per booking)

**For 1 million bookings/month:**

-   Storage: ~1.2GB/month
-   Read QPS: ~500-1000 (route searches)
-   Write QPS: ~100-200 (bookings + events)

**PostgreSQL can handle:**

-   10,000+ reads/second on modern hardware
-   1,000+ writes/second with proper indexing
-   Multi-TB databases with partitioning

**Our system is designed to scale horizontally with:**

-   Read replicas for route searches
-   Connection pooling
-   Redis caching (90%+ cache hit rate expected)

## 🏗️ Architecture Highlights

### Route Search Algorithm

The `/api/routes` endpoint implements a sophisticated flight search algorithm:

1. **Direct Flight Search**: Queries flight instances for direct routes
2. **Transit Route Discovery**:
    - Validates transit routes from the routes configuration table
    - Finds connecting flights with proper layover timing
    - Calculates total journey and layover durations
3. **Intelligent Caching**:
    - Dynamic TTL based on departure proximity
    - 5 minutes for same-day flights
    - 30 minutes for weekly flights
    - 1 hour for future dates

### Event-Driven Architecture

The system uses an **events table** to track the complete lifecycle of bookings:

```sql
-- Events table captures all booking state changes
CREATE TABLE events (
  id UUID PRIMARY KEY,
  entity_type event_entity NOT NULL,  -- 'BOOKING'
  entity_id UUID NOT NULL,            -- booking.id
  event_type event_type NOT NULL,     -- 'BOOKED', 'DEPARTED', 'ARRIVED', etc.
  location VARCHAR(3),                -- Airport code
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Benefits:**

-   **Audit Trail**: Complete history of all booking operations
-   **State Reconstruction**: Can rebuild booking status from events
-   **Analytics**: Rich data for operational insights
-   **Compliance**: Immutable record for regulatory requirements

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/rnkp755/air-cargo-booking.git
cd air-cargo-booking
```

### 2. Environment Setup

Copy the environment example and configure your databases:

```bash
cp .env.example .env
```

Update `.env` with your database credentials:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/air_cargo
REDIS_URL=redis://localhost:6379
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Database Setup

Push the database schema and seed with sample data:

```bash
# Push database schema to PostgreSQL
pnpm drizzle-push

# Seed database with airports, routes, and flight instances
pnpm seed-db
```

The seeding process will create:

-   **Major airports** (DEL, DXB, BOM, BLR, etc.)
-   **Direct and transit routes** between airports
-   **Flight schedules** for multiple airlines
-   **Flight instances** for the next 30 days

### 5. Start Development Server

```bash
pnpm dev
```

The website will be available at `http://localhost:3000/`

## 📖 API Documentation

### 🔍 Search Routes

**POST** `/api/routes`

Search for available flight routes between airports.

```json
{
	"origin": "DEL",
	"destination": "DXB",
	"departure_date": "2025-08-25"
}
```

**Response:**

```json
{
	"success": true,
	"message": "Found 2 direct flights and 1 transit route for DEL to DXB on 2025-08-25",
	"data": {
		"directFlights": [
			{
				"id": "flight-instance-uuid",
				"flightNumber": "AI131",
				"airlineName": "Air India",
				"origin": "DEL",
				"destination": "DXB",
				"departureAt": "2025-08-25T06:00:00.000Z",
				"arrivalAt": "2025-08-25T09:30:00.000Z",
				"operateDate": "2025-08-25",
				"status": "SCHEDULED"
			}
		],
		"transitRoute": {
			"firstFlight": {
				/* flight details */
			},
			"secondFlight": {
				/* flight details */
			},
			"transitAirport": "BOM",
			"totalDuration": "8h 30m",
			"layoverDuration": "2h 15m"
		}
	},
	"timestamp": "2025-08-24T12:00:00.000Z"
}
```

### 📦 Create Booking

**POST** `/api/bookings/create`

Create a new cargo booking for selected flights.

```json
{
	"origin": "DEL",
	"destination": "DXB",
	"flightInstanceIds": ["flight-uuid-1", "flight-uuid-2"],
	"pieces": 30,
	"weightKg": 140
}
```

**Response:**

```json
{
	"success": true,
	"message": "",
	"data": {
		"id": "booking-uuid",
		"refId": "DEL_DXB_ABC123",
		"origin": "DEL",
		"destination": "DXB",
		"pieces": 30,
		"weightKg": 140,
		"status": "BOOKED",
		"flights": [
			{
				"flightInstanceId": "flight-uuid",
				"flightNumber": "AI131",
				"airlineName": "Air India",
				"origin": "DEL",
				"destination": "DXB",
				"departureAt": "2025-08-25T06:00:00.000Z",
				"arrivalAt": "2025-08-25T09:30:00.000Z",
				"hopOrder": 1
			}
		],
		"createdAt": "2025-08-24T12:00:00.000Z",
		"updatedAt": "2025-08-24T12:00:00.000Z"
	}
}
```

### 📋 Booking History

**GET** `/api/bookings/{refId}/history`

Retrieve complete booking history including all events.

**Response:**

```json
{
	"success": true,
	"data": {
		"booking": {
			"id": "booking-uuid",
			"refId": "DEL_DXB_ABC123",
			"status": "ARRIVED",
			"pieces": 30,
			"weightKg": 140
		},
		"flights": [
			/* flight details */
		],
		"timeline": [
			{
				"id": "event-uuid",
				"eventType": "ARRIVED",
				"location": "DXB",
				"description": null,
				"createdAt": "2025-08-25T09:30:00.000Z"
			},
			{
				"eventType": "DEPARTED",
				"location": "DEL",
				"createdAt": "2025-08-25T06:00:00.000Z"
			},
			{
				"eventType": "BOOKED",
				"location": null,
				"createdAt": "2025-08-24T12:00:00.000Z"
			}
		]
	}
}
```

### 🚚 Update Booking Status

**PATCH** `/api/bookings/{refId}/departed`
Mark booking as departed from origin.

**PATCH** `/api/bookings/{refId}/arrived`  
Mark booking as arrived at destination.

**PATCH** `/api/bookings/{refId}/cancel`
Cancel the booking with reason.

```json
{
	"reason": "Customer request"
}
```

## 🧪 Testing

### Run All Tests

```bash
# Run all tests
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Run only API integration tests
pnpm test:api
```

### Test Coverage

The test suite includes:

-   **Route Search Tests**: Validates route discovery algorithm
-   **Booking Creation**: Tests direct and transit route bookings
-   **Lifecycle Management**: Complete booking flow (BOOKED → DEPARTED → ARRIVED)
-   **Error Handling**: Invalid input and edge case validation
-   **Event Timeline**: Verifies proper event logging

### Test Data Requirements

Tests require seeded data. Ensure you've run:

```bash
pnpm seed-db
```

The tests will:

1. Search for routes between DEL and DXB
2. Create multiple booking types
3. Test complete booking lifecycle
4. Validate event timeline accuracy

## 🛠️ Development Scripts

| Command             | Description                             |
| ------------------- | --------------------------------------- |
| `pnpm dev`          | Start development server with Turbopack |
| `pnpm build`        | Build production application            |
| `pnpm start`        | Start production server                 |
| `pnpm lint`         | Run ESLint checks                       |
| `pnpm drizzle-push` | Push database schema changes            |
| `pnpm seed-db`      | Populate database with sample data      |
| `pnpm test`         | Run tests in watch mode                 |
| `pnpm test:run`     | Run tests once                          |
| `pnpm test:api`     | Run API integration tests               |

## 🏭 Production Considerations

### Database Optimization

-   **Indexes**: Configured on frequently queried columns
-   **Partitioning**: Events table can be partitioned by date
-   **Connection Pooling**: Use PgBouncer for production

### Caching Strategy

-   **Route Cache**: 90%+ hit rate expected for popular routes
-   **TTL Management**: Dynamic based on departure proximity
-   **Cache Warming**: Pre-populate popular routes

### Monitoring & Observability

-   **Event Logging**: All booking operations logged
-   **Performance Metrics**: Response times and cache hit rates
-   **Error Tracking**: Comprehensive error handling

### Security

-   **Input Validation**: Zod schemas for all API inputs
-   **SQL Injection**: Drizzle ORM provides parameterized queries
-   **Rate Limiting**: Implement for production deployment

---

**Built with ❤️ by [Raushan](https://github.com/rnkp755) for GoComet Full Stack Intern Assessment**
