import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Phone, Mail, MapPin, TrendingUp, Users, Target, Award, Eye, Plus, Filter } from "lucide-react";
import type { Lead, LeadWithDetails, LeadStats } from "@shared/schema";

const statusColors = {
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

const priorityColors = {
  "high": "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg border-red-200",
  "medium": "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg border-yellow-200",
  "low": "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border-green-200"
};

const leadTypeColors = {
  "hot": "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg animate-pulse",
  "warm": "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg", 
  "cold": "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
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
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch leads with filters
  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"]
  });

  // Fetch lead statistics
  const { data: stats } = useQuery<LeadStats>({
    queryKey: ["/api/leads/stats"]
  });

  // Fetch selected lead details
  const { data: leadDetails } = useQuery<LeadWithDetails>({
    queryKey: [`/api/leads/${selectedLead?.leadId}`],
    enabled: !!selectedLead?.leadId,
  });

  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: ({ leadId, updates }: { leadId: string; updates: any }) => {
      return apiRequest("PUT", `/api/leads/${leadId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/stats"] });
      toast({ title: "Lead updated successfully" });
    },
  });

  // Add lead activity mutation
  const addActivityMutation = useMutation({
    mutationFn: ({ leadId, activity }: { leadId: string; activity: any }) => {
      return apiRequest("POST", `/api/leads/${leadId}/activities`, activity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads", selectedLead?.leadId] });
      toast({ title: "Activity added successfully" });
    },
  });

  // Add lead note mutation
  const addNoteMutation = useMutation({
    mutationFn: ({ leadId, note }: { leadId: string; note: any }) => {
      return apiRequest("POST", `/api/leads/${leadId}/notes`, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads", selectedLead?.leadId] });
      toast({ title: "Note added successfully" });
    },
  });

  // Qualify lead mutation
  const qualifyLeadMutation = useMutation({
    mutationFn: ({ leadId, qualified, notes }: { leadId: string; qualified: boolean; notes: string }) => {
      return apiRequest("POST", `/api/leads/${leadId}/qualify`, { qualified, notes });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
              <p className="text-gray-600">Track and manage customer leads</p>
            </div>
            
            <div className="flex items-center gap-4">
              <nav className="flex space-x-8">
                <Link href="/" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link href="/analytics" className="text-gray-600 hover:text-gray-900">Analytics</Link>
                <Link href="/leads" className="text-violet-600 font-medium">Leads</Link>
                <Link href="/bookings" className="text-gray-600 hover:text-gray-900">Bookings</Link>
                <Link href="/property-config" className="text-gray-600 hover:text-gray-900">Configuration</Link>
              </nav>
              

            </div>
          </div>
        </div>
      </div>

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
                    onClick={() => setSelectedLead({...lead, activities: [], notes: []})}
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
                            setSelectedLead({...lead, activities: [], notes: []});
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
                          <strong>Created:</strong> {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
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