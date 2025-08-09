import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { 
  Building, Save, ArrowLeft, ChevronRight, Plus, Trash2,
  Home, MapPin, DollarSign, Calendar, Tag, Users,
  FileText, Image, Video, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";
import { 
  insertPropertySchema, 
  insertPropertyConfigurationSchema,
  type Property 
} from "@shared/schema";

const configurationSchema = insertPropertyConfigurationSchema.extend({
  id: z.string().optional(),
});

const propertyFormSchema = insertPropertySchema.extend({
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  configurations: z.array(configurationSchema).optional(),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

export default function PropertiesAdd() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [currentTab, setCurrentTab] = useState("basic");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // These states and mutations are placeholders, assuming they exist in a real app
  const [isEditMode, setIsEditMode] = useState(false); // Example state for edit mode
  const propertyId = undefined; // Example property ID for edit mode
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track submission

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: "",
      developer: "",
      area: "",
      zone: "",
      cityId: "",
      zoneId: "",
      type: "apartment",
      status: "active",
      startingPrice: 0,
      maxPrice: 0,
      description: "",
      amenities: "",
      highlights: "",
      videoUrl: "",
      brochureUrl: "",
      images: [],
      tags: [],
      configurations: [{
        propertyId: "",
        configuration: "",
        pricePerSqft: "0",
        builtUpArea: 0,
        plotSize: 0,
        availabilityStatus: "available",
        totalUnits: 0,
        availableUnits: 0,
        price: 0,
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "configurations",
  });

  // Fetch cities for dropdown
  const { data: cities = [] } = useQuery({
    queryKey: ["/api/cities"],
    queryFn: async () => {
      const response = await fetch("/api/cities");
      if (!response.ok) throw new Error("Failed to fetch cities");
      return response.json();
    },
  });

  const [selectedCityId, setSelectedCityId] = useState<string>("");

  // Fetch zones based on selected city
  const { data: zones = [] } = useQuery({
    queryKey: ["/api/zones/city", selectedCityId],
    queryFn: async () => {
      if (!selectedCityId) return [];
      const response = await fetch(`/api/zones/city/${selectedCityId}`);
      if (!response.ok) throw new Error("Failed to fetch zones");
      return response.json();
    },
    enabled: !!selectedCityId,
  });

  // Fetch developers for dropdown
  const { data: developers = [] } = useQuery({
    queryKey: ["/api/developers"],
    queryFn: async () => {
      const response = await fetch("/api/developers");
      if (!response.ok) throw new Error("Failed to fetch developers");
      return response.json();
    },
  });

  // Placeholder for update mutation
  const updatePropertyMutation = useMutation({
    mutationFn: async (data: any) => {
      // This is a placeholder. Replace with your actual update API call.
      console.log("Updating property:", data);
      // Example: return apiRequest("PUT", `/api/properties/${data.id}`, data);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      return { id: data.id, ...data };
    },
    onSuccess: (updatedProperty) => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties/stats"] });
      toast({
        title: "Property Updated",
        description: `${updatedProperty.name} has been updated successfully.`,
      });
      navigate("/admin-panel/properties/view");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update property",
        variant: "destructive",
      });
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const { configurations, ...propertyData } = data;

      // Create property first
      const propertyResponse = await apiRequest("POST", "/api/properties", {
        ...propertyData,
        tags: tags, // Use the current tags state
      });
      const property = await propertyResponse.json();

      // Create configurations for the new property
      if (configurations) {
        for (const config of configurations) {
          await apiRequest("POST", "/api/property-configurations", {
            ...config,
            propertyId: property.id,
          });
        }
      }

      return property;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties/stats"] });
      toast({
        title: "Property added",
        description: "New property has been added successfully",
      });
      navigate("/admin-panel/properties/view");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add property",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!data.name?.trim()) {
        throw new Error("Property name is required");
      }
      if (!data.cityId) {
        throw new Error("City selection is required");
      }
      if (!data.zoneId) {
        throw new Error("Zone selection is required");
      }

      // Process the data
      const processedData = {
        ...data,
        // Ensure required fields have proper types
        price: data.price ? data.price.toString() : "0",
        area: data.area ? data.area.toString() : "0",
        totalUnits: data.totalUnits ? parseInt(data.totalUnits.toString()) : 0,
        // Convert arrays to proper format
        amenities: Array.isArray(data.amenities) ? data.amenities : (data.amenities ? [data.amenities] : []),
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
        // Ensure booleans
        reraApproved: Boolean(data.reraApproved),
        // Set defaults for optional fields
        status: data.status || "active",
        type: data.type || "apartment",
      };

      let result;
      if (isEditMode && propertyId) {
        result = await updatePropertyMutation.mutateAsync({
          id: propertyId,
          ...processedData
        });
      } else {
        result = await createPropertyMutation.mutateAsync(processedData);
      }

      toast({
        title: isEditMode ? "Property Updated" : "Property Created",
        description: `${data.name} has been ${isEditMode ? 'updated' : 'created'} successfully.`,
      });

      // Navigate back to properties list
      navigate("/admin-panel/properties/view");
    } catch (error) {
      console.error("Error saving property:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const addConfiguration = () => {
    append({
      propertyId: "",
      configuration: "",
      pricePerSqft: "0",
      builtUpArea: 0,
      plotSize: 0,
      availabilityStatus: "available",
      totalUnits: 0,
      availableUnits: 0,
      price: 0,
    });
  };

  const calculatePrice = (index: number) => {
    const builtUpArea = form.watch(`configurations.${index}.builtUpArea`);
    const pricePerSqft = parseFloat(form.watch(`configurations.${index}.pricePerSqft`) || "0");
    const totalPrice = Math.round((builtUpArea * pricePerSqft) / 100000); // Convert to lakhs
    form.setValue(`configurations.${index}.price`, totalPrice);
  };

  return (
    <AdminLayout title="Add New Property">
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <Building className="h-4 w-4" />
                <span>Properties</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-900 font-medium">Add New Property</span>
              </div>
              <h2 className="text-lg font-medium text-gray-900">Create Property Listing</h2>
              <p className="text-sm text-gray-600">Add a new property to your inventory</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate("/admin-panel/properties/view")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={addPropertyMutation.isPending || isSubmitting}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {addPropertyMutation.isPending || isSubmitting ? "Saving..." : "Save Property"}
              </Button>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <div className="flex-1 px-6 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="configurations">Configurations</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="tags">Tags</TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Home className="h-5 w-5 mr-2" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter property name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="developer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Developer *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select developer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {developers.map((dev: any) => (
                                  <SelectItem key={dev.id} value={dev.name}>
                                    {dev.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Area *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter area/locality" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cityId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedCityId(value);
                                form.setValue("zoneId", ""); // Reset zone when city changes
                              }} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select city" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cities.map((city: any) => (
                                  <SelectItem key={city.id} value={city.id}>
                                    {city.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="zoneId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zone *</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={!selectedCityId}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={selectedCityId ? "Select zone" : "First select a city"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {zones.map((zone: any) => (
                                  <SelectItem key={zone.id} value={zone.id}>
                                    {zone.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="apartment">Apartment</SelectItem>
                                <SelectItem value="villa">Villa</SelectItem>
                                <SelectItem value="plot">Plot</SelectItem>
                                <SelectItem value="commercial">Commercial</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="sold">Sold</SelectItem>
                                <SelectItem value="under-construction">Under Construction</SelectItem>
                                <SelectItem value="coming-soon">Coming Soon</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Pricing Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="startingPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Starting Price (₹ Lakhs) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter starting price"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Price (₹ Lakhs)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter maximum price"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Property Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter detailed property description"
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="amenities"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amenities</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="List property amenities (e.g., Swimming Pool, Gym, Security)"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="highlights"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Highlights</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Key highlights and unique selling points"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Configurations Tab */}
                <TabsContent value="configurations" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Users className="h-5 w-5 mr-2" />
                          Property Configurations
                        </CardTitle>
                        <Button
                          type="button"
                          onClick={addConfiguration}
                          size="sm"
                          className="flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Configuration
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {fields.map((field, index) => (
                        <div key={field.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-900">Configuration {index + 1}</h4>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name={`configurations.${index}.configuration`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Configuration Type *</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="e.g., 3BHK, 4BHK, Villa" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`configurations.${index}.pricePerSqft`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price per Sqft (₹) *</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      onChange={(e) => {
                                        field.onChange(e);
                                        setTimeout(() => calculatePrice(index), 100);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`configurations.${index}.builtUpArea`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Built-up Area (Sqft) *</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="number"
                                      placeholder="0"
                                      onChange={(e) => {
                                        field.onChange(Number(e.target.value));
                                        setTimeout(() => calculatePrice(index), 100);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`configurations.${index}.plotSize`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Plot Size (Sqft)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="number"
                                      placeholder="0 (optional for apartments)"
                                      value={field.value || 0}
                                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`configurations.${index}.availabilityStatus`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Availability Status *</FormLabel>
                                  <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="sold-out">Sold Out</SelectItem>
                                        <SelectItem value="coming-soon">Coming Soon</SelectItem>
                                        <SelectItem value="limited">Limited</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`configurations.${index}.totalUnits`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Total Units</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="number"
                                      placeholder="0"
                                      value={field.value || 0}
                                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`configurations.${index}.availableUnits`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Available Units</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="number"
                                      placeholder="0"
                                      value={field.value || 0}
                                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`configurations.${index}.price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Total Price (₹ Lakhs)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="number"
                                      placeholder="Auto-calculated"
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Media Tab */}
                <TabsContent value="media" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Image className="h-5 w-5 mr-2" />
                        Media Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="videoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>YouTube Video URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://www.youtube.com/watch?v=..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="brochureUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Brochure URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/brochure.pdf"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <Label>Property Images</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Image upload functionality will be added here</p>
                          <p className="text-sm text-gray-500 mt-2">Support for multiple image uploads</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tags Tab */}
                <TabsContent value="tags" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Tag className="h-5 w-5 mr-2" />
                        Property Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <Label>Add Tags</Label>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Enter tag and press Enter"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                          />
                          <Button type="button" onClick={addTag} variant="outline">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {tags.length > 0 && (
                          <div className="space-y-2">
                            <Label>Current Tags</Label>
                            <div className="flex flex-wrap gap-2">
                              {tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                                  <span>{tag}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="ml-1 hover:text-red-600"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </div>
      </div>
    </AdminLayout>
  );
}