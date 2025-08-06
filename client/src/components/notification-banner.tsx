import { useState, useEffect } from 'react';
import { X, Clock, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface NotificationItem {
  id: number;
  type: 'order' | 'savings' | 'alert';
  message: string;
  action?: string;
  urgent?: boolean;
}

const notifications: NotificationItem[] = [
  {
    id: 1,
    type: 'order',
    message: 'Rahul K. just ordered Civil+MEP report for Prestige Lakeside Habitat',
    urgent: false
  },
  {
    id: 2,
    type: 'savings',
    message: 'Priya M. saved ₹4.2L using our valuation report in Electronic City',
    urgent: false
  },
  {
    id: 3,
    type: 'alert',
    message: 'URGENT: 23 buyers checking properties in your area right now',
    action: 'Check Now',
    urgent: true
  },
  {
    id: 4,
    type: 'order',
    message: 'Sandeep & Meera found hidden issues in Whitefield project - disaster averted!',
    urgent: false
  }
];

export function NotificationBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const currentNotification = notifications[currentIndex];

  return (
    <div className={`fixed top-20 left-4 right-4 z-30 transition-all duration-500 ${
      currentNotification.urgent 
        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white' 
        : 'bg-white border border-gray-200 text-gray-900'
    } rounded-lg shadow-lg p-4 animate-slide-down`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            currentNotification.type === 'order' ? 'bg-blue-500' :
            currentNotification.type === 'savings' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          
          <div className="flex items-center space-x-2">
            {currentNotification.type === 'order' && <Users className="h-4 w-4" />}
            {currentNotification.type === 'savings' && <TrendingUp className="h-4 w-4" />}
            {currentNotification.type === 'alert' && <Clock className="h-4 w-4" />}
            
            <span className="text-sm font-medium">{currentNotification.message}</span>
          </div>

          {currentNotification.action && (
            <Link href="/find-property">
              <Button 
                size="sm" 
                className={`ml-4 ${
                  currentNotification.urgent 
                    ? 'bg-white text-red-600 hover:bg-gray-100' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {currentNotification.action}
              </Button>
            </Link>
          )}
        </div>
        
        <button 
          onClick={() => setIsVisible(false)}
          className={`${currentNotification.urgent ? 'text-white hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}