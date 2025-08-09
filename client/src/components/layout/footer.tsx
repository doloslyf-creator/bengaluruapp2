import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main horizontal footer content */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo */}
          <div className="flex items-center">
            <h3 className="text-xl font-bold text-primary ownitwise-wordmark">
              <span className="text-blue-400">Ownit</span><span className="text-emerald-400">Wise</span>
            </h3>
            <span className="text-gray-400 text-sm ml-2">Own homes With Confidence</span>
          </div>

          {/* Navigation & Policy Links */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8 text-sm">
            {/* Service Links */}
            <div className="flex items-center space-x-6">
              <Link href="/consultation" className="text-gray-300 hover:text-primary transition-colors font-medium">
                Consultation
              </Link>
              <Link href="/book-visit" className="text-gray-300 hover:text-primary transition-colors font-medium">
                Book Visit
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-primary transition-colors font-medium">
                Contact
              </Link>
            </div>
            
            {/* Policy Links */}
            <div className="flex items-center space-x-4 text-xs">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-gray-300 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-use" className="text-gray-400 hover:text-gray-300 transition-colors">
                Terms of Use
              </Link>
              <Link href="/refund-policy" className="text-gray-400 hover:text-gray-300 transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; 2024 OwnitWise. All rights reserved. Professional property advisory services in Bangalore.</p>
        </div>
      </div>
    </footer>
  );
}