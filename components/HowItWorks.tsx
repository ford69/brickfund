import { Search, DollarSign, TrendingUp, FileCheck } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Discover Projects',
      description: 'Browse verified real estate projects from trusted developers with detailed financials and projections.',
      color: 'blue'
    },
    {
      icon: FileCheck,
      title: 'Complete Verification',
      description: 'Complete our secure KYC process to ensure compliance and protect all investors on the platform.',
      color: 'green'
    },
    {
      icon: DollarSign,
      title: 'Invest Securely',
      description: 'Invest as little as $100 with funds held in escrow until project milestones are achieved.',
      color: 'purple'
    },
    {
      icon: TrendingUp,
      title: 'Earn Returns',
      description: 'Track your investments and receive returns as projects reach completion and generate revenue.',
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      purple: 'bg-purple-100 text-purple-700',
      orange: 'bg-orange-100 text-orange-700',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How BrickFund Works
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Start your real estate investment journey in four simple steps. 
            Our platform makes it easy and secure to build wealth through property investments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center group">
              <div className="mb-6">
                <div className={`w-16 h-16 mx-auto rounded-full ${getColorClasses(step.color)} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="h-8 w-8" />
                </div>
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                  {index + 1}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {step.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full">
                  <div className="w-full h-0.5 bg-gray-200"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Start Building Wealth?</h3>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of investors who are already earning returns through real estate crowdfunding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-700 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
              Start Investing Now
            </button>
            <button className="border border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-700 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}