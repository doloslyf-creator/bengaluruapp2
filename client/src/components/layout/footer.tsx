import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main horizontal footer content */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo */}
          <div className="flex items-center">
            <h3 className="text-xl font-bold text-primary">OwnItRight</h3>
            <span className="text-gray-400 text-sm ml-2">Property Advisory</span>
          </div>

          {/* Policy Links */}
          <div className="flex items-center space-x-6 text-sm">
            <Link href="/privacy-policy" className="text-gray-300 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-use" className="text-gray-300 hover:text-primary transition-colors">
              Terms of Use
            </Link>
            <Link href="/refund-policy" className="text-gray-300 hover:text-primary transition-colors">
              Refund Policy
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; 2024 OwnItRight. All rights reserved. Professional property advisory services in Bangalore.</p>
        </div>
      </div>
    </footer>
  );
}