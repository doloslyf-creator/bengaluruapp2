import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Edit, User, Phone, Mail, MapPin, DollarSign, Clock, Target } from "lucide-react";

interface EditLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: any;
}

export default function EditLeadDialog({ open, onOpenChange, lead }: EditLeadDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    buyerPersona: "",
    urgency: "",
    budgetMin: "",
    budgetMax: "",
    propertyType: "",
    bhkPreference: "",
    preferredAreas: [] as string[],
    financing: "",
    hasPreApproval: false,
    buyingFor: "",
    wantsLegalSupport: false,
    seniorCitizenFriendly: false,
    preferredContactTime: "",
    notes: ""
  });

  // Populate form with existing lead data when dialog opens
  useEffect(() => {
    if (lead && open) {
      setFormData({
        customerName: lead.customerName || "",
        email: lead.email || "",
        phone: lead.phone || "",
        buyerPersona: lead.buyerPersona || "",
        urgency: lead.urgency || "",
        budgetMin: lead.budgetMin?.toString() || "",
        budgetMax: lead.budgetMax?.toString() || "",
        propertyType: lead.propertyType || "",
        bhkPreference: lead.bhkPreference || "",
        preferredAreas: lead.preferredAreas || [],
        financing: lead.financing || "",
        hasPreApproval: lead.hasPreApproval || false,
        buyingFor: lead.buyingFor || "",
        wantsLegalSupport: lead.wantsLegalSupport || false,
        seniorCitizenFriendly: lead.seniorCitizenFriendly || false,
        preferredContactTime: lead.preferredContactTime || "",
        notes: lead.notes || ""
      });
    }
  }, [lead, open]);

  const updateLeadMutation = useMutation({
    mutationFn: async (leadData: any) => {
      const response = await apiRequest("PUT", `/api/leads/enhanced/${lead.id}`, leadData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads/enhanced"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/stats"] });
      onOpenChange(false);
      toast({ title: "Success", description: "Lead updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update lead",
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      budgetMin: formData.budgetMin ? parseInt(formData.budgetMin) : undefined,
      budgetMax: formData.budgetMax ? parseInt(formData.budgetMax) : undefined,
      // Convert empty strings to undefined for enum fields
      buyerPersona: formData.buyerPersona || undefined,
      urgency: formData.urgency || undefined,
      propertyType: formData.propertyType || undefined,
      financing: formData.financing || undefined,
      buyingFor: formData.buyingFor || undefined,
      preferredContactTime: formData.preferredContactTime || undefined
    };

    updateLeadMutation.mutate(submitData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAreaChange = (area: string) => {
    setFormData(prev => ({
      ...prev,
      preferredAreas: prev.preferredAreas.includes(area)
        ? prev.preferredAreas.filter(a => a !== area)
        : [...prev.preferredAreas, area]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            Edit Lead: {lead?.customerName}
          </DialogTitle>
          <DialogDescription>
            Update lead information and preferences
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Name *
              </Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleInputChange("customerName", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number *
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredContactTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Preferred Contact Time
              </Label>
              <Input
                id="preferredContactTime"
                value={formData.preferredContactTime}
                onChange={(e) => handleInputChange("preferredContactTime", e.target.value)}
                placeholder="e.g., 9 AM - 6 PM"
              />
            </div>
          </div>

          {/* Customer Persona & Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyerPersona">Buyer Persona</Label>
              <Select value={formData.buyerPersona} onValueChange={(value) => handleInputChange("buyerPersona", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select buyer persona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="end-user-family">End User Family</SelectItem>
                  <SelectItem value="nri-investor">NRI Investor</SelectItem>
                  <SelectItem value="first-time-buyer">First-time Buyer</SelectItem>
                  <SelectItem value="senior-buyer">Senior Buyer</SelectItem>
                  <SelectItem value="working-couple">Working Couple</SelectItem>
                  <SelectItem value="research-oriented">Research Oriented</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency</Label>
              <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate (within 1 month)</SelectItem>
                  <SelectItem value="3-6-months">3-6 months</SelectItem>
                  <SelectItem value="6-12-months">6-12 months</SelectItem>
                  <SelectItem value="exploratory">Exploratory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetMin" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Minimum Budget (₹)
              </Label>
              <Input
                id="budgetMin"
                type="number"
                value={formData.budgetMin}
                onChange={(e) => handleInputChange("budgetMin", e.target.value)}
                placeholder="e.g., 5000000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budgetMax" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Maximum Budget (₹)
              </Label>
              <Input
                id="budgetMax"
                type="number"
                value={formData.budgetMax}
                onChange={(e) => handleInputChange("budgetMax", e.target.value)}
                placeholder="e.g., 10000000"
              />
            </div>
          </div>

          {/* Property Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="plot">Plot</SelectItem>
                  <SelectItem value="duplex">Duplex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bhkPreference">BHK Preference</Label>
              <Input
                id="bhkPreference"
                value={formData.bhkPreference}
                onChange={(e) => handleInputChange("bhkPreference", e.target.value)}
                placeholder="e.g., 3BHK, 4BHK"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyingFor">Buying For</Label>
              <Select value={formData.buyingFor} onValueChange={(value) => handleInputChange("buyingFor", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Self</SelectItem>
                  <SelectItem value="parents">Parents</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="resale-flip">Resale/Flip</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Financing */}
          <div className="space-y-2">
            <Label htmlFor="financing">Financing Method</Label>
            <Select value={formData.financing} onValueChange={(value) => handleInputChange("financing", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select financing method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="own-funds">Own Funds</SelectItem>
                <SelectItem value="bank-loan">Bank Loan</SelectItem>
                <SelectItem value="inheritance">Inheritance</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Areas */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Preferred Areas
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4 border rounded-md">
              {["Whitefield", "Sarjapur", "Electronic City", "Hebbal", "Marathahalli", "Koramangala", "HSR Layout", "Yelahanka"].map((area) => (
                <div key={area} className="flex items-center space-x-2">
                  <Checkbox
                    id={area}
                    checked={formData.preferredAreas.includes(area)}
                    onCheckedChange={() => handleAreaChange(area)}
                  />
                  <Label htmlFor={area} className="text-sm">{area}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Special Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPreApproval"
                checked={formData.hasPreApproval}
                onCheckedChange={(checked) => handleInputChange("hasPreApproval", checked)}
              />
              <Label htmlFor="hasPreApproval">Has Loan Pre-approval</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="wantsLegalSupport"
                checked={formData.wantsLegalSupport}
                onCheckedChange={(checked) => handleInputChange("wantsLegalSupport", checked)}
              />
              <Label htmlFor="wantsLegalSupport">Wants Legal Support</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="seniorCitizenFriendly"
                checked={formData.seniorCitizenFriendly}
                onCheckedChange={(checked) => handleInputChange("seniorCitizenFriendly", checked)}
              />
              <Label htmlFor="seniorCitizenFriendly">Senior Citizen Friendly</Label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any additional information about the lead..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateLeadMutation.isPending}
              className="bg-[#004445] hover:bg-[#002223] text-white"
            >
              {updateLeadMutation.isPending ? "Updating..." : "Update Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}