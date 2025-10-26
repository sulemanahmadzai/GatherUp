"use client";

import {
  Settings,
  Gauge,
  CircleDot,
  Wrench,
  Battery,
  Disc,
  Wind,
  Droplets,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ServicesSection() {
  const services = [
    {
      icon: Settings,
      title: "Engine Repair & Diagnostics",
      description:
        "Complete engine diagnostics, repair, and rebuilds using advanced computer diagnostic tools.",
      price: "From $89",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: CircleDot,
      title: "Tire Services",
      description:
        "Tire rotation, balancing, alignment, and replacement with top tire brands.",
      price: "From $49",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Wrench,
      title: "Transmission Service",
      description:
        "Transmission fluid change, repair, and complete transmission replacement services.",
      price: "From $129",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Disc,
      title: "Brake Services",
      description:
        "Brake pad replacement, rotor resurfacing, brake fluid flush, and complete brake system inspection.",
      price: "From $79",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Battery,
      title: "Battery Services",
      description:
        "Battery testing, replacement, and electrical system diagnostics to keep you powered.",
      price: "From $39",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Wind,
      title: "AC & Heating",
      description:
        "Air conditioning recharge, heating system repair, and climate control diagnostics.",
      price: "From $69",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: Droplets,
      title: "Oil Change & Lubrication",
      description:
        "Complete oil change service with filter replacement and multi-point inspection.",
      price: "From $29",
      color: "from-amber-500 to-yellow-500",
    },
    {
      icon: Zap,
      title: "Electrical System",
      description:
        "Comprehensive electrical diagnostics, starter & alternator repair, and wiring services.",
      price: "From $59",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Gauge,
      title: "Pre-Purchase Inspection",
      description:
        "Thorough vehicle inspection before you buy to identify potential issues and save money.",
      price: "From $99",
      color: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary font-semibold rounded-full mb-4">
            Our Services
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Complete Auto Repair & Maintenance Services
          </h2>
          <p className="text-lg text-gray-600">
            From routine maintenance to major repairs, our certified technicians
            handle it all with precision and care.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent hover:-translate-y-2"
            >
              {/* Gradient Header */}
              <div
                className={`h-32 bg-gradient-to-br ${service.color} relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <service.icon className="w-16 h-16 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                {/* Decorative Circle */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                </div>

                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-primary font-bold text-lg">
                    {service.price}
                  </div>
                  <button className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="bg-gradient-to-br from-primary to-orange-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>

          <div className="relative space-y-6">
            <h3 className="text-3xl lg:text-4xl font-bold">
              Don't See the Service You Need?
            </h3>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              We offer a comprehensive range of auto repair services. Contact us
              to discuss your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
              >
                View All Services
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-6 text-lg font-semibold"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
