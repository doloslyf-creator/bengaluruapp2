import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, MapPin, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  area: z.string().optional(),
  pincode: z.string().optional(),
  coordinates: z.string().optional(),
});

type ZoneFormData = z.infer<typeof zoneSchema>;

export default function ZonesAdd() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const form = useForm<ZoneFormData>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      name: "",
      description: "",
      area: "",
      pincode: "",
      coordinates: "",
    },
  });

  const createZoneMutation = useMutation({
    mutationFn: async (data: ZoneFormData) => {
      return apiRequest("POST", "/api/zones", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zones"] });
      toast({
        title: "Zone created",
        description: "Zone has been successfully created.",
      });
      setLocation("/admin-panel/zones/view");
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create zone.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ZoneFormData) => {
    createZoneMutation.mutate(data);
  };

  return (
    <AdminLayout title="Add Zone">
      <div className="flex flex-col h-full">
        {/* Breadcrumb Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/admin-panel/zones">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Zones
                </Button>
              </Link>
              <div className="text-sm text-gray-500">
                <span>Zones</span>
                <span className="mx-2">›</span>
                <span className="text-gray-900 font-medium">Add Zone</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Create New Zone</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zone Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., North Bengaluru, Whitefield" {...field} />
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
                          name="area"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Area (sq km)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g., 25.5" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pincode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primary Pincode</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 560001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="coordinates"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coordinates (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., 12.9716,77.5946" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                      <Link href="/admin-panel/zones">
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </Link>
                      <Button 
                        type="submit" 
                        disabled={createZoneMutation.isPending}
                      >
                        {createZoneMutation.isPending ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Create Zone
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