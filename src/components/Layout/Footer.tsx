import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Mail, Twitter, Linkedin, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-primary-600 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MoneyWise</span>
            </Link>
            <p className="text-neutral-400 mb-6 max-w-md">
              Master the stock market through interactive learning, AI-powered guidance, 
              and expert mentorship. Build your financial future with confidence.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/games" className="hover:text-white transition-colors">
                  Educational Games
                </Link>
              </li>
              <li>
                <Link to="/mentors" className="hover:text-white transition-colors">
                  Find Mentors
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-white transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400 text-sm">
              © 2025 MoneyWise. All rights reserved.
            </p>
            <p className="text-neutral-400 text-sm mt-2 md:mt-0">
              Made with ❤️ for financial education
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;