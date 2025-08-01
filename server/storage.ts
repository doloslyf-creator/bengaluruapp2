import { 
  type Property, 
  type InsertProperty, 
  type PropertyStats, 
  type PropertyConfiguration,
  type InsertPropertyConfiguration,
  type PropertyWithConfigurations,
  type Lead,
  type InsertLead,
  type LeadWithDetails,
  type LeadActivity,
  type InsertLeadActivity,
  type LeadNote,
  type InsertLeadNote,
  type LeadStats,
  type Booking,
  type InsertBooking
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Property CRUD operations
  getProperty(id: string): Promise<Property | undefined>;
  getAllProperties(): Promise<Property[]>;
  getPropertyWithConfigurations(id: string): Promise<PropertyWithConfigurations | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;
  
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
  
  // Lead scoring and qualification
  updateLeadScore(leadId: string, score: number, notes?: string): Promise<Lead | undefined>;
  qualifyLead(leadId: string, qualified: boolean, notes: string): Promise<Lead | undefined>;
  
  // User operations (from original template)
  getUser(id: string): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: any): Promise<any>;
}

export class MemStorage implements IStorage {
  private properties: Map<string, Property>;
  private propertyConfigurations: Map<string, PropertyConfiguration>;
  private bookings: Map<string, Booking>;
  private leads: Map<string, Lead>;
  private leadActivities: Map<string, LeadActivity[]>;
  private leadNotes: Map<string, LeadNote[]>;
  private users: Map<string, any>;

  constructor() {
    this.properties = new Map();
    this.propertyConfigurations = new Map();
    this.bookings = new Map();
    this.leads = new Map();
    this.leadActivities = new Map();
    this.leadNotes = new Map();
    this.users = new Map();
    
    // Initialize with some sample properties and configurations
    this.initializeSampleData();
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
        note: `Lead score updated to ${score}. ${notes}`,
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
      note: `Lead ${qualified ? 'qualified' : 'disqualified'}: ${notes}`,
      noteType: "qualification",
      createdBy: "system",
    });
    
    return updated;
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
}

export const storage = new MemStorage();
