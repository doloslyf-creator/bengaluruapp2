import { FileCheck, Clock, Shield, BarChart3, MapPin, Verified } from "lucide-react";

export function DataTransparencyFooter() {
  return (
    <div className="bg-gray-50 border-t border-gray-200 py-6 mt-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Transparency Promise</h3>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            All property information on OwnitWise is verified through multiple authoritative sources to ensure accuracy and trustworthiness.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="bg-green-100 p-3 rounded-full mb-2">
              <FileCheck className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">RERA Database</div>
            <div className="text-xs text-gray-600">Government verified</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">Site Verification</div>
            <div className="text-xs text-gray-600">Expert inspected</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-purple-100 p-3 rounded-full mb-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">Market Analysis</div>
            <div className="text-xs text-gray-600">Real-time pricing</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-orange-100 p-3 rounded-full mb-2">
              <Shield className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">Independent Review</div>
            <div className="text-xs text-gray-600">Unbiased evaluation</div>
          </div>
        </div>
        
        <div className="flex items-center justify-center mt-6 text-xs text-gray-500">
          <Clock className="h-3 w-3 mr-1" />
          <span>Last updated: {new Date().toLocaleDateString('en-IN')} | Data refreshed daily</span>
        </div>
      </div>
    </div>
  );
}