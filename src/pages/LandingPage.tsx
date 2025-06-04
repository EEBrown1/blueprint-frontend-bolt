import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, MessageSquare, ZoomIn, Upload, 
  CheckCircle, ChevronDown, ChevronRight 
} from 'lucide-react';
import Button from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

// Define pricing tiers
const pricingTiers = [
  {
    name: 'Starter',
    price: 29,
    period: 'month',
    description: 'Perfect for individual contractors and small projects',
    features: [
      '5 blueprints storage',
      'Basic blueprint analysis',
      'Email support',
      '100 queries per month'
    ],
    popular: false,
    cta: 'Start Free Trial'
  },
  {
    name: 'Professional',
    price: 79,
    period: 'month',
    description: 'Ideal for small teams and multiple projects',
    features: [
      '25 blueprints storage',
      'Advanced blueprint analysis',
      'Priority support',
      'Unlimited queries',
      'Team collaboration'
    ],
    popular: true,
    cta: 'Start Free Trial'
  },
  {
    name: 'Enterprise',
    price: 199,
    period: 'month',
    description: 'For large teams and organizations',
    features: [
      'Unlimited blueprints storage',
      'Custom AI model training',
      'Dedicated support',
      'Advanced reporting',
      'API access',
      'Custom integrations'
    ],
    popular: false,
    cta: 'Contact Sales'
  }
];

