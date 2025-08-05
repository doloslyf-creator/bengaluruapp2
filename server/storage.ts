 import { 
  type Property, 
  type InsertProperty, 
  type PropertyStats, 
  type PropertyConfiguration,
  type InsertPropertyConfiguration,
  type PropertyWithConfigurations,
  type PropertyScore,
  type InsertPropertyScore,
  type Lead,
  type InsertLead,
  type LeadWithDetails,
  type LeadActivity,
  type InsertLeadActivity,
  type LeadNote,
  type InsertLeadNote,
  type LeadTimeline,
  type InsertLeadTimeline,
  type LeadDocument,
  type InsertLeadDocument,
  type LeadStats,
  type Booking,
  type InsertBooking,
  type SiteVisitBooking,
  type InsertSiteVisitBooking,
  type SiteVisitBookingWithDetails,
  type BookingTimeSlot,
  type InsertBookingTimeSlot,
  type BookingStaff,
  type InsertBookingStaff,
  type BookingStats,
  type PropertyValuationReport,
  type InsertPropertyValuationReport,
  type CivilMepReport,
  type InsertCivilMepReport,
  type ReportPayment,
  type InsertReportPayment,
  type CustomerNote,
  type InsertCustomerNote,
  type AppSettings,
  type InsertAppSettings,
  type TeamMember,
  type InsertTeamMember,
  properties, 
  propertyConfigurations,
  propertyScores,
  leads, 
  leadActivities, 
  leadNotes,
  leadTimeline,
  leadDocuments,
  bookings,
  siteVisitBookings,
  bookingTimeSlots,
  bookingStaff,
  propertyValuationReports,
  civilMepReports,
  reportPayments,
  customerNotes,
  appSettings,
  teamMembers,
  reraData,
  type ReraData,
  type InsertReraData
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, gte, lte, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Property CRUD operations
  getProperty(id: string): Promise<Property | undefined>;
  getAllProperties(): Promise<Property[]>;
  getPropertyWithConfigurations(id: string): Promise<PropertyWithConfigurations | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;
  
  // Property Scoring operations
  createPropertyScore(score: InsertPropertyScore): Promise<PropertyScore>;
  getPropertyScore(propertyId: string): Promise<PropertyScore | undefined>;
  updatePropertyScore(id: string, score: Partial<InsertPropertyScore>): Promise<PropertyScore | undefined>;
  deletePropertyScore(id: string): Promise<boolean>;
  getAllPropertyScores(): Promise<PropertyScore[]>;
  
  // Property Configuration CRUD operations
  getPropertyConfigurations(propertyId: string): Promise<PropertyConfiguration[]>;
  createPropertyConfiguration(config: InsertPropertyConfiguration): Promise<PropertyConfiguration>;
  updatePropertyConfiguration(id: string, config: Partial<InsertPropertyConfiguration>): Promise<PropertyConfiguration | undefined>;
  deletePropertyConfiguration(id: string): Promise<boolean>;
  
  // Search and filter operations
  searchProperties(query: string): Promise<Property[]>;
  filterProperties(filters: {
    type?: string;
    status?: string;
    zone?: string;
    reraApproved?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Property[]>;
  
  // Statistics
  getPropertyStats(): Promise<PropertyStats>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(bookingId: string): Promise<Booking | undefined>;
  getAllBookings(): Promise<Booking[]>;
  updateBookingStatus(bookingId: string, status: string): Promise<Booking | undefined>;
  
  // Lead management operations
  createLead(lead: InsertLead): Promise<Lead>;
  getLead(leadId: string): Promise<Lead | undefined>;
  getLeadWithDetails(leadId: string): Promise<LeadWithDetails | undefined>;
  getAllLeads(): Promise<Lead[]>;
  updateLead(leadId: string, updates: Partial<InsertLead>): Promise<Lead | undefined>;
  
  // Lead activities
  addLeadActivity(activity: InsertLeadActivity): Promise<LeadActivity>;
  getLeadActivities(leadId: string): Promise<LeadActivity[]>;
  
  // Lead notes
  addLeadNote(note: InsertLeadNote): Promise<LeadNote>;
  getLeadNotes(leadId: string): Promise<LeadNote[]>;
  
  // Lead statistics and filtering
  getLeadStats(): Promise<LeadStats>;
  filterLeads(filters: {
    status?: string;
    leadType?: string;
    priority?: string;
    assignedTo?: string;
    source?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Lead[]>;
  
  // Enhanced lead filtering
  getEnhancedLeads(filters: {
    persona?: string;
    urgency?: string;
    budget?: string;
    status?: string;
    smartTags?: string[];
    assignedTo?: string;
    dateRange?: string;
  }): Promise<LeadWithDetails[]>;
  
  // Lead scoring and qualification
  updateLeadScore(leadId: string, score: number, notes?: string): Promise<Lead | undefined>;
  qualifyLead(leadId: string, qualified: boolean, notes: string): Promise<Lead | undefined>;
  
  // Enhanced lead operations
  addLeadTimeline(timeline: InsertLeadTimeline): Promise<LeadTimeline>;
  getLeadTimeline(leadId: string): Promise<LeadTimeline[]>;
  addLeadDocument(document: InsertLeadDocument): Promise<LeadDocument>;
  getLeadDocuments(leadId: string): Promise<LeadDocument[]>;
  
  // User operations (from original template)
  getUser(id: string): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: any): Promise<any>;


  
  // Property Valuation Report operations
  createValuationReport(report: InsertPropertyValuationReport): Promise<PropertyValuationReport>;
  getValuationReport(reportId: string): Promise<PropertyValuationReport | undefined>;
  getAllValuationReports(): Promise<PropertyValuationReport[]>;
  updateValuationReport(reportId: string, updates: Partial<InsertPropertyValuationReport>): Promise<PropertyValuationReport | undefined>;
  deleteValuationReport(reportId: string): Promise<boolean>;
  getValuationReportsByProperty(propertyId: string): Promise<PropertyValuationReport[]>;
  getValuationReportsByCustomer(customerId: string): Promise<PropertyValuationReport[]>;
  assignReportToCustomer(reportId: string, customerId: string): Promise<PropertyValuationReport | undefined>;
  updateReportStatus(reportId: string, status: "draft" | "in_progress" | "completed" | "delivered"): Promise<PropertyValuationReport | undefined>;
  getValuationReportStats(): Promise<any>;

  // App Settings operations
  getAppSettings(): Promise<AppSettings | undefined>;
  updateAppSettings(settings: Partial<InsertAppSettings>): Promise<AppSettings>;
  initializeAppSettings(): Promise<AppSettings>;

  // Team member operations
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  getAllTeamMembers(): Promise<TeamMember[]>;
  updateTeamMember(id: string, updates: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<boolean>;
  getTeamMembersByDepartment(department: string): Promise<TeamMember[]>;
  getActiveTeamMembers(): Promise<TeamMember[]>;

  // RERA Data operations
  createReraData(reraInfo: InsertReraData): Promise<ReraData>;
  getReraData(reraId: string): Promise<ReraData | undefined>;
  getReraDataByProperty(propertyId: string): Promise<ReraData | undefined>;
  getAllReraData(): Promise<ReraData[]>;
  updateReraData(reraId: string, updates: Partial<InsertReraData>): Promise<ReraData | undefined>;
  deleteReraData(reraId: string): Promise<boolean>;

  // Civil+MEP Report operations
  createCivilMepReport(report: InsertCivilMepReport): Promise<CivilMepReport>;
  getCivilMepReport(reportId: string): Promise<CivilMepReport | undefined>;
  getCivilMepReportByProperty(propertyId: string): Promise<CivilMepReport | undefined>;
  getAllCivilMepReports(): Promise<CivilMepReport[]>;
  updateCivilMepReport(reportId: string, updates: Partial<InsertCivilMepReport>): Promise<CivilMepReport | undefined>;
  deleteCivilMepReport(reportId: string): Promise<boolean>;
  getCivilMepReportStats(): Promise<any>;
  
  // Report Payment operations
  createReportPayment(payment: InsertReportPayment): Promise<ReportPayment>;
  getReportPayment(paymentId: string): Promise<ReportPayment | undefined>;
  getAllReportPayments(): Promise<ReportPayment[]>;
  getReportPaymentsByProperty(propertyId: string): Promise<ReportPayment[]>;
  updateReportPaymentStatus(paymentId: string, status: string): Promise<ReportPayment | undefined>;
}

export class MemStorage implements IStorage {
  private properties: Map<string, Property>;
  private propertyConfigurations: Map<string, PropertyConfiguration>;
  private bookings: Map<string, Booking>;
  private leads: Map<string, Lead>;
  private leadActivities: Map<string, LeadActivity[]>;
  private leadNotes: Map<string, LeadNote[]>;
  private users: Map<string, any>;
  private appSettings: AppSettings | null;

  constructor() {
    this.properties = new Map();
    this.propertyConfigurations = new Map();
    this.bookings = new Map();
    this.leads = new Map();
    this.leadActivities = new Map();
    this.leadNotes = new Map();
    this.users = new Map();
    this.appSettings = null;
    
    // Initialize with some sample properties and configurations
    this.initializeSampleData();
    
    // Initialize default app settings
    this.initializeDefaultAppSettings();
  }

  private initializeSampleData() {
    const sampleProperties: InsertProperty[] = [
      {
        name: "Prestige Lakeside Habitat",
        type: "apartment",
        developer: "Prestige Group",
        status: "active",
        area: "Varthur",
        zone: "east",
        address: "Varthur, East Bengaluru, Karnataka",

        possessionDate: "2025-12",
        reraNumber: "PRM/KA/RERA/1251/309/AG/2020-21",
        reraApproved: true,
        infrastructureVerdict: "Good connectivity, metro planned",
        zoningInfo: "Residential zone with mixed development",
        tags: ["rera-approved", "gated-community"],
        images: [],
        videos: [],
      },
      {
        name: "Brigade Woods",
        type: "villa",
        developer: "Brigade Group",
        status: "pre-launch",
        area: "Whitefield",
        zone: "east",
        address: "Whitefield, East Bengaluru, Karnataka",

        possessionDate: "2027-03",
        reraNumber: "PRM/KA/RERA/1251/310/AG/2021-22",
        reraApproved: true,
        infrastructureVerdict: "Excellent infrastructure, IT hub proximity",
        zoningInfo: "Premium residential zone",
        tags: ["rera-approved", "premium"],
        images: [],
        videos: [],
      },
      {
        name: "Godrej Park Retreat",
        type: "plot",
        developer: "Godrej Properties",
        status: "active",
        area: "Sarjapur Road",
        zone: "south",
        address: "Sarjapur Road, South Bengaluru, Karnataka",
        possessionDate: "immediate",
        reraNumber: "PRM/KA/RERA/1251/311/AG/2020-21",
        reraApproved: true,
        infrastructureVerdict: "Developing area, flood risk present",
        zoningInfo: "Residential zone with environmental concerns",
        tags: ["rera-approved", "flood-zone"],
        images: [],
        videos: [],
      },
      {
        name: "Sobha Neopolis",
        type: "apartment",
        developer: "Sobha Limited",
        status: "under-construction",
        area: "Panathur",
        zone: "east",
        address: "Panathur Road, East Bengaluru, Karnataka",
        possessionDate: "2026-09",
        reraNumber: "PRM/KA/RERA/1251/312/AG/2023-24",
        reraApproved: true,
        infrastructureVerdict: "Excellent IT connectivity, upcoming metro",
        zoningInfo: "IT corridor residential zone",
        tags: ["rera-approved", "premium", "it-hub-proximity"],
        images: [],
        videos: [],
      },
      {
        name: "Ozone Urbana Prime",
        type: "villa",
        developer: "Ozone Group",
        status: "completed",
        area: "Devanahalli",
        zone: "north",
        address: "Devanahalli, North Bengaluru, Karnataka",
        possessionDate: "immediate",
        reraNumber: "PRM/KA/RERA/1251/313/AG/2021-22",
        reraApproved: true,
        infrastructureVerdict: "Airport proximity, good infrastructure",
        zoningInfo: "Premium residential with golf course views",
        tags: ["rera-approved", "premium", "golf-course", "eco-friendly"],
        images: [],
        videos: [],
      },
    ];

    const propertyIds: string[] = [];
    
    sampleProperties.forEach(property => {
      const id = randomUUID();
      const fullProperty: Property = {
        ...property,
        id,
        possessionDate: property.possessionDate || null,
        reraNumber: property.reraNumber || null,
        reraApproved: property.reraApproved ?? false,
        infrastructureVerdict: property.infrastructureVerdict || null,
        zoningInfo: property.zoningInfo || null,
        tags: (property.tags as string[]) || [],
        images: (property.images as string[]) || [],
        videos: (property.videos as string[]) || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.properties.set(id, fullProperty);
      propertyIds.push(id);
    });

    // Add sample configurations for each property
    const sampleConfigurations: InsertPropertyConfiguration[] = [
      // Prestige Lakeside Habitat configurations
      {
        propertyId: propertyIds[0],
        configuration: "3BHK",
        pricePerSqft: "6500",
        builtUpArea: 1850,
        plotSize: 0,
        availabilityStatus: "available",
        totalUnits: 120,
        availableUnits: 95,
        price: 120,
      },
      {
        propertyId: propertyIds[0],
        configuration: "4BHK",
        pricePerSqft: "7200",
        builtUpArea: 2100,
        plotSize: 0,
        availabilityStatus: "limited",
        totalUnits: 80,
        availableUnits: 12,
        price: 151,
      },
      // Brigade Woods configurations
      {
        propertyId: propertyIds[1],
        configuration: "4BHK Villa",
        pricePerSqft: "14000",
        builtUpArea: 3200,
        plotSize: 2400,
        availabilityStatus: "coming-soon",
        totalUnits: 50,
        availableUnits: 50,
        price: 448,
      },
      // Godrej Park Retreat configurations
      {
        propertyId: propertyIds[2],
        configuration: "Plot - 30x40",
        pricePerSqft: "4000",
        builtUpArea: 0,
        plotSize: 1200,
        availabilityStatus: "available",
        totalUnits: 200,
        availableUnits: 156,
        price: 48,
      },
      {
        propertyId: propertyIds[2],
        configuration: "Plot - 40x60",
        pricePerSqft: "4000",
        builtUpArea: 0,
        plotSize: 2400,
        availabilityStatus: "available",
        totalUnits: 120,
        availableUnits: 89,
        price: 96,
      },
      // Sobha Neopolis configurations
      {
        propertyId: propertyIds[3],
        configuration: "2BHK",
        pricePerSqft: "7800",
        builtUpArea: 1250,
        plotSize: 0,
        availabilityStatus: "available",
        totalUnits: 200,
        availableUnits: 145,
        price: 98,
      },
      {
        propertyId: propertyIds[3],
        configuration: "3BHK",
        pricePerSqft: "7500",
        builtUpArea: 1650,
        plotSize: 0,
        availabilityStatus: "available",
        totalUnits: 180,
        availableUnits: 92,
        price: 124,
      },
      {
        propertyId: propertyIds[3],
        configuration: "3BHK Premium",
        pricePerSqft: "8200",
        builtUpArea: 1850,
        plotSize: 0,
        availabilityStatus: "limited",
        totalUnits: 60,
        availableUnits: 8,
        price: 152,
      },
      // Ozone Urbana Prime configurations
      {
        propertyId: propertyIds[4],
        configuration: "3BHK Villa",
        pricePerSqft: "12500",
        builtUpArea: 2800,
        plotSize: 1800,
        availabilityStatus: "available",
        totalUnits: 150,
        availableUnits: 67,
        price: 350,
      },
      {
        propertyId: propertyIds[4],
        configuration: "4BHK Villa",
        pricePerSqft: "12000",
        builtUpArea: 3500,
        plotSize: 2200,
        availabilityStatus: "available",
        totalUnits: 100,
        availableUnits: 23,
        price: 420,
      },
      {
        propertyId: propertyIds[4],
        configuration: "5BHK Villa Premium",
        pricePerSqft: "13500",
        builtUpArea: 4200,
        plotSize: 2800,
        availabilityStatus: "limited",
        totalUnits: 40,
        availableUnits: 5,
        price: 567,
      },
    ];

    sampleConfigurations.forEach(config => {
      const id = randomUUID();
      const fullConfig: PropertyConfiguration = {
        ...config,
        id,
        plotSize: config.plotSize || null,
        totalUnits: config.totalUnits || null,
        availableUnits: config.availableUnits || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.propertyConfigurations.set(id, fullConfig);
    });
  }

  async getProperty(id: string): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getAllProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = randomUUID();
    const property: Property = {
      ...insertProperty,
      id,
      possessionDate: insertProperty.possessionDate || null,
      reraNumber: insertProperty.reraNumber || null,
      reraApproved: insertProperty.reraApproved ?? false,
      infrastructureVerdict: insertProperty.infrastructureVerdict || null,
      zoningInfo: insertProperty.zoningInfo || null,
      tags: (insertProperty.tags as string[]) || [],
      images: (insertProperty.images as string[]) || [],
      videos: (insertProperty.videos as string[]) || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.properties.set(id, property);
    return property;
  }

  async getPropertyWithConfigurations(id: string): Promise<PropertyWithConfigurations | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;
    
    const configurations = Array.from(this.propertyConfigurations.values())
      .filter(config => config.propertyId === id);
    
    return {
      ...property,
      configurations
    };
  }

  async updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const existing = this.properties.get(id);
    if (!existing) return undefined;

    const updated: Property = {
      ...existing,
      ...updates,
      tags: Array.isArray(updates.tags) ? updates.tags as string[] : existing.tags,
      images: Array.isArray(updates.images) ? updates.images as string[] : existing.images,
      videos: Array.isArray(updates.videos) ? updates.videos as string[] : existing.videos,
      updatedAt: new Date(),
    };
    this.properties.set(id, updated);
    return updated;
  }

  async deleteProperty(id: string): Promise<boolean> {
    // Also delete associated configurations
    const configsToDelete = Array.from(this.propertyConfigurations.entries())
      .filter(([, config]) => config.propertyId === id)
      .map(([configId]) => configId);
    
    configsToDelete.forEach(configId => this.propertyConfigurations.delete(configId));
    
    return this.properties.delete(id);
  }

  // Property Configuration CRUD operations
  async getPropertyConfigurations(propertyId: string): Promise<PropertyConfiguration[]> {
    return Array.from(this.propertyConfigurations.values())
      .filter(config => config.propertyId === propertyId);
  }

  async createPropertyConfiguration(config: InsertPropertyConfiguration): Promise<PropertyConfiguration> {
    const id = randomUUID();
    const fullConfig: PropertyConfiguration = {
      ...config,
      id,
      plotSize: config.plotSize || null,
      totalUnits: config.totalUnits || null,
      availableUnits: config.availableUnits || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.propertyConfigurations.set(id, fullConfig);
    return fullConfig;
  }

  async updatePropertyConfiguration(id: string, updates: Partial<InsertPropertyConfiguration>): Promise<PropertyConfiguration | undefined> {
    const existing = this.propertyConfigurations.get(id);
    if (!existing) return undefined;

    const updated: PropertyConfiguration = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.propertyConfigurations.set(id, updated);
    return updated;
  }

  async deletePropertyConfiguration(id: string): Promise<boolean> {
    return this.propertyConfigurations.delete(id);
  }

  async searchProperties(query: string): Promise<Property[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.properties.values()).filter(
      (property) =>
        property.name.toLowerCase().includes(searchTerm) ||
        property.developer.toLowerCase().includes(searchTerm) ||
        property.area.toLowerCase().includes(searchTerm) ||
        property.address.toLowerCase().includes(searchTerm)
    );
  }

  async filterProperties(filters: {
    type?: string;
    status?: string;
    zone?: string;
    reraApproved?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Property[]> {
    const properties = Array.from(this.properties.values()).filter((property) => {
      if (filters.type && property.type !== filters.type) return false;
      if (filters.status && property.status !== filters.status) return false;
      if (filters.zone && property.zone !== filters.zone) return false;
      if (filters.reraApproved !== undefined && property.reraApproved !== filters.reraApproved) return false;
      return true;
    });

    // If price filters are specified, filter by property configurations
    if (filters.minPrice || filters.maxPrice) {
      const configurations = Array.from(this.propertyConfigurations.values());
      const filteredPropertyIds = configurations
        .filter(config => {
          if (filters.minPrice && config.price < filters.minPrice) return false;
          if (filters.maxPrice && config.price > filters.maxPrice) return false;
          return true;
        })
        .map(config => config.propertyId);
      
      return properties.filter(property => filteredPropertyIds.includes(property.id));
    }

    return properties;
  }

  async getPropertyStats(): Promise<PropertyStats> {
    const properties = Array.from(this.properties.values());
    const configurations = Array.from(this.propertyConfigurations.values());
    
    const totalProperties = properties.length;
    const activeProjects = properties.filter(p => p.status === "active" || p.status === "under-construction").length;
    const reraApproved = properties.filter(p => p.reraApproved).length;
    
    // Calculate average price from configurations
    const avgPrice = configurations.length > 0 
      ? Math.round(configurations.reduce((sum, c) => sum + c.price, 0) / configurations.length * 10) / 10 
      : 156.2; // Default average for sample data

    return {
      totalProperties,
      activeProjects,
      reraApproved,
      avgPrice,
    };
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const fullBooking: Booking = {
      ...booking,
      id,
      questions: booking.questions || null,
      preferredDate: booking.preferredDate || null,
      preferredTime: booking.preferredTime || null,
      visitType: booking.visitType || null,
      numberOfVisitors: booking.numberOfVisitors || null,
      consultationType: booking.consultationType || null,
      preferredContactTime: booking.preferredContactTime || null,
      urgency: booking.urgency || null,
      specialRequests: booking.specialRequests || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bookings.set(id, fullBooking);
    return fullBooking;
  }

  async getBooking(bookingId: string): Promise<Booking | undefined> {
    return Array.from(this.bookings.values()).find(b => b.bookingId === bookingId);
  }

  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<Booking | undefined> {
    const booking = await this.getBooking(bookingId);
    if (!booking) return undefined;

    const updated: Booking = {
      ...booking,
      status: status as any,
      updatedAt: new Date(),
    };
    this.bookings.set(booking.id, updated);
    return updated;
  }

  // Lead management operations
  async createLead(lead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const fullLead: Lead = {
      ...lead,
      id,
      propertyId: lead.propertyId || null,
      interestedConfiguration: lead.interestedConfiguration || null,
      budgetRange: lead.budgetRange || null,
      qualificationNotes: lead.qualificationNotes || null,
      assignedTo: lead.assignedTo || null,
      lastContactDate: lead.lastContactDate || null,
      nextFollowUpDate: lead.nextFollowUpDate || null,
      communicationPreference: lead.communicationPreference || "phone",
      expectedCloseDate: lead.expectedCloseDate || null,
      dealValue: lead.dealValue || null,
      status: lead.status || "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.leads.set(id, fullLead);
    return fullLead;
  }

  async getLead(leadId: string): Promise<Lead | undefined> {
    return Array.from(this.leads.values()).find(l => l.leadId === leadId);
  }

  async getLeadWithDetails(leadId: string): Promise<LeadWithDetails | undefined> {
    const lead = await this.getLead(leadId);
    if (!lead) return undefined;

    const activities = this.leadActivities.get(lead.id) || [];
    const notes = this.leadNotes.get(lead.id) || [];
    const propertyDetails = lead.propertyId ? await this.getProperty(lead.propertyId) : undefined;

    return {
      ...lead,
      activities,
      notes,
      propertyDetails,
    };
  }

  async getAllLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values());
  }

  async updateLead(leadId: string, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const lead = await this.getLead(leadId);
    if (!lead) return undefined;

    const updated: Lead = {
      ...lead,
      ...updates,
      updatedAt: new Date(),
    };
    this.leads.set(lead.id, updated);
    return updated;
  }

  // Lead activities
  async addLeadActivity(activity: InsertLeadActivity): Promise<LeadActivity> {
    const id = randomUUID();
    const fullActivity: LeadActivity = {
      ...activity,
      id,
      description: activity.description || null,
      outcome: activity.outcome || null,
      nextAction: activity.nextAction || null,
      scheduledAt: activity.scheduledAt || null,
      completedAt: activity.completedAt || null,
      createdAt: new Date(),
    };

    const existing = this.leadActivities.get(activity.leadId) || [];
    existing.push(fullActivity);
    this.leadActivities.set(activity.leadId, existing);
    return fullActivity;
  }

  async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    return this.leadActivities.get(leadId) || [];
  }

  // Lead notes
  async addLeadNote(note: InsertLeadNote): Promise<LeadNote> {
    const id = randomUUID();
    const fullNote: LeadNote = {
      ...note,
      id,
      noteType: note.noteType || "general",
      isPrivate: note.isPrivate || false,
      createdAt: new Date(),
    };

    const existing = this.leadNotes.get(note.leadId) || [];
    existing.push(fullNote);
    this.leadNotes.set(note.leadId, existing);
    return fullNote;
  }

  async getLeadNotes(leadId: string): Promise<LeadNote[]> {
    return this.leadNotes.get(leadId) || [];
  }

  // Lead statistics and filtering
  async getLeadStats(): Promise<LeadStats> {
    const leads = Array.from(this.leads.values());
    
    const totalLeads = leads.length;
    const newLeads = leads.filter(l => l.status === "new").length;
    const qualifiedLeads = leads.filter(l => l.status === "qualified").length;
    const hotLeads = leads.filter(l => l.leadType === "hot").length;
    
    const closedWon = leads.filter(l => l.status === "closed-won").length;
    const conversionRate = totalLeads > 0 ? Math.round((closedWon / totalLeads) * 100) : 0;
    
    const avgLeadScore = leads.length > 0 
      ? Math.round(leads.reduce((sum, l) => sum + (l.leadScore || 0), 0) / leads.length)
      : 0;

    const leadsBySource = leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const leadsByStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLeads,
      newLeads,
      qualifiedLeads,
      hotLeads,
      conversionRate,
      avgLeadScore,
      leadsBySource,
      leadsByStatus,
    };
  }

  async filterLeads(filters: {
    status?: string;
    leadType?: string;
    priority?: string;
    assignedTo?: string;
    source?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(lead => {
      if (filters.status && lead.status !== filters.status) return false;
      if (filters.leadType && lead.leadType !== filters.leadType) return false;
      if (filters.priority && lead.priority !== filters.priority) return false;
      if (filters.assignedTo && lead.assignedTo !== filters.assignedTo) return false;
      if (filters.source && lead.source !== filters.source) return false;
      
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom);
        if (lead.createdAt < dateFrom) return false;
      }
      
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        if (lead.createdAt > dateTo) return false;
      }
      
      return true;
    });
  }

  // Lead scoring and qualification
  async updateLeadScore(leadId: string, score: number, notes?: string): Promise<Lead | undefined> {
    const lead = await this.getLead(leadId);
    if (!lead) return undefined;

    const updated = await this.updateLead(leadId, { 
      leadScore: score,
      qualificationNotes: notes || lead.qualificationNotes 
    });
    
    if (notes) {
      await this.addLeadNote({
        leadId: lead.id,
        content: `Lead score updated to ${score}. ${notes}`,
        noteType: "qualification",
        createdBy: "system",
      });
    }
    
    return updated;
  }

  async qualifyLead(leadId: string, qualified: boolean, notes: string): Promise<Lead | undefined> {
    const lead = await this.getLead(leadId);
    if (!lead) return undefined;

    const newStatus = qualified ? "qualified" : "new";
    const newLeadType = qualified ? "hot" : "cold";
    
    const updated = await this.updateLead(leadId, { 
      status: newStatus,
      leadType: newLeadType,
      qualificationNotes: notes
    });
    
    await this.addLeadNote({
      leadId: lead.id,
      content: `Lead ${qualified ? 'qualified' : 'disqualified'}: ${notes}`,
      noteType: "qualification",
      createdBy: "system",
    });
    
    return updated;
  }

  // Enhanced lead filtering
  async getEnhancedLeads(filters: {
    persona?: string;
    urgency?: string;
    budget?: string;
    status?: string;
    smartTags?: string[];
    assignedTo?: string;
    dateRange?: string;
  }): Promise<LeadWithDetails[]> {
    let filteredLeads = Array.from(this.leads.values());

    // Apply filters
    if (filters.persona && filters.persona !== "all") {
      filteredLeads = filteredLeads.filter(lead => lead.buyerPersona === filters.persona);
    }
    
    if (filters.urgency && filters.urgency !== "all") {
      filteredLeads = filteredLeads.filter(lead => lead.urgency === filters.urgency);
    }
    
    if (filters.status && filters.status !== "all") {
      filteredLeads = filteredLeads.filter(lead => lead.status === filters.status);
    }
    
    if (filters.smartTags && filters.smartTags.length > 0) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.smartTags && filters.smartTags!.some(tag => lead.smartTags!.includes(tag))
      );
    }
    
    if (filters.assignedTo && filters.assignedTo !== "all") {
      filteredLeads = filteredLeads.filter(lead => lead.assignedTo === filters.assignedTo);
    }

    // Convert to LeadWithDetails
    const leadsWithDetails: LeadWithDetails[] = await Promise.all(
      filteredLeads.map(async (lead) => ({
        ...lead,
        activities: await this.getLeadActivities(lead.id),
        notes: await this.getLeadNotes(lead.id),
      }))
    );

    return leadsWithDetails;
  }

  // Enhanced lead operations
  async addLeadTimeline(timeline: InsertLeadTimeline): Promise<LeadTimeline> {
    const id = randomUUID();
    const fullTimeline: LeadTimeline = {
      ...timeline,
      id,
      isCompleted: timeline.isCompleted || false,
      createdAt: new Date(),
    };
    return fullTimeline;
  }

  async getLeadTimeline(leadId: string): Promise<LeadTimeline[]> {
    return [];
  }

  async addLeadDocument(document: InsertLeadDocument): Promise<LeadDocument> {
    const id = randomUUID();
    const fullDocument: LeadDocument = {
      ...document,
      id,
      isPublic: document.isPublic || false,
      uploadedAt: new Date(),
    };
    return fullDocument;
  }

  async getLeadDocuments(leadId: string): Promise<LeadDocument[]> {
    return [];
  }

  // User operations (from original template)
  async getUser(id: string): Promise<any> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Property Scoring operations (MemStorage placeholder implementations)
  async createPropertyScore(score: InsertPropertyScore): Promise<PropertyScore> {
    throw new Error("Property scoring not implemented in MemStorage");
  }

  async getPropertyScore(propertyId: string): Promise<PropertyScore | undefined> {
    return undefined;
  }

  async updatePropertyScore(id: string, score: Partial<InsertPropertyScore>): Promise<PropertyScore | undefined> {
    return undefined;
  }

  async deletePropertyScore(id: string): Promise<boolean> {
    return false;
  }

  async getAllPropertyScores(): Promise<PropertyScore[]> {
    return [];
  }

  // App Settings operations
  private initializeDefaultAppSettings() {
    this.appSettings = {
      id: randomUUID(),
      businessName: "OwnItRight – Curated Property Advisors",
      logoUrl: null,
      faviconUrl: null,
      contactEmail: "contact@ownitright.com",
      phoneNumber: "+91 98765 43210",
      whatsappNumber: "+91 98765 43210",
      officeAddress: "Bengaluru, Karnataka, India",
      defaultCurrency: "INR",
      currencySymbol: "₹",
      timezone: "Asia/Kolkata",
      dateFormat: "DD/MM/YYYY",
      maintenanceMode: false,
      maintenanceMessage: "We are currently performing maintenance. Please check back later.",
      primaryColor: "#2563eb",
      secondaryColor: "#64748b",
      metaTitle: "OwnItRight - Property Discovery Platform",
      metaDescription: "Discover your perfect property in Bengaluru with our advanced property discovery platform",
      enableBookings: true,
      enableConsultations: true,
      enableReports: true,
      enableBlog: true,
      lastUpdatedBy: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getAppSettings(): Promise<AppSettings | undefined> {
    return this.appSettings || undefined;
  }

  async updateAppSettings(settingsData: Partial<InsertAppSettings>): Promise<AppSettings> {
    if (!this.appSettings) {
      this.initializeDefaultAppSettings();
    }

    this.appSettings = {
      ...this.appSettings!,
      ...settingsData,
      updatedAt: new Date(),
    };

    return this.appSettings;
  }

  async initializeAppSettings(): Promise<AppSettings> {
    this.initializeDefaultAppSettings();
    return this.appSettings!;
  }

  // Valuation report implementations for MemStorage

  async enableValuationReport(propertyId: string): Promise<Property | undefined> {
    return undefined;
  }

  async getAllValuationReports(): Promise<PropertyValuationReport[]> {
    throw new Error("Valuation reports not implemented in MemStorage");
  }

  async deleteValuationReport(reportId: string): Promise<boolean> {
    throw new Error("Valuation reports not implemented in MemStorage");
  }

  async getValuationReportsByProperty(propertyId: string): Promise<PropertyValuationReport[]> {
    throw new Error("Valuation reports not implemented in MemStorage");
  }

  async getValuationReportsByCustomer(customerId: string): Promise<PropertyValuationReport[]> {
    throw new Error("Valuation reports not implemented in MemStorage");
  }

  async assignReportToCustomer(reportId: string, customerId: string): Promise<PropertyValuationReport | undefined> {
    throw new Error("Valuation reports not implemented in MemStorage");
  }

  async updateReportStatus(reportId: string, status: "draft" | "in_progress" | "completed" | "delivered"): Promise<PropertyValuationReport | undefined> {
    throw new Error("Valuation reports not implemented in MemStorage");
  }

  async getValuationReport(propertyId: string): Promise<PropertyValuationReport | undefined> {
    return undefined;
  }

  async createValuationReport(report: InsertPropertyValuationReport): Promise<PropertyValuationReport> {
    throw new Error("Valuation reports not implemented in MemStorage");
  }

  async updateValuationReport(reportId: string, updates: Partial<InsertPropertyValuationReport>): Promise<PropertyValuationReport | undefined> {
    return undefined;
  }

  async getPropertiesWithValuationReports(statusFilter?: string): Promise<Array<Property & { valuationReport?: PropertyValuationReport; reportStats?: any }>> {
    return [];
  }

  async createReportPayment(payment: InsertReportPayment): Promise<ReportPayment> {
    throw new Error("Report payments not implemented in MemStorage");
  }

  async getReportPayments(reportId: string, reportType?: string): Promise<ReportPayment[]> {
    return [];
  }

  async getAllReportPayments(): Promise<ReportPayment[]> {
    return [];
  }

  async updatePaymentStatus(paymentId: string, status: string): Promise<ReportPayment | undefined> {
    return undefined;
  }

  async getAllOrdersWithDetails(): Promise<any[]> {
    throw new Error("Orders not implemented in MemStorage");
  }

  async getOrderStats(): Promise<any> {
    throw new Error("Orders not implemented in MemStorage");
  }

  // Team Management operations
  async getAllTeamMembers(): Promise<any[]> {
    throw new Error("Team management not implemented in MemStorage");
  }

  async getTeamMember(id: string): Promise<any> {
    throw new Error("Team management not implemented in MemStorage");
  }

  async createTeamMember(member: any): Promise<any> {
    throw new Error("Team management not implemented in MemStorage");
  }

  async updateTeamMember(id: string, updates: any): Promise<any> {
    throw new Error("Team management not implemented in MemStorage");
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    throw new Error("Team management not implemented in MemStorage");
  }

  async getTeamMembersByDepartment(department: string): Promise<any[]> {
    throw new Error("Team management not implemented in MemStorage");
  }

  async getActiveTeamMembers(): Promise<any[]> {
    throw new Error("Team management not implemented in MemStorage");
  }

  async getValuationReportStats(): Promise<any> {
    return {};
  }

  // RERA Data operations - MemStorage stub implementations
  async createReraData(reraInfo: InsertReraData): Promise<ReraData> {
    throw new Error("RERA data not implemented in MemStorage");
  }

  async getReraData(reraId: string): Promise<ReraData | undefined> {
    return undefined;
  }

  async getReraDataByProperty(propertyId: string): Promise<ReraData | undefined> {
    return undefined;
  }

  async getAllReraData(): Promise<ReraData[]> {
    return [];
  }

  async updateReraData(reraId: string, updates: Partial<InsertReraData>): Promise<ReraData | undefined> {
    return undefined;
  }

  async deleteReraData(reraId: string): Promise<boolean> {
    return false;
  }

  // Civil+MEP Report operations - MemStorage stub implementations  
  async createCivilMepReport(report: InsertCivilMepReport): Promise<CivilMepReport> {
    throw new Error("Civil+MEP reports not implemented in MemStorage");
  }

  async getCivilMepReport(reportId: string): Promise<CivilMepReport | undefined> {
    return undefined;
  }

  async getCivilMepReportByProperty(propertyId: string): Promise<CivilMepReport | undefined> {
    return undefined;
  }

  async getAllCivilMepReports(): Promise<CivilMepReport[]> {
    return [];
  }

  async updateCivilMepReport(reportId: string, updates: Partial<InsertCivilMepReport>): Promise<CivilMepReport | undefined> {
    return undefined;
  }

  async deleteCivilMepReport(reportId: string): Promise<boolean> {
    return false;
  }

  async getCivilMepReportStats(): Promise<any> {
    return {
      totalReports: 0,
      completedReports: 0,
      inProgressReports: 0,
      draftReports: 0,
      approvedReports: 0,
      avgScore: 0,
      byRecommendation: {
        "highly-recommended": 0,
        "recommended": 0,
        "conditional": 0,
        "not-recommended": 0,
      }
    };
  }
}

export class DatabaseStorage implements IStorage {
  
  // Enhanced lead filtering
  async getEnhancedLeads(filters: {
    persona?: string;
    urgency?: string;
    budget?: string;
    status?: string;
    smartTags?: string[];
    assignedTo?: string;
    dateRange?: string;
  }): Promise<LeadWithDetails[]> {
    let query = db.select().from(leads);

    // Build where conditions based on filters
    const conditions = [];
    
    if (filters.persona && filters.persona !== "all") {
      conditions.push(eq(leads.buyerPersona, filters.persona));
    }
    
    if (filters.urgency && filters.urgency !== "all") {
      conditions.push(eq(leads.urgency, filters.urgency));
    }
    
    if (filters.status && filters.status !== "all") {
      conditions.push(eq(leads.status, filters.status));
    }
    
    if (filters.assignedTo && filters.assignedTo !== "all") {
      conditions.push(eq(leads.assignedTo, filters.assignedTo));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const leadResults = await query.orderBy(desc(leads.createdAt));

    // Convert to LeadWithDetails
    const leadsWithDetails: LeadWithDetails[] = await Promise.all(
      leadResults.map(async (lead) => ({
        ...lead,
        activities: await this.getLeadActivities(lead.id),
        notes: await this.getLeadNotes(lead.id),
      }))
    );

    return leadsWithDetails;
  }

  // Enhanced lead operations
  async addLeadTimeline(timeline: InsertLeadTimeline): Promise<LeadTimeline> {
    const [result] = await db.insert(leadTimeline).values(timeline).returning();
    return result;
  }

  async getLeadTimeline(leadId: string): Promise<LeadTimeline[]> {
    return await db.select().from(leadTimeline).where(eq(leadTimeline.leadId, leadId));
  }

  async addLeadDocument(document: InsertLeadDocument): Promise<LeadDocument> {
    const [result] = await db.insert(leadDocuments).values(document).returning();
    return result;
  }

  async getLeadDocuments(leadId: string): Promise<LeadDocument[]> {
    return await db.select().from(leadDocuments).where(eq(leadDocuments.leadId, leadId));
  }
  // Property CRUD operations
  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async getAllProperties(): Promise<Property[]> {
    return await db.select().from(properties).orderBy(desc(properties.createdAt));
  }

  async getPropertyWithConfigurations(id: string): Promise<PropertyWithConfigurations | undefined> {
    const property = await this.getProperty(id);
    if (!property) return undefined;
    
    const configs = await db.select().from(propertyConfigurations)
      .where(eq(propertyConfigurations.propertyId, id));
    
    return {
      ...property,
      configurations: configs
    };
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const [property] = await db.insert(properties)
      .values(insertProperty)
      .returning();
    return property;
  }

  async updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const [property] = await db.update(properties)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return property || undefined;
  }

  async deleteProperty(id: string): Promise<boolean> {
    // Delete associated configurations first
    await db.delete(propertyConfigurations).where(eq(propertyConfigurations.propertyId, id));
    // Delete associated property scores
    await db.delete(propertyScores).where(eq(propertyScores.propertyId, id));
    
    const result = await db.delete(properties).where(eq(properties.id, id));
    return result.rowCount > 0;
  }

  // Property Scoring operations
  async createPropertyScore(insertScore: InsertPropertyScore): Promise<PropertyScore> {
    // Calculate totals
    const locationTotal = (insertScore.transportConnectivity || 0) + 
                         (insertScore.infrastructureDevelopment || 0) + 
                         (insertScore.socialInfrastructure || 0) + 
                         (insertScore.employmentHubs || 0);
    
    const amenitiesTotal = (insertScore.basicAmenities || 0) + 
                          (insertScore.lifestyleAmenities || 0) + 
                          (insertScore.modernFeatures || 0);
    
    const legalTotal = (insertScore.reraCompliance || 0) + 
                      (insertScore.titleClarity || 0) + 
                      (insertScore.approvals || 0);
    
    const valueTotal = (insertScore.priceCompetitiveness || 0) + 
                      (insertScore.appreciationPotential || 0) + 
                      (insertScore.rentalYield || 0);
    
    const developerTotal = (insertScore.trackRecord || 0) + 
                          (insertScore.financialStability || 0) + 
                          (insertScore.customerSatisfaction || 0);
    
    const constructionTotal = (insertScore.structuralQuality || 0) + 
                             (insertScore.finishingStandards || 0) + 
                             (insertScore.maintenanceStandards || 0);
                             
    const overallTotal = locationTotal + amenitiesTotal + legalTotal + valueTotal + developerTotal + constructionTotal;
    
    // Calculate grade based on overall score
    let grade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" = "D";
    if (overallTotal >= 90) grade = "A+";
    else if (overallTotal >= 80) grade = "A";
    else if (overallTotal >= 70) grade = "B+";
    else if (overallTotal >= 60) grade = "B";
    else if (overallTotal >= 50) grade = "C+";
    else if (overallTotal >= 40) grade = "C";
    
    const scoreWithTotals = {
      ...insertScore,
      locationScoreTotal: locationTotal,
      amenitiesScoreTotal: amenitiesTotal,
      legalScoreTotal: legalTotal,
      valueScoreTotal: valueTotal,
      developerScoreTotal: developerTotal,
      constructionScoreTotal: constructionTotal,
      overallScoreTotal: overallTotal,
      overallGrade: grade
    };

    const [score] = await db.insert(propertyScores)
      .values(scoreWithTotals)
      .returning();
      
    // Update property with the score reference and legacy scores
    await db.update(properties)
      .set({
        propertyScoreId: score.id,
        locationScore: Math.round(locationTotal / 5), // Convert to 1-5 scale for legacy compatibility
        amenitiesScore: Math.round(amenitiesTotal / 4), // Convert to 1-5 scale
        valueScore: Math.round(valueTotal / 3), // Convert to 1-5 scale
        overallScore: (overallTotal / 20).toFixed(1) // Convert to 1-5 scale
      })
      .where(eq(properties.id, insertScore.propertyId));
      
    return score;
  }

  async getPropertyScore(propertyId: string): Promise<PropertyScore | undefined> {
    const [score] = await db.select().from(propertyScores)
      .where(eq(propertyScores.propertyId, propertyId));
    return score || undefined;
  }

  async updatePropertyScore(id: string, updates: Partial<InsertPropertyScore>): Promise<PropertyScore | undefined> {
    // Get current score to calculate new totals
    const [currentScore] = await db.select().from(propertyScores).where(eq(propertyScores.id, id));
    if (!currentScore) return undefined;
    
    const mergedScore = { ...currentScore, ...updates };
    
    // Recalculate totals
    const locationTotal = (mergedScore.transportConnectivity || 0) + 
                         (mergedScore.infrastructureDevelopment || 0) + 
                         (mergedScore.socialInfrastructure || 0) + 
                         (mergedScore.employmentHubs || 0);
    
    const amenitiesTotal = (mergedScore.basicAmenities || 0) + 
                          (mergedScore.lifestyleAmenities || 0) + 
                          (mergedScore.modernFeatures || 0);
    
    const legalTotal = (mergedScore.reraCompliance || 0) + 
                      (mergedScore.titleClarity || 0) + 
                      (mergedScore.approvals || 0);
    
    const valueTotal = (mergedScore.priceCompetitiveness || 0) + 
                      (mergedScore.appreciationPotential || 0) + 
                      (mergedScore.rentalYield || 0);
    
    const developerTotal = (mergedScore.trackRecord || 0) + 
                          (mergedScore.financialStability || 0) + 
                          (mergedScore.customerSatisfaction || 0);
    
    const constructionTotal = (mergedScore.structuralQuality || 0) + 
                             (mergedScore.finishingStandards || 0) + 
                             (mergedScore.maintenanceStandards || 0);
                             
    const overallTotal = locationTotal + amenitiesTotal + legalTotal + valueTotal + developerTotal + constructionTotal;
    
    // Calculate grade
    let grade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" = "D";
    if (overallTotal >= 90) grade = "A+";
    else if (overallTotal >= 80) grade = "A";
    else if (overallTotal >= 70) grade = "B+";
    else if (overallTotal >= 60) grade = "B";
    else if (overallTotal >= 50) grade = "C+";
    else if (overallTotal >= 40) grade = "C";
    
    const updatesWithTotals = {
      ...updates,
      locationScoreTotal: locationTotal,
      amenitiesScoreTotal: amenitiesTotal,
      legalScoreTotal: legalTotal,
      valueScoreTotal: valueTotal,
      developerScoreTotal: developerTotal,
      constructionScoreTotal: constructionTotal,
      overallScoreTotal: overallTotal,
      overallGrade: grade,
      lastUpdated: new Date()
    };

    const [updatedScore] = await db.update(propertyScores)
      .set(updatesWithTotals)
      .where(eq(propertyScores.id, id))
      .returning();
      
    // Update legacy scores in properties table
    if (updatedScore) {
      await db.update(properties)
        .set({
          locationScore: Math.round(locationTotal / 5),
          amenitiesScore: Math.round(amenitiesTotal / 4),
          valueScore: Math.round(valueTotal / 3),
          overallScore: (overallTotal / 20).toFixed(1)
        })
        .where(eq(properties.id, updatedScore.propertyId));
    }
      
    return updatedScore || undefined;
  }

  async deletePropertyScore(id: string): Promise<boolean> {
    // Get the property ID first to update the property
    const [score] = await db.select().from(propertyScores).where(eq(propertyScores.id, id));
    if (score) {
      // Reset property score reference and legacy scores
      await db.update(properties)
        .set({
          propertyScoreId: null,
          locationScore: 0,
          amenitiesScore: 0,
          valueScore: 0,
          overallScore: "0.0"
        })
        .where(eq(properties.id, score.propertyId));
    }
    
    const result = await db.delete(propertyScores).where(eq(propertyScores.id, id));
    return result.rowCount > 0;
  }

  async getAllPropertyScores(): Promise<PropertyScore[]> {
    return await db.select().from(propertyScores).orderBy(desc(propertyScores.overallScoreTotal));
  }

  // Property Configuration CRUD operations
  async getPropertyConfigurations(propertyId: string): Promise<PropertyConfiguration[]> {
    return await db.select().from(propertyConfigurations)
      .where(eq(propertyConfigurations.propertyId, propertyId));
  }

  async createPropertyConfiguration(config: InsertPropertyConfiguration): Promise<PropertyConfiguration> {
    const [configuration] = await db.insert(propertyConfigurations)
      .values(config)
      .returning();
    return configuration;
  }

  async updatePropertyConfiguration(id: string, updates: Partial<InsertPropertyConfiguration>): Promise<PropertyConfiguration | undefined> {
    const [configuration] = await db.update(propertyConfigurations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(propertyConfigurations.id, id))
      .returning();
    return configuration || undefined;
  }

  async deletePropertyConfiguration(id: string): Promise<boolean> {
    const result = await db.delete(propertyConfigurations).where(eq(propertyConfigurations.id, id));
    return result.rowCount > 0;
  }

  // Search and filter operations
  async searchProperties(query: string): Promise<Property[]> {
    return await db.select().from(properties)
      .where(
        sql`${properties.name} ILIKE ${`%${query}%`} OR 
            ${properties.developer} ILIKE ${`%${query}%`} OR 
            ${properties.area} ILIKE ${`%${query}%`} OR 
            ${properties.address} ILIKE ${`%${query}%`}`
      )
      .orderBy(desc(properties.createdAt));
  }

  async filterProperties(filters: {
    type?: string;
    status?: string;
    zone?: string;
    reraApproved?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Property[]> {
    let query = db.select().from(properties);
    const conditions = [];

    if (filters.type) conditions.push(eq(properties.type, filters.type));
    if (filters.status) conditions.push(eq(properties.status, filters.status));
    if (filters.zone) conditions.push(eq(properties.zone, filters.zone));
    if (filters.reraApproved !== undefined) conditions.push(eq(properties.reraApproved, filters.reraApproved));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(properties.createdAt));
  }

  // Statistics
  async getPropertyStats(): Promise<PropertyStats> {
    const allProperties = await this.getAllProperties();
    const totalProperties = allProperties.length;
    const activeProjects = allProperties.filter(p => p.status === 'active').length;
    const completedProjects = allProperties.filter(p => p.status === 'completed').length;
    const reraApprovedCount = allProperties.filter(p => p.reraApproved).length;

    return {
      totalProperties,
      activeProjects,
      completedProjects,
      reraApprovedCount
    };
  }

  // Booking operations
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings)
      .values(insertBooking)
      .returning();
    return booking;
  }

  async getBooking(bookingId: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
    return booking || undefined;
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<Booking | undefined> {
    const [booking] = await db.update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, bookingId))
      .returning();
    return booking || undefined;
  }

  // Lead management operations
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads)
      .values(insertLead)
      .returning();
    return lead;
  }

  async getLead(leadId: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
    return lead || undefined;
  }

  async getLeadWithDetails(leadId: string): Promise<LeadWithDetails | undefined> {
    const lead = await this.getLead(leadId);
    if (!lead) return undefined;

    const activities = await this.getLeadActivities(leadId);
    const notes = await this.getLeadNotes(leadId);

    return {
      ...lead,
      activities,
      notes
    };
  }

  async getAllLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async updateLead(leadId: string, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const [lead] = await db.update(leads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leads.id, leadId))
      .returning();
    return lead || undefined;
  }

  // Lead activities
  async addLeadActivity(insertActivity: InsertLeadActivity): Promise<LeadActivity> {
    const activityData = {
      ...insertActivity,
      attendees: insertActivity.attendees || [],
      attachments: insertActivity.attachments || [],
      duration: insertActivity.duration || null,
      scheduledAt: insertActivity.scheduledAt || null,
      completedAt: insertActivity.completedAt || null,
      nextAction: insertActivity.nextAction || null
    };
    
    const [activity] = await db.insert(leadActivities)
      .values(activityData)
      .returning();
    return activity;
  }

  async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    return await db.select().from(leadActivities)
      .where(eq(leadActivities.leadId, leadId))
      .orderBy(desc(leadActivities.createdAt));
  }

  // Lead notes
  async addLeadNote(insertNote: InsertLeadNote): Promise<LeadNote> {
    const [note] = await db.insert(leadNotes)
      .values(insertNote)
      .returning();
    return note;
  }

  async getLeadNotes(leadId: string): Promise<LeadNote[]> {
    return await db.select().from(leadNotes)
      .where(eq(leadNotes.leadId, leadId))
      .orderBy(desc(leadNotes.createdAt));
  }

  // Lead statistics and filtering
  async getLeadStats(): Promise<LeadStats> {
    const allLeads = await this.getAllLeads();
    const totalLeads = allLeads.length;
    const qualifiedLeads = allLeads.filter(l => l.qualified).length;
    const hotLeads = allLeads.filter(l => l.priority === 'high').length;
    const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

    return {
      totalLeads,
      qualifiedLeads,
      hotLeads,
      conversionRate
    };
  }

  async filterLeads(filters: {
    status?: string;
    leadType?: string;
    priority?: string;
    assignedTo?: string;
    source?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Lead[]> {
    let query = db.select().from(leads);
    const conditions = [];

    if (filters.status) conditions.push(eq(leads.status, filters.status));
    if (filters.leadType) conditions.push(eq(leads.leadType, filters.leadType));
    if (filters.priority) conditions.push(eq(leads.priority, filters.priority));
    if (filters.assignedTo) conditions.push(eq(leads.assignedTo, filters.assignedTo));
    if (filters.source) conditions.push(eq(leads.source, filters.source));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(leads.createdAt));
  }

  // Lead scoring and qualification
  async updateLeadScore(leadId: string, score: number, notes?: string): Promise<Lead | undefined> {
    const updates: Partial<InsertLead> = { score, updatedAt: new Date() };
    if (notes) updates.notes = notes;

    const [lead] = await db.update(leads)
      .set(updates)
      .where(eq(leads.id, leadId))
      .returning();
    return lead || undefined;
  }

  async qualifyLead(leadId: string, qualified: boolean, notes: string): Promise<Lead | undefined> {
    const [lead] = await db.update(leads)
      .set({ qualified, notes, updatedAt: new Date() })
      .where(eq(leads.id, leadId))
      .returning();
    return lead || undefined;
  }

  // User operations (basic stub implementation - no users table in current schema)
  async getUser(id: string): Promise<any> {
    return undefined;
  }

  async getUserByUsername(username: string): Promise<any> {
    return undefined;
  }

  async createUser(insertUser: any): Promise<any> {
    const id = randomUUID();
    return { ...insertUser, id };
  }



  async createReportPayment(payment: InsertReportPayment): Promise<ReportPayment> {
    const [newPayment] = await db.insert(reportPayments)
      .values(payment)
      .returning();
    return newPayment;
  }



  async getReportPayment(paymentId: string): Promise<ReportPayment | undefined> {
    const [payment] = await db.select().from(reportPayments)
      .where(eq(reportPayments.id, paymentId));
    return payment || undefined;
  }

  async getReportPayments(reportId: string, reportType?: string): Promise<ReportPayment[]> {
    let query = db.select().from(reportPayments);
    
    if (reportId && reportType) {
      query = query.where(and(eq(reportPayments.reportId, reportId), eq(reportPayments.reportType, reportType)));
    } else if (reportId) {
      query = query.where(eq(reportPayments.reportId, reportId));
    } else if (reportType) {
      query = query.where(eq(reportPayments.reportType, reportType));
    }
    
    return await query;
  }

  async getReportPaymentsByProperty(propertyId: string): Promise<ReportPayment[]> {
    return await db.select().from(reportPayments)
      .where(eq(reportPayments.propertyId, propertyId))
      .orderBy(desc(reportPayments.createdAt));
  }

  async updateReportPaymentStatus(paymentId: string, status: string): Promise<ReportPayment | undefined> {
    const [payment] = await db.update(reportPayments)
      .set({ paymentStatus: status as any, updatedAt: new Date() })
      .where(eq(reportPayments.id, paymentId))
      .returning();
    return payment || undefined;
  }

  async getAllReportPayments(): Promise<ReportPayment[]> {
    return await db.select().from(reportPayments);
  }

  async updatePaymentStatus(paymentId: string, status: string): Promise<ReportPayment | undefined> {
    const [payment] = await db.update(reportPayments)
      .set({ paymentStatus: status as any, updatedAt: new Date() })
      .where(eq(reportPayments.id, paymentId))
      .returning();
    return payment || undefined;
  }



  // Property Valuation Report operations
  async createValuationReport(report: InsertPropertyValuationReport): Promise<PropertyValuationReport> {
    const [newReport] = await db.insert(propertyValuationReports)
      .values(report)
      .returning();
    return newReport;
  }

  async getValuationReport(reportId: string): Promise<PropertyValuationReport | undefined> {
    const [report] = await db.select().from(propertyValuationReports)
      .where(eq(propertyValuationReports.id, reportId));
    return report || undefined;
  }

  async getAllValuationReports(): Promise<PropertyValuationReport[]> {
    return await db.select().from(propertyValuationReports)
      .orderBy(desc(propertyValuationReports.createdAt));
  }

  async updateValuationReport(reportId: string, updates: Partial<InsertPropertyValuationReport>): Promise<PropertyValuationReport | undefined> {
    const [report] = await db.update(propertyValuationReports)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(propertyValuationReports.id, reportId))
      .returning();
    return report || undefined;
  }

  async deleteValuationReport(reportId: string): Promise<boolean> {
    const result = await db.delete(propertyValuationReports)
      .where(eq(propertyValuationReports.id, reportId));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getValuationReportsByProperty(propertyId: string): Promise<PropertyValuationReport[]> {
    return await db.select().from(propertyValuationReports)
      .where(eq(propertyValuationReports.propertyId, propertyId))
      .orderBy(desc(propertyValuationReports.createdAt));
  }

  async getValuationReportsByCustomer(customerId: string): Promise<PropertyValuationReport[]> {
    return await db.select().from(propertyValuationReports)
      .where(eq(propertyValuationReports.customerId, customerId))
      .orderBy(desc(propertyValuationReports.createdAt));
  }

  async assignReportToCustomer(reportId: string, customerId: string): Promise<PropertyValuationReport | undefined> {
    const [report] = await db.update(propertyValuationReports)
      .set({ customerId, assignedTo: customerId, updatedAt: new Date() })
      .where(eq(propertyValuationReports.id, reportId))
      .returning();
    return report || undefined;
  }

  async updateReportStatus(reportId: string, status: "draft" | "in_progress" | "completed" | "delivered"): Promise<PropertyValuationReport | undefined> {
    const updates: any = { reportStatus: status, updatedAt: new Date() };
    if (status === "delivered") {
      updates.deliveredAt = new Date();
    }

    const [report] = await db.update(propertyValuationReports)
      .set(updates)
      .where(eq(propertyValuationReports.id, reportId))
      .returning();
    return report || undefined;
  }

  async getValuationReportStats(): Promise<any> {
    const allReports = await this.getAllValuationReports();
    const totalReports = allReports.length;
    const completedReports = allReports.filter(r => r.reportStatus === 'completed').length;
    const deliveredReports = allReports.filter(r => r.reportStatus === 'delivered').length;
    const inProgressReports = allReports.filter(r => r.reportStatus === 'in_progress').length;
    const draftReports = allReports.filter(r => r.reportStatus === 'draft').length;

    // Calculate average estimated value
    const reportsWithValue = allReports.filter(r => r.estimatedMarketValue);
    const averageValue = reportsWithValue.length > 0 
      ? reportsWithValue.reduce((sum, r) => sum + Number(r.estimatedMarketValue || 0), 0) / reportsWithValue.length
      : 0;

    return {
      totalReports,
      completedReports,
      deliveredReports,
      inProgressReports,
      draftReports,
      averageEstimatedValue: Math.round(averageValue),
      completionRate: totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0,
      deliveryRate: totalReports > 0 ? Math.round((deliveredReports / totalReports) * 100) : 0
    };
  }



  // Orders management methods
  async getAllOrdersWithDetails(): Promise<any[]> {
    const payments = await db.select().from(reportPayments);
    const result = [];
    
    for (const payment of payments) {
      const [property] = await db.select().from(properties)
        .where(eq(properties.id, payment.propertyId));
      
      let reportTitle = "Report";
      let reportType = "unknown";
      
      // Check if it's a CIVIL+MEP report
      const [civilMepReport] = await db.select().from(civilMepReports)
        .where(eq(civilMepReports.id, payment.reportId));
      
      if (civilMepReport) {
        reportTitle = civilMepReport.reportTitle || "CIVIL+MEP Report";
        reportType = "civil-mep";
      } else {
        // Check if it's a Valuation report
        const [valuationReport] = await db.select().from(propertyValuationReports)
          .where(eq(propertyValuationReports.id, payment.reportId));
        
        if (valuationReport) {
          reportTitle = "Property Valuation Report";
          reportType = "valuation";
        }
      }
      
      result.push({
        ...payment,
        reportType,
        propertyName: property?.name || "Unknown Property",
        reportTitle
      });
    }
    
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOrderStats(): Promise<any> {
    const allPayments = await db.select().from(reportPayments);
    const now = new Date();
    
    const overduePayments = allPayments.filter(p => 
      p.paymentStatus === 'pay-later-pending' && 
      p.payLaterDueDate && 
      new Date(p.payLaterDueDate) < now
    );
    
    return {
      totalOrders: allPayments.length,
      pendingPayments: allPayments.filter(p => p.paymentStatus === 'pay-later-pending').length,
      completedPayments: allPayments.filter(p => p.paymentStatus === 'completed').length,
      totalRevenue: allPayments.filter(p => p.paymentStatus === 'completed').reduce((sum, p) => sum + Number(p.amount), 0),
      overduePayments: overduePayments.length
    };
  }

  // Customer CRM methods
  async getAllCustomersWithDetails(): Promise<any[]> {
    // Get unique customers from leads, bookings, and orders
    const allLeads = await db.select().from(this.leads);
    const allBookings = await db.select().from(this.bookings);  
    const payments = await db.select().from(reportPayments);
    
    const customerMap = new Map();
    
    // Process leads
    for (const lead of allLeads) {
      const key = lead.email || lead.phone;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          name: lead.customerName,
          email: lead.email,
          phone: lead.phone,
          status: lead.leadType || "cold",
          leadScore: lead.leadScore || 0,
          source: lead.source,
          lastActivity: lead.updatedAt || lead.createdAt,
          leads: [],
          bookings: [],
          orders: [],
          notes: [],
          totalOrders: 0,
          totalSpent: 0
        });
      }
      customerMap.get(key).leads.push(lead);
    }
    
    // Process bookings
    for (const booking of allBookings) {
      const key = booking.email || booking.phone;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          status: "warm",
          leadScore: 40,
          source: "booking",
          lastActivity: booking.updatedAt || booking.createdAt,
          leads: [],
          bookings: [],
          orders: [],
          notes: [],
          totalOrders: 0,
          totalSpent: 0
        });
      }
      customerMap.get(key).bookings.push(booking);
      if (new Date(booking.updatedAt || booking.createdAt) > new Date(customerMap.get(key).lastActivity)) {
        customerMap.get(key).lastActivity = booking.updatedAt || booking.createdAt;
      }
    }
    
    // Process orders/payments
    for (const payment of payments) {
      const key = payment.customerEmail || payment.customerPhone;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          name: payment.customerName,
          email: payment.customerEmail,
          phone: payment.customerPhone,
          status: "converted",
          leadScore: 85,
          source: "order",
          lastActivity: payment.updatedAt || payment.createdAt,
          leads: [],
          bookings: [],
          orders: [],
          notes: [],
          totalOrders: 0,
          totalSpent: 0
        });
      }
      const customer = customerMap.get(key);
      customer.orders.push(payment);
      customer.totalOrders += 1;
      customer.totalSpent += parseFloat(payment.amount);
      customer.status = "converted";
      customer.leadScore = Math.max(customer.leadScore, 85);
      if (new Date(payment.updatedAt || payment.createdAt) > new Date(customer.lastActivity)) {
        customer.lastActivity = payment.updatedAt || payment.createdAt;
      }
    }
    
    // Get notes for each customer
    const notes = await db.select().from(customerNotes);
    for (const note of notes) {
      if (customerMap.has(note.customerId)) {
        customerMap.get(note.customerId).notes.push(note);
      }
    }
    
    return Array.from(customerMap.values()).sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
  }

  async getCustomerStats(): Promise<any> {
    const customers = await this.getAllCustomersWithDetails();
    
    const totalCustomers = customers.length;
    const hotLeads = customers.filter(c => c.status === "hot").length;
    const convertedCustomers = customers.filter(c => c.status === "converted").length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgOrderValue = convertedCustomers > 0 ? totalRevenue / convertedCustomers : 0;
    
    return {
      totalCustomers,
      hotLeads,
      convertedCustomers,
      totalRevenue,
      avgOrderValue
    };
  }

  async addCustomerNote(customerId: string, content: string): Promise<CustomerNote> {
    const [note] = await db.insert(customerNotes)
      .values({ customerId, content })
      .returning();
    return note;
  }

  async updateCustomerStatus(customerId: string, status: string): Promise<any> {
    // Update lead status if customer has leads
    await db.update(this.leads)
      .set({ leadType: status as any, updatedAt: new Date() })
      .where(or(eq(this.leads.email, customerId), eq(this.leads.phone, customerId)));
    
    return { success: true, customerId, status };
  }

  // App Settings operations
  async getAppSettings(): Promise<AppSettings | undefined> {
    const [settings] = await db.select().from(appSettings).limit(1);
    return settings;
  }

  async updateAppSettings(settingsData: Partial<InsertAppSettings>): Promise<AppSettings> {
    const existing = await this.getAppSettings();
    
    if (existing) {
      const [updated] = await db.update(appSettings)
        .set({
          ...settingsData,
          updatedAt: new Date(),
        })
        .where(eq(appSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      return await this.initializeAppSettings();
    }
  }

  async initializeAppSettings(): Promise<AppSettings> {
    const [settings] = await db.insert(appSettings)
      .values({
        businessName: "OwnItRight – Curated Property Advisors",
        contactEmail: "contact@ownitright.com",
        phoneNumber: "+91 98765 43210",
        whatsappNumber: "+91 98765 43210",
        officeAddress: "Bengaluru, Karnataka, India",
        defaultCurrency: "INR",
        currencySymbol: "₹",
        timezone: "Asia/Kolkata",
        dateFormat: "DD/MM/YYYY",
        maintenanceMode: false,
        maintenanceMessage: "We are currently performing maintenance. Please check back later.",
        primaryColor: "#2563eb",
        secondaryColor: "#64748b",
        metaTitle: "OwnItRight - Property Discovery Platform",
        metaDescription: "Discover your perfect property in Bengaluru with our advanced property discovery platform",
        enableBookings: true,
        enableConsultations: true,
        enableReports: true,
        enableBlog: true,
        lastUpdatedBy: "admin"
      })
      .returning();
    return settings;
  }

  // Team member operations
  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db.insert(teamMembers)
      .values(member)
      .returning();
    return newMember;
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers)
      .where(eq(teamMembers.id, id));
    return member || undefined;
  }

  async getAllTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers)
      .orderBy(desc(teamMembers.joinDate));
  }

  async updateTeamMember(id: string, updates: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const [member] = await db.update(teamMembers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(teamMembers.id, id))
      .returning();
    return member || undefined;
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    const result = await db.delete(teamMembers)
      .where(eq(teamMembers.id, id));
    return result.rowCount > 0;
  }

  async getTeamMembersByDepartment(department: string): Promise<TeamMember[]> {
    return await db.select().from(teamMembers)
      .where(eq(teamMembers.department, department))
      .orderBy(desc(teamMembers.joinDate));
  }

  async getActiveTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers)
      .where(eq(teamMembers.status, "active"))
      .orderBy(desc(teamMembers.joinDate));
  }

  // RERA Data operations
  async createReraData(reraInfo: InsertReraData): Promise<ReraData> {
    const [rera] = await db.insert(reraData)
      .values(reraInfo)
      .returning();
    return rera;
  }

  async getReraData(reraId: string): Promise<ReraData | undefined> {
    const [rera] = await db.select().from(reraData)
      .where(eq(reraData.id, reraId));
    return rera || undefined;
  }

  async getReraDataByProperty(propertyId: string): Promise<ReraData | undefined> {
    const [rera] = await db.select().from(reraData)
      .where(eq(reraData.propertyId, propertyId));
    return rera || undefined;
  }

  async getAllReraData(): Promise<ReraData[]> {
    return await db.select().from(reraData)
      .orderBy(desc(reraData.createdAt));
  }

  async updateReraData(reraId: string, updates: Partial<InsertReraData>): Promise<ReraData | undefined> {
    const [rera] = await db.update(reraData)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(reraData.id, reraId))
      .returning();
    return rera || undefined;
  }

  async deleteReraData(reraId: string): Promise<boolean> {
    const result = await db.delete(reraData)
      .where(eq(reraData.id, reraId));
    return result.rowCount > 0;
  }

  // Civil+MEP Report operations
  async createCivilMepReport(report: InsertCivilMepReport): Promise<CivilMepReport> {
    const [newReport] = await db.insert(civilMepReports)
      .values(report)
      .returning();
    return newReport;
  }

  async getCivilMepReport(reportId: string): Promise<CivilMepReport | undefined> {
    const [report] = await db.select().from(civilMepReports)
      .where(eq(civilMepReports.id, reportId));
    return report || undefined;
  }

  async getCivilMepReportByProperty(propertyId: string): Promise<CivilMepReport | undefined> {
    const [report] = await db.select().from(civilMepReports)
      .where(eq(civilMepReports.propertyId, propertyId));
    return report || undefined;
  }

  async getAllCivilMepReports(): Promise<CivilMepReport[]> {
    return await db.select().from(civilMepReports)
      .orderBy(desc(civilMepReports.createdAt));
  }

  async updateCivilMepReport(reportId: string, updates: Partial<InsertCivilMepReport>): Promise<CivilMepReport | undefined> {
    const [report] = await db.update(civilMepReports)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(civilMepReports.id, reportId))
      .returning();
    return report || undefined;
  }

  async deleteCivilMepReport(reportId: string): Promise<boolean> {
    const result = await db.delete(civilMepReports)
      .where(eq(civilMepReports.id, reportId));
    return result.rowCount > 0;
  }

  async getCivilMepReportStats(): Promise<any> {
    const reports = await this.getAllCivilMepReports();
    
    const totalReports = reports.length;
    const completedReports = reports.filter(r => r.status === "completed").length;
    const inProgressReports = reports.filter(r => r.status === "in-progress").length;
    const draftReports = reports.filter(r => r.status === "draft").length;
    const approvedReports = reports.filter(r => r.status === "approved").length;
    
    const avgScore = reports.length > 0 
      ? reports.reduce((sum, r) => sum + (r.overallScore || 0), 0) / reports.length 
      : 0;
    
    // Group by investment recommendation
    const byRecommendation = {
      "highly-recommended": reports.filter(r => r.investmentRecommendation === "highly-recommended").length,
      "recommended": reports.filter(r => r.investmentRecommendation === "recommended").length,
      "conditional": reports.filter(r => r.investmentRecommendation === "conditional").length,
      "not-recommended": reports.filter(r => r.investmentRecommendation === "not-recommended").length,
    };
    
    return {
      totalReports,
      completedReports,
      inProgressReports,
      draftReports,
      approvedReports,
      avgScore,
      byRecommendation
    };
  }
}

export const storage = new DatabaseStorage();
