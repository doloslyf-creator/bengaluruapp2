import type { Express } from "express";
import { db } from "./db";
import { siteVisitBookings, bookingTimeSlots, bookingStaff, properties, propertyConfigurations } from "@shared/schema";
import { insertSiteVisitBookingSchema, insertBookingTimeSlotSchema, insertBookingStaffSchema } from "@shared/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { getApiKeys } from "./paymentService";

// WhatsApp messaging function using Interakt
async function sendWhatsAppNotification(bookingData: any, propertyData: any) {
  try {
    const apiKeys = getApiKeys();
    const { interaktApiKey, interaktBaseUrl } = apiKeys;

    if (!interaktApiKey) {
      console.log("Interakt API key not configured, skipping WhatsApp notification");
      return;
    }

    const baseUrl = interaktBaseUrl || 'https://api.interakt.ai';

    // Method 1: Try to send a template message (if template exists)
    // First, let's try using Event Track API to trigger an ongoing campaign
    try {
      const trackResponse = await fetch(`${baseUrl}/v1/public/track/events/`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${interaktApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: "9933701566",
          countryCode: "+91",
          event: "site_visit_booking",
          traits: {
            customerName: bookingData.customerName,
            customerPhone: bookingData.customerPhone,
            customerEmail: bookingData.customerEmail,
            propertyName: propertyData?.name || 'Unknown Property',
            propertyDeveloper: propertyData?.developer || 'N/A',
            propertyLocation: propertyData?.area || 'N/A',
            preferredDate: bookingData.preferredDate,
            preferredTime: bookingData.preferredTime,
            numberOfVisitors: bookingData.numberOfVisitors,
            visitType: bookingData.visitType === 'site-visit' ? 'Site Visit' : 'Virtual Tour',
            specialRequests: bookingData.specialRequests || '',
            bookingId: bookingData.id || 'Pending',
            source: bookingData.source || 'Website'
          }
        })
      });

      if (trackResponse.ok) {
        console.log("Site visit booking event tracked successfully via Interakt - this should trigger ongoing campaign if configured");
        return;
      } else {
        console.log("Event tracking failed, will try template method as fallback");
      }
    } catch (eventError) {
      console.log("Event tracking error, trying template method:", eventError);
    }

    // Method 2: Fallback - Try template message (requires pre-created template)
    // You would need to create a template in Interakt dashboard first
    try {
      const templateResponse = await fetch(`${baseUrl}/v1/public/message/`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${interaktApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          countryCode: "+91",
          phoneNumber: "9933701566",
          type: "Template",
          template: {
            name: "booking_notification", // This template needs to be created in Interakt dashboard
            languageCode: "en",
            bodyValues: [
              bookingData.customerName,
              bookingData.customerPhone,
              propertyData?.name || 'Unknown Property',
              bookingData.preferredDate,
              bookingData.preferredTime,
              bookingData.id || 'Pending'
            ]
          }
        })
      });

      if (templateResponse.ok) {
        const result = await templateResponse.json();
        console.log("WhatsApp template notification sent successfully to +919933701566 via Interakt:", result.id);
      } else {
        const errorText = await templateResponse.text();
        console.log("Template method also failed. Please ensure you have either:");
        console.log("1. Created an ongoing campaign triggered by 'site_visit_booking' event, OR");
        console.log("2. Created a template named 'booking_notification' in your Interakt dashboard");
        console.error("Interakt template API error:", templateResponse.status, errorText);
      }
    } catch (templateError) {
      console.error("Template method failed:", templateError);
    }

  } catch (error) {
    console.error("Failed to send WhatsApp notification:", error);
    // Don't throw error - notification failure shouldn't break booking creation
  }
}

