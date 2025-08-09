import { useState } from "react";
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
import { Plus, User, Phone, Mail, MapPin, DollarSign, Clock, Target } from "lucide-react";

interface CreateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateLeadDialog({ open, onOpenChange }: CreateLeadDialogProps) {
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

  const createLeadMutation = useMutation({
    mutationFn: (leadData: any) => apiRequest("POST", "/api/leads/enhanced", leadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads/enhanced"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/stats"] });
      onOpenChange(false);
      setFormData({
        customerName: "",
        email: "",
        phone: "",
        buyerPersona: "",
        urgency: "",
        budgetMin: "",
        budgetMax: "",
        propertyType: "",
        bhkPreference: "",
        preferredAreas: [],
        financing: "",
        hasPreApproval: false,
        buyingFor: "",
        wantsLegalSupport: false,
        seniorCitizenFriendly: false,
        preferredContactTime: "",
        notes: ""
      });
      toast({ title: "Success", description: "Lead created successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create lead",
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.email || !formData.phone) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const submitData = {
      ...formData,
      budgetMin: formData.budgetMin ? parseInt(formData.budgetMin) : null,
      budgetMax: formData.budgetMax ? parseInt(formData.budgetMax) : null,
      source: "walk-in",
      status: "new",
      createdBy: "admin",
      propertyName: "General Inquiry", // Required field
      interestedConfiguration: formData.bhkPreference || "any", // Required field
      budgetRange: formData.budgetMin && formData.budgetMax ? `${formData.budgetMin}L-${formData.budgetMax}L` : "TBD",
      preferredAreas: formData.preferredAreas || [],
      smartTags: [],
      amenitiesNeeded: [],
      interestedInReports: [],
      leadDetails: {
        personalizedNotes: formData.notes || "",
        keyNonNegotiables: []
      }
    };

    createLeadMutation.mutate(submitData);
  };

  const handleAreaAdd = (area: string) => {
    if (area && !formData.preferredAreas.includes(area)) {
      setFormData(prev => ({
        ...prev,
        preferredAreas: [...prev.preferredAreas, area]
      }));
    }
  };

  const handleAreaRemove = (area: string) => {
    setFormData(prev => ({
      ...prev,
      preferredAreas: prev.preferredAreas.filter(a => a !== area)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Enhanced Lead
          </DialogTitle>
          <DialogDescription>
            Add a new lead with persona-specific details and advanced tracking
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
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
                required
                data-testid="input-customer-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                required
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone *
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
                required
                data-testid="input-phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredContactTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Preferred Contact Time
              </Label>
              <Select 
                value={formData.preferredContactTime} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, preferredContactTime: value }))}
              >
                <SelectTrigger id="preferredContactTime" data-testid="select-contact-time">
                  <SelectValue placeholder="Select preferred time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                  <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
                  <SelectItem value="anytime">Any time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Buyer Persona & Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyerPersona" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Buyer Persona
              </Label>
              <Select 
                value={formData.buyerPersona} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, buyerPersona: value }))}
              >
                <SelectTrigger id="buyerPersona" data-testid="select-buyer-persona">
                  <SelectValue placeholder="Select buyer persona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="end-user-family">End-User Family</SelectItem>
                  <SelectItem value="nri-investor">NRI Investor</SelectItem>
                  <SelectItem value="first-time-buyer">First-Time Buyer</SelectItem>
                  <SelectItem value="senior-buyer">Senior Buyer</SelectItem>
                  <SelectItem value="working-couple">Working Couple</SelectItem>
                  <SelectItem value="research-oriented">Research-Oriented</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Purchase Urgency</Label>
              <Select 
                value={formData.urgency} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}
              >
                <SelectTrigger id="urgency" data-testid="select-urgency">
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate (Within 1 month)</SelectItem>
                  <SelectItem value="3-6-months">3-6 Months</SelectItem>
                  <SelectItem value="6-12-months">6-12 Months</SelectItem>
                  <SelectItem value="exploratory">Exploratory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Budget Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetMin" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Budget Min (Lakhs)
              </Label>
              <Input
                id="budgetMin"
                type="number"
                value={formData.budgetMin}
                onChange={(e) => setFormData(prev => ({ ...prev, budgetMin: e.target.value }))}
                placeholder="Minimum budget"
                data-testid="input-budget-min"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetMax">Budget Max (Lakhs)</Label>
              <Input
                id="budgetMax"
                type="number"
                value={formData.budgetMax}
                onChange={(e) => setFormData(prev => ({ ...prev, budgetMax: e.target.value }))}
                placeholder="Maximum budget"
                data-testid="input-budget-max"
              />
            </div>
          </div>

          {/* Property Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select 
                value={formData.propertyType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}
              >
                <SelectTrigger id="propertyType" data-testid="select-property-type">
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
              <Select 
                value={formData.bhkPreference} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, bhkPreference: value }))}
              >
                <SelectTrigger id="bhkPreference" data-testid="select-bhk">
                  <SelectValue placeholder="Select BHK" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1bhk">1 BHK</SelectItem>
                  <SelectItem value="2bhk">2 BHK</SelectItem>
                  <SelectItem value="3bhk">3 BHK</SelectItem>
                  <SelectItem value="4bhk">4 BHK</SelectItem>
                  <SelectItem value="5bhk+">5+ BHK</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Financing & Support */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="financing">Financing Method</Label>
              <Select 
                value={formData.financing} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, financing: value }))}
              >
                <SelectTrigger id="financing" data-testid="select-financing">
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

            <div className="space-y-2">
              <Label htmlFor="buyingFor">Buying For</Label>
              <Select 
                value={formData.buyingFor} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, buyingFor: value }))}
              >
                <SelectTrigger id="buyingFor" data-testid="select-buying-for">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Self</SelectItem>
                  <SelectItem value="parents">Parents</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="resale-flip">Resale Flip</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPreApproval"
                checked={formData.hasPreApproval}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasPreApproval: !!checked }))}
                data-testid="checkbox-pre-approval"
              />
              <Label htmlFor="hasPreApproval">Has Loan Pre-approval</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="wantsLegalSupport"
                checked={formData.wantsLegalSupport}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, wantsLegalSupport: !!checked }))}
                data-testid="checkbox-legal-support"
              />
              <Label htmlFor="wantsLegalSupport">Wants Legal Support</Label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="seniorCitizenFriendly"
              checked={formData.seniorCitizenFriendly}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, seniorCitizenFriendly: !!checked }))}
              data-testid="checkbox-senior-friendly"
            />
            <Label htmlFor="seniorCitizenFriendly">Senior Citizen Friendly Requirements</Label>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information about the lead..."
              rows={3}
              data-testid="textarea-notes"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createLeadMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              data-testid="button-submit-lead"
            >
              {createLeadMutation.isPending ? "Creating..." : "Create Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}