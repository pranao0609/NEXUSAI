import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Crown, 
  Zap, 
  Shield, 
  Users, 
  BarChart3, 
  Headphones,
  Star,
  Sparkles
} from 'lucide-react';

const PricingModal = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState('enterprise');

  const pricingPlans = [
    {
      id: 'free',
      name: 'Free Tier',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started with AI agents',
      popular: false,
      features: [
        { text: '2 AI Agents', included: true },
        { text: '100 Tasks per month', included: true },
        { text: 'Basic Analytics', included: true },
        { text: 'Email Support', included: true },
        { text: 'Standard Performance', included: true },
        { text: 'Advanced Features', included: false },
        { text: 'Priority Support', included: false },
        { text: 'Custom Integrations', included: false },
        { text: 'Unlimited Tasks', included: false },
        { text: 'Advanced Analytics', included: false }
      ],
      buttonText: 'Current Plan',
      buttonStyle: 'bg-gray-200 text-gray-600 cursor-not-allowed',
      cardStyle: 'border-gray-200'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$29.99',
      period: '/month',
      description: 'Unlimited access to all premium features',
      popular: true,
      features: [
        { text: 'Unlimited AI Agents', included: true },
        { text: 'Unlimited Tasks', included: true },
        { text: 'Advanced Analytics & Reports', included: true },
        { text: '24/7 Priority Support', included: true },
        { text: 'Maximum Performance', included: true },
        { text: 'Custom Integrations', included: true },
        { text: 'API Access', included: true },
        { text: 'White-label Options', included: true },
        { text: 'Advanced Security', included: true },
        { text: 'Dedicated Account Manager', included: true }
      ],
      buttonText: 'Upgrade Now',
      buttonStyle: 'bg-gradient-to-r from-[#7FA0A8] to-[#6A8B94] text-white hover:from-[#6A8B94] hover:to-[#7FA0A8]',
      cardStyle: 'border-[#7FA0A8] ring-2 ring-[#7FA0A8] ring-opacity-50'
    }
  ];

  const handleUpgrade = (planId) => {
    if (planId === 'enterprise') {
      console.log('Upgrading to Enterprise plan...');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7FA0A8] to-[#6A8B94] px-6 py-4 flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-1">Choose Your Plan</h2>
            <p className="text-white/90 text-sm">Unlock the full potential of AI agents</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
          <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl shadow-md border-2 ${plan.cardStyle} p-6 transition-all duration-300 hover:shadow-lg flex flex-col h-full`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-[#7FA0A8] to-[#6A8B94] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className="mb-3">
                    {plan.id === 'free' ? (
                      <Zap className="w-10 h-10 text-gray-400 mx-auto" />
                    ) : (
                      <Crown className="w-10 h-10 text-[#7FA0A8] mx-auto" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>

                {/* Features List - This will now take available space */}
                <div className="flex-grow mb-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            feature.included
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {feature.included ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                        </div>
                        <span
                          className={`text-sm leading-relaxed ${
                            feature.included ? 'text-gray-900' : 'text-gray-500 line-through'
                          }`}
                        >
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Section - Enterprise Extra Info */}
                {plan.id === 'enterprise' && (
                  <div className="mb-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="flex flex-col items-center">
                        <Shield className="w-6 h-6 text-[#7FA0A8] mb-2" />
                        <p className="text-sm font-semibold text-gray-900">99.9% Uptime</p>
                        <p className="text-xs text-gray-600">Guaranteed</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <Headphones className="w-6 h-6 text-[#7FA0A8] mb-2" />
                        <p className="text-sm font-semibold text-gray-900">24/7 Support</p>
                        <p className="text-xs text-gray-600">Priority Help</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button - Always at bottom */}
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={plan.id === 'free'}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${plan.buttonStyle}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          {/* Bottom Benefits Section */}
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">30-Day Money Back Guarantee</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Try Enterprise risk-free for 30 days. If you're not completely satisfied, 
                we'll refund your money, no questions asked.
              </p>
            </div>
          </div>

          {/* Enterprise Benefits */}
          <div className="mt-6 grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="text-center p-4">
              <BarChart3 className="w-8 h-8 text-[#7FA0A8] mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1 text-sm">Advanced Analytics</h4>
              <p className="text-xs text-gray-600">Deep insights into agent performance</p>
            </div>
            <div className="text-center p-4">
              <Users className="w-8 h-8 text-[#7FA0A8] mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1 text-sm">Team Collaboration</h4>
              <p className="text-xs text-gray-600">Share agents across your organization</p>
            </div>
            <div className="text-center p-4">
              <Shield className="w-8 h-8 text-[#7FA0A8] mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1 text-sm">Enterprise Security</h4>
              <p className="text-xs text-gray-600">Bank-level security and compliance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;