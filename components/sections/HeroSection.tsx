"use client";

import { Button } from "@/components/ui/button";
import { Users, Mail, TrendingUp, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-[#053D3D] via-[#0a5555] to-[#053D3D] overflow-hidden min-h-screen flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#A6FF48] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#BCE8E7] rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGgtMnYyaDJ2LTJ6bTAgNGgtMnYyaDJ2LTJ6bS0yIDRoMnYyaC0ydi0yem0tMiAyaDJ2MmgtMnYtMnptLTIgMmgydjJoLTJ2LTJ6bS0yIDJoMnYyaC0ydi0yem0tMiAyaDJ2MmgtMnYtMnoiIHN0cm9rZT0iI0E2RkY0OCIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvZz48L3N2Zz4=')] opacity-5"></div>

      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8 text-white"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-[#A6FF48]/10 border border-[#A6FF48]/30 rounded-full px-4 py-2"
            >
              <div className="w-2 h-2 bg-[#A6FF48] rounded-full animate-pulse"></div>
              <span className="text-sm text-[#A6FF48] font-medium">
                Accountability Partnership Platform
              </span>
            </motion.div>

            {/* Main Headline */}
            <div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Connect. Commit.
                <span className="block text-[#A6FF48] mt-2">
                  Achieve Together.
                </span>
              </h1>
              <p className="text-xl text-gray-300 mt-6 leading-relaxed">
                GatherUp pairs you with the perfect accountability partner to
                help you achieve your goals. Track progress, stay motivated with
                automated check-ins, and celebrate wins together.
              </p>
            </div>

            {/* Key Features */}
            <div className="space-y-4">
              {[
                "Get matched with compatible accountability partners",
                "Track progress with our intuitive 1-12 scale system",
                "Receive automated check-ins and reflection prompts",
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="w-6 h-6 text-[#A6FF48] flex-shrink-0 mt-1" />
                  <span className="text-gray-200 text-lg">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link href="/sign-in">
                <Button
                  size="lg"
                  className="bg-[#A6FF48] hover:bg-[#95ee37] text-[#053D3D] px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-[#053D3D] px-8 py-6 text-lg font-semibold backdrop-blur-sm"
                >
                  See How It Works
                </Button>
              </Link>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="flex gap-8 pt-6 border-t border-white/20"
            >
              {[
                { value: "Smart", label: "Matching Algorithm" },
                { value: "1-12", label: "Progress Scale" },
                { value: "Auto", label: "Check-In Reminders" },
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="text-3xl font-bold text-[#A6FF48]">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-300 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative space-y-4">
              {/* Floating Feature Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white rounded-2xl shadow-2xl p-6 hover:shadow-[#A6FF48]/20 hover:shadow-3xl transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E0F2CC] flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-[#053D3D]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#053D3D] mb-1">
                      Smart Matching
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Our admin team pairs you with partners based on your
                      goals, preferences, and commitment level.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="bg-white rounded-2xl shadow-2xl p-6 ml-8 hover:shadow-[#A6FF48]/20 hover:shadow-3xl transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E0F2CC] flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-[#053D3D]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#053D3D] mb-1">
                      Progress Tracking
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Update your progress with our 1-12 scale system and
                      visualize your journey with charts.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl p-6 hover:shadow-[#A6FF48]/20 hover:shadow-3xl transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E0F2CC] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-[#053D3D]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#053D3D] mb-1">
                      Automated Check-Ins
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Never miss a beat with automated check-in reminders and
                      reflection prompts sent to your inbox.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute -z-10 -right-4 top-4 w-full h-full bg-[#A6FF48]/10 rounded-2xl blur-xl"></div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 fill-white"
          viewBox="0 0 1440 48"
          preserveAspectRatio="none"
        >
          <path d="M0,24 C240,48 480,48 720,24 C960,0 1200,0 1440,24 L1440,48 L0,48 Z"></path>
        </svg>
      </div>
    </section>
  );
}
