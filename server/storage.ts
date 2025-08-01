import { type Property, type InsertProperty, type PropertyStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Property CRUD operations
  getProperty(id: string): Promise<Property | undefined>;
  getAllProperties(): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;
  
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
  private users: Map<string, any>;

  constructor() {
    this.properties = new Map();
    this.users = new Map();
    
    // Initialize with some sample properties
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
        builtUpArea: 1850,
        landArea: null,
        price: 120,
        bedrooms: "3-bhk",
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
        builtUpArea: 3200,
        landArea: 2400,
        price: 450,
        bedrooms: "4-bhk",
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
        builtUpArea: null,
        landArea: 2400,
        price: 96,
        bedrooms: null,
        possessionDate: "immediate",
        reraNumber: "PRM/KA/RERA/1251/311/AG/2020-21",
        reraApproved: true,
        infrastructureVerdict: "Developing area, flood risk present",
        zoningInfo: "Residential zone with environmental concerns",
        tags: ["rera-approved", "flood-zone"],
        images: [],
        videos: [],
      },
    ];

    sampleProperties.forEach(property => {
      const id = randomUUID();
      const fullProperty: Property = {
        ...property,
        id,
        builtUpArea: property.builtUpArea ?? null,
        landArea: property.landArea ?? null,
        bedrooms: property.bedrooms ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.properties.set(id, fullProperty);
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
      builtUpArea: insertProperty.builtUpArea ?? null,
      landArea: insertProperty.landArea ?? null,
      bedrooms: insertProperty.bedrooms ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const existing = this.properties.get(id);
    if (!existing) return undefined;

    const updated: Property = {
      ...existing,
      ...updates,
      builtUpArea: updates.builtUpArea !== undefined ? updates.builtUpArea ?? null : existing.builtUpArea,
      landArea: updates.landArea !== undefined ? updates.landArea ?? null : existing.landArea,
      bedrooms: updates.bedrooms !== undefined ? updates.bedrooms ?? null : existing.bedrooms,
      tags: Array.isArray(updates.tags) ? updates.tags : existing.tags,
      updatedAt: new Date(),
    };
    this.properties.set(id, updated);
    return updated;
  }

  async deleteProperty(id: string): Promise<boolean> {
    return this.properties.delete(id);
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
    const totalProperties = properties.length;
    const activeProjects = properties.filter(p => p.status === "active" || p.status === "under-construction").length;
    const reraApproved = properties.filter(p => p.reraApproved).length;
    const avgPrice = totalProperties > 0 
      ? Math.round(properties.reduce((sum, p) => sum + p.price, 0) / totalProperties / 10) / 10 
      : 0;

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
