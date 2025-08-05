import { Link } from 'wouter';
import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">OwnItRight</h3>
            <p className="text-gray-300 text-sm">
              Professional property advisory services in Bangalore. Expert valuations, 
              detailed reports, and personalized investment guidance.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-primary cursor-pointer" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-primary cursor-pointer" />
              <Linkedin className="w-5 h-5 text-gray-400 hover:text-primary cursor-pointer" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-primary cursor-pointer" />
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Our Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services/property-valuation" className="text-gray-300 hover:text-primary transition-colors">
                  Property Valuation Reports
                </Link>
              </li>
              <li>
                <Link href="/services/civil-mep-reports" className="text-gray-300 hover:text-primary transition-colors">
                  CIVIL & MEP Reports
                </Link>
              </li>
              <li>
                <Link href="/services/legal-due-diligence" className="text-gray-300 hover:text-primary transition-colors">
                  Legal Due Diligence
                </Link>
              </li>
              <li>
                <Link href="/consultation" className="text-gray-300 hover:text-primary transition-colors">
                  Property Consultation
                </Link>
              </li>
              <li>
                <Link href="/book-visit" className="text-gray-300 hover:text-primary transition-colors">
                  Site Visit Booking
                </Link>
              </li>
            </ul>
          </div>

          {/* Properties by Location */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Properties by Location</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/properties/whitefield" className="text-gray-300 hover:text-primary transition-colors">
                  Whitefield Properties
                </Link>
              </li>
              <li>
                <Link href="/properties/electronic-city" className="text-gray-300 hover:text-primary transition-colors">
                  Electronic City Properties
                </Link>
              </li>
              <li>
                <Link href="/properties/hebbal" className="text-gray-300 hover:text-primary transition-colors">
                  Hebbal Properties
                </Link>
              </li>
              <li>
                <Link href="/properties/sarjapur" className="text-gray-300 hover:text-primary transition-colors">
                  Sarjapur Properties
                </Link>
              </li>
              <li>
                <Link href="/properties" className="text-gray-300 hover:text-primary transition-colors">
                  View All Properties
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact & Legal</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-gray-300">Bangalore, Karnataka</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-gray-300">+91-9876543210</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-gray-300">info@ownitright.com</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-use" className="text-gray-300 hover:text-primary transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-gray-300 hover:text-primary transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} OwnItRight Property Advisory. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
              <span>RERA Registered</span>
              <span>ISO Certified</span>
              <span>Professional Services</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}