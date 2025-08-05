import { User, Award, Building2, Briefcase, GraduationCap, MapPin, Calendar, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Expert {
  id: string;
  name: string;
  title: string;
  specialization: string;
  experience: string;
  qualifications: string[];
  verificationCount: number;
  rating: number;
  location: string;
  avatar?: string;
}

interface ExpertCredentialsProps {
  reportType: "civil-mep" | "valuation" | "legal" | "site-visit";
  compact?: boolean;
}

const expertDatabase: Record<string, Expert[]> = {
  "civil-mep": [
    {
      id: "eng001",
      name: "Rajesh Kumar M.E.",
      title: "Senior Structural Engineer",
      specialization: "Civil & MEP Analysis",
      experience: "12+ years",
      qualifications: ["M.E. Structural", "RERA Certified", "Green Building Expert"],
      verificationCount: 450,
      rating: 4.9,
      location: "Bengaluru"
    },
    {
      id: "eng002", 
      name: "Priya Sharma B.Tech",
      title: "MEP Systems Specialist",
      specialization: "Electrical & Plumbing Systems",
      experience: "8+ years",
      qualifications: ["B.Tech EEE", "MEP Certified", "Fire Safety Expert"],
      verificationCount: 320,
      rating: 4.8,
      location: "Bengaluru"
    }
  ],
  "valuation": [
    {
      id: "val001",
      name: "Suresh Reddy MRICS",
      title: "Chartered Valuer",
      specialization: "Property Valuation",
      experience: "15+ years",
      qualifications: ["MRICS", "Certified Valuer", "Market Analysis Expert"],
      verificationCount: 680,
      rating: 4.9,
      location: "Bengaluru"
    },
    {
      id: "val002",
      name: "Anita Krishnan FCA",
      title: "Financial Analyst",
      specialization: "Investment Analysis", 
      experience: "10+ years",
      qualifications: ["FCA", "CFA Level II", "Real Estate Finance"],
      verificationCount: 290,
      rating: 4.7,
      location: "Bengaluru"
    }
  ],
  "legal": [
    {
      id: "leg001",
      name: "Advocate Ramesh Nair",
      title: "Property Legal Expert",
      specialization: "Real Estate Law",
      experience: "18+ years",
      qualifications: ["LLB", "Property Law Specialist", "RERA Advocate"],
      verificationCount: 520,
      rating: 4.8,
      location: "Bengaluru"
    }
  ],
  "site-visit": [
    {
      id: "sit001",
      name: "Kiran Patel B.Arch",
      title: "Site Verification Expert",
      specialization: "Construction Quality Assessment",
      experience: "9+ years", 
      qualifications: ["B.Arch", "Quality Control Expert", "Site Inspector"],
      verificationCount: 380,
      rating: 4.8,
      location: "Bengaluru"
    }
  ]
};

export function ExpertCredentials({ reportType, compact = false }: ExpertCredentialsProps) {
  const experts = expertDatabase[reportType] || [];
  const primaryExpert = experts[0];

  if (!primaryExpert) return null;

  if (compact) {
    return (
      <div className="flex items-center space-x-3 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{primaryExpert.name}</div>
            <div className="text-xs text-gray-600">{primaryExpert.title}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            <Star className="h-3 w-3 mr-1 text-yellow-500" />
            {primaryExpert.rating}
          </Badge>
          <span className="text-xs text-gray-500">{primaryExpert.verificationCount}+ verified</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-blue-900">Expert Credentials</h4>
          <Badge className="bg-blue-100 text-blue-800">Verified Professional</Badge>
        </div>

        <div className="space-y-4">
          {experts.slice(0, 2).map((expert, index) => (
            <div key={expert.id} className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-gray-900">{expert.name}</h5>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{expert.rating}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center text-gray-700">
                    <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{expert.title}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{expert.experience} experience</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{expert.specialization}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{expert.location}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {expert.qualifications.map((qual, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {qual}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-600">
                  <Award className="h-3 w-3 inline mr-1" />
                  {expert.verificationCount}+ properties verified successfully
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-800">
            <strong>Quality Assurance:</strong> All our experts are RERA certified professionals with extensive field experience. 
            Each report undergoes peer review before delivery to ensure accuracy and completeness.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}