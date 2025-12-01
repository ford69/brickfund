import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Shield, Users } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-blue-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Building Wealth,{' '}
            <span className="text-blue-700">Brick by Brick</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Democratize real estate investing. Fund verified property projects with as little as $100 
            and earn returns while developers build the future.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3">
              Start Investing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3">
              List Your Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-blue-700" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Secure & Verified</p>
                <p className="text-sm text-gray-600">KYC verified projects only</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-700" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">High Returns</p>
                <p className="text-sm text-gray-600">8-15% projected ROI</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-700" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Community Driven</p>
                <p className="text-sm text-gray-600">Join 50,000+ investors</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}