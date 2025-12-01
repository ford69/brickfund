'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Building2, 
  Search, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Users,
  CheckCircle,
  ArrowRight,
  FileText,
  BarChart3,
  Clock,
  Target,
  Info
} from 'lucide-react';
import { apiClient, HowItWorksContent } from '@/lib/api';

const iconMap = {
  Search,
  DollarSign,
  TrendingUp,
  Target,
  Building2,
  Users,
  FileText,
  Shield,
  BarChart3,
  Clock,
};

const getIconComponent = (iconName: string) => {
  const IconComponent = iconMap[iconName as keyof typeof iconMap];
  return IconComponent || Info;
};

export default function HowItWorks() {
  const [content, setContent] = useState<HowItWorksContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getHowItWorksContent();
        if (response.success && response.data) {
          setContent(response.data);
        } else {
          setContent(null);
        }
      } catch (err) {
        console.error('Failed to load How It Works content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  const steps = [...(content?.steps || [])].sort((a, b) => a.order - b.order);
  const benefits = content?.benefits || [];
  const faqs = content?.faqs || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              How BrickFund Works
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Democratizing real estate investment through technology. 
              Start building wealth with as little as $100.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/projects">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
                  Browse Projects
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-center">
          {error}
        </div>
      )}

      {/* Steps Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From browsing projects to earning returns, our platform makes real estate investment simple and accessible.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-700"></div>
            </div>
          ) : steps.length === 0 ? (
            <p className="text-center text-gray-600">Process details are coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => {
                const StepIcon = getIconComponent(step.icon);
                const stepNumber = step.order ?? index + 1;
                return (
                  <Card key={step.id || index} className="relative">
                    <CardContent className="p-8 text-center">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-700 text-white text-lg px-4 py-2">
                          {stepNumber}
                        </Badge>
                      </div>
                      
                      <div className="mt-8 mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <StepIcon className="h-8 w-8 text-blue-700" />
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {step.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-6">
                        {step.description}
                      </p>

                      {step.features?.length ? (
                        <ul className="space-y-2 text-sm text-gray-600">
                          {step.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose BrickFund?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're revolutionizing real estate investment by making it accessible, transparent, and profitable for everyone.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-700"></div>
            </div>
          ) : benefits.length === 0 ? (
            <p className="text-center text-gray-600">Benefits content will be available soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => {
                const BenefitIcon = getIconComponent(benefit.icon);
                return (
                  <Card key={benefit.id || index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BenefitIcon className="h-8 w-8 text-blue-700" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Get answers to common questions about real estate crowdfunding.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-700"></div>
            </div>
          ) : faqs.length === 0 ? (
            <p className="text-center text-gray-600">FAQ content will be available soon.</p>
          ) : (
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={faq.id || index}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Investing?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of investors who are already building wealth through real estate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
                Create Account
              </Button>
            </Link>
            <Link href="/projects">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700">
                Browse Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}