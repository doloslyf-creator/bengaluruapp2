import { useState } from 'react';
import { Phone, MessageCircle, Shield, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export function FloatingActionButtons() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Main FAB */}
      <div className="relative">
        {/* Expanded Options */}
        {isExpanded && (
          <div className="absolute bottom-16 right-0 space-y-3 animate-in slide-in-from-bottom-2">
            <div className="bg-white rounded-full shadow-lg p-3 border border-gray-200">
              <Link href="/find-property">
                <Button size="sm" className="bg-slate-600 hover:bg-slate-700 text-white rounded-full h-12 w-12 p-0">
                  <Shield className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            <div className="bg-white rounded-full shadow-lg p-3 border border-gray-200">
              <Button size="sm" className="bg-gray-600 hover:bg-gray-700 text-white rounded-full h-12 w-12 p-0">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="bg-white rounded-full shadow-lg p-3 border border-gray-200">
              <Button size="sm" className="bg-zinc-600 hover:bg-zinc-700 text-white rounded-full h-12 w-12 p-0">
                <Phone className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Main Button */}
        <Button
          className="bg-primary hover:bg-primary/90 text-white rounded-full h-16 w-16 shadow-2xl animate-bounce"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <X className="h-6 w-6" />
          ) : (
            <Zap className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Urgent Banner */}
      {!isExpanded && (
        <div className="absolute bottom-20 right-0 bg-red-600 text-white px-4 py-2 rounded-l-full shadow-lg animate-pulse">
          <div className="text-xs font-bold">FREE Risk Check!</div>
        </div>
      )}
    </div>
  );
}