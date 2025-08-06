import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, MapPin, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layout/admin-layout";
import { apiRequest } from "@/lib/queryClient";

const zoneSchema = z.object({
  name: z.string().min(1, "Zone name is required"),
  description: z.string().optional(),
  cityId: z.string().min(1, "City selection is required"),
  locationType: z.enum(["urban", "suburban", "rural"]).default("urban"),
  priceRangeMin: z.number().optional(),
  priceRangeMax: z.number().optional(),
  appreciationRate: z.number().optional(),
  rentalYield: z.number().optional(),
  infrastructureScore: z.number().min(1).max(10).default(5),
  connectivityScore: z.number().min(1).max(10).default(5),
  amenitiesScore: z.number().min(1).max(10).default(5),
  educationScore: z.number().min(1).max(10).default(5),
  area: z.number().optional(),
  population: z.number().optional(),
  pincodesServed: z.array(z.string()).default([]),
});

type ZoneFormData = z.infer<typeof zoneSchema>;

export default function ZonesEdit() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const params = useParams();
  const zoneId = params.id;

  // Fetch zone data
  const { data: zone, isLoading: zoneLoading } = useQuery({
    queryKey: ["/api/zones", zoneId],
    queryFn: async () => {
      const response = await fetch(`/api/zones/${zoneId}`);
      if (!response.ok) throw new Error("Failed to fetch zone");
      return response.json();
    },
    enabled: !!zoneId,
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

  const form = useForm<ZoneFormData>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      name: "",
      description: "",
      cityId: "",
      locationType: "urban",
      infrastructureScore: 5,
      connectivityScore: 5,
      amenitiesScore: 5,
      educationScore: 5,
      pincodesServed: [],
    },
  });

  // Update form when zone data is loaded
  useEffect(() => {
    if (zone) {
      form.reset({
        name: zone.name || "",
        description: zone.description || "",
        cityId: zone.cityId || "",
        locationType: zone.locationType || "urban",
        priceRangeMin: zone.priceRangeMin || undefined,
        priceRangeMax: zone.priceRangeMax || undefined,
        appreciationRate: zone.appreciationRate ? Number(zone.appreciationRate) : undefined,
        rentalYield: zone.rentalYield ? Number(zone.rentalYield) : undefined,
        infrastructureScore: zone.infrastructureScore || 5,
        connectivityScore: zone.connectivityScore || 5,
        amenitiesScore: zone.amenitiesScore || 5,
        educationScore: zone.educationScore || 5,
        area: zone.area ? Number(zone.area) : undefined,
        population: zone.population || undefined,
        pincodesServed: zone.pincodesServed || [],
      });
    }
  }, [zone, form]);

  const updateZoneMutation = useMutation({
    mutationFn: async (data: ZoneFormData) => {
      return apiRequest("PUT", `/api/zones/${zoneId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zones"] });
      queryClient.invalidateQueries({ queryKey: ["/api/zones", zoneId] });
      toast({
        title: "Zone updated",
        description: "Zone has been successfully updated.",
      });
      setLocation("/admin-panel/zones/view");
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update zone.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ZoneFormData) => {
    updateZoneMutation.mutate(data);
  };

  if (zoneLoading) {
    return (
      <AdminLayout title="Edit Zone">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  if (!zone) {
    return (
      <AdminLayout title="Edit Zone">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Zone not found</h2>
            <p className="text-gray-600 mb-4">The zone you're looking for doesn't exist.</p>
            <Link href="/admin-panel/zones/view">
              <Button>Back to Zones</Button>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Zone">
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <MapPin className="h-4 w-4" />
                <span>Zones</span>
                <span className="mx-2">›</span>
                <span className="text-gray-900 font-medium">Edit Zone</span>
              </div>
              <h2 className="text-lg font-medium text-gray-900">Edit Zone: {zone.name}</h2>
              <p className="text-sm text-gray-600">Update zone information and settings</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/admin-panel/zones/view">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Zones
                </Button>
              </Link>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateZoneMutation.isPending}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateZoneMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <div className="flex-1 px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Zone Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Zone Info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zone Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., North Bengaluru, Whitefield, Koramangala" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Brief description of the zone, key features, connectivity..."
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Location Details */}
                    <div className="space-y-4 pt-6 border-t">
                      <h3 className="text-lg font-medium">Location Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="cityId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City *</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a city" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {cities.map((city: any) => (
                                      <SelectItem key={city.id} value={city.id}>
                                        {city.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="locationType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location Type</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select location type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="urban">Urban</SelectItem>
                                    <SelectItem value="suburban">Suburban</SelectItem>
                                    <SelectItem value="rural">Rural</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="area"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Area (sq km)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="25.5" 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="population"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Population</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="500000" 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Market Data */}
                    <div className="space-y-4 pt-6 border-t">
                      <h3 className="text-lg font-medium">Market Data</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="priceRangeMin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Min Price (₹ Lakhs)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="50" 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="priceRangeMax"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Price (₹ Lakhs)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="200" 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="appreciationRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Appreciation Rate (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="8.5" 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="rentalYield"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rental Yield (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="3.5" 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Infrastructure Scores */}
                    <div className="space-y-4 pt-6 border-t">
                      <h3 className="text-lg font-medium">Infrastructure Scores (1-10)</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="infrastructureScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Infrastructure Score</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="10" 
                                  placeholder="5" 
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
                          name="connectivityScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Connectivity Score</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="10" 
                                  placeholder="5" 
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
                          name="amenitiesScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amenities Score</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="10" 
                                  placeholder="5" 
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
                          name="educationScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Education Score</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="10" 
                                  placeholder="5" 
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                      <Link href="/admin-panel/zones/view">
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </Link>
                      <Button 
                        type="submit" 
                        disabled={updateZoneMutation.isPending}
                      >
                        {updateZoneMutation.isPending ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}