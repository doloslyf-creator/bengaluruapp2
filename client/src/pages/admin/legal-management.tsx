import { Link } from "wouter";
import { 
  Scale, 
  FileText, 
  Users, 
  Activity, 
  ChevronRight,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/layout/admin-layout";

const menuItems = [
  {
    title: "Legal Tracker Dashboard",
    description: "Overview of all legal verification processes",
    href: "/admin-panel/legal-tracker",
    icon: Scale,
    color: "bg-purple-50 text-purple-600 border-purple-200",
    iconColor: "text-purple-500"
  },
  {
    title: "Manage Verifications",
    description: "Create and manage property legal verifications",
    href: "/admin-panel/legal-tracker/manage",
    icon: FileText,
    color: "bg-blue-50 text-blue-600 border-blue-200",
    iconColor: "text-blue-500"
  },
  {
    title: "Legal Team Management",
    description: "Manage lawyers and legal professionals",
    href: "/admin-panel/legal-tracker/team",
    icon: Users,
    color: "bg-green-50 text-green-600 border-green-200",
    iconColor: "text-green-500"
  },
  {
    title: "Reports & Analytics",
    description: "Legal verification reports and insights",
    href: "/admin-panel/legal-tracker/reports",
    icon: Activity,
    color: "bg-orange-50 text-orange-600 border-orange-200",
    iconColor: "text-orange-500"
  }
];

const quickStats = [
  {
    label: "Active Verifications",
    value: "12",
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50"
  },
  {
    label: "Completed This Month",
    value: "8",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50"
  },
  {
    label: "Pending Review",
    value: "5",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50"
  },
  {
    label: "Legal Team Members",
    value: "3",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50"
  }
];

export default function LegalManagement() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Scale className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Legal Due Diligence Management</h1>
          <p className="text-lg text-gray-600 mt-2">
            Comprehensive legal verification system for property investments
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bg}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={index} href={item.href}>
                <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-2 ${item.color} hover:scale-105`}>
                  <CardContent className="pt-8 pb-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-white rounded-lg shadow-sm">
                          <Icon className={`h-6 w-6 ${item.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                          <p className="text-gray-600">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Feature Highlights */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Why Legal Due Diligence Matters</h2>
            <p className="text-gray-600">Protect your customers' investments with comprehensive legal verification</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-4 bg-white rounded-lg shadow-sm mb-4 mx-auto w-fit">
                <Shield className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Risk Mitigation</h3>
              <p className="text-sm text-gray-600">Identify and resolve potential legal issues before they become problems</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-white rounded-lg shadow-sm mb-4 mx-auto w-fit">
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Document Verification</h3>
              <p className="text-sm text-gray-600">Comprehensive verification of all legal documents and certificates</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-white rounded-lg shadow-sm mb-4 mx-auto w-fit">
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Expert Legal Team</h3>
              <p className="text-sm text-gray-600">Professional lawyers and legal experts handle all verifications</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link href="/admin-panel/legal-tracker">
                <Button className="flex items-center space-x-2">
                  <Scale className="h-4 w-4" />
                  <span>View All Trackers</span>
                </Button>
              </Link>
              <Link href="/admin-panel/legal-tracker/manage">
                <Button variant="outline" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Start New Verification</span>
                </Button>
              </Link>
              <Button variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}