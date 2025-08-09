import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Search, 
  Eye, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  DollarSign,
  Clock,
  User,
  UserPlus,
  Building,
  FileText,
  MessageSquare,
  Filter,
  Star,
  CheckCircle,
  AlertCircle,
  Users,
  Target,
  BookOpen,
  ShoppingCart,
  Send,
  BarChart3,
  Plus,
  Download,
  Upload,
  Settings,
  RefreshCw,
  CalendarDays,
  PieChart,
  Activity,
  UserCheck,
  Zap,
  Heart,
  Briefcase,
  MoreHorizontal,
  Home,
  TrendingUp as Investment,
  Baby,
  GraduationCap,
  Smartphone,
  Brain,
  Tag,
  Pin,
  FileImage,
  Clock as Timeline
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";
import CreateLeadDialog from "./create-lead-dialog";
import type { Lead, LeadWithDetails, LeadStats } from "@shared/schema";

// Buyer persona configurations
const BUYER_PERSONAS = {
  "end-user-family": { icon: Home, label: "End-User Family", color: "bg-blue-500" },
  "nri-investor": { icon: Investment, label: "NRI Investor", color: "bg-green-500" },
  "first-time-buyer": { icon: Baby, label: "First-Time Buyer", color: "bg-yellow-500" },
  "senior-buyer": { icon: GraduationCap, label: "Senior Buyer", color: "bg-purple-500" },
  "working-couple": { icon: Briefcase, label: "Working Couple", color: "bg-orange-500" },
  "research-oriented": { icon: Brain, label: "Research-Oriented", color: "bg-indigo-500" }
};

const URGENCY_COLORS = {
  "immediate": "bg-red-500 text-white animate-pulse",
  "3-6-months": "bg-yellow-500 text-white",
  "6-12-months": "bg-blue-500 text-white",
  "exploratory": "bg-gray-400 text-white"
};

const STATUS_COLORS = {
  "new": "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg",
  "contacted": "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg", 
  "qualified": "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg",
  "demo-scheduled": "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg",
  "proposal-sent": "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg",
  "negotiation": "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg",
  "closed-won": "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg",
  "closed-lost": "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg",
  "follow-up": "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg"
};

interface SmartFilters {
  persona: string;
  urgency: string;
  budget: string;
  status: string;
  smartTags: string[];
  assignedTo: string;
  dateRange: string;
}

