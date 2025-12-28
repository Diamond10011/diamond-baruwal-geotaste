import React, { useState } from "react";
import {
  ChefHat,
  UtensilsCrossed,
  Search,
  Star,
  MapPin,
  Clock,
  Users,
  Smartphone,
  TrendingUp,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/Image/GeoTasteLogo.png"
import heroimage from "../assets/Image/herosectionimage.png";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isHovered, setIsHovered] = useState(null);

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Smart Search",
      description:
        "Find recipes and restaurants tailored to your taste and dietary preferences instantly.",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Curated Reviews",
      description:
        "Access authentic reviews from food lovers and expert critics to make the best choice.",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Local Discovery",
      description:
        "Discover hidden gems and trending spots in your neighborhood and beyond.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Save Time",
      description:
        "Get personalized recommendations in seconds, not hours of searching.",
    },
  ];

  const stats = [
    { number: "50K+", label: "Recipes" },
    { number: "10K+", label: "Restaurants" },
    { number: "100K+", label: "Happy Users" },
    { number: "4.9★", label: "Rating" },
  ];

  const handleSubmit = () => {
    if (email) {
      alert(`Thanks for signing up with ${email}!`);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 to-gray-100">
      
      {/* Navigation */}
      <nav className="backdrop-blur-md shadow-sm fixed w-full h-20 top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-around items-center h-16">
            <div className="flex items-center pt-2 space-x-4">
              <img src={logo} alt="GeoTaste Logo" className="h-16 rounded-full" />
            </div>
            <div className="text-2xl font-bold text-orange-600">
              <h1>Geo-Locational Food & Restaurant Recommendor</h1>
            </div>
            <div>
              <button className="text-gray-700 hover:text-orange-600 px-4 py-2 rounded-full transition-colors">
               <Link to="/register">Sign In</Link>
              </button>

              <button className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition-all transform hover:scale-105">
                <Link to="/login">Get Started</Link>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="bg-amber-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
                  🎉 Now with recommendations system
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Discover Your Next
                <span className="block bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Culinary Adventure
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                From home-cooked recipes to restaurant reservations, find
                exactly what you're craving with personalized recommendations
                powered by AI.
              </p>
              
              <div className="flex items-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>100K+ users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Award winning</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="aspect-square flex items-center justify-center">
                <img src={heroimage} alt="Hero" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-6 transform hover:rotate-3 transition-transform">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-full p-3">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">2.5K+</p>
                    <p className="text-sm text-gray-600">Daily searches</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center transform hover:scale-110 transition-transform"
              >
                <p className="text-4xl md:text-5xl font-bold bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {stat.number}
                </p>
                <p className="text-gray-600 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Explore Food
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make your culinary journey
              effortless and enjoyable
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setIsHovered(index)}
                onMouseLeave={() => setIsHovered(null)}
                className={`bg-amber-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 ${
                  isHovered === index
                    ? "border-2 border-orange-500"
                    : "border-2 border-transparent"
                }`}
              >
                <div className="bg-linear-to-br from-orange-100 to-amber-100 w-14 h-14 rounded-xl flex items-center justify-center text-orange-600 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-full ">
          <div className="bg-linear-to-r from-red-500 to-amber-600 rounded-3xl p-12 md:p-16 text-center shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Your Food Journey?
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Join thousands of food lovers discovering amazing recipes and
              restaurants every day
            </p>
            <button className="bg-white text-orange-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all transform hover:scale-105">
                <Link to="/register">Get Started for Free</Link >
              
            </button>
            <p className="text-orange-100 mt-4 text-sm">
              No credit card required • Try for Free 
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src={logo} alt="Logo" className="rounded-2xl h-16" />
                <span className="text-xl font-bold text-white">GeoTaste</span>
              </div>
              <p className="text-sm">
                Discover your next culinary adventure with AI-powered
                recommendations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 GeoTaste. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
