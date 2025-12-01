import Link from 'next/link';
import { Building2, Mail, Phone, MapPin, Twitter, Linkedin, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center mb-6">
              <Building2 className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-2xl font-bold">BrickFund</span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Democratizing real estate investment through crowdfunding. 
              Building wealth, brick by brick, for everyone.
            </p>
            <div className="flex space-x-4">
              <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                <Twitter className="h-5 w-5" />
              </div>
              <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                <Linkedin className="h-5 w-5" />
              </div>
              <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                <Facebook className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Investors</h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link href="/projects" className="hover:text-white transition-colors">Browse Projects</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/risk-disclosure" className="hover:text-white transition-colors">Risk Disclosure</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Developers</h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link href="/list-project" className="hover:text-white transition-colors">List Your Project</Link></li>
              <li><Link href="/developer-guide" className="hover:text-white transition-colors">Developer Guide</Link></li>
              <li><Link href="/verification-process" className="hover:text-white transition-colors">Verification Process</Link></li>
              <li><Link href="/success-stories" className="hover:text-white transition-colors">Success Stories</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center text-gray-400">
                <Mail className="h-5 w-5 mr-3" />
                <span>hello@brickfund.com</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="h-5 w-5 mr-3" />
                <span>1-800-BRICKFUND</span>
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin className="h-5 w-5 mr-3" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 lg:mb-0">
              © 2024 BrickFund. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/securities" className="hover:text-white transition-colors">Securities</Link>
              <Link href="/compliance" className="hover:text-white transition-colors">Compliance</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}