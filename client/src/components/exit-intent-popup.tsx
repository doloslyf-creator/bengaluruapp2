import { useState, useEffect } from 'react';
import { X, AlertTriangle, Gift, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg mx-4 p-8 animate-in zoom-in-95">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Wait! Don't Risk Losing ₹5+ Lakhs
          </h3>
          
          <p className="text-gray-600 mb-6">
            Before you go, grab your <strong>FREE Property Risk Assessment</strong> 
            and join 2,847+ smart buyers who avoided costly mistakes.
          </p>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-center mb-3">
              <Gift className="h-5 w-5 text-red-600 mr-2" />
              <span className="font-bold text-red-800">Limited Time Bonus</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>✓ Free Risk Assessment</span>
                <span className="line-through text-gray-500">₹999</span>
                <span className="font-bold text-green-600">FREE</span>
              </div>
              <div className="flex items-center justify-between">
                <span>✓ Hidden Issues Alert</span>
                <span className="line-through text-gray-500">₹499</span>
                <span className="font-bold text-green-600">FREE</span>
              </div>
              <div className="flex items-center justify-between">
                <span>✓ Price Analysis Report</span>
                <span className="line-through text-gray-500">₹799</span>
                <span className="font-bold text-green-600">FREE</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center mb-6 text-red-600">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Offer expires in 10 minutes</span>
          </div>

          <div className="space-y-3">
            <Link href="/find-property">
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-lg font-bold"
                onClick={() => setIsVisible(false)}
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Yes, Get My FREE Risk Assessment
              </Button>
            </Link>
            
            <button 
              className="w-full text-gray-500 text-sm hover:text-gray-700"
              onClick={() => setIsVisible(false)}
            >
              No thanks, I'll risk losing money
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}