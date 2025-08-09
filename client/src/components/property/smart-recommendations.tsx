
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Brain, 
  TrendingUp, 
  Heart, 
  Star, 
  MapPin, 
  IndianRupee, 
  Eye, 
  ChevronRight,
  Sparkles,
  Target,
  BarChart3
} from 'lucide-react';
import { useSmartRecommendations } from '@/hooks/use-smart-recommendations';
import { type Property } from '@shared/schema';
import { formatPriceDisplay } from '@/lib/utils';
import { generatePropertySlug } from '@/utils/seo';
import { useLocation } from 'wouter';

interface SmartRecommendationsProps {
  intent: 'investment' | 'end-use' | '';
  currentProperty?: Property;
  userPreferences?: any;
  className?: string;
}

export function SmartRecommendations({
  intent,
  currentProperty,
  userPreferences,
  className
}: SmartRecommendationsProps) {
  const [, navigate] = useLocation();
  const { recommendations, trackBehavior, analytics } = useSmartRecommendations({
    intent,
    currentProperty,
    userPreferences,
    limit: 6
  });

  const handlePropertyClick = (property: Property) => {
    trackBehavior('view_property', { propertyId: property.id });
    const slug = generatePropertySlug(property);
    navigate(`/property/${slug}`);
  };

  const handleSaveProperty = (property: Property, event: React.MouseEvent) => {
    event.stopPropagation();
    trackBehavior('save_property', { propertyId: property.id });
    // Add to favorites logic here
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getIntentIcon = () => {
    if (intent === 'investment') return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (intent === 'end-use') return <Heart className="h-5 w-5 text-purple-600" />;
    return <Target className="h-5 w-5 text-blue-600" />;
  };

  const getIntentTitle = () => {
    if (intent === 'investment') return 'Smart Investment Picks';
    if (intent === 'end-use') return 'Perfect Homes for You';
    return 'Recommended Properties';
  };

  const getIntentDescription = () => {
    if (intent === 'investment') return 'AI-curated properties with high investment potential based on your preferences';
    if (intent === 'end-use') return 'Handpicked homes that match your lifestyle and family needs';
    return 'Personalized property recommendations based on your search behavior';
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={className}>
        {/* Header with Analytics */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                {getIntentIcon()}
                <h2 className="text-2xl font-bold text-gray-900">{getIntentTitle()}</h2>
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-gray-600 mt-1">{getIntentDescription()}</p>
            </div>
          </div>
          
          {/* Analytics Badge */}
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-full border border-blue-200">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Avg Score: {analytics.averageScore}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <div>High Confidence: {analytics.confidenceDistribution.high}</div>
                <div>Medium Confidence: {analytics.confidenceDistribution.medium}</div>
                <div>Data Points: {analytics.behaviorDataPoints}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Recommendations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((item, index) => {
            const { property, recommendation } = item;
            const primaryConfig = property.configurations?.[0];
            const priceDisplay = primaryConfig ? formatPriceDisplay(primaryConfig.price) : 'Price on request';

            return (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 relative overflow-hidden"
                  onClick={() => handlePropertyClick(property)}
                >
                  {/* Confidence Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className={`text-xs ${getConfidenceColor(recommendation.confidence)}`}>
                      {recommendation.confidence.toUpperCase()}
                    </Badge>
                  </div>

                  {/* AI Score Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      <Brain className="h-3 w-3" />
                      <span>{recommendation.score}</span>
                    </div>
                  </div>

                  {/* Property Image */}
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-gray-400 text-center">
                          <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                            {property.type === 'villa' ? '🏘️' : property.type === 'apartment' ? '🏢' : '🏗️'}
                          </div>
                          <p className="text-sm">No Image</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    {/* Property Details */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {property.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="capitalize">{property.area}, {property.zone}</span>
                        </div>
                      </div>

                      {/* Price and Configuration */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-lg font-bold text-gray-900">
                          <IndianRupee className="h-4 w-4" />
                          <span>{priceDisplay}</span>
                        </div>
                        {primaryConfig && (
                          <Badge variant="outline" className="text-xs">
                            {primaryConfig.configuration}
                          </Badge>
                        )}
                      </div>

                      {/* AI Reasons */}
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Sparkles className="h-3 w-3 mr-1" />
                          <span>Why we recommend this:</span>
                        </div>
                        <div className="space-y-1">
                          {recommendation.reasons.slice(0, 2).map((reason, idx) => (
                            <div key={idx} className="flex items-center text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                              <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleSaveProperty(property, e)}
                            className="text-gray-600 hover:text-red-500"
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center text-xs text-gray-500">
                            <Eye className="h-3 w-3 mr-1" />
                            <span>Smart Match</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          <span className="text-sm">View Details</span>
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* View More Button */}
        {recommendations.length >= 6 && (
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              className="px-8 py-3 text-blue-600 border-blue-300 hover:bg-blue-50"
              onClick={() => navigate('/property-results')}
            >
              <Brain className="h-4 w-4 mr-2" />
              View All Smart Recommendations
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Personalization Notice */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 text-sm text-blue-700">
            <Brain className="h-4 w-4" />
            <span className="font-medium">AI-Powered Personalization</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Recommendations improve as you browse. Each interaction helps us understand your preferences better.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
