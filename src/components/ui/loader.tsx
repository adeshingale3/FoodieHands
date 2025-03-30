import React from 'react';
import { Loader2, Utensils } from 'lucide-react';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Logo Animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
          <div className="relative bg-primary rounded-full p-4">
            <Utensils className="h-8 w-8 text-primary-foreground animate-bounce" />
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold text-primary animate-pulse">
            Foodie Hands
          </h2>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Preparing your experience...
            </p>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-[loading_2s_ease-in-out_infinite]" 
               style={{
                 animation: 'loading 2s ease-in-out infinite',
                 width: '100%'
               }} />
        </div>
      </div>
    </div>
  );
};

export default Loader; 