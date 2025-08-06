import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage, 
  FormDescription 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";
import { apiRequest } from "@/lib/queryClient";
import React from "react";

const cityFormSchema = z.object({
  name: z.string().min(1, "City name is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().default("India"),
  description: z.string().optional(),
  population: z.number().optional(),
  area: z.number().optional(),
  averagePropertyPrice: z.number().optional(),
  priceAppreciationRate: z.number().optional(),
  rentalYieldRange: z.string().optional(),
  transportScore: z.number().min(0).max(10).default(0),
  educationScore: z.number().min(0).max(10).default(0),
  healthcareScore: z.number().min(0).max(10).default(0),
  employmentScore: z.number().min(0).max(10).default(0),
  isActive: z.boolean().default(true),
  displayOrder: z.number().default(0),
});

type CityFormData = z.infer<typeof cityFormSchema>;

export default function CityEdit() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch city data
  const { data: city, isLoading: cityLoading } = useQuery({
    queryKey: [`/api/cities/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/cities/${id}`);
      if (!response.ok) throw new Error("Failed to fetch city");
      return response.json();
    },
  });

  const form = useForm<CityFormData>({
    resolver: zodResolver(cityFormSchema),
    defaultValues: {
      name: "",
      state: "",
      country: "India",
      description: "",
      transportScore: 0,
      educationScore: 0,
      healthcareScore: 0,
      employmentScore: 0,
      isActive: true,
      displayOrder: 0,
    },
  });

  // Update form when city data is loaded
  React.useEffect(() => {
    if (city) {
      form.reset({
        name: city.name || "",
        state: city.state || "",
        country: city.country || "India",
        description: city.description || "",
        population: city.population || undefined,
        area: city.area ? parseFloat(city.area) : undefined,
        averagePropertyPrice: city.averagePropertyPrice || undefined,
        priceAppreciationRate: city.priceAppreciationRate ? parseFloat(city.priceAppreciationRate) : undefined,
        rentalYieldRange: city.rentalYieldRange || "",
        transportScore: city.transportScore || 0,
        educationScore: city.educationScore || 0,
        healthcareScore: city.healthcareScore || 0,
        employmentScore: city.employmentScore || 0,
        isActive: city.isActive ?? true,
        displayOrder: city.displayOrder || 0,
      });
    }
  }, [city, form]);

  const updateCityMutation = useMutation({
    mutationFn: async (data: CityFormData) => {
      // Convert numeric fields to strings for decimal database fields
      const transformedData = {
        ...data,
        area: data.area ? data.area.toString() : undefined,
        priceAppreciationRate: data.priceAppreciationRate ? data.priceAppreciationRate.toString() : undefined,
      } as any;
      return apiRequest("PUT", `/api/cities/${id}`, transformedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cities/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      toast({
        title: "City updated",
        description: "City has been successfully updated.",
      });
      setLocation("/admin-panel/cities");
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update city.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CityFormData) => {
    updateCityMutation.mutate(data);
  };

  if (cityLoading) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!city) {
    return (
      <AdminLayout title="City Not Found">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold mb-2">City Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The requested city could not be found.
          </p>
          <Button onClick={() => setLocation("/admin-panel/cities")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cities
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit ${city.name}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation("/admin-panel/cities")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit City</h1>
              <p className="text-muted-foreground">
                Update city information and infrastructure details
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city name" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter state name" {...field} data-testid="input-state" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter country name" {...field} data-testid="input-country" />
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
                            placeholder="Enter city description" 
                            {...field} 
                            data-testid="input-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active</FormLabel>
                            <FormDescription>
                              Show this city in listings
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-active"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="displayOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Order</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-order"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Geographic & Market Data */}
              <Card>
                <CardHeader>
                  <CardTitle>Geographic & Market Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="population"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Population</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter population" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              data-testid="input-population"
                            />
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
                          <FormLabel>Area (km²)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="Enter area" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              data-testid="input-area"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="averagePropertyPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Average Property Price (₹ Lakhs)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter average price in lakhs" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            data-testid="input-price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priceAppreciationRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price Appreciation Rate (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="Enter rate" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              data-testid="input-appreciation"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rentalYieldRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rental Yield Range</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 3-5%" 
                              {...field} 
                              data-testid="input-yield"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Infrastructure Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Infrastructure Scores (1-10)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="transportScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transport</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="10" 
                            placeholder="0-10" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-transport"
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
                        <FormLabel>Education</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="10" 
                            placeholder="0-10" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-education"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="healthcareScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Healthcare</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="10" 
                            placeholder="0-10" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-healthcare"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employmentScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="10" 
                            placeholder="0-10" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-employment"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation("/admin-panel/cities")}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateCityMutation.isPending}
                data-testid="button-save"
              >
                {updateCityMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}