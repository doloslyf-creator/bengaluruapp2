
# API Reference - OwnItRight Platform

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication
Most admin endpoints require authentication. Include the session token in requests:
```javascript
headers: {
  'Authorization': 'Bearer YOUR_SESSION_TOKEN'
}
```

## Properties API

### GET /api/properties
Retrieve all properties with optional filtering.

**Query Parameters:**
- `location` (string): Filter by location
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `propertyType` (string): Filter by property type
- `page` (number): Page number for pagination
- `limit` (number): Number of results per page

**Response:**
```json
{
  "properties": [
    {
      "id": "uuid",
      "title": "Luxury 3BHK Apartment",
      "location": "Whitefield, Bangalore",
      "price": 8500000,
      "propertyType": "Apartment",
      "bedrooms": 3,
      "bathrooms": 2,
      "sqft": 1200,
      "amenities": ["Gym", "Pool", "Parking"],
      "images": ["image1.jpg", "image2.jpg"],
      "description": "Beautiful apartment...",
      "latitude": 12.9698,
      "longitude": 77.7500,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### GET /api/properties/:id
Get detailed information about a specific property.

**Response:**
```json
{
  "id": "uuid",
  "title": "Luxury 3BHK Apartment",
  "location": "Whitefield, Bangalore",
  "price": 8500000,
  "propertyType": "Apartment",
  "bedrooms": 3,
  "bathrooms": 2,
  "sqft": 1200,
  "amenities": ["Gym", "Pool", "Parking"],
  "images": ["image1.jpg", "image2.jpg"],
  "description": "Detailed description...",
  "latitude": 12.9698,
  "longitude": 77.7500,
  "reraNumber": "RERA123456",
  "builder": "Prestige Group",
  "completionDate": "2025-06-01",
  "scores": {
    "investmentScore": 85,
    "amenitiesScore": 90,
    "connectivityScore": 88,
    "overallScore": 87.7
  }
}
```

### POST /api/properties (Admin Only)
Create a new property listing.

**Request Body:**
```json
{
  "title": "Luxury 3BHK Apartment",
  "location": "Whitefield, Bangalore",
  "price": 8500000,
  "propertyType": "Apartment",
  "bedrooms": 3,
  "bathrooms": 2,
  "sqft": 1200,
  "amenities": ["Gym", "Pool", "Parking"],
  "description": "Beautiful apartment...",
  "latitude": 12.9698,
  "longitude": 77.7500,
  "reraNumber": "RERA123456",
  "builder": "Prestige Group"
}
```

## Leads/Customers API

### GET /api/customers (Admin Only)
Retrieve all leads and customers.

**Query Parameters:**
- `status` (string): Filter by lead status
- `source` (string): Filter by lead source
- `priority` (string): Filter by priority level
- `page` (number): Page number
- `limit` (number): Results per page

**Response:**
```json
{
  "customers": [
    {
      "id": "email@example.com",
      "name": "John Doe",
      "phone": "+91-9876543210",
      "email": "john@example.com",
      "status": "qualified",
      "source": "website",
      "priority": "high",
      "leadScore": 85,
      "budget": 5000000,
      "preferredLocation": "Whitefield",
      "interestedProperties": ["property-id-1"],
      "notes": "Interested in 3BHK apartments",
      "createdAt": "2025-01-01T00:00:00Z",
      "lastContactDate": "2025-01-03T00:00:00Z"
    }
  ]
}
```

### POST /api/customers
Create a new lead (used by contact forms).

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+91-9876543210",
  "email": "john@example.com",
  "source": "website",
  "message": "Interested in property consultation",
  "propertyId": "property-uuid",
  "budget": 5000000,
  "preferredLocation": "Whitefield"
}
```

### GET /api/customers/stats (Admin Only)
Get customer/lead statistics.

**Response:**
```json
{
  "totalCustomers": 150,
  "hotLeads": 25,
  "conversions": 12,
  "conversionRate": 8.0,
  "monthlyStats": [
    {
      "month": "2025-01",
      "newLeads": 45,
      "conversions": 8,
      "revenue": 480000
    }
  ]
}
```

## Reports API

### GET /api/valuation-reports (Admin Only)
List all property valuation reports.

