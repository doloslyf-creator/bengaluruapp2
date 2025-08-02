import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Property, PropertyScore, InsertPropertyScore } from "@shared/schema";
import { Star, MapPin, Building2, Award, TrendingUp, Shield, Wrench, DollarSign, Users, Construction, Plus, Edit2, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";

interface ScoringField {
  key: keyof InsertPropertyScore;
  label: string;
  max: number;
  description: string;
}

const scoringCriteria = {
  location: {
    title: "Location Score (25 points total)",
    color: "bg-blue-500",
    fields: [
      { key: "transportConnectivity" as keyof InsertPropertyScore, label: "Transport Connectivity", max: 8, description: "Metro, bus routes, major roads access" },
      { key: "infrastructureDevelopment" as keyof InsertPropertyScore, label: "Infrastructure Development", max: 7, description: "Upcoming projects, government investments" },
      { key: "socialInfrastructure" as keyof InsertPropertyScore, label: "Social Infrastructure", max: 5, description: "Schools, hospitals, shopping centers" },
      { key: "employmentHubs" as keyof InsertPropertyScore, label: "Employment Hubs", max: 5, description: "IT parks, business districts proximity" }
    ] as ScoringField[]
  },
  amenities: {
    title: "Amenities & Features (20 points total)",
    color: "bg-green-500",
    fields: [
      { key: "basicAmenities" as keyof InsertPropertyScore, label: "Basic Amenities", max: 8, description: "Parking, security, power backup" },
      { key: "lifestyleAmenities" as keyof InsertPropertyScore, label: "Lifestyle Amenities", max: 7, description: "Gym, pool, clubhouse, gardens" },
      { key: "modernFeatures" as keyof InsertPropertyScore, label: "Modern Features", max: 5, description: "Smart home, eco-friendly features" }
    ] as ScoringField[]
  },
  legal: {
    title: "Legal & Compliance (20 points total)",
    color: "bg-purple-500",
    fields: [
      { key: "reraCompliance" as keyof InsertPropertyScore, label: "RERA Compliance", max: 8, description: "Approved, registered, compliant" },
      { key: "titleClarity" as keyof InsertPropertyScore, label: "Title Clarity", max: 7, description: "Clear title, no disputes" },
      { key: "approvals" as keyof InsertPropertyScore, label: "Approvals", max: 5, description: "Building permits, clearances" }
    ] as ScoringField[]
  },
  value: {
    title: "Value Proposition (15 points total)",
    color: "bg-orange-500",
    fields: [
      { key: "priceCompetitiveness" as keyof InsertPropertyScore, label: "Price Competitiveness", max: 8, description: "Below/at/above area average" },
      { key: "appreciationPotential" as keyof InsertPropertyScore, label: "Appreciation Potential", max: 4, description: "Historical trends, future prospects" },
      { key: "rentalYield" as keyof InsertPropertyScore, label: "Rental Yield", max: 3, description: "Current rental market potential" }
    ] as ScoringField[]
  },
  developer: {
    title: "Developer Credibility (10 points total)",
    color: "bg-red-500",
    fields: [
      { key: "trackRecord" as keyof InsertPropertyScore, label: "Track Record", max: 5, description: "Previous projects, delivery timeline" },
      { key: "financialStability" as keyof InsertPropertyScore, label: "Financial Stability", max: 3, description: "Company rating, market presence" },
      { key: "customerSatisfaction" as keyof InsertPropertyScore, label: "Customer Satisfaction", max: 2, description: "Reviews, complaints, reputation" }
    ] as ScoringField[]
  },
  construction: {
    title: "Construction Quality (10 points total)",
    color: "bg-indigo-500",
    fields: [
      { key: "structuralQuality" as keyof InsertPropertyScore, label: "Structural Quality", max: 5, description: "Foundation, materials, design" },
      { key: "finishingStandards" as keyof InsertPropertyScore, label: "Finishing Standards", max: 3, description: "Flooring, fixtures, paint quality" },
      { key: "maintenanceStandards" as keyof InsertPropertyScore, label: "Maintenance Standards", max: 2, description: "Common areas, upkeep" }
    ] as ScoringField[]
  }
};

const getGradeColor = (grade: string) => {
  switch (grade) {
    case "A+": return "bg-green-100 text-green-800 border-green-200";
    case "A": return "bg-green-100 text-green-700 border-green-200";
    case "B+": return "bg-blue-100 text-blue-800 border-blue-200";
    case "B": return "bg-blue-100 text-blue-700 border-blue-200";
    case "C+": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "C": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "D": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function PropertyScoring() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [scoringData, setScoringData] = useState<Partial<InsertPropertyScore>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch properties
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/properties"]
  });

  // Fetch all property scores
  const { data: propertyScores = [], isLoading: scoresLoading } = useQuery({
    queryKey: ["/api/property-scores"]
  });

  // Create or update property score mutation
  const scoreMutation = useMutation({
    mutationFn: async (data: InsertPropertyScore) => {
      if (isEditMode && selectedProperty) {
        // Find existing score for this property
        const existingScore = propertyScores.find(s => s.propertyId === selectedProperty.id);
        if (existingScore) {
          return apiRequest("PATCH", `/api/property-scores/${existingScore.id}`, data);
        }
      }
      return apiRequest("POST", "/api/property-scores", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-scores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Success",
        description: `Property score ${isEditMode ? 'updated' : 'created'} successfully`,
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} property score`,
        variant: "destructive",
      });
    }
  });

  // Delete property score mutation
  const deleteMutation = useMutation({
    mutationFn: async (scoreId: string) => {
      return apiRequest("DELETE", `/api/property-scores/${scoreId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-scores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Success",
        description: "Property score deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete property score",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setSelectedProperty(null);
    setScoringData({});
    setIsEditMode(false);
  };

  const openCreateDialog = (property: Property) => {
    setSelectedProperty(property);
    setIsEditMode(false);
    setScoringData({ propertyId: property.id, scoredBy: "Admin" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (property: Property, score: PropertyScore) => {
    setSelectedProperty(property);
    setIsEditMode(true);
    setScoringData(score);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!selectedProperty || !scoringData.propertyId) return;
    
    scoreMutation.mutate(scoringData as InsertPropertyScore);
  };

  const updateScoringField = (field: keyof InsertPropertyScore, value: number | string) => {
    setScoringData(prev => ({ ...prev, [field]: value }));
  };

  const calculateCategoryTotal = (categoryKey: string) => {
    const category = scoringCriteria[categoryKey as keyof typeof scoringCriteria];
    return category.fields.reduce((total, field) => total + (scoringData[field.key] as number || 0), 0);
  };

  const calculateOverallTotal = () => {
    return Object.keys(scoringCriteria).reduce((total, categoryKey) => total + calculateCategoryTotal(categoryKey), 0);
  };

  // Get properties with their scores
  const propertiesWithScores = properties.map(property => {
    const score = propertyScores.find(s => s.propertyId === property.id);
    return { property, score };
  });

  if (propertiesLoading || scoresLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AdminLayout title="Property Scoring">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Property Scoring</h1>
            <p className="text-gray-600">Comprehensive property evaluation and scoring system</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {propertyScores.length} Properties Scored
          </Badge>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">A+ Properties</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {propertyScores.filter(s => s.overallGrade === "A+").length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">Avg Score</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {propertyScores.length > 0 
                  ? Math.round(propertyScores.reduce((sum, s) => sum + s.overallScoreTotal, 0) / propertyScores.length)
                  : 0
                }
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-gray-600">Total Properties</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {properties.length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span className="text-sm text-gray-600">Needs Scoring</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {properties.length - propertyScores.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties List */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Properties & Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {propertiesWithScores.map(({ property, score }) => (
                <div key={property.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{property.name}</h3>
                        {score && (
                          <Badge className={getGradeColor(score.overallGrade || "D")}>
                            Grade {score.overallGrade}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.area}, {property.zone.charAt(0).toUpperCase() + property.zone.slice(1)}
                        </span>
                        <span className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          {property.developer}
                        </span>
                      </div>
                      {score && (
                        <div className="mt-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium">Overall Score:</span>
                            <span className="text-lg font-bold text-primary">{score.overallScoreTotal}/100</span>
                            <Progress value={score.overallScoreTotal} className="flex-1 max-w-xs" />
                          </div>
                          <div className="flex space-x-6 text-xs">
                            <span>Location: {score.locationScoreTotal}/25</span>
                            <span>Amenities: {score.amenitiesScoreTotal}/20</span>
                            <span>Legal: {score.legalScoreTotal}/20</span>
                            <span>Value: {score.valueScoreTotal}/15</span>
                            <span>Developer: {score.developerScoreTotal}/10</span>
                            <span>Construction: {score.constructionScoreTotal}/10</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {score ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openEditDialog(property, score)}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit Score
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteMutation.mutate(score.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => openCreateDialog(property)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Score
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      {/* Scoring Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit' : 'Create'} Property Score - {selectedProperty?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Overall Score Display */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {calculateOverallTotal()}/100
                  </div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                  <Progress value={calculateOverallTotal()} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            {/* Scoring Categories */}
            <Tabs defaultValue="location" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                {Object.entries(scoringCriteria).map(([key, category]) => (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(scoringCriteria).map(([categoryKey, category]) => (
                <TabsContent key={categoryKey} value={categoryKey} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{category.title}</h3>
                    <Badge variant="outline">
                      {calculateCategoryTotal(categoryKey)}/{category.fields.reduce((sum, f) => sum + f.max, 0)} points
                    </Badge>
                  </div>
                  
                  <div className="grid gap-4">
                    {category.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={field.key}>{field.label} (max {field.max})</Label>
                          <span className="text-sm text-gray-500">
                            {scoringData[field.key] || 0}/{field.max}
                          </span>
                        </div>
                        <Input
                          id={field.key}
                          type="number"
                          min="0"
                          max={field.max}
                          value={scoringData[field.key] || 0}
                          onChange={(e) => updateScoringField(field.key, parseInt(e.target.value) || 0)}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500">{field.description}</p>
                        
                        {/* Notes field */}
                        <Textarea
                          placeholder={`Notes for ${field.label.toLowerCase()}...`}
                          value={scoringData[`${field.key}Notes` as keyof InsertPropertyScore] as string || ""}
                          onChange={(e) => updateScoringField(`${field.key}Notes` as keyof InsertPropertyScore, e.target.value)}
                          className="text-sm"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Additional Fields */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Additional Insights</h3>
              
              <div>
                <Label htmlFor="keyStrengths">Key Strengths (comma-separated)</Label>
                <Input
                  id="keyStrengths"
                  placeholder="Modern amenities, great location, RERA approved..."
                  value={Array.isArray(scoringData.keyStrengths) ? scoringData.keyStrengths.join(", ") : ""}
                  onChange={(e) => updateScoringField("keyStrengths", e.target.value.split(", ").filter(s => s.trim()))}
                />
              </div>
              
              <div>
                <Label htmlFor="areasOfConcern">Areas of Concern (comma-separated)</Label>
                <Input
                  id="areasOfConcern"
                  placeholder="Traffic congestion, limited parking..."
                  value={Array.isArray(scoringData.areasOfConcern) ? scoringData.areasOfConcern.join(", ") : ""}
                  onChange={(e) => updateScoringField("areasOfConcern", e.target.value.split(", ").filter(s => s.trim()))}
                />
              </div>
              
              <div>
                <Label htmlFor="recommendationSummary">Recommendation Summary</Label>
                <Textarea
                  id="recommendationSummary"
                  placeholder="Overall recommendation and investment advice..."
                  value={scoringData.recommendationSummary || ""}
                  onChange={(e) => updateScoringField("recommendationSummary", e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 border-t pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={scoreMutation.isPending}
              >
                {scoreMutation.isPending ? 'Saving...' : (isEditMode ? 'Update Score' : 'Create Score')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}