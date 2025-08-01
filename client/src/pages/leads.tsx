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
  
  const { logout } = useAuth();
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
              
              <Button variant="ghost" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700 tracking-wide">Total Leads</CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats?.totalLeads || 0}</div>
              <p className="text-xs text-gray-600 font-medium">
                Active leads in pipeline
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700 tracking-wide">Hot Leads</CardTitle>
              <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg shadow-md animate-pulse">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats?.hotLeads || 0}</div>
              <p className="text-xs text-gray-600 font-medium">
                High priority prospects
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700 tracking-wide">Avg Lead Score</CardTitle>
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg shadow-md">
                <Target className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats?.avgLeadScore || 0}</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500" 
                  style={{width: `${Math.min((stats?.avgLeadScore || 0) / 100 * 100, 100)}%`}}
                ></div>
              </div>
              <p className="text-xs text-gray-600 font-medium">
                Quality indicator
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700 tracking-wide">Conversion Rate</CardTitle>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg shadow-md">
                <Award className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats?.conversionRate || 0}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full transition-all duration-500" 
                  style={{width: `${Math.min((stats?.conversionRate || 0), 100)}%`}}
                ></div>
              </div>
              <p className="text-xs text-gray-600 font-medium">
                Success rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-md">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-wide">Filters & Search</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative max-w-sm">
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-gray-200 focus:border-blue-500 transition-colors duration-200 shadow-sm"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-40 border-2 border-gray-200 hover:border-blue-400 transition-colors duration-200 shadow-sm">
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
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b border-gray-100">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-md">
                <Users className="h-5 w-5 text-white" />
              </div>
              Leads ({filteredLeads.length})
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Manage and track your sales leads with advanced analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
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
                    className="group relative border-0 rounded-xl p-6 bg-gradient-to-r from-white to-gray-50 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">{lead.customerName}</h3>
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
                        <div className="text-sm text-gray-700 space-y-2">
                          <div className="grid grid-cols-2 gap-4">
                            <span className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                              <Phone className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{lead.phone}</span>
                            </span>
                            <span className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                              <Mail className="h-4 w-4 text-green-600" />
                              <span className="font-medium">{lead.email}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                            <MapPin className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">{lead.propertyName}</span>
                          </div>
                          <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-xs">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                            <span className="font-semibold text-gray-700">Source: {lead.source}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-3">
                        <div className="text-center">
                          <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg">
                            <div className="text-2xl font-bold text-white">{lead.leadScore}</div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-yellow-800" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                              </svg>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 font-medium mt-1">Lead Score</div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 hover:scale-105"
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