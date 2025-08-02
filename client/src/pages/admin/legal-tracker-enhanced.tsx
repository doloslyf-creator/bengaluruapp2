import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, Search, Filter, MoreHorizontal, 
  CheckCircle, Clock, AlertTriangle, Eye,
  Calendar, User, FileText, Download,
  ArrowLeft, Building, Scale, Settings,
  Users, ChevronRight, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";

interface LegalStep {
  id: number;
  title: string;
  description: string;
  action: string;
  documentsNeeded: string[];
  status: "verified" | "pending" | "not-verified";
  dateVerified?: string;
  notes?: string;
  assignedTo?: string;
  priority: "critical" | "high" | "medium";
}

interface LegalTracker {
  propertyId: string;
  propertyName: string;
  steps: LegalStep[];
  overallProgress: number;
  lastUpdated: string;
  customerName?: string;
  customerEmail?: string;
  assignedLawyer?: string;
  dueDate?: string;
  createdAt: string;
}

export default function AdminLegalTrackerEnhanced() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedStep, setSelectedStep] = useState<LegalStep | null>(null);
  const [showStepDialog, setShowStepDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trackers = [], isLoading } = useQuery<LegalTracker[]>({
    queryKey: ["/api/legal-trackers"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ["/api/properties"],
    staleTime: 10 * 60 * 1000,
  });

  const updateStepMutation = useMutation({
    mutationFn: ({ trackerId, stepId, updateData }: { 
      trackerId: string; 
      stepId: string; 
      updateData: Partial<LegalStep> 
    }) => {
      return apiRequest("PATCH", `/api/legal-trackers/${trackerId}/steps/${stepId}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legal-trackers"] });
      toast({
        title: "Step Updated",
        description: "Legal verification step has been updated successfully.",
      });
      setShowStepDialog(false);
      setSelectedStep(null);
    },
  });

  const createTrackerMutation = useMutation({
    mutationFn: (trackerData: Partial<LegalTracker>) => {
      return apiRequest("POST", "/api/legal-trackers", trackerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legal-trackers"] });
      toast({
        title: "Legal Tracker Created",
        description: "New legal verification tracker has been created.",
      });
      setShowCreateDialog(false);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800">Not Verified</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      default:
        return <Badge variant="outline">Medium</Badge>;
    }
  };

  const filteredTrackers = trackers.filter(tracker => {
    const matchesSearch = tracker.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tracker.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tracker.assignedLawyer?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "completed" && tracker.overallProgress === 100) ||
                         (statusFilter === "in-progress" && tracker.overallProgress > 0 && tracker.overallProgress < 100) ||
                         (statusFilter === "not-started" && tracker.overallProgress === 0);
    
    return matchesSearch && matchesStatus;
  });

  const getOverallStats = () => {
    const total = trackers.length;
    const completed = trackers.filter(t => t.overallProgress === 100).length;
    const inProgress = trackers.filter(t => t.overallProgress > 0 && t.overallProgress < 100).length;
    const notStarted = trackers.filter(t => t.overallProgress === 0).length;
    const avgProgress = total > 0 ? trackers.reduce((sum, t) => sum + t.overallProgress, 0) / total : 0;
    
    return { total, completed, inProgress, notStarted, avgProgress };
  };

  const stats = getOverallStats();

  const handleUpdateStep = (step: LegalStep, status: string) => {
    const trackerId = selectedProperty;
    if (!trackerId) return;

    const updateData = {
      status: status as "verified" | "pending" | "not-verified",
      dateVerified: status === 'verified' ? new Date().toISOString() : undefined,
    };

    updateStepMutation.mutate({ trackerId, stepId: step.id.toString(), updateData });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Legal Due Diligence Tracker">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Legal Due Diligence Tracker">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Legal Due Diligence Management</h1>
            <p className="text-gray-600 mt-1">Manage legal verification processes for all properties</p>
          </div>
          <div className="flex items-center space-x-3">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Verification
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Start Legal Verification</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property: any) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name} - {property.area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Customer name" />
                  <Input placeholder="Customer email" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign lawyer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adv-sharma">Adv. Rajesh Sharma</SelectItem>
                      <SelectItem value="adv-patel">Adv. Priya Patel</SelectItem>
                      <SelectItem value="adv-kumar">Adv. Suresh Kumar</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full">Create Legal Tracker</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Trackers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Scale className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Not Started</p>
                  <p className="text-2xl font-bold text-red-600">{stats.notStarted}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{Math.round(stats.avgProgress)}%</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">By Property</TabsTrigger>
            <TabsTrigger value="lawyers">By Lawyer</TabsTrigger>
            <TabsTrigger value="pending">Pending Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by property, customer, or lawyer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="not-started">Not Started</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trackers Table */}
            <Card>
              <CardHeader>
                <CardTitle>Legal Verification Trackers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Assigned Lawyer</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrackers.map((tracker) => (
                      <TableRow key={tracker.propertyId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{tracker.propertyName}</div>
                            <div className="text-sm text-gray-500">ID: {tracker.propertyId.slice(0, 8)}...</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{tracker.customerName || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{tracker.customerEmail || 'No email'}</div>
                          </div>
                        </TableCell>
                        <TableCell>{tracker.assignedLawyer || 'Unassigned'}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{tracker.overallProgress}%</span>
                              <span className="text-gray-500">
                                {tracker.steps.filter(s => s.status === 'verified').length}/{tracker.steps.length}
                              </span>
                            </div>
                            <Progress value={tracker.overallProgress} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          {tracker.overallProgress === 100 ? (
                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          ) : tracker.overallProgress > 0 ? (
                            <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Not Started</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {new Date(tracker.lastUpdated).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedProperty(tracker.propertyId)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Generate Report
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <User className="h-4 w-4 mr-2" />
                                Reassign Lawyer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property: any) => {
                const tracker = trackers.find(t => t.propertyId === property.id);
                return (
                  <Card key={property.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{property.name}</h3>
                          <p className="text-sm text-gray-600">{property.area}</p>
                          <p className="text-xs text-gray-500">{property.developer}</p>
                        </div>
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      
                      {tracker ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span className="font-medium">{tracker.overallProgress}%</span>
                          </div>
                          <Progress value={tracker.overallProgress} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Lawyer: {tracker.assignedLawyer || 'Unassigned'}</span>
                            <span>Updated {new Date(tracker.lastUpdated).toLocaleDateString()}</span>
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => setSelectedProperty(property.id)}
                          >
                            Manage Verification
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-3">No verification started</p>
                          <Button size="sm" className="w-full">Start Verification</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackers.map(tracker => 
                    tracker.steps
                      .filter(step => step.status === 'pending')
                      .map(step => (
                        <div key={`${tracker.propertyId}-${step.id}`} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Clock className="h-5 w-5 text-yellow-500" />
                            <div>
                              <div className="font-medium">{step.title}</div>
                              <div className="text-sm text-gray-600">{tracker.propertyName}</div>
                              <div className="text-xs text-gray-500">Assigned to: {tracker.assignedLawyer || 'Unassigned'}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getPriorityBadge(step.priority)}
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateStep(step, 'verified')}
                            >
                              Mark Verified
                            </Button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Property Detail Modal */}
        {selectedProperty && (
          <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty("")}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Legal Verification Details - {trackers.find(t => t.propertyId === selectedProperty)?.propertyName}
                </DialogTitle>
              </DialogHeader>
              
              {/* Property verification steps would go here */}
              <div className="space-y-4">
                <p className="text-gray-600">Detailed step-by-step verification management interface would be displayed here.</p>
                <Button onClick={() => setSelectedProperty("")}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}