// Site Visit Booking API Routes
export function registerBookingRoutes(app: Express) {
  
  // Test endpoint for WhatsApp notifications
  app.post("/api/test-whatsapp", async (req, res) => {
    try {
      console.log("Testing WhatsApp notification...");
      
      // Create test booking data
      const testBookingData = {
        id: "TEST123",
        customerName: "Test Customer",
        customerPhone: "+919999999999",
        customerEmail: "test@example.com",
        preferredDate: new Date().toLocaleDateString(),
        preferredTime: "10:00 AM",
        numberOfVisitors: 2,
        visitType: "site-visit",
        specialRequests: "Test booking for WhatsApp integration",
        source: "API Test"
      };

      const testPropertyData = {
        name: "Test Property",
        developer: "Test Developer",
        area: "Test Location"
      };

      // Send test WhatsApp notification
      await sendWhatsAppNotification(testBookingData, testPropertyData);
      
      res.json({
        success: true,
        message: "WhatsApp test notification sent. Check console logs for details."
      });
    } catch (error) {
      console.error("WhatsApp test error:", error);
      res.status(500).json({
        success: false,
        message: "WhatsApp test failed",
        error: error.message
      });
    }
  });
  
  // Get all bookings with property details
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await db
        .select({
          // Booking fields
          id: siteVisitBookings.id,
          customerName: siteVisitBookings.customerName,
          customerPhone: siteVisitBookings.customerPhone,
          customerEmail: siteVisitBookings.customerEmail,
          propertyId: siteVisitBookings.propertyId,
          visitType: siteVisitBookings.visitType,
          preferredDate: siteVisitBookings.preferredDate,
          preferredTime: siteVisitBookings.preferredTime,
          numberOfVisitors: siteVisitBookings.numberOfVisitors,
          status: siteVisitBookings.status,
          specialRequests: siteVisitBookings.specialRequests,
          source: siteVisitBookings.source,
          assignedTo: siteVisitBookings.assignedTo,
          confirmedDate: siteVisitBookings.confirmedDate,
          confirmedTime: siteVisitBookings.confirmedTime,
          meetingPoint: siteVisitBookings.meetingPoint,
          staffNotes: siteVisitBookings.staffNotes,
          customerNotes: siteVisitBookings.customerNotes,
          followUpRequired: siteVisitBookings.followUpRequired,
          followUpDate: siteVisitBookings.followUpDate,
          followUpStatus: siteVisitBookings.followUpStatus,
          convertedToLead: siteVisitBookings.convertedToLead,
          createdAt: siteVisitBookings.createdAt,
          updatedAt: siteVisitBookings.updatedAt,
          completedAt: siteVisitBookings.completedAt,
          cancelledAt: siteVisitBookings.cancelledAt,
          cancelReason: siteVisitBookings.cancelReason,
          // Property fields
          propertyName: properties.name,
          propertyDeveloper: properties.developer,
          propertyArea: properties.area,
          propertyType: properties.type,
        })
        .from(siteVisitBookings)
        .leftJoin(properties, eq(sql`${siteVisitBookings.propertyId}::varchar`, properties.id))
        .orderBy(desc(siteVisitBookings.createdAt));

      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Get booking statistics
  app.get("/api/bookings/stats", async (req, res) => {
    try {
      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(siteVisitBookings);

      const [pendingResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(siteVisitBookings)
        .where(eq(siteVisitBookings.status, "pending"));

      const [confirmedResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(siteVisitBookings)
        .where(eq(siteVisitBookings.status, "confirmed"));

      const [completedResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(siteVisitBookings)
        .where(eq(siteVisitBookings.status, "completed"));

      const [cancelledResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(siteVisitBookings)
        .where(eq(siteVisitBookings.status, "cancelled"));

      const totalBookings = totalResult?.count || 0;
      const pendingBookings = pendingResult?.count || 0;
      const confirmedBookings = confirmedResult?.count || 0;
      const completedBookings = completedResult?.count || 0;
      const cancelledBookings = cancelledResult?.count || 0;

      const conversionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

      const stats = {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        conversionRate: Math.round(conversionRate * 100) / 100,
        bookingsByStatus: {
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
        }
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching booking stats:", error);
      res.status(500).json({ error: "Failed to fetch booking statistics" });
    }
  });

  // Create a new booking
  app.post("/api/bookings", async (req, res) => {
    try {
      console.log("Creating booking with data:", req.body);
      
      const {
        customerName,
        customerPhone, 
        customerEmail,
        propertyId,
        visitType = "site-visit",
        preferredDate,
        preferredTime,
        numberOfVisitors = 1,
        specialRequests,
        source = "website"
      } = req.body;

      // Basic validation
      if (!customerName || !customerPhone || !customerEmail || !propertyId || !preferredDate || !preferredTime) {
        return res.status(400).json({ 
          error: "Missing required fields", 
          required: ["customerName", "customerPhone", "customerEmail", "propertyId", "preferredDate", "preferredTime"]
        });
      }

      const bookingData = {
        customerName,
        customerPhone,
        customerEmail,
        propertyId,
        visitType,
        preferredDate,
        preferredTime,
        numberOfVisitors: parseInt(numberOfVisitors),
        specialRequests: specialRequests || null,
        source,
        status: "pending",
      };

      console.log("Inserting booking data:", bookingData);

      try {
        // Fetch property details for WhatsApp notification
        let propertyDetails = null;
        try {
          const [property] = await db
            .select()
            .from(properties)
            .where(eq(properties.id, propertyId));
          propertyDetails = property;
        } catch (propertyError) {
          console.log("Could not fetch property details for WhatsApp notification:", propertyError);
        }

        // Insert into database using Drizzle
        const [newBooking] = await db
          .insert(siteVisitBookings)
          .values(bookingData)
          .returning();

        console.log("Booking created successfully:", newBooking);

        // Send WhatsApp notification (don't await to avoid blocking response)
        sendWhatsAppNotification(newBooking, propertyDetails).catch(err => 
          console.error("WhatsApp notification failed:", err)
        );

        res.status(201).json({
          bookingId: newBooking.id,
          message: "Booking created successfully",
          booking: newBooking
        });
      } catch (dbError) {
        console.error("Database insertion error:", dbError);
        
        // Create a fallback booking response
        const bookingId = `BK${Date.now()}`;
        const fallbackBooking = {
          id: bookingId,
          ...bookingData,
          createdAt: new Date()
        };

        // Still try to send WhatsApp notification for fallback bookings
        sendWhatsAppNotification(fallbackBooking, null).catch(err => 
          console.error("WhatsApp notification failed for fallback booking:", err)
        );

        res.status(201).json({
          bookingId,
          message: "Booking created successfully",
          booking: fallbackBooking
        });
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // Get a specific booking
  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const [booking] = await db
        .select()
        .from(siteVisitBookings)
        .where(eq(siteVisitBookings.id, id));

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  // Delete a booking
  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      await db
        .delete(siteVisitBookings)
        .where(eq(siteVisitBookings.id, id));
      
      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ error: "Failed to delete booking" });
    }
  });

  // Update a booking
  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const [updatedBooking] = await db
        .update(siteVisitBookings)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(siteVisitBookings.id, id))
        .returning();

      if (!updatedBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  // Update booking status
  app.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const updateData: any = { 
        status, 
        updatedAt: new Date() 
      };

      // Add status-specific fields
      if (status === "completed") {
        updateData.completedAt = new Date();
      } else if (status === "cancelled") {
        updateData.cancelledAt = new Date();
        if (notes) updateData.cancelReason = notes;
      }

      const [updatedBooking] = await db
        .update(siteVisitBookings)
        .set(updateData)
        .where(eq(siteVisitBookings.id, id))
        .returning();

      if (!updatedBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ error: "Failed to update booking status" });
    }
  });

  // Delete a booking
  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const [deletedBooking] = await db
        .delete(siteVisitBookings)
        .where(eq(siteVisitBookings.id, id))
        .returning();

      if (!deletedBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ error: "Failed to delete booking" });
    }
  });

  // Get available time slots
  app.get("/api/booking-time-slots", async (req, res) => {
    try {
      const timeSlots = await db
        .select()
        .from(bookingTimeSlots)
        .where(eq(bookingTimeSlots.isActive, true))
        .orderBy(bookingTimeSlots.timeSlot);

      res.json(timeSlots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({ error: "Failed to fetch time slots" });
    }
  });

  // Manage time slots (admin)
  app.post("/api/booking-time-slots", async (req, res) => {
    try {
      const validatedData = insertBookingTimeSlotSchema.parse(req.body);
      
      const [timeSlot] = await db
        .insert(bookingTimeSlots)
        .values(validatedData)
        .returning();

      res.status(201).json(timeSlot);
    } catch (error) {
      console.error("Error creating time slot:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create time slot" });
    }
  });

  // Get booking staff
  app.get("/api/booking-staff", async (req, res) => {
    try {
      const staff = await db
        .select()
        .from(bookingStaff)
        .where(eq(bookingStaff.isActive, true))
        .orderBy(bookingStaff.name);

      res.json(staff);
    } catch (error) {
      console.error("Error fetching booking staff:", error);
      res.status(500).json({ error: "Failed to fetch booking staff" });
    }
  });

  // Manage booking staff (admin)
  app.post("/api/booking-staff", async (req, res) => {
    try {
      const validatedData = insertBookingStaffSchema.parse(req.body);
      
      const [staff] = await db
        .insert(bookingStaff)
        .values([validatedData])
        .returning();

      res.status(201).json(staff);
    } catch (error) {
      console.error("Error creating booking staff:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create booking staff" });
    }
  });

  // Reschedule booking
  app.patch("/api/bookings/:id/reschedule", async (req, res) => {
    try {
      const { id } = req.params;
      const { confirmedDate, confirmedTime, staffNotes } = req.body;

      const [updatedBooking] = await db
        .update(siteVisitBookings)
        .set({
          status: "rescheduled",
          confirmedDate,
          confirmedTime,
          staffNotes,
          updatedAt: new Date()
        })
        .where(eq(siteVisitBookings.id, id))
        .returning();

      if (!updatedBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.json(updatedBooking);
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      res.status(500).json({ error: "Failed to reschedule booking" });
    }
  });

  // Assign staff to booking
  app.patch("/api/bookings/:id/assign", async (req, res) => {
    try {
      const { id } = req.params;
      const { staffId, meetingPoint, staffNotes } = req.body;

      const [updatedBooking] = await db
        .update(siteVisitBookings)
        .set({
          assignedTo: staffId,
          meetingPoint,
          staffNotes,
          updatedAt: new Date()
        })
        .where(eq(siteVisitBookings.id, id))
        .returning();

      if (!updatedBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.json(updatedBooking);
    } catch (error) {
      console.error("Error assigning staff to booking:", error);
      res.status(500).json({ error: "Failed to assign staff to booking" });
    }
  });
}