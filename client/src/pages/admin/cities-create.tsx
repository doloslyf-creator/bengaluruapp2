import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Globe, Save, ArrowLeft, MapPin, Users, Building } from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";
import { useEffect } from "react";

// Form schema based on the City structure from schema
const formSchema = z.object({
  name: z.string().min(1, "City name is required"),
  state: z.string().optional(),
  country: z.string().default("India"),
  population: z.number().min(0, "Population must be positive").optional(),
  avgPropertyPrice: z.number().min(0, "Average property price must be positive").optional(),
  infrastructureScore: z.number().min(0).max(10, "Infrastructure score must be between 0-10").optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().min(1, "Display order must be at least 1").default(1),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminCitiesCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Extract city ID from URL if in edit mode
  const currentPath = window.location.pathname;
  const editMatch = currentPath.match(/\/edit$/) && currentPath.includes('/cities/');
  const cityId = editMatch ? currentPath.split('/').slice(-2, -1)[0] : null;
  const isEditMode = !!cityId;

  // Fetch existing city data if in edit mode
  const { data: existingCity, isLoading: isLoadingCity } = useQuery({
    queryKey: [`/api/cities/${cityId}`],
    enabled: isEditMode && !!cityId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      state: "",
      country: "India",
      population: 0,
      avgPropertyPrice: 0,
      infrastructureScore: 7,
      description: "",
      isActive: true,
      displayOrder: 1,
    },
  });

  // Populate form with existing data when in edit mode
  useEffect(() => {
    if (existingCity && isEditMode) {
      const city = existingCity as any;
      form.reset({
        name: city.name || "",
        state: city.state || "",
        country: city.country || "India",
        population: city.population || 0,
        avgPropertyPrice: city.avgPropertyPrice || 0,
        infrastructureScore: city.infrastructureScore || 7,
        description: city.description || "",
        isActive: city.isActive !== false,
        displayOrder: city.displayOrder || 1,
      });
    }
  }, [existingCity, isEditMode, form]);

  const saveCityMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = isEditMode ? `/api/cities/${cityId}` : "/api/cities";
      const method = isEditMode ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEditMode ? 'update' : 'create'} city`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: [`/api/cities/${cityId}`] });
      }
      toast({ title: `City ${isEditMode ? 'updated' : 'created'} successfully` });
      setLocation("/admin-panel/cities");
    },
    onError: (error: any) => {
      toast({
        title: `Error ${isEditMode ? 'updating' : 'creating'} city`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    saveCityMutation.mutate(data);
  };

  if (isLoadingCity) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded"></div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted animate-pulse rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/admin-panel/cities")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? 'Edit City' : 'Add New City'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isEditMode ? 'Update city information' : 'Add a new city to organize properties geographically'}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Bengaluru" data-testid="input-city-name" />
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
                        <FormLabel>State/Region</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Karnataka" data-testid="input-state" />
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
                          <Input {...field} placeholder="India" data-testid="input-country" />
                        </FormControl>
                        <FormMessage />
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
                          <Input {...field} type="number" min="1"
                            value={field.value || 1}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            data-testid="input-display-order" />
                        </FormControl>
                        <FormDescription>Order in which city appears in lists</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} 
                          placeholder="Brief description of the city..."
                          data-testid="textarea-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active City</FormLabel>
                        <FormDescription>
                          Allow properties to be added in this city
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-is-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Demographics & Market Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Demographics & Market Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="population"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Population</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            placeholder="e.g., 12000000"
                            data-testid="input-population" />
                        </FormControl>
                        <FormDescription>Total city population</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="avgPropertyPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Average Property Price (₹)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            placeholder="e.g., 8500000"
                            data-testid="input-avg-property-price" />
                        </FormControl>
                        <FormDescription>Average residential property price</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="infrastructureScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Infrastructure Score (0-10)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" max="10" step="0.1"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 7)}
                            placeholder="e.g., 8.5"
                            data-testid="input-infrastructure-score" />
                        </FormControl>
                        <FormDescription>Overall infrastructure rating</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
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
                disabled={saveCityMutation.isPending}
                data-testid="button-submit"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveCityMutation.isPending 
                  ? `${isEditMode ? 'Updating' : 'Creating'}...` 
                  : `${isEditMode ? 'Update' : 'Create'} City`
                }
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}