// Define FAQ items
const faqItems = [
  {
    question: 'What file formats are supported?',
    answer: 'Currently, TalkToMe Blueprint supports PDF files. We plan to add support for additional formats like DWG, DXF, and RVT in the future.'
  },
  {
    question: 'How accurate is the AI in analyzing blueprints?',
    answer: 'Our AI is trained on thousands of architectural plans and can accurately identify standard elements, measurements, and specifications. The accuracy improves with usage as the system learns from corrections and feedback.'
  },
  {
    question: 'Can I share blueprints with my team?',
    answer: 'Yes, our Professional and Enterprise plans include team collaboration features that allow you to share blueprints and conversations with team members.'
  },
  {
    question: 'Is my blueprint data secure?',
    answer: 'Absolutely. We use industry-standard encryption and security practices to protect your data. Your blueprints are stored securely and only accessible to you and team members you explicitly grant access to.'
  },
  {
    question: 'Can I export the information extracted from blueprints?',
    answer: 'Yes, you can export information in various formats including PDF reports, CSV for data tables, and structured JSON for integration with other systems.'
  }
];

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="bg-white py-4 px-6 border-b fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-primary mr-2" />
            <span className="text-xl font-bold text-gray-900">TalkToMe</span>
            <span className="text-xl font-normal text-primary ml-1">Blueprint</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-700 hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-primary transition-colors">How it Works</a>
            <a href="#pricing" className="text-gray-700 hover:text-primary transition-colors">Pricing</a>
            <a href="#faq" className="text-gray-700 hover:text-primary transition-colors">FAQ</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-700 hover:text-primary">Log in</Link>
            <Link to="/register">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Blueprints that <span className="text-primary">answer back</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-600 mb-8 max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Transform how you interact with architectural plans. 
                Upload blueprints and get instant, intelligent answers to your questions.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link to="/register">
                  <Button size="lg">Try for free</Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg">See demo</Button>
                </a>
              </motion.div>
            </div>
            
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="relative shadow-2xl rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src="https://images.pexels.com/photos/5582597/pexels-photo-5582597.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Blueprint with AI analysis" 
                  className="w-full rounded-t-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-gray-500 text-sm">Question</p>
                      <p className="font-medium">What are the dimensions of the master bedroom?</p>
                      <div className="mt-2 p-3 bg-gray-100 rounded-md">
                        <p className="text-gray-800">The master bedroom is 14' x 16' (224 sq ft) with 9' ceilings and includes a walk-in closet of 6' x 8'.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to understand and work with architectural blueprints more efficiently.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Natural Language Interface
              </h3>
              <p className="text-gray-600">
                Ask questions in plain English and get accurate, context-aware responses about your blueprints.
              </p>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <ZoomIn className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Visual Analysis
              </h3>
              <p className="text-gray-600">
                Automatically identifies and highlights relevant areas of your blueprint based on your queries.
              </p>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Easy Document Management
              </h3>
              <p className="text-gray-600">
                Upload, organize, and search through your blueprint collection with intuitive controls.
              </p>
            </motion.div>
            
            {/* Feature 4 */}
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Code Compliance Checking
              </h3>
              <p className="text-gray-600">
                Automatically verify building code compliance and identify potential issues.
              </p>
            </motion.div>
            
            {/* Feature 5 */}
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-600">
                  <path d="M3 3v18h18"></path>
                  <path d="M20 18v3"></path>
                  <path d="M3 6h3v10H3z"></path>
                  <path d="M8 6h3v14H8z"></path>
                  <path d="M13 6h3v8h-3z"></path>
                  <path d="M18 6h3v6h-3z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Material Quantification
              </h3>
              <p className="text-gray-600">
                Automatically calculate material quantities and cost estimates for your projects.
              </p>
            </motion.div>
            
            {/* Feature 6 */}
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-red-600">
                  <path d="M17 14v6m-3-3h6M6 12V6a3 3 0 0 1 3-3h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-4"></path>
                  <path d="M6 12H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2"></path>
                  <path d="M6 8h6"></path>
                  <path d="M6 5h3"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Team Collaboration
              </h3>
              <p className="text-gray-600">
                Share blueprints and insights with your team, clients, or contractors.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              TalkToMe Blueprint makes working with architectural plans simple and intuitive.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 h-full">
                <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center mb-4 text-white font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Upload Your Blueprint
                </h3>
                <p className="text-gray-600">
                  Simply drag and drop your blueprint PDF or select from your computer. Our system processes it automatically.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                <ChevronRight className="h-8 w-8 text-gray-300" />
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 h-full">
                <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center mb-4 text-white font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ask Questions
                </h3>
                <p className="text-gray-600">
                  Ask any question about your blueprint in plain language. "What are the dimensions of the kitchen?" or "How many outlets are in the living room?"
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                <ChevronRight className="h-8 w-8 text-gray-300" />
              </div>
            </div>
            
            {/* Step 3 */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 h-full">
                <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center mb-4 text-white font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Get Intelligent Answers
                </h3>
                <p className="text-gray-600">
                  Receive detailed, visual responses with highlighted areas on your blueprint, measurements, and specifications.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-16">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
              <div className="aspect-video bg-gray-100 relative">
                <img 
                  src="https://images.pexels.com/photos/834892/pexels-photo-834892.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="TalkToMe Blueprint Demo" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                  <button className="bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary ml-1">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that's right for you or your team.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <motion.div 
                key={index}
                className={`bg-white rounded-lg shadow-md overflow-hidden border ${
                  tier.popular ? 'border-primary relative' : 'border-gray-200'
                }`}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                transition={{ duration: 0.2 }}
              >
                {tier.popular && (
                  <div className="bg-primary text-white text-xs font-bold uppercase py-1 px-4 absolute top-0 right-0 rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-600 mb-4">{tier.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">${tier.price}</span>
                    <span className="text-gray-600">/{tier.period}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-6 pb-6">
                  <Button 
                    className="w-full"
                    variant={tier.popular ? 'primary' : 'outline'}
                  >
                    {tier.cta}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>
          
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div 
                key={index}
                className="border border-gray-200 rounded-lg"
              >
                <button
                  className="flex justify-between items-center w-full p-4 text-left"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium text-gray-900">{item.question}</span>
                  <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${
                    activeFaq === index ? 'transform rotate-180' : ''
                  }`} />
                </button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 border-t border-gray-200">
                        <p className="text-gray-600">{item.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to transform how you work with blueprints?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who are saving time and improving accuracy with TalkToMe Blueprint.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100"
              >
                Start Free Trial
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white/10"
              >
                See Demo
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-primary mr-2" />
                <span className="text-xl font-bold">TalkToMe</span>
                <span className="text-xl font-normal text-primary ml-1">Blueprint</span>
              </div>
              <p className="text-gray-400 mb-4">
                Making architectural blueprints interactive and intelligent.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">Case Studies</a>
                </li>
                <li><a href="#" className="text-gray-400 hover:text-white">Testimonials</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Guides</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">API Reference</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} TalkToMe Blueprint. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;