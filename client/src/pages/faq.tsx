import { useState } from "react";
import { Link } from "wouter";
import {
  ChevronDown,
  ChevronUp,
  Home,
  HelpCircle,
  FileText,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "What is included in a Civil & MEP Report?",
    answer: "Our Civil & MEP Reports provide comprehensive analysis of a property's structural integrity, electrical systems, plumbing, HVAC, fire safety measures, and overall engineering compliance. The report includes detailed assessments, photographs, recommendations, and compliance certifications.",
    category: "Reports",
    tags: ["civil", "mep", "engineering", "structural"]
  },
  {
    id: "2",
    question: "How long does it take to receive my Property Valuation Report?",
    answer: "Property Valuation Reports typically take 3-5 business days to complete after our site visit. Complex properties or those requiring additional documentation may take 7-10 business days. You'll receive status updates throughout the process.",
    category: "Timeline",
    tags: ["valuation", "timeline", "delivery"]
  },
  {
    id: "3",
    question: "Are your reports legally valid for property transactions?",
    answer: "Yes, all our reports are prepared by certified professionals and are legally valid for property transactions, loan applications, insurance claims, and court proceedings. They comply with industry standards and regulatory requirements.",
    category: "Legal",
    tags: ["legal", "certification", "compliance"]
  },
  {
    id: "4",
    question: "Can I request modifications to my report after delivery?",
    answer: "Minor clarifications and corrections can be made within 7 days of report delivery at no additional cost. Significant modifications or additional assessments may incur additional charges and require a new site visit.",
    category: "Modifications",
    tags: ["modifications", "changes", "updates"]
  },
  {
    id: "5",
    question: "What documents do I need to provide for a property assessment?",
    answer: "You'll need property ownership documents, building plans (if available), previous inspection reports, utility bills, and any relevant permits or approvals. Our team will provide a complete checklist upon booking.",
    category: "Requirements",
    tags: ["documents", "requirements", "preparation"]
  },
  {
    id: "6",
    question: "Do you provide assessments for commercial properties?",
    answer: "Yes, we provide comprehensive assessments for both residential and commercial properties including offices, retail spaces, warehouses, and industrial facilities. Commercial assessments may require specialized expertise and longer timelines.",
    category: "Property Types",
    tags: ["commercial", "residential", "property types"]
  },
  {
    id: "7",
    question: "How accurate are your property valuations?",
    answer: "Our valuations are prepared using market analysis, comparable sales data, property condition assessment, and location factors. We maintain 95%+ accuracy rate based on subsequent market transactions within 6 months.",
    category: "Accuracy",
    tags: ["accuracy", "market value", "methodology"]
  },
  {
    id: "8",
    question: "Can I get a digital copy of my report?",
    answer: "Yes, all reports are delivered digitally through your customer account portal. You can download PDF copies, share secure links, and access your reports anytime. Physical copies can be requested for an additional fee.",
    category: "Delivery",
    tags: ["digital", "download", "access"]
  },
  {
    id: "9",
    question: "What happens if issues are found during inspection?",
    answer: "If significant issues are discovered, we'll immediately notify you and provide preliminary findings. The detailed report will include severity classifications, recommended actions, cost estimates for repairs, and timeline for addressing issues.",
    category: "Issues",
    tags: ["problems", "defects", "recommendations"]
  },
  {
    id: "10",
    question: "Do you offer consultation services after report delivery?",
    answer: "Yes, we provide 30 days of free consultation after report delivery to help you understand findings and recommendations. Extended consultation services and follow-up assessments are available at reasonable rates.",
    category: "Support",
    tags: ["consultation", "support", "follow-up"]
  }
];

const categories = ["All", "Reports", "Timeline", "Legal", "Requirements", "Property Types", "Accuracy", "Delivery", "Issues", "Support", "Modifications"];

export default function FAQ() {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/my-account">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Account
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                <h1 className="text-xl font-bold">Frequently Asked Questions</h1>
              </div>
            </div>
            <Button asChild>
              <Link href="/contact">
                <MessageCircle className="h-4 w-4 mr-1" />
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Find Answers to Your Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Bar */}
              <div>
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''}
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <Card key={faq.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-0">
                <button
                  onClick={() => toggleExpanded(faq.id)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {faq.question}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {faq.category}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {faq.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4">
                      {expandedItems.includes(faq.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </button>
                
                {expandedItems.includes(faq.id) && (
                  <div className="px-6 pb-6">
                    <Separator className="mb-4" />
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or category filter.
              </p>
              <Button asChild>
                <Link href="/contact">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Contact Support
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mt-12">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle>Still need help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4" asChild>
                  <Link href="/report-documentation">
                    <div className="text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div>
                        <p className="font-medium">Report Documentation</p>
                        <p className="text-sm text-gray-600">Learn how to read reports</p>
                      </div>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto p-4" asChild>
                  <Link href="/contact">
                    <div className="text-center">
                      <Mail className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div>
                        <p className="font-medium">Email Support</p>
                        <p className="text-sm text-gray-600">Get help via email</p>
                      </div>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto p-4" asChild>
                  <Link href="/contact">
                    <div className="text-center">
                      <Phone className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <div>
                        <p className="font-medium">Phone Support</p>
                        <p className="text-sm text-gray-600">Call our support team</p>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}