export default function EnhancedLeads() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<LeadWithDetails | null>(null);
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [showCreateLeadDialog, setShowCreateLeadDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [newNote, setNewNote] = useState("");
  const [smartFilters, setSmartFilters] = useState<SmartFilters>({
    persona: "all",
    urgency: "all", 
    budget: "all",
    status: "all",
    smartTags: [],
    assignedTo: "all",
    dateRange: "all"
  });

  // Fetch leads with enhanced filters
  const { data: leads = [], isLoading } = useQuery<LeadWithDetails[]>({
    queryKey: ["/api/leads/enhanced", smartFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(smartFilters).forEach(([key, value]) => {
        if (value !== "all" && value !== "" && value.length > 0) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value);
          }
        }
      });
      const result = await apiRequest("GET", `/api/leads/enhanced?${params.toString()}`);
      console.log("Enhanced leads data:", result);
      return result;
    }
  });

  const { data: stats } = useQuery<LeadStats>({
    queryKey: ["/api/leads/stats"],
  });

  // Filter leads based on search query
  const filteredLeads = useMemo(() => {
    const leadsArray = Array.isArray(leads) ? leads : [];
    if (!searchQuery) return leadsArray;
    const query = searchQuery.toLowerCase();
    return leadsArray.filter(lead => 
      lead.customerName.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.phone.includes(query) ||
      lead.leadId.toLowerCase().includes(query) ||
      lead.propertyName?.toLowerCase().includes(query)
    );
  }, [leads, searchQuery]);

  // Smart tag suggestions
  const smartTagOptions = [
    "hot-lead", "ready-to-visit", "needs-legal-handholding", "first-time-buyer",
    "high-budget", "urgent", "research-intensive", "family-focused", "investment-focused"
  ];

  // Create new lead mutation
  const createLeadMutation = useMutation({
    mutationFn: (leadData: any) => apiRequest("POST", "/api/leads/enhanced", leadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads/enhanced"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/stats"] });
      setShowCreateLeadDialog(false);
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

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: ({ leadId, note }: { leadId: string; note: any }) => 
      apiRequest("POST", `/api/leads/${leadId}/notes`, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads/enhanced"] });
      setNewNote("");
      toast({ title: "Success", description: "Note added successfully" });
    }
  });

  const renderPersonaIcon = (persona: string | null) => {
    if (!persona || !BUYER_PERSONAS[persona as keyof typeof BUYER_PERSONAS]) {
      return <User className="w-4 h-4" />;
    }
    const { icon: IconComponent, color } = BUYER_PERSONAS[persona as keyof typeof BUYER_PERSONAS];
    return (
      <div className={`p-1 rounded-full ${color}`}>
        <IconComponent className="w-3 h-3 text-white" />
      </div>
    );
  };

  const renderSmartTags = (tags: string[]) => {
    return tags.map(tag => (
      <Badge key={tag} variant="secondary" className="text-xs">
        <Tag className="w-3 h-3 mr-1" />
        {tag}
      </Badge>
    ));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Enhanced Lead Management</h1>
            <p className="text-gray-600 mt-2">
              Persona-driven lead management with advanced tracking and insights
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateLeadDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            data-testid="button-create-lead"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Lead
          </Button>
        </div>

        {/* Stats Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Leads</p>
                    <p className="text-3xl font-bold text-blue-800" data-testid="text-total-leads">
                      {stats.totalLeads}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">Hot Leads</p>
                    <p className="text-3xl font-bold text-red-800" data-testid="text-hot-leads">
                      {stats.hotLeads}
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Qualified</p>
                    <p className="text-3xl font-bold text-green-800" data-testid="text-qualified-leads">
                      {stats.qualifiedLeads}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Conversion Rate</p>
                    <p className="text-3xl font-bold text-purple-800" data-testid="text-conversion-rate">
                      {stats.conversionRate}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Smart Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Smart Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="filter-persona">Buyer Persona</Label>
                <Select 
                  value={smartFilters.persona} 
                  onValueChange={(value) => setSmartFilters(prev => ({ ...prev, persona: value }))}
                >
                  <SelectTrigger id="filter-persona" data-testid="select-persona-filter">
                    <SelectValue placeholder="All Personas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Personas</SelectItem>
                    {Object.entries(BUYER_PERSONAS).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-urgency">Urgency</Label>
                <Select 
                  value={smartFilters.urgency} 
                  onValueChange={(value) => setSmartFilters(prev => ({ ...prev, urgency: value }))}
                >
                  <SelectTrigger id="filter-urgency" data-testid="select-urgency-filter">
                    <SelectValue placeholder="All Urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Urgency</SelectItem>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="3-6-months">3-6 Months</SelectItem>
                    <SelectItem value="6-12-months">6-12 Months</SelectItem>
                    <SelectItem value="exploratory">Exploratory</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-status">Status</Label>
                <Select 
                  value={smartFilters.status} 
                  onValueChange={(value) => setSmartFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger id="filter-status" data-testid="select-status-filter">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="demo-scheduled">Demo Scheduled</SelectItem>
                    <SelectItem value="proposal-sent">Proposal Sent</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed-won">Closed Won</SelectItem>
                    <SelectItem value="closed-lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-leads"
                  />
                </div>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSmartFilters({
                      persona: "all",
                      urgency: "all",
                      budget: "all", 
                      status: "all",
                      smartTags: [],
                      assignedTo: "all",
                      dateRange: "all"
                    });
                    setSearchQuery("");
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Leads ({filteredLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading enhanced leads...</p>
                </div>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-center">
                  <p className="text-gray-600 mb-2">No leads found</p>
                  <p className="text-sm text-gray-500">Try adjusting your filters or create a new lead</p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Persona</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Smart Tags</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium" data-testid={`text-lead-name-${lead.id}`}>
                            {lead.customerName}
                          </div>
                          <div className="text-sm text-gray-500" data-testid={`text-lead-id-${lead.id}`}>
                            {lead.leadId}
                          </div>
                          <div className="text-xs text-gray-400">
                            {format(new Date(lead.createdAt), "MMM dd, yyyy")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderPersonaIcon(lead.buyerPersona)}
                          <span className="text-sm">
                            {lead.buyerPersona ? 
                              BUYER_PERSONAS[lead.buyerPersona as keyof typeof BUYER_PERSONAS]?.label : 
                              "Not Set"
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {lead.budgetMin && lead.budgetMax ? 
                            `₹${lead.budgetMin}L - ₹${lead.budgetMax}L` :
                            lead.budgetRange || "Not specified"
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.urgency && (
                          <Badge className={URGENCY_COLORS[lead.urgency as keyof typeof URGENCY_COLORS]}>
                            {lead.urgency.replace("-", " ")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[lead.status as keyof typeof STATUS_COLORS]}>
                          {lead.status.replace("-", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${lead.leadScore || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{lead.leadScore || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {lead.smartTags && renderSmartTags(lead.smartTags)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowLeadDialog(true);
                          }}
                          data-testid={`button-view-lead-${lead.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Create Lead Dialog */}
        <CreateLeadDialog 
          open={showCreateLeadDialog} 
          onOpenChange={setShowCreateLeadDialog} 
        />

        {/* Lead Details Dialog */}
        <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedLead && renderPersonaIcon(selectedLead.buyerPersona)}
                Lead Details: {selectedLead?.customerName}
              </DialogTitle>
              <DialogDescription>
                {selectedLead?.leadId} • Created {selectedLead && format(new Date(selectedLead.createdAt), "MMM dd, yyyy")}
              </DialogDescription>
            </DialogHeader>
            
            {selectedLead && (
              <Tabs defaultValue="profile" className="mt-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  <TabsTrigger value="activities">Activities</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{selectedLead.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{selectedLead.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{selectedLead.email}</span>
                        </div>
                        {selectedLead.preferredContactTime && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Preferred: {selectedLead.preferredContactTime}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Buyer Profile</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {selectedLead.buyerPersona && (
                          <div className="flex items-center gap-2">
                            {renderPersonaIcon(selectedLead.buyerPersona)}
                            <span>{BUYER_PERSONAS[selectedLead.buyerPersona as keyof typeof BUYER_PERSONAS]?.label}</span>
                          </div>
                        )}
                        {selectedLead.buyingFor && (
                          <div>
                            <span className="font-medium">Buying for:</span> {selectedLead.buyingFor}
                          </div>
                        )}
                        {selectedLead.urgency && (
                          <div>
                            <Badge className={URGENCY_COLORS[selectedLead.urgency as keyof typeof URGENCY_COLORS]}>
                              {selectedLead.urgency.replace("-", " ")}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Budget & Financing</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {(selectedLead.budgetMin && selectedLead.budgetMax) ? (
                          <div>
                            <span className="font-medium">Budget Range:</span> ₹{selectedLead.budgetMin}L - ₹{selectedLead.budgetMax}L
                          </div>
                        ) : selectedLead.budgetRange && (
                          <div>
                            <span className="font-medium">Budget:</span> {selectedLead.budgetRange}
                          </div>
                        )}
                        {selectedLead.financing && (
                          <div>
                            <span className="font-medium">Financing:</span> {selectedLead.financing}
                          </div>
                        )}
                        {selectedLead.hasPreApproval !== null && (
                          <div>
                            <span className="font-medium">Pre-approval:</span> {selectedLead.hasPreApproval ? "Yes" : "No"}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Property Preferences</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {selectedLead.propertyType && (
                          <div>
                            <span className="font-medium">Type:</span> {selectedLead.propertyType}
                          </div>
                        )}
                        {selectedLead.bhkPreference && (
                          <div>
                            <span className="font-medium">BHK:</span> {selectedLead.bhkPreference}
                          </div>
                        )}
                        {selectedLead.preferredAreas && selectedLead.preferredAreas.length > 0 && (
                          <div>
                            <span className="font-medium">Areas:</span> {selectedLead.preferredAreas.join(", ")}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="activities" className="space-y-4">
                  <div className="space-y-2">
                    {selectedLead.activities?.map((activity) => (
                      <Card key={activity.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Activity className="w-4 h-4" />
                              <span className="font-medium">{activity.subject}</span>
                              <Badge variant="outline">{activity.activityType}</Badge>
                            </div>
                            {activity.description && (
                              <p className="text-sm text-gray-600">{activity.description}</p>
                            )}
                            {activity.outcome && (
                              <Badge className="mt-2" variant={activity.outcome === "positive" ? "default" : "secondary"}>
                                {activity.outcome}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(activity.createdAt), "MMM dd, HH:mm")}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a note about this lead..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="flex-1"
                        data-testid="textarea-new-note"
                      />
                      <Button
                        onClick={() => {
                          if (newNote.trim() && selectedLead) {
                            addNoteMutation.mutate({
                              leadId: selectedLead.id,
                              note: { content: newNote, noteType: "general" }
                            });
                          }
                        }}
                        disabled={!newNote.trim() || addNoteMutation.isPending}
                        data-testid="button-add-note"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {selectedLead.notes?.map((note) => (
                        <Card key={note.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {note.title && (
                                <h4 className="font-medium mb-1">{note.title}</h4>
                              )}
                              <p className="text-sm">{note.content}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">{note.noteType}</Badge>
                                {note.isPinned && <Pin className="w-3 h-3 text-yellow-500" />}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(note.createdAt), "MMM dd, HH:mm")}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Timeline className="w-4 h-4" />
                      Lead journey timeline will be implemented here
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}