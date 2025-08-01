import { ReactNode, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { useOnboarding } from "./onboarding-provider";

interface OnboardingTooltipProps {
  stepId: string;
  title: string;
  description: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  offset?: number;
  showProgress?: boolean;
}

export function OnboardingTooltip({
  stepId,
  title,
  description,
  children,
  position = "bottom",
  offset = 10,
  showProgress = true,
}: OnboardingTooltipProps) {
  const { isStepActive, nextStep, prevStep, skipOnboarding, currentStep, totalSteps, completeOnboarding } = useOnboarding();
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const isActive = isStepActive(stepId);

  useEffect(() => {
    if (isActive && containerRef.current && tooltipRef.current) {
      // Scroll element into view
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Add highlight effect to target element
      const targetElement = containerRef.current.firstElementChild as HTMLElement;
      if (targetElement) {
        targetElement.style.position = "relative";
        targetElement.style.zIndex = "1001";
        targetElement.classList.add("onboarding-highlight");
      }

      return () => {
        if (targetElement) {
          targetElement.style.position = "";
          targetElement.style.zIndex = "";
          targetElement.classList.remove("onboarding-highlight");
        }
      };
    }
  }, [isActive]);

  const handleNext = () => {
    if (currentStep === totalSteps - 1) {
      completeOnboarding();
    } else {
      nextStep();
    }
  };

  const getTooltipPosition = () => {
    switch (position) {
      case "top":
        return "bottom-full mb-2";
      case "bottom":
        return "top-full mt-2";
      case "left":
        return "right-full mr-2";
      case "right":
        return "left-full ml-2";
      default:
        return "top-full mt-2";
    }
  };

  const getArrowPosition = () => {
    switch (position) {
      case "top":
        return "after:top-full after:left-1/2 after:-translate-x-1/2 after:border-t-white after:border-l-transparent after:border-r-transparent after:border-b-transparent";
      case "bottom":
        return "before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-b-white before:border-l-transparent before:border-r-transparent before:border-t-transparent";
      case "left":
        return "after:left-full after:top-1/2 after:-translate-y-1/2 after:border-l-white after:border-t-transparent after:border-b-transparent after:border-r-transparent";
      case "right":
        return "before:right-full before:top-1/2 before:-translate-y-1/2 before:border-r-white before:border-t-transparent before:border-b-transparent before:border-l-transparent";
      default:
        return "before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-b-white before:border-l-transparent before:border-r-transparent before:border-t-transparent";
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {children}
      
      {isActive && (
        <>
          {/* Backdrop overlay */}
          <div className="fixed inset-0 bg-black/50 z-1000 pointer-events-none" />
          
          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className={`
              absolute z-1002 w-80 max-w-sm
              ${getTooltipPosition()}
              before:content-[''] before:absolute before:w-0 before:h-0 before:border-8
              ${getArrowPosition()}
            `}
          >
            <Card className="shadow-2xl border-0 bg-white">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-blue-100 rounded-full">
                      <HelpCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipOnboarding}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">{description}</p>

                {/* Progress */}
                {showProgress && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Step {currentStep + 1} of {totalSteps}</span>
                      <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipOnboarding}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Skip Tour
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    {currentStep > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevStep}
                        className="flex items-center space-x-1"
                      >
                        <ChevronLeft className="h-3 w-3" />
                        <span>Back</span>
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      onClick={handleNext}
                      className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      <span>{currentStep === totalSteps - 1 ? "Finish" : "Next"}</span>
                      {currentStep < totalSteps - 1 && <ChevronRight className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}