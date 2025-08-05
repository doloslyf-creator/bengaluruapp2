import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Filter, Eye, Calendar, CheckCircle, Clock, AlertCircle, Building2, Wrench, Zap } from "lucide-react";
import { Link } from "wouter";
import type { CivilMepReport } from "@shared/schema";

export default function CivilMepReports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch Civil+MEP reports
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["/api/civil-mep-reports"],
  });

  // Filter reports based on search and status - only show completed and approved reports for public view
  const filteredReports = (reports as CivilMepReport[]).filter((report: CivilMepReport) => {
    const isPublicReport = report.status === "completed" || report.status === "approved";
    const matchesSearch = report.reportTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.engineerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return isPublicReport && matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: "default" as const, icon: CheckCircle, color: "bg-blue-100 text-blue-800 border-blue-200" },
      approved: { variant: "default" as const, icon: CheckCircle, color: "bg-green-100 text-green-800 border-green-200" }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || AlertCircle;
    
    return (
      <Badge className={config?.color || "bg-gray-100 text-gray-800"}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </Badge>
    );
  };

  const getRecommendationBadge = (recommendation: string) => {
    const recConfig = {
      "highly-recommended": { bg: "bg-green-100 text-green-800 border-green-200" },
      "recommended": { bg: "bg-blue-100 text-blue-800 border-blue-200" },
      "conditional": { bg: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      "not-recommended": { bg: "bg-red-100 text-red-800 border-red-200" }
    };
    const config = recConfig[recommendation as keyof typeof recConfig];
    
    return (
      <Badge className={config?.bg || "bg-gray-100 text-gray-800"}>
        {recommendation?.replace('-', ' ').toUpperCase() || 'PENDING'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
              <Wrench className="w-6 h-6 text-green-600" />
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Civil + MEP Engineering Reports
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive structural, mechanical, electrical, and plumbing assessments for informed property investment decisions
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Reports
            </CardTitle>
            <CardDescription>
              Find engineering reports by property, engineer, or report details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by report title, engineer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  data-testid="input-search-reports"
                />
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Reports Found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {searchTerm || statusFilter !== "all" 
                  ? "No reports match your current search criteria."
                  : "No engineering reports are currently available for public viewing."
                }
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report: CivilMepReport) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2 mb-2">
                        {report.reportTitle}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 text-sm">
                        <FileText className="w-4 h-4" />
                        Civil + MEP Assessment
                      </CardDescription>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Engineer:</span>
                      <p className="text-gray-900 dark:text-white truncate">{report.engineerName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Score:</span>
                      <p className="text-gray-900 dark:text-white">
                        {report.overallScore ? `${report.overallScore}/10` : 'Pending'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400 text-sm">Recommendation:</span>
                    <div className="mt-1">
                      {getRecommendationBadge(report.investmentRecommendation)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {report.reportDate ? new Date(report.reportDate.toString()).toLocaleDateString() : 'Date pending'}
                    </div>
                    <Link to={`/civil-mep-report/${report.id}`}>
                      <Button size="sm" data-testid={`button-view-report-${report.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View Report
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Information Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Civil Engineering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Comprehensive structural assessments including foundation, superstructure, walls, roofing, and overall building integrity evaluation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-green-600" />
                Mechanical Systems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Detailed analysis of HVAC systems, ventilation, fire safety systems, and building management automation for optimal performance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Electrical & Plumbing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Complete evaluation of electrical installations, power distribution, plumbing systems, and water management infrastructure.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}