**Response:**
```json
{
  "reports": [
    {
      "id": "report-uuid",
      "propertyId": "property-uuid",
      "customerId": "customer-email",
      "reportType": "comprehensive",
      "status": "completed",
      "marketValue": 8500000,
      "projectedAppreciation": 8.5,
      "investmentScore": 87,
      "createdAt": "2025-01-01T00:00:00Z",
      "completedAt": "2025-01-02T00:00:00Z"
    }
  ]
}
```

### POST /api/valuation-reports (Admin Only)
Create a new valuation report.

**Request Body:**
```json
{
  "propertyId": "property-uuid",
  "customerId": "customer-email",
  "reportType": "comprehensive",
  "marketValue": 8500000,
  "comparativeAnalysis": {...},
  "financialProjections": {...},
  "riskAssessment": {...}
}
```

### GET /api/civil-mep-reports (Admin Only)
List all Civil & MEP engineering reports.

**Response:**
```json
{
  "reports": [
    {
      "id": "report-uuid",
      "propertyId": "property-uuid",
      "customerId": "customer-email",
      "status": "completed",
      "structuralAssessment": {...},
      "mepSystems": {...},
      "fireSafety": {...},
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

## Bookings API

### POST /api/bookings
Create a new booking (site visit or consultation).

**Request Body:**
```json
{
  "customerName": "John Doe",
  "customerPhone": "+91-9876543210",
  "customerEmail": "john@example.com",
  "bookingType": "site-visit",
  "propertyId": "property-uuid",
  "preferredDate": "2025-01-15",
  "preferredTime": "10:00",
  "message": "Would like to visit on weekend"
}
```

### GET /api/bookings (Admin Only)
List all bookings.

**Response:**
```json
{
  "bookings": [
    {
      "id": "booking-uuid",
      "customerName": "John Doe",
      "customerPhone": "+91-9876543210",
      "customerEmail": "john@example.com",
      "bookingType": "site-visit",
      "propertyId": "property-uuid",
      "status": "confirmed",
      "scheduledDate": "2025-01-15T10:00:00Z",
      "createdAt": "2025-01-10T00:00:00Z"
    }
  ]
}
```

## Settings API

### GET /api/settings
Get application settings.

**Response:**
```json
{
  "businessName": "OwnItRight",
  "businessEmail": "contact@ownitright.com",
  "businessPhone": "+91-80-12345678",
  "businessAddress": "Bangalore, Karnataka",
  "websiteUrl": "https://ownitright.com",
  "logoUrl": "/logo.png",
  "socialMedia": {
    "facebook": "https://facebook.com/ownitright",
    "linkedin": "https://linkedin.com/company/ownitright"
  }
}
```

### GET /api/settings/api-keys (Admin Only)
Get configured API keys (masked for security).

**Response:**
```json
{
  "razorpayKeyId": "rzp_live_****",
  "razorpayKeySecret": "****",
  "googleAnalyticsId": "G-****",
  "googleMapsApiKey": "****",
  "twilioAccountSid": "****",
  "sendgridApiKey": "****"
}
```

## Payment API

### POST /api/payments/create-order
Create a Razorpay order for payment.

**Request Body:**
```json
{
  "amount": 50000,
  "currency": "INR",
  "serviceType": "valuation-report",
  "customerId": "customer-email",
  "propertyId": "property-uuid"
}
```

**Response:**
```json
{
  "orderId": "order_razorpay_id",
  "amount": 50000,
  "currency": "INR",
  "key": "rzp_live_****"
}
```

### POST /api/payments/verify
Verify payment after successful transaction.

**Request Body:**
```json
{
  "razorpay_order_id": "order_id",
  "razorpay_payment_id": "payment_id",
  "razorpay_signature": "signature",
  "orderId": "internal_order_id"
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

### Example Error Response
```json
{
  "error": true,
  "message": "Property not found",
  "code": "PROPERTY_NOT_FOUND",
  "details": {
    "propertyId": "invalid-uuid"
  }
}
```

## Rate Limiting
- **Public Endpoints**: 100 requests per minute per IP
- **Admin Endpoints**: 1000 requests per minute per authenticated user
- **Payment Endpoints**: 10 requests per minute per user

## Webhooks

### Razorpay Webhook
Endpoint: `POST /api/webhooks/razorpay`

Handles payment status updates from Razorpay.

---

**Note**: This API reference covers the core endpoints. Additional endpoints may be available for specific administrative functions.
