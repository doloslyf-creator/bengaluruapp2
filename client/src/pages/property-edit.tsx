import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Building, Save, ArrowLeft, ChevronRight, Plus,
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
  type PropertyWithConfigurations,
  insertPropertySchema,
  type Property 
} from "@shared/schema";

const propertyFormSchema = insertPropertySchema.extend({
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

export default function PropertyEdit() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [currentTab, setCurrentTab] = useState("basic");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const { data: property, isLoading } = useQuery<PropertyWithConfigurations>({
    queryKey: ["/api/properties", id, "with-configurations"],
    enabled: !!id,
  });

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
    },
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

  // Load property data into form when available
  useEffect(() => {
    if (property) {
      setSelectedCityId(property.cityId);
      setTags(property.tags || []);
      
      form.reset({
        name: property.name,
        type: property.type,
        developer: property.developer,
        status: property.status,
        area: property.area,
        zone: property.zone,
        cityId: property.cityId,
        zoneId: property.zoneId,
        address: property.address,
        description: property.description || "",
        amenities: property.amenities || "",
        highlights: property.highlights || "",
        possessionDate: property.possessionDate || "",
        reraNumber: property.reraNumber || "",
        reraApproved: property.reraApproved,
        infrastructureVerdict: property.infrastructureVerdict || "",
        zoningInfo: property.zoningInfo || "",
        startingPrice: property.startingPrice || 0,
        maxPrice: property.maxPrice || 0,
        tags: property.tags || [],
        images: property.images || [],
        videos: property.videos || [],
        youtubeVideoUrl: property.youtubeVideoUrl || "",
        videoUrl: property.youtubeVideoUrl || "",
        brochureUrl: property.brochureUrl || "",
      });
    }
  }, [property, form]);

  const updatePropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const response = await apiRequest("PATCH", `/api/properties/${id}`, {
        ...data,
        tags: tags, // Use the current tags state
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Property updated successfully",
        description: "The property has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      navigate("/admin-panel/properties/view");
    },
    onError: (error: any) => {
      toast({
        title: "Error updating property",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PropertyFormData) => {
    updatePropertyMutation.mutate(data);
  };

  // Tag management functions
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

  if (isLoading) {
    return (
      <AdminLayout title="Loading Property...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  if (!property) {
    return (
      <AdminLayout title="Property Not Found">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Property not found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/admin-panel/properties/view")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Property">
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <Building className="h-4 w-4" />
                <span>Properties</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-900 font-medium">Edit Property</span>
              </div>
              <h2 className="text-lg font-medium text-gray-900">Edit {property.name}</h2>
              <p className="text-sm text-gray-600">Update property details and information</p>
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
                disabled={updatePropertyMutation.isPending}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {updatePropertyMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <div className="flex-1 px-6 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
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
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select developer" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {developers.map((dev: any) => (
                                      <SelectItem key={dev.id} value={dev.name}>
                                        {dev.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property Type *</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="apartment">Apartment</SelectItem>
                                    <SelectItem value="villa">Villa</SelectItem>
                                    <SelectItem value="plot">Plot</SelectItem>
                                    <SelectItem value="commercial">Commercial</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
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
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="sold-out">Sold Out</SelectItem>
                                  </SelectContent>
                                </Select>
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
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Location Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="cityId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City *</FormLabel>
                              <FormControl>
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    setSelectedCityId(value);
                                  }} 
                                  value={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select city" />
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
                          name="zoneId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Zone *</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select zone" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {zones.map((zone: any) => (
                                      <SelectItem key={zone.id} value={zone.id}>
                                        {zone.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="area"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Area *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter area name" {...field} />
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
                              <FormLabel>Zone Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter zone name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter complete address"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
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
                    <CardContent className="space-y-6">
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