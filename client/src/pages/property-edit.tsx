import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Trash2, Save, Camera } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  type PropertyWithConfigurations, 
  type PropertyConfiguration,
  insertPropertySchema,
  insertPropertyConfigurationSchema 
} from "@shared/schema";

const propertyEditSchema = insertPropertySchema.extend({
  configurations: z.array(insertPropertyConfigurationSchema.extend({
    id: z.string().optional(),
  })).min(1, "At least one configuration is required"),
});

type PropertyEditForm = z.infer<typeof propertyEditSchema>;

export default function PropertyEdit() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: property, isLoading } = useQuery<PropertyWithConfigurations>({
    queryKey: ["/api/properties", id, "with-configurations"],
    enabled: !!id,
  });

  const form = useForm<PropertyEditForm>({
    resolver: zodResolver(propertyEditSchema),
    defaultValues: {
      configurations: [
        {
          propertyId: "",
          configuration: "",
          pricePerSqft: "0",
          builtUpArea: 0,
          plotSize: 0,
          availabilityStatus: "available",
          totalUnits: 0,
          availableUnits: 0,
          price: 0,
        }
      ]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "configurations",
  });

  // Load property data into form when available
  useEffect(() => {
    if (property) {
      form.reset({
        name: property.name,
        type: property.type,
        developer: property.developer,
        status: property.status,
        area: property.area,
        zone: property.zone,
        address: property.address,
        possessionDate: property.possessionDate || "",
        reraNumber: property.reraNumber || "",
        reraApproved: property.reraApproved,
        infrastructureVerdict: property.infrastructureVerdict || "",
        zoningInfo: property.zoningInfo || "",
        tags: property.tags,
        images: property.images,
        videos: property.videos,
        youtubeVideoUrl: property.youtubeVideoUrl || "",
        configurations: property.configurations.length > 0 ? property.configurations.map(config => ({
          id: config.id,
          propertyId: config.propertyId,
          configuration: config.configuration,
          pricePerSqft: config.pricePerSqft,
          builtUpArea: config.builtUpArea,
          plotSize: config.plotSize || 0,
          availabilityStatus: config.availabilityStatus,
          totalUnits: config.totalUnits || 0,
          availableUnits: config.availableUnits || 0,
          price: config.price,
        })) : [{
          propertyId: id || "",
          configuration: "",
          pricePerSqft: "0",
          builtUpArea: 0,
          plotSize: 0,
          availabilityStatus: "available" as const,
          totalUnits: 0,
          availableUnits: 0,
          price: 0,
        }]
      });
    }
  }, [property, form]);

  const updatePropertyMutation = useMutation({
    mutationFn: async (data: PropertyEditForm) => {
      const { configurations, ...propertyData } = data;
      
      // Update property
      await apiRequest("PATCH", `/api/properties/${id}`, propertyData);
      
      // Update configurations
      for (const config of configurations) {
        if (config.id) {
          // Update existing configuration
          await apiRequest("PATCH", `/api/property-configurations/${config.id}`, {
            ...config,
            propertyId: id,
          });
        } else {
          // Create new configuration
          await apiRequest("POST", "/api/property-configurations", {
            ...config,
            propertyId: id,
          });
        }
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Property updated successfully",
        description: "Property and configurations have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error updating property",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PropertyEditForm) => {
    updatePropertyMutation.mutate(data);
  };

  const addConfiguration = () => {
    append({
      propertyId: id || "",
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

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse text-center">
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Property not found</h2>
              <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
              <Button onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
              </Button>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Edit Property</h2>
                <p className="text-sm text-gray-600 mt-1">{property.name}</p>
              </div>
            </div>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={updatePropertyMutation.isPending}
              className="flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {updatePropertyMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Property Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter property name" />
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
                        <FormLabel>Developer</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter developer name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                            <SelectItem value="plot">Plot</SelectItem>
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
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pre-launch">Pre Launch</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="under-construction">Under Construction</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="sold-out">Sold Out</SelectItem>
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
                        <FormLabel>Area</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Whitefield, Koramangala" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zone</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select zone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="north">North Bengaluru</SelectItem>
                            <SelectItem value="south">South Bengaluru</SelectItem>
                            <SelectItem value="east">East Bengaluru</SelectItem>
                            <SelectItem value="west">West Bengaluru</SelectItem>
                            <SelectItem value="central">Central Bengaluru</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter complete address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Property Configurations */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Property Configurations</h3>
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

                <div className="space-y-6">
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
                              <FormLabel>Configuration Type</FormLabel>
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
                              <FormLabel>Price per Sqft (₹)</FormLabel>
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
                              <FormLabel>Built-up Area (Sqft)</FormLabel>
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
                              <FormLabel>Availability Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="available">Available</SelectItem>
                                  <SelectItem value="sold-out">Sold Out</SelectItem>
                                  <SelectItem value="coming-soon">Coming Soon</SelectItem>
                                  <SelectItem value="limited">Limited</SelectItem>
                                </SelectContent>
                              </Select>
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
                              <FormLabel>Total Price (₹ Crores)</FormLabel>
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
                </div>
              </Card>

              {/* RERA and Legal Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal & Regulatory</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="reraNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RERA Number</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Enter RERA registration number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="possessionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Possession Date</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="YYYY-MM format" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-6">
                  <FormField
                    control={form.control}
                    name="infrastructureVerdict"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Infrastructure Verdict</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} placeholder="Infrastructure assessment and connectivity details" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-6">
                  <FormField
                    control={form.control}
                    name="zoningInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zoning Information</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} placeholder="Zoning classification and regulatory details" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Media and Content */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Media & Content</h3>
                
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="youtubeVideoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube Video URL (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="https://www.youtube.com/watch?v=..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Tags</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                            onChange={(e) => field.onChange(e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                            placeholder="luxury, gated-community, gym, swimming-pool" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Images</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <Input 
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                // For now, we'll store file names as placeholders
                                // In production, you'd upload to cloud storage and store URLs
                                const imageUrls = files.map(file => URL.createObjectURL(file));
                                field.onChange([...(field.value || []), ...imageUrls]);
                              }}
                              className="hidden"
                              id="image-upload"
                            />
                            <label 
                              htmlFor="image-upload"
                              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                            >
                              <div className="text-center">
                                <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-600">Click to upload images</p>
                                <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB each</p>
                              </div>
                            </label>
                            
                            {field.value && field.value.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {field.value.map((image: string, index: number) => (
                                  <div key={index} className="relative">
                                    <img 
                                      src={image} 
                                      alt={`Property image ${index + 1}`}
                                      className="w-full h-24 object-cover rounded-lg border"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-1 right-1 h-6 w-6 p-0"
                                      onClick={() => {
                                        const newImages = (field.value || []).filter((_: string, i: number) => i !== index);
                                        field.onChange(newImages);
                                      }}
                                    >
                                      ×
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            </form>
          </Form>
        </main>
      </div>
    </div>
  );
}