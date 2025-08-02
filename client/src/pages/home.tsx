import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building, BarChart3, MapPin } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Stripe Style */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/20"></div>
        <div className="container-stripe section-stripe relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-display text-foreground mb-6">
              Property Management
              <span className="block text-primary">Platform</span>
            </h1>
            
            <p className="text-body-large text-muted-foreground mb-12 max-w-2xl mx-auto">
              Comprehensive solution for managing residential property projects in Bengaluru. 
              Advanced analytics, property tracking, and management tools for real estate professionals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="px-8 py-4 text-base font-medium h-auto rounded-xl focus-stripe transition-stripe">
                <Link href="/admin-panel">
                  Access Admin Panel
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="px-8 py-4 text-base font-medium h-auto rounded-xl focus-stripe transition-stripe border-2">
                <a href="#features">
                  Learn More
                </a>
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-stripe bg-muted/30">
        <div className="container-stripe">
          <div className="text-center mb-16">
            <h2 className="text-heading-2 text-foreground mb-4">Everything you need to manage properties</h2>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed for real estate professionals to streamline operations and maximize efficiency.
            </p>
          </div>
          
          <div className="grid-stripe grid-cols-1 md:grid-cols-3">
            <div className="card-stripe p-8 text-center group hover:shadow-lg transition-stripe">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-primary/20 transition-stripe">
                <Building className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-heading-3 text-foreground mb-4">Property Management</h3>
              <p className="text-body text-muted-foreground">Complete CRUD operations for apartments, villas, and plots with detailed configurations and pricing.</p>
            </div>

            <div className="card-stripe p-8 text-center group hover:shadow-lg transition-stripe">
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-success/20 transition-stripe">
                <BarChart3 className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-heading-3 text-foreground mb-4">Analytics Dashboard</h3>
              <p className="text-body text-muted-foreground">Advanced data visualization and analytics for property statistics, trends, and performance metrics.</p>
            </div>

            <div className="card-stripe p-8 text-center group hover:shadow-lg transition-stripe">
              <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-warning/20 transition-stripe">
                <MapPin className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-heading-3 text-foreground mb-4">Zone Management</h3>
              <p className="text-body text-muted-foreground">Comprehensive zone-based categorization and management for Bengaluru's property market.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}