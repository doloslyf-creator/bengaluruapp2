import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Trash2, Save, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatPriceInCrores } from "@/lib/utils";
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

export default function AdminPropertyEdit() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { logout } = useAuth();
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
      navigate("/admin-panel");
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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h1>
          <Button onClick={() => navigate("/admin-panel")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/admin-panel")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
                <p className="text-gray-600">{property.name}</p>
              </div>
            </div>
            
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pre-launch">Pre-Launch</SelectItem>
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
                      <FormLabel>Area/Locality</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
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
                      <FormLabel>Complete Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Configurations */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Property Configurations</h2>
                <Button type="button" onClick={addConfiguration} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Configuration
                </Button>
              </div>

              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Configuration {index + 1}</h3>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`configurations.${index}.configuration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Configuration</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., 3BHK" />
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
                            <FormLabel>Built-up Area (sq ft)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
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
                            <FormLabel>Price (₹)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <div className="text-sm text-gray-500">
                              {formatPriceInCrores(field.value)}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`configurations.${index}.pricePerSqft`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price per sq ft (₹)</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                            <FormLabel>Availability</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="sold-out">Sold Out</SelectItem>
                                <SelectItem value="coming-soon">Coming Soon</SelectItem>
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
                                type="number" 
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
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

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-violet-600 hover:bg-violet-700"
                disabled={updatePropertyMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {updatePropertyMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}