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
    queryFn: () => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") queryParams.append(key, value);
      });
      return apiRequest(`/api/leads?${queryParams}`);
    }
  });

  // Fetch lead statistics
  const { data: stats } = useQuery<LeadStats>({
    queryKey: ["/api/leads/stats"]
  });

  // Fetch selected lead details
  const { data: leadDetails } = useQuery<LeadWithDetails>({
    queryKey: ["/api/leads", selectedLead?.leadId],
    queryFn: () => apiRequest(`/api/leads/${selectedLead?.leadId}`),
    enabled: !!selectedLead?.leadId
  });

  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: ({ leadId, updates }: { leadId: string; updates: any }) =>
      apiRequest(`/api/leads/${leadId}`, { method: "PATCH", body: updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Lead updated successfully" });
    }
  });

  // Add activity mutation
  const addActivityMutation = useMutation({
    mutationFn: ({ leadId, activity }: { leadId: string; activity: any }) =>
      apiRequest(`/api/leads/${leadId}/activities`, { method: "POST", body: activity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Activity added successfully" });
    }
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: ({ leadId, note }: { leadId: string; note: any }) =>
      apiRequest(`/api/leads/${leadId}/notes`, { method: "POST", body: note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Note added successfully" });
    }
  });

  // Qualify lead mutation
  const qualifyLeadMutation = useMutation({
    mutationFn: ({ leadId, qualified, notes }: { leadId: string; qualified: boolean; notes: string }) =>
      apiRequest(`/api/leads/${leadId}/qualify`, { method: "POST", body: { qualified, notes } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Lead qualification updated" });
    }
  });

  // Filter leads by search term
  const filteredLeads = leads.filter(lead =>
    searchTerm === "" || 
    lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.propertyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (leadId: string, status: string) => {
    updateLeadMutation.mutate({ leadId, updates: { status } });
  };

  const handleAddActivity = (leadId: string, activity: any) => {
    addActivityMutation.mutate({ leadId, activity: { ...activity, performedBy: "admin" } });
  };

  const handleAddNote = (leadId: string, note: any) => {
    addNoteMutation.mutate({ leadId, note: { ...note, createdBy: "admin" } });
  };

  if (leadsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
              <p className="text-gray-600">Track and manage your property leads</p>
            </div>
            
            <div className="flex items-center gap-4">
              <nav className="flex space-x-8">
                <Link href="/admin-panel" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link href="/admin-panel/analytics" className="text-gray-600 hover:text-gray-900">Analytics</Link>
                <Link href="/admin-panel/leads" className="text-violet-600 font-medium">Leads</Link>
                <Link href="/admin-panel/developers" className="text-gray-600 hover:text-gray-900">Developers</Link>
                <Link href="/admin-panel/zones" className="text-gray-600 hover:text-gray-900">Zones</Link>
              </nav>
              
              <Button variant="ghost" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                {stats.newLeads} new this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.qualifiedLeads}</div>
              <p className="text-xs text-muted-foreground">
                {stats.hotLeads} hot leads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgLeadScore}</div>
              <p className="text-xs text-muted-foreground">
                Lead quality score
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
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

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({filteredLeads.length})</CardTitle>
          <CardDescription>Manage and track all your property leads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedLead(lead)}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{lead.customerName}</h3>
                    <Badge className={leadTypeColors[lead.leadType]}>{lead.leadType}</Badge>
                    <Badge className={priorityColors[lead.priority]}>{lead.priority}</Badge>
                    <Badge className={statusColors[lead.status]}>{lead.status.replace("-", " ")}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {lead.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {lead.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {lead.propertyName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-medium">Score: {lead.leadScore || 0}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredLeads.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No leads found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lead Details Dialog */}
      {selectedLead && leadDetails && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {leadDetails.customerName}
                <Badge className={leadTypeColors[leadDetails.leadType]}>{leadDetails.leadType}</Badge>
                <Badge className={priorityColors[leadDetails.priority]}>{leadDetails.priority}</Badge>
              </DialogTitle>
              <DialogDescription>Lead ID: {leadDetails.leadId}</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details" className="mt-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activities">Activities ({leadDetails.activities.length})</TabsTrigger>
                <TabsTrigger value="notes">Notes ({leadDetails.notes.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Contact Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Phone:</strong> {leadDetails.phone}</p>
                      <p><strong>Email:</strong> {leadDetails.email}</p>
                      <p><strong>Property:</strong> {leadDetails.propertyName}</p>
                      <p><strong>Source:</strong> {leadDetails.source}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Lead Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Score:</strong> {leadDetails.leadScore || 0}/100</p>
                      <p><strong>Status:</strong> 
                        <Select 
                          value={leadDetails.status} 
                          onValueChange={(value) => handleStatusChange(leadDetails.leadId, value)}
                        >
                          <SelectTrigger className="w-40 ml-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
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
                      </p>
                      <p><strong>Created:</strong> {new Date(leadDetails.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {leadDetails.leadDetails && Object.keys(leadDetails.leadDetails).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Additional Details</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(leadDetails.leadDetails, null, 2)}</pre>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => qualifyLeadMutation.mutate({ 
                      leadId: leadDetails.leadId, 
                      qualified: true, 
                      notes: "Qualified via admin panel" 
                    })}
                  >
                    Mark Qualified
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => qualifyLeadMutation.mutate({ 
                      leadId: leadDetails.leadId, 
                      qualified: false, 
                      notes: "Disqualified via admin panel" 
                    })}
                  >
                    Mark Disqualified
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="activities" className="space-y-4">
                <div className="space-y-3">
                  {leadDetails.activities.map((activity) => (
                    <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{activity.subject}</h5>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          {activity.outcome && (
                            <Badge className="mt-1" variant="secondary">{activity.outcome}</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <h5 className="font-medium mb-2">Add Activity</h5>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    handleAddActivity(leadDetails.leadId, {
                      activityType: formData.get('activityType'),
                      subject: formData.get('subject'),
                      description: formData.get('description'),
                      outcome: formData.get('outcome'),
                    });
                    (e.target as HTMLFormElement).reset();
                  }}>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Select name="activityType" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Activity Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="call">Call</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="site-visit">Site Visit</SelectItem>
                          <SelectItem value="follow-up">Follow Up</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select name="outcome">
                        <SelectTrigger>
                          <SelectValue placeholder="Outcome" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="positive">Positive</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="negative">Negative</SelectItem>
                          <SelectItem value="no-response">No Response</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Input name="subject" placeholder="Activity subject" required className="mb-2" />
                    <Textarea name="description" placeholder="Activity description" className="mb-2" />
                    <Button type="submit" size="sm">Add Activity</Button>
                  </form>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <div className="space-y-3">
                  {leadDetails.notes.map((note) => (
                    <div key={note.id} className="bg-yellow-50 p-3 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm">{note.note}</p>
                          <Badge variant="secondary" className="mt-1">{note.noteType}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <h5 className="font-medium mb-2">Add Note</h5>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    handleAddNote(leadDetails.leadId, {
                      note: formData.get('note'),
                      noteType: formData.get('noteType'),
                      isPrivate: formData.get('isPrivate') === 'on',
                    });
                    (e.target as HTMLFormElement).reset();
                  }}>
                    <Textarea name="note" placeholder="Add a note..." required className="mb-2" />
                    <div className="flex gap-2 mb-2">
                      <Select name="noteType" defaultValue="general">
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="qualification">Qualification</SelectItem>
                          <SelectItem value="objection">Objection</SelectItem>
                          <SelectItem value="requirement">Requirement</SelectItem>
                        </SelectContent>
                      </Select>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="isPrivate" />
                        Private note
                      </label>
                    </div>
                    <Button type="submit" size="sm">Add Note</Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
  );
}