import React from 'react';
import Link from 'next/link';
import { Brain, ArrowUpRight, Heart, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Smooth scroll function for anchor links
interface SmoothScrollEvent extends React.MouseEvent<HTMLAnchorElement, MouseEvent> {}

const handleSmoothScroll = (e: SmoothScrollEvent, href: string): void => {
    // Only handle anchor links (starting with #)
    if (href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            });
        }
    }
};

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Study Tools', href: '/tools' },
      { name: 'Mind Maps', href: '/mindmaps' },
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Status', href: '/status' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Github, href: 'https://github.com/vatsal-bhakodia/smriti-ai', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    // { icon: Mail, href: 'mailto:hello@smritiai.com', label: 'Email' },
  ];

  return (
    <footer className="bg-black border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logo */}
            <div className="flex items-center group">
              <Link href="/" className="flex items-center">
                <div className="relative">
                  <Brain className="me-[5px] h-6 w-6 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <span className="text-xl font-bold text-white group-hover:text-primary transition-colors duration-300">
                  Smriti AI
                </span>
              </Link>
            </div>

            {/* Description */}
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              Transform passive learning into active remembering. Smriti AI helps you retain knowledge faster with AI-powered study tools and spaced repetition.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="group relative p-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-all duration-300 hover:scale-110"
                >
                  <social.icon className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors duration-300" />
                  <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      onClick={(e) => handleSmoothScroll(e, link.href)}
                      className="group flex items-center text-gray-400 hover:text-primary text-sm transition-all duration-300 hover:translate-x-1"
                    >
                      <span>{link.name}</span>
                      <ArrowUpRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:flex-1">
              <h3 className="text-white font-semibold text-lg mb-2">
                Stay updated with Smriti AI
              </h3>
              <p className="text-gray-400 text-sm">
                Get the latest features, study tips, and productivity insights delivered to your inbox.
              </p>
            </div>
            <div className="mt-4 lg:mt-0 lg:ml-8">
              <div className="flex max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 min-w-0 px-4 py-2 bg-gray-900 border border-gray-700 rounded-l-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                />
                <button className="group px-6 py-2 bg-primary hover:bg-primary/90 text-black font-medium rounded-r-lg transition-all duration-300 hover:scale-105 active:scale-95">
                  <span className="group-hover:scale-110 transition-transform duration-300 inline-block">
                    Subscribe
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>© {currentYear} Smriti AI. All rights reserved.</span>
              <div className="hidden md:flex items-center space-x-1">
                <span>Made with</span>
                <Heart className="h-3 w-3 text-red-500 animate-pulse" />
                <span>for learners</span>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-6 text-sm">
                <Link 
                  href="/privacy" 
                  className="text-gray-400 hover:text-primary transition-colors duration-300"
                >
                  Privacy
                </Link>
                <Link 
                  href="/terms" 
                  className="text-gray-400 hover:text-primary transition-colors duration-300"
                >
                  Terms
                </Link>
                <Link 
                  href="/cookies" 
                  className="text-gray-400 hover:text-primary transition-colors duration-300"
                >
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;