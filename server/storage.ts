import { 
  type Property, 
  type InsertProperty, 
  type PropertyStats, 
  type PropertyConfiguration,
  type InsertPropertyConfiguration,
  type PropertyWithConfigurations 
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
  
  // User operations (from original template)
  getUser(id: string): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: any): Promise<any>;
}

export class MemStorage implements IStorage {
  private properties: Map<string, Property>;
  private propertyConfigurations: Map<string, PropertyConfiguration>;
  private users: Map<string, any>;

  constructor() {
    this.properties = new Map();
    this.propertyConfigurations = new Map();
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
      tags: Array.isArray(updates.tags) ? updates.tags : existing.tags,
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
    return Array.from(this.properties.values()).filter((property) => {
      if (filters.type && property.type !== filters.type) return false;
      if (filters.status && property.status !== filters.status) return false;
      if (filters.zone && property.zone !== filters.zone) return false;
      if (filters.reraApproved !== undefined && property.reraApproved !== filters.reraApproved) return false;
      if (filters.minPrice && property.price < filters.minPrice) return false;
      if (filters.maxPrice && property.price > filters.maxPrice) return false;
      return true;
    });
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
