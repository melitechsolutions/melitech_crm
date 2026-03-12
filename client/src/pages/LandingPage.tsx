import React, { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getDashboardUrl } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import {
  BarChart3,
  Briefcase,
  CreditCard,
  DollarSign,
  FileText,
  Package,
  Users,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  HelpCircle,
} from "lucide-react";

/**
 * LandingPage Component
 * Modern landing page with carousel, hero section, and features
 */
export default function LandingPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect((): void => {
    if (loading) {
      return;
    }

    if (isAuthenticated && user) {
      navigate(getDashboardUrl(user.role || "staff"));
    }
  }, [loading, isAuthenticated, user, navigate]);

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const carouselItems = [
    {
      title: "Sales Management",
      description: "Manage clients, projects, and track opportunities",
      color: "from-blue-500 to-blue-600",
      icon: <TrendingUp className="h-12 w-12" />,
    },
    {
      title: "Financial Control",
      description: "Invoicing, payments, and comprehensive reporting",
      color: "from-green-500 to-green-600",
      icon: <DollarSign className="h-12 w-12" />,
    },
    {
      title: "HR Management",
      description: "Employee records, attendance, and payroll",
      color: "from-purple-500 to-purple-600",
      icon: <Users className="h-12 w-12" />,
    },
  ];

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "Real-time Analytics",
      description: "Monitor business metrics with interactive dashboards",
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and role-based access control",
    },
    {
      icon: <Zap className="h-8 w-8 text-blue-600" />,
      title: "Workflow Automation",
      description: "Streamline processes with intelligent automations",
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Team Collaboration",
      description: "Built-in messaging and approval workflows",
    },
    {
      icon: <FileText className="h-8 w-8 text-blue-600" />,
      title: "Document Management",
      description: "Organize and track all business documents",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      title: "Growth Focused",
      description: "Tools to scale your business efficiently",
    },
  ];

  const modules = [
    { name: "Sales", icon: <TrendingUp />, color: "bg-blue-50" },
    { name: "Accounting", icon: <CreditCard />, color: "bg-green-50" },
    { name: "HR", icon: <Users />, color: "bg-purple-50" },
    { name: "Procurement", icon: <Package />, color: "bg-orange-50" },
    { name: "Inventory", icon: <FileText />, color: "bg-yellow-50" },
    { name: "Reports", icon: <BarChart3 />, color: "bg-pink-50" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Melitech CRM</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/documentation"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
            >
              <BookOpen className="h-4 w-4" />
              Docs
            </a>
            <a
              href="/user-guide"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
            >
              <HelpCircle className="h-4 w-4" />
              Guide
            </a>
            {!isAuthenticated ? (
              <>
                <Button variant="outline" size="sm" onClick={(): void => navigate("/login")}>
                  Login
                </Button>
                <Button size="sm" onClick={(): void => navigate("/signup")} className="bg-blue-600">
                  Get Started
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Hero Section with Carousel */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 z-10">
              <div>
                <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-semibold rounded-full mb-4">
                  Built for Enterprise
                </span>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Unified Business Management
                </h1>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                All-in-one CRM platform for sales, HR, accounting, procurement, and more. 
                Manage your entire business from a single, intuitive dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={(): void => navigate("/signup")}
                  className="bg-blue-600 hover:bg-blue-700 text-lg"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={(): void => navigate("/login")}
                  className="text-lg"
                >
                  View Demo
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-8 pt-8 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>

            {/* Right Carousel */}
            <div className="relative">
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                {/* Carousel Items */}
                {carouselItems.map((item, idx) => (
                  <div
                    key={item.id || `carousel-${idx}`}
                    className={`absolute w-full h-full transition-opacity duration-1000 ${
                      idx === carouselIndex ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <div
                      className={`w-full h-full bg-gradient-to-br ${item.color} flex flex-col items-center justify-center text-white p-8 text-center`}
                    >
                      {item.icon}
                      <h3 className="text-3xl font-bold mt-6">{item.title}</h3>
                      <p className="text-lg mt-4 opacity-90">{item.description}</p>
                    </div>
                  </div>
                ))}

                {/* Carousel Controls */}
                <button
                  onClick={() => setCarouselIndex((prev) => (prev - 1 + 3) % 3)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all z-10"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setCarouselIndex((prev) => (prev + 1) % 3)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all z-10"
                  aria-label="Next"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Carousel Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {carouselItems.map((_, idx) => (
                    <button
                      key={`dot-${idx}`}
                      onClick={() => setCarouselIndex(idx)}
                      className={`h-3 w-3 rounded-full transition-all ${
                        idx === carouselIndex ? "bg-white w-8" : "bg-white/50"
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Complete Suite of Modules
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to run your entire business
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {modules.map((module) => (
              <div
                key={module.name}
                className={`${module.color} dark:bg-gray-800 p-6 rounded-lg text-center hover:shadow-lg transition-shadow`}
              >
                <div className="text-blue-600 dark:text-blue-400 mb-4 flex justify-center">
                  {React.cloneElement(module.icon as React.ReactElement, {
                    className: "h-8 w-8",
                  })}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{module.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything designed to help you succeed
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card key={feature.title || `feat-${idx}`} className="hover:shadow-lg transition-shadow dark:border-gray-700">
                <CardContent className="pt-8">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses using Melitech CRM to streamline operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={(): void => navigate("/signup")}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={(): void => navigate("/documentation")}
              className="text-white border-white hover:bg-blue-700"
            >
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Melitech CRM</h3>
              <p className="text-sm text-gray-400">Unified business management platform</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/documentation" className="hover:text-blue-400">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="/user-guide" className="hover:text-blue-400">
                    User Guide
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/" className="hover:text-blue-400">
                    About
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-blue-400">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/privacy-policy" className="hover:text-blue-400">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms-and-conditions" className="hover:text-blue-400">
                    Terms & Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-sm">
            <p>&copy; 2024 Melitech CRM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
