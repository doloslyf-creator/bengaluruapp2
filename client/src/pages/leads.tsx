import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Phone, Mail, MapPin, TrendingUp, Users, Target, Award, Eye, Plus, Filter, LogOut } from "lucide-react";
import type { Lead, LeadWithDetails, LeadStats } from "@shared/schema";

const statusColors = {
  "new": "bg-blue-100 text-blue-800",
  "contacted": "bg-yellow-100 text-yellow-800", 
  "qualified": "bg-green-100 text-green-800",
  "demo-scheduled": "bg-purple-100 text-purple-800",
  "proposal-sent": "bg-orange-100 text-orange-800",
  "negotiation": "bg-red-100 text-red-800",
  "closed-won": "bg-emerald-100 text-emerald-800",
  "closed-lost": "bg-gray-100 text-gray-800",
  "follow-up": "bg-indigo-100 text-indigo-800"
};

const priorityColors = {
  "high": "bg-red-100 text-red-800",
  "medium": "bg-yellow-100 text-yellow-800",
  "low": "bg-green-100 text-green-800"
};

const leadTypeColors = {
  "hot": "bg-red-100 text-red-800",
  "warm": "bg-yellow-100 text-yellow-800", 
  "cold": "bg-blue-100 text-blue-800"
};

export default function LeadsPage() {
  const [selectedLead, setSelectedLead] = useState<LeadWithDetails | null>(null);
  const [filters, setFilters] = useState({
    status: "all",
    leadType: "all",
    priority: "all",
    source: "all"
  });
  const [searchTerm, setSearchTerm] = useState("");
  
  const { logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch leads with filters
  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads", filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") queryParams.append(key, value);
      });
      return await apiRequest(`/api/leads?${queryParams}`);
    }
  });

  // Fetch lead statistics
  const { data: stats } = useQuery<LeadStats>({
    queryKey: ["/api/leads/stats"],
    queryFn: async () => await apiRequest("/api/leads/stats")
  });

  // Fetch selected lead details
  const { data: leadDetails } = useQuery<LeadWithDetails>({
    queryKey: ["/api/leads", selectedLead?.leadId],
    queryFn: async () => await apiRequest(`/api/leads/${selectedLead?.leadId}`),
    enabled: !!selectedLead?.leadId,
  });

  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, updates }: { leadId: string; updates: any }) => {
      return await apiRequest(`/api/leads/${leadId}`, {
        method: "PUT",
        body: updates,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/stats"] });
      toast({ title: "Lead updated successfully" });
    },
  });

  // Add lead activity mutation
  const addActivityMutation = useMutation({
    mutationFn: async ({ leadId, activity }: { leadId: string; activity: any }) => {
      return await apiRequest(`/api/leads/${leadId}/activities`, {
        method: "POST",
        body: activity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads", selectedLead?.leadId] });
      toast({ title: "Activity added successfully" });
    },
  });

  // Add lead note mutation
  const addNoteMutation = useMutation({
    mutationFn: async ({ leadId, note }: { leadId: string; note: any }) => {
      return await apiRequest(`/api/leads/${leadId}/notes`, {
        method: "POST",
        body: note,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads", selectedLead?.leadId] });
      toast({ title: "Note added successfully" });
    },
  });

  // Qualify lead mutation
  const qualifyLeadMutation = useMutation({
    mutationFn: async ({ leadId, qualified, notes }: { leadId: string; qualified: boolean; notes: string }) => {
      return await apiRequest(`/api/leads/${leadId}/qualify`, {
        method: "POST",
        body: { qualified, notes },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/stats"] });
      toast({ title: "Lead qualification updated" });
    },
  });

  // Filter leads based on search term
  const filteredLeads = leads.filter((lead: Lead) => 
    lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.propertyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
              <nav className="flex space-x-6">
                <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                  Properties
                </Link>
                <Link href="/leads" className="text-blue-600 font-medium">
                  Leads
                </Link>
                <Link href="/bookings" className="text-gray-600 hover:text-gray-900">
                  Bookings
                </Link>
                <Link href="/property-config" className="text-gray-600 hover:text-gray-900">
                  Configurations
                </Link>
              </nav>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLeads || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active leads in pipeline
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.hotLeads || 0}</div>
              <p className="text-xs text-muted-foreground">
                High priority prospects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Lead Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.avgLeadScore || 0}</div>
              <p className="text-xs text-muted-foreground">
                Quality indicator
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.conversionRate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Success rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="demo-scheduled">Demo Scheduled</SelectItem>
                  <SelectItem value="closed-won">Closed Won</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.leadType} onValueChange={(value) => setFilters(prev => ({ ...prev, leadType: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.source} onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="site-visit">Site Visit</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="property-inquiry">Property Inquiry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads List */}
        <Card>
          <CardHeader>
            <CardTitle>Leads ({filteredLeads.length})</CardTitle>
            <CardDescription>
              Manage and track your sales leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leadsLoading ? (
              <div className="text-center py-8">Loading leads...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No leads found. Leads will appear here when customers submit booking or consultation requests.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLeads.map((lead: Lead) => (
                  <div
                    key={lead.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{lead.customerName}</h3>
                          <Badge className={leadTypeColors[lead.leadType as keyof typeof leadTypeColors]}>
                            {lead.leadType}
                          </Badge>
                          <Badge className={priorityColors[lead.priority as keyof typeof priorityColors]}>
                            {lead.priority}
                          </Badge>
                          <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                            {lead.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {lead.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {lead.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {lead.propertyName}
                            </span>
                            <span>Source: {lead.source}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{lead.leadScore}</div>
                        <div className="text-sm text-gray-500">Lead Score</div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                    
                    {/* Lead Details Preview */}
                    <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>Created:</strong> {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Details:</strong> {lead.leadDetails && typeof lead.leadDetails === 'object' ? 
                            Object.entries(lead.leadDetails).slice(0, 2).map(([key, value]) => `${key}: ${value}`).join(', ') : 
                            'No details available'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead Details Dialog */}
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {leadDetails?.customerName}
                <Badge className={leadTypeColors[leadDetails?.leadType as keyof typeof leadTypeColors]}>
                  {leadDetails?.leadType}
                </Badge>
                <Badge className={priorityColors[leadDetails?.priority as keyof typeof priorityColors]}>
                  {leadDetails?.priority}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Lead ID: {leadDetails?.leadId}
              </DialogDescription>
            </DialogHeader>

            {leadDetails && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activities">Activities ({leadDetails.activities?.length || 0})</TabsTrigger>
                  <TabsTrigger value="notes">Notes ({leadDetails.notes?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {leadDetails.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {leadDetails.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {leadDetails.propertyName}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Lead Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div>Score: <span className="font-bold text-blue-600">{leadDetails.leadScore}</span></div>
                        <div>Status: <Badge className={statusColors[leadDetails.status as keyof typeof statusColors]}>{leadDetails.status}</Badge></div>
                        <div>Source: {leadDetails.source}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Lead Details</h4>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm">
                      {leadDetails.leadDetails && typeof leadDetails.leadDetails === 'object' ? (
                        Object.entries(leadDetails.leadDetails).map(([key, value]) => (
                          <div key={key} className="mb-2">
                            <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong> {value}
                          </div>
                        ))
                      ) : (
                        'No details available'
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activities" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Lead Activities</h4>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Activity
                    </Button>
                  </div>
                  
                  {leadDetails.activities && leadDetails.activities.length > 0 ? (
                    <div className="space-y-3">
                      {leadDetails.activities.map((activity: any, index: number) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">{activity.subject}</h5>
                              <p className="text-sm text-gray-600">{activity.description}</p>
                              {activity.nextAction && (
                                <p className="text-sm text-blue-600 mt-1">Next: {activity.nextAction}</p>
                              )}
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <div>{activity.performedBy}</div>
                              <div>{new Date(activity.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No activities recorded for this lead yet.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Lead Notes</h4>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>

                  {leadDetails.notes && leadDetails.notes.length > 0 ? (
                    <div className="space-y-3">
                      {leadDetails.notes.map((note: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium">{note.subject}</h5>
                            <div className="text-sm text-gray-500">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No notes added for this lead yet.
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}