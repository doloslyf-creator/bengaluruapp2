import { FileCheck, Clock, Shield, BarChart3, MapPin } from "lucide-react";

interface DataTransparencyIndicatorProps {
  variant?: "compact" | "banner" | "inline";
  sources?: string[];
  lastUpdated?: string;
  className?: string;
}

export function DataTransparencyIndicator({ 
  variant = "compact", 
  sources = ["RERA Database", "Site Verification", "Market Analysis"],
  lastUpdated = new Date().toLocaleDateString('en-IN'),
  className = ""
}: DataTransparencyIndicatorProps) {
  
  const getIcon = (source: string) => {
    if (source.includes("RERA") || source.includes("Database")) return FileCheck;
    if (source.includes("Site") || source.includes("Visit")) return MapPin;
    if (source.includes("Market") || source.includes("Analysis")) return BarChart3;
    if (source.includes("Independent") || source.includes("Engineer")) return Shield;
    return FileCheck;
  };

  const getColor = (index: number) => {
    const colors = ["text-green-700", "text-blue-700", "text-purple-700", "text-orange-700"];
    return colors[index % colors.length];
  };

  if (variant === "banner") {
    return (
      <div className={`bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center space-x-8 text-sm">
          {sources.map((source, index) => {
            const Icon = getIcon(source);
            return (
              <div key={source} className={`flex items-center ${getColor(index)}`}>
                <Icon className="h-4 w-4 mr-2" />
                <span className="font-medium">{source}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center space-x-4 text-xs ${className}`}>
        {sources.slice(0, 2).map((source, index) => {
          const Icon = getIcon(source);
          return (
            <div key={source} className={`flex items-center ${getColor(index)}`}>
              <Icon className="h-3 w-3 mr-1" />
              <span className="font-medium">{source.split(' ')[0]} Verified</span>
            </div>
          );
        })}
        <div className="flex items-center text-gray-600">
          <Clock className="h-3 w-3 mr-1" />
          <span>Updated {lastUpdated}</span>
        </div>
      </div>
    );
  }

  // Compact variant (default)
  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg px-3 py-2 ${className}`}>
      <div className="flex items-center space-x-3 text-xs">
        <div className="flex items-center text-green-700">
          <FileCheck className="h-3 w-3 mr-1" />
          <span className="font-medium">Data Verified</span>
        </div>
        <div className="flex items-center text-blue-700">
          <Clock className="h-3 w-3 mr-1" />
          <span>Updated {lastUpdated}</span>
        </div>
      </div>
    </div>
  );
}