import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Search, Shield, Users, Star, ArrowRight, Building, MapPin, Award } from "lucide-react";
import Marquee from "@/components/magicui/marquee";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            Trusted by 500+ Property Buyers
          </Badge>
          
          <h1 className="text-5xl lg:text-7xl font-bold mb-8 text-foreground">
            OwnItRight
            <span className="block text-3xl lg:text-4xl text-muted-foreground mt-4">
              Curated Property Consultants
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
            After spending 5 years in Service business we understand how difficult developers can be. 
            We are small but effective team in researching properties, completing due diligence and 
            offering you peace of mind property search experience with us.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button asChild size="lg">
              <Link href="/find-property">
                Find Your Property
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <a href="#how-it-works">
                How It Works
              </a>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 bg-muted rounded-full">
                <Shield className="h-6 w-6" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Due Diligence</div>
                <div className="text-sm text-muted-foreground">Comprehensive verification</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 bg-muted rounded-full">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Expert Team</div>
                <div className="text-sm text-muted-foreground">5+ years experience</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 bg-muted rounded-full">
                <Award className="h-6 w-6" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Peace of Mind</div>
                <div className="text-sm text-muted-foreground">Trusted process</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our proven 4-step process ensures you find the perfect property with complete confidence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="text-2xl font-bold text-primary mb-4">01</div>
                <h3 className="text-xl font-semibold mb-4">Property Discovery</h3>
                <p className="text-muted-foreground">Use our smart search to find properties that match your exact requirements and budget</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="text-2xl font-bold text-primary mb-4">02</div>
                <h3 className="text-xl font-semibold mb-4">Due Diligence</h3>
                <p className="text-muted-foreground">Our experts conduct thorough verification of legal documents, approvals, and developer credibility</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="text-2xl font-bold text-primary mb-4">03</div>
                <h3 className="text-xl font-semibold mb-4">Site Visit</h3>
                <p className="text-muted-foreground">Schedule guided site visits with our property experts who know every detail</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="text-2xl font-bold text-primary mb-4">04</div>
                <h3 className="text-xl font-semibold mb-4">Final Decision</h3>
                <p className="text-muted-foreground">Make informed decisions with our comprehensive property report and ongoing support</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section with Animated Marquee */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              What Our Clients Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real experiences from satisfied property buyers who trusted OwnItRight
            </p>
          </div>

          <div className="relative">
            <Marquee pauseOnHover className="[--duration:20s]">
              <Card className="mx-6 w-[350px] shrink-0">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 text-sm italic">
                    "OwnItRight's team saved us from a potential legal nightmare. Their due diligence process caught issues that other consultants missed."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold mr-3 text-sm">
                      RS
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Rajesh Sharma</div>
                      <div className="text-xs text-muted-foreground">Software Engineer, Whitefield</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mx-6 w-[350px] shrink-0">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 text-sm italic">
                    "The property search experience was seamless. Their expertise in Bengaluru market helped us find our dream home within budget."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold mr-3 text-sm">
                      PM
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Priya Menon</div>
                      <div className="text-xs text-muted-foreground">Marketing Manager, Koramangala</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mx-6 w-[350px] shrink-0">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 text-sm italic">
                    "After 5 years in property business, OwnItRight understands what buyers really need. Their transparent approach gave us complete confidence."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold mr-3 text-sm">
                      AK
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Anand Kumar</div>
                      <div className="text-xs text-muted-foreground">Business Owner, Electronic City</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mx-6 w-[350px] shrink-0">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 text-sm italic">
                    "The 5+ years of experience really shows. They guided us through every step and made property buying stress-free. Excellent service!"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold mr-3 text-sm">
                      ST
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Sneha Trivedi</div>
                      <div className="text-xs text-muted-foreground">Doctor, Indiranagar</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mx-6 w-[350px] shrink-0">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 text-sm italic">
                    "Professional team with deep market knowledge. They helped us avoid costly mistakes and found exactly what we were looking for."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold mr-3 text-sm">
                      VG
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Vikram Gupta</div>
                      <div className="text-xs text-muted-foreground">Finance Manager, HSR Layout</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Marquee>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-primary-foreground mb-6">
            Ready to Find Your Perfect Property?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Let our experienced team guide you through your property buying journey with complete peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/find-property">
                Start Property Search
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link href="/consultation">
                Get Expert Consultation
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                OwnItRight
              </h3>
              <p className="text-muted-foreground max-w-md">
                Your trusted partner in property discovery with 5+ years of experience in due diligence and customer service.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/find-property" className="block text-muted-foreground hover:text-foreground transition-colors">Find Property</Link>
                <Link href="/consultation" className="block text-muted-foreground hover:text-foreground transition-colors">Expert Consultation</Link>
                <Link href="/admin" className="block text-muted-foreground hover:text-foreground transition-colors">Admin Portal</Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Bengaluru, Karnataka</span>
                </div>
                <div>Expert Property Consultancy Services</div>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 OwnItRight. All rights reserved. Curated Property Consultants.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}