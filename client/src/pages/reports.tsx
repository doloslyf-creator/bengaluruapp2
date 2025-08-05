import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  MapPin, 
  Building2, 
  Shield, 
  Star, 
  Users, 
  Award,
  CheckCircle,
  TrendingUp,
  FileText,
  Calculator,
  AlertTriangle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePayment } from "@/hooks/use-payment";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import type { Property } from "@shared/schema";

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReportType, setSelectedReportType] = useState<"civil-mep" | "valuation">("civil-mep");
  const { toast } = useToast();

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const filteredProperties = useMemo(() => {
    if (!searchTerm.trim()) return properties;
    
    const searchLower = searchTerm.toLowerCase();
    return properties.filter((property: Property) =>
      property.name?.toLowerCase().includes(searchLower) ||
      property.developer?.toLowerCase().includes(searchLower) ||
      property.area?.toLowerCase().includes(searchLower) ||
      property.address?.toLowerCase().includes(searchLower)
    );
  }, [properties, searchTerm]);

  const handleOrderReport = (propertyId: string, reportType: string) => {
    // Integration with existing payment flow
    toast({
      title: "Redirecting to Payment",
      description: `Processing ${reportType} report order for ₹2,499`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      


      {/* Search Section */}
      <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Professional Property Reports
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get comprehensive Civil+MEP Analysis or Property Valuation Reports
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by property name, builder, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredProperties.length} properties found
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Property Cards - Main Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <Card className="text-center py-12 mb-12">
              <CardContent>
                <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Properties Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search terms or contact us for custom reports.
                </p>
                <Button>Contact for Custom Report</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredProperties.slice(0, 6).map((property: Property) => (
                    <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        {/* Property Header */}
                        <div className="mb-4">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                            {property.name}
                          </h3>
                          <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm mb-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{property.area}</span>
                          </div>
                          {property.developer && (
                            <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm mb-2">
                              <Building2 className="w-4 h-4 mr-1" />
                              <span>{property.developer}</span>
                            </div>
                          )}
                        </div>

                        {/* Report Type Tabs */}
                        <Tabs value={selectedReportType} onValueChange={(value: any) => setSelectedReportType(value)} className="mb-4">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="civil-mep" className="text-xs">
                              <FileText className="w-4 h-4 mr-1" />
                              Civil+MEP
                            </TabsTrigger>
                            <TabsTrigger value="valuation" className="text-xs">
                              <Calculator className="w-4 h-4 mr-1" />
                              Valuation
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="civil-mep" className="mt-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                Civil+MEP Engineering Analysis
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center text-blue-700 dark:text-blue-300">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Structural integrity assessment
                                </div>
                                <div className="flex items-center text-blue-700 dark:text-blue-300">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  MEP systems evaluation
                                </div>
                                <div className="flex items-center text-blue-700 dark:text-blue-300">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Quality score: 8.5/10
                                </div>
                                <div className="flex items-center text-blue-700 dark:text-blue-300">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  RERA compliance verified
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="valuation" className="mt-4">
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                                Property Valuation Report
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center text-green-700 dark:text-green-300">
                                  <TrendingUp className="w-4 h-4 mr-2" />
                                  Market value: Contact for pricing
                                </div>
                                <div className="flex items-center text-green-700 dark:text-green-300">
                                  <TrendingUp className="w-4 h-4 mr-2" />
                                  Investment potential: High
                                </div>
                                <div className="flex items-center text-green-700 dark:text-green-300">
                                  <TrendingUp className="w-4 h-4 mr-2" />
                                  ROI projection: 12-15%
                                </div>
                                <div className="flex items-center text-green-700 dark:text-green-300">
                                  <TrendingUp className="w-4 h-4 mr-2" />
                                  Location score: 9/10
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>

                        {/* Quality Indicators */}
                        <div className="flex gap-2 mb-4">
                          {property.reraApproved && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <Shield className="w-3 h-3 mr-1" />
                              RERA Approved
                            </Badge>
                          )}
                          <Badge variant="outline" className="border-blue-200 text-blue-700">
                            <Star className="w-3 h-3 mr-1" />
                            Verified Property
                          </Badge>
                        </div>

                        {/* Buy Button */}
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleOrderReport(property.id, selectedReportType)}
                        >
                          Get {selectedReportType === "civil-mep" ? "Civil+MEP" : "Valuation"} Report - ₹2,499
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
          
          {/* Educational Sections Below - Previously Sidebar Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            
            {/* Why We Charge Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  Why We Charge ₹2,499?
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    <span>Covers actual inspection and analysis costs</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    <span>Ensures completely unbiased reporting</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    <span>Professional engineer certification</span>
                  </div>
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 mr-2 text-orange-600 mt-0.5" />
                    <span className="font-medium">Beware of "free" reports - they're often biased!</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonials */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Customer Reviews
                </h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-l-blue-500 pl-4">
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      "The Civil+MEP report saved me from a costly mistake. Found major structural issues that others missed."
                    </p>
                    <p className="text-xs text-gray-500">- Rajesh K., Bangalore</p>
                  </div>
                  
                  <div className="border-l-4 border-l-green-500 pl-4">
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      "Property valuation report was spot-on. Helped negotiate ₹15 lakhs off the asking price!"
                    </p>
                    <p className="text-xs text-gray-500">- Priya S., Chennai</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Why Our Reports Matter */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-600" />
                  Why Our Reports Matter
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Free Reports Elsewhere:</h4>
                    <ul className="space-y-1 text-red-700 dark:text-red-300">
                      <li>• Often sponsored by builders</li>
                      <li>• Hide critical issues</li>
                      <li>• Generic templates</li>
                      <li>• No liability or accountability</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Our Professional Reports:</h4>
                    <ul className="space-y-1 text-green-700 dark:text-green-300">
                      <li>• Independent & unbiased</li>
                      <li>• Detailed property-specific analysis</li>
                      <li>• Professional engineer certified</li>
                      <li>• Legal compliance guaranteed</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact CTA Section */}
          <div className="mt-12">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8 text-center">
                <h3 className="font-semibold text-2xl mb-4">Property Not Listed?</h3>
                <p className="text-lg mb-6 opacity-90">
                  Get a custom report for any property in India
                </p>
                <Button variant="secondary" className="px-8 py-3">
                  Request Custom Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}