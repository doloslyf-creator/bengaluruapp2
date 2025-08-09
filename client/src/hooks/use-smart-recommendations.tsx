
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type Property } from '@shared/schema';

interface UserBehavior {
  viewedProperties: string[];
  searchHistory: string[];
  savedProperties: string[];
  priceRangeHistory: [number, number][];
  locationPreferences: string[];
  propertyTypePreferences: string[];
  timeSpentOnProperties: Record<string, number>;
  clickedFeatures: string[];
}

interface SmartRecommendationParams {
  intent: 'investment' | 'end-use' | '';
  currentProperty?: Property;
  userPreferences?: any;
  limit?: number;
}

interface RecommendationScore {
  propertyId: string;
  score: number;
  reasons: string[];
  confidence: 'high' | 'medium' | 'low';
}

export function useSmartRecommendations({
  intent,
  currentProperty,
  userPreferences,
  limit = 6
}: SmartRecommendationParams) {
  const [userBehavior, setUserBehavior] = useState<UserBehavior>(() => {
    const stored = localStorage.getItem('userBehavior');
    return stored ? JSON.parse(stored) : {
      viewedProperties: [],
      searchHistory: [],
      savedProperties: [],
      priceRangeHistory: [],
      locationPreferences: [],
      propertyTypePreferences: [],
      timeSpentOnProperties: {},
      clickedFeatures: []
    };
  });

  // Fetch all properties for recommendation analysis
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Update user behavior tracking
  const trackBehavior = (action: string, data: any) => {
    const newBehavior = { ...userBehavior };
    
    switch (action) {
      case 'view_property':
        if (!newBehavior.viewedProperties.includes(data.propertyId)) {
          newBehavior.viewedProperties.push(data.propertyId);
        }
        break;
      case 'save_property':
        if (!newBehavior.savedProperties.includes(data.propertyId)) {
          newBehavior.savedProperties.push(data.propertyId);
        }
        break;
      case 'search':
        newBehavior.searchHistory.push(data.searchTerm);
        if (data.priceRange) {
          newBehavior.priceRangeHistory.push(data.priceRange);
        }
        break;
      case 'time_spent':
        newBehavior.timeSpentOnProperties[data.propertyId] = data.timeSpent;
        break;
      case 'click_feature':
        if (!newBehavior.clickedFeatures.includes(data.feature)) {
          newBehavior.clickedFeatures.push(data.feature);
        }
        break;
    }
    
    setUserBehavior(newBehavior);
    localStorage.setItem('userBehavior', JSON.stringify(newBehavior));
  };

  // AI-powered scoring algorithm
  const calculateRecommendationScore = (property: Property): RecommendationScore => {
    let score = 0;
    const reasons: string[] = [];
    
    // Base score from property quality
    score += property.overallScore || 0;
    
    // Intent-based scoring
    if (intent === 'investment') {
      // Investment-focused scoring
      if (property.tags.includes('high-roi')) {
        score += 20;
        reasons.push('High ROI potential');
      }
      if (property.tags.includes('rental-income')) {
        score += 15;
        reasons.push('Strong rental income');
      }
      if (property.zone === 'east' || property.zone === 'north') {
        score += 10;
        reasons.push('Investment-friendly location');
      }
      if (property.status === 'pre-launch') {
        score += 12;
        reasons.push('Pre-launch pricing advantage');
      }
      if (property.tags.includes('metro-connectivity')) {
        score += 8;
        reasons.push('Metro connectivity boosts value');
      }
    } else if (intent === 'end-use') {
      // Family/end-use focused scoring
      if (property.tags.includes('family-friendly')) {
        score += 20;
        reasons.push('Perfect for families');
      }
      if (property.tags.includes('school-nearby')) {
        score += 15;
        reasons.push('Good schools nearby');
      }
      if (property.tags.includes('park') || property.tags.includes('children-play-area')) {
        score += 12;
        reasons.push('Great for children');
      }
      if (property.configurations.some(c => c.configuration.includes('3 BHK'))) {
        score += 10;
        reasons.push('Spacious family layout');
      }
    }

    // User behavior-based scoring
    const viewedSimilarTypes = userBehavior.propertyTypePreferences.filter(type => 
      type === property.type
    ).length;
    if (viewedSimilarTypes > 0) {
      score += viewedSimilarTypes * 5;
      reasons.push('Matches your preferred property type');
    }

    // Location preference scoring
    const viewedSimilarLocations = userBehavior.locationPreferences.filter(loc => 
      property.area.toLowerCase().includes(loc.toLowerCase()) ||
      property.zone === loc
    ).length;
    if (viewedSimilarLocations > 0) {
      score += viewedSimilarLocations * 3;
      reasons.push('In your preferred area');
    }

    // Price range compatibility
    if (userPreferences?.budgetRange) {
      const [minBudget, maxBudget] = userPreferences.budgetRange;
      const minBudgetCrores = minBudget >= 100 ? minBudget / 100 : minBudget / 100;
      const maxBudgetCrores = maxBudget >= 100 ? maxBudget / 100 : maxBudget / 100;
      
      const propertyConfigs = property.configurations || [];
      const inBudget = propertyConfigs.some(config => {
        const price = config.price;
        return price >= minBudgetCrores && price <= maxBudgetCrores;
      });
      
      if (inBudget) {
        score += 15;
        reasons.push('Within your budget');
      }
    }

    // Feature preference scoring
    const preferredFeatures = userBehavior.clickedFeatures;
    const matchingFeatures = property.tags.filter(tag => 
      preferredFeatures.some(pref => tag.toLowerCase().includes(pref.toLowerCase()))
    );
    score += matchingFeatures.length * 2;
    if (matchingFeatures.length > 0) {
      reasons.push('Has features you've shown interest in');
    }

    // Collaborative filtering - "Users like you also viewed"
    const similarUserViews = userBehavior.viewedProperties;
    if (similarUserViews.length > 0) {
      // Boost score for properties similar to viewed ones
      const viewedProps = properties.filter(p => similarUserViews.includes(p.id));
      const similarityBoost = viewedProps.some(viewed => 
        viewed.zone === property.zone || 
        viewed.type === property.type ||
        viewed.tags.some(tag => property.tags.includes(tag))
      );
      if (similarityBoost) {
        score += 8;
        reasons.push('Similar to properties you\'ve viewed');
      }
    }

    // Recency and trending boost
    if (property.status === 'active' && property.tags.includes('trending')) {
      score += 5;
      reasons.push('Trending property');
    }

    // Developer reputation boost
    if (property.tags.includes('premium-developer')) {
      score += 7;
      reasons.push('Reputed developer');
    }

    // Determine confidence level
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (reasons.length >= 4 && score >= 80) confidence = 'high';
    else if (reasons.length >= 2 && score >= 60) confidence = 'medium';

    return {
      propertyId: property.id,
      score: Math.round(score),
      reasons: reasons.slice(0, 3), // Top 3 reasons
      confidence
    };
  };

  // Generate smart recommendations
  const generateRecommendations = () => {
    if (!properties.length) return [];

    // Exclude current property and already viewed properties for diversity
    const candidateProperties = properties.filter(p => {
      if (currentProperty && p.id === currentProperty.id) return false;
      // Don't exclude all viewed properties, just recent ones for diversity
      const recentlyViewed = userBehavior.viewedProperties.slice(-3);
      return !recentlyViewed.includes(p.id);
    });

    // Score all candidate properties
    const scoredProperties = candidateProperties.map(property => ({
      property,
      recommendation: calculateRecommendationScore(property)
    }));

    // Sort by score and apply diversity filter
    const sortedRecommendations = scoredProperties
      .sort((a, b) => b.recommendation.score - a.recommendation.score)
      .slice(0, limit * 2); // Get more than needed for diversity

    // Apply diversity filter - ensure variety in types and locations
    const diverseRecommendations = [];
    const usedTypes = new Set();
    const usedZones = new Set();

    for (const item of sortedRecommendations) {
      if (diverseRecommendations.length >= limit) break;
      
      const { property } = item;
      const typeKey = property.type;
      const zoneKey = property.zone;
      
      // Ensure diversity in first few recommendations
      if (diverseRecommendations.length < 3) {
        if (!usedTypes.has(typeKey) || !usedZones.has(zoneKey)) {
          diverseRecommendations.push(item);
          usedTypes.add(typeKey);
          usedZones.add(zoneKey);
          continue;
        }
      }
      
      // For remaining slots, prioritize by score
      diverseRecommendations.push(item);
    }

    return diverseRecommendations.slice(0, limit);
  };

  const recommendations = generateRecommendations();

  // Analytics data for recommendations
  const getRecommendationAnalytics = () => {
    const totalScore = recommendations.reduce((sum, r) => sum + r.recommendation.score, 0);
    const avgScore = recommendations.length > 0 ? totalScore / recommendations.length : 0;
    
    const confidenceDistribution = {
      high: recommendations.filter(r => r.recommendation.confidence === 'high').length,
      medium: recommendations.filter(r => r.recommendation.confidence === 'medium').length,
      low: recommendations.filter(r => r.recommendation.confidence === 'low').length
    };

    return {
      totalRecommendations: recommendations.length,
      averageScore: Math.round(avgScore),
      confidenceDistribution,
      intentOptimized: intent !== '',
      behaviorDataPoints: Object.keys(userBehavior).reduce((sum, key) => {
        const value = userBehavior[key as keyof UserBehavior];
        return sum + (Array.isArray(value) ? value.length : Object.keys(value).length);
      }, 0)
    };
  };

  return {
    recommendations,
    trackBehavior,
    analytics: getRecommendationAnalytics(),
    userBehavior
  };
}
