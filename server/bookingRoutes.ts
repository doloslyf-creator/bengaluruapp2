import type { Express } from "express";
import { db } from "./db";
import { siteVisitBookings, bookingTimeSlots, bookingStaff, properties, propertyConfigurations } from "@shared/schema";
import { insertSiteVisitBookingSchema, insertBookingTimeSlotSchema, insertBookingStaffSchema } from "@shared/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

// Site Visit Booking API Routes
export function registerBookingRoutes(app: Express) {
  
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
        .leftJoin(properties, eq(siteVisitBookings.propertyId, properties.id))
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
      const validatedData = insertSiteVisitBookingSchema.parse(req.body);
      
      const [booking] = await db
        .insert(siteVisitBookings)
        .values(validatedData)
        .returning();

      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
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
        .values(validatedData)
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