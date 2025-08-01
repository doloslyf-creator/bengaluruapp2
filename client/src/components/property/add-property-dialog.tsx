import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPropertySchema, type InsertProperty } from "@shared/schema";

interface AddPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const propertyTags = [
  { id: "rera-approved", label: "RERA Approved" },
  { id: "gated-community", label: "Gated Community" },
  { id: "flood-zone", label: "Flood Zone" },
  { id: "premium", label: "Premium" },
  { id: "golf-course", label: "Golf Course" },
  { id: "eco-friendly", label: "Eco-Friendly" },
  { id: "metro-connectivity", label: "Metro Connectivity" },
  { id: "it-hub-proximity", label: "IT Hub Proximity" },
];

export function AddPropertyDialog({ open, onOpenChange }: AddPropertyDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const form = useForm<InsertProperty>({
    resolver: zodResolver(insertPropertySchema),
    defaultValues: {
      name: "",
      type: "apartment",
      developer: "",
      status: "active",
      area: "",
      zone: "east",
      address: "",
      builtUpArea: 0,
      landArea: 0,
      price: 0,
      bedrooms: "2-bhk",
      possessionDate: "",
      reraNumber: "",
      reraApproved: false,
      infrastructureVerdict: "",
      zoningInfo: "",
      tags: [],
      images: [],
      videos: [],
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: (data: InsertProperty) => apiRequest("POST", "/api/properties", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties/stats"] });
      toast({
        title: "Success",
        description: "Property added successfully!",
      });
      onOpenChange(false);
      form.reset();
      setSelectedTags([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add property",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProperty) => {
    const formData = {
      ...data,
      tags: selectedTags,
      builtUpArea: data.builtUpArea || null,
      landArea: data.landArea || null,
    };
    createPropertyMutation.mutate(formData);
  };

  const handleTagChange = (tagId: string, checked: boolean) => {
    if (checked) {
      setSelectedTags([...selectedTags, tagId]);
    } else {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Property Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter property name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="type">Property Type</Label>
              <Select onValueChange={(value) => form.setValue("type", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="plot">Plot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="developer">Developer</Label>
              <Input
                id="developer"
                {...form.register("developer")}
                placeholder="Enter developer name"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => form.setValue("status", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-launch">Pre-Launch</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="under-construction">Under Construction</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="sold-out">Sold Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location Details */}
          <div className="border-t border-border pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Location Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="area">Area/Locality</Label>
                <Input
                  id="area"
                  {...form.register("area")}
                  placeholder="e.g., Whitefield"
                />
              </div>

              <div>
                <Label htmlFor="zone">Zone</Label>
                <Select onValueChange={(value) => form.setValue("zone", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="north">North Bengaluru</SelectItem>
                    <SelectItem value="south">South Bengaluru</SelectItem>
                    <SelectItem value="east">East Bengaluru</SelectItem>
                    <SelectItem value="west">West Bengaluru</SelectItem>
                    <SelectItem value="central">Central Bengaluru</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Complete Address</Label>
                <Textarea
                  id="address"
                  {...form.register("address")}
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Property Specifications */}
          <div className="border-t border-border pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Property Specifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="builtUpArea">Built-up Area (sq ft)</Label>
                <Input
                  id="builtUpArea"
                  type="number"
                  {...form.register("builtUpArea", { valueAsNumber: true })}
                  placeholder="1850"
                />
              </div>

              <div>
                <Label htmlFor="landArea">Land Area (sq ft)</Label>
                <Input
                  id="landArea"
                  type="number"
                  {...form.register("landArea", { valueAsNumber: true })}
                  placeholder="2400"
                />
              </div>

              <div>
                <Label htmlFor="price">Price (₹ in Lakhs)</Label>
                <Input
                  id="price"
                  type="number"
                  {...form.register("price", { valueAsNumber: true })}
                  placeholder="120"
                />
              </div>

              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Select onValueChange={(value) => form.setValue("bedrooms", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-bhk">1 BHK</SelectItem>
                    <SelectItem value="2-bhk">2 BHK</SelectItem>
                    <SelectItem value="3-bhk">3 BHK</SelectItem>
                    <SelectItem value="4-bhk">4 BHK</SelectItem>
                    <SelectItem value="5-bhk">5+ BHK</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="possessionDate">Possession Date</Label>
                <Input
                  id="possessionDate"
                  type="month"
                  {...form.register("possessionDate")}
                />
              </div>

              <div>
                <Label htmlFor="reraNumber">RERA Number</Label>
                <Input
                  id="reraNumber"
                  {...form.register("reraNumber")}
                  placeholder="PRM/KA/RERA/1251/309/AG/2020-21"
                />
              </div>
            </div>
          </div>

          {/* Property Tags */}
          <div className="border-t border-border pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Property Tags & Features</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {propertyTags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag.id}
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={(checked) => handleTagChange(tag.id, checked as boolean)}
                  />
                  <Label htmlFor={tag.id} className="text-sm">
                    {tag.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-border pt-6 flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPropertyMutation.isPending}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {createPropertyMutation.isPending ? "Saving..." : "Save Property"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
