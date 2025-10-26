"use client";

import {
  Users,
  UserPlus,
  TrendingUp,
  Mail,
  RefreshCw,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: UserPlus,
    title: "Invitation System",
    description:
      "Admins invite members via unique one-time links. Sign up, complete onboarding, and get ready to be matched with your accountability partner.",
    color: "bg-[#E0F2CC]",
  },
  {
    icon: Target,
    title: "SMART Goal Setting",
    description:
      "Define your goals using the SMART framework during onboarding. Set specific, measurable, achievable, relevant, and time-bound objectives.",
    color: "bg-[#BCE8E7]",
  },
  {
    icon: Users,
    title: "Manual Matching",
    description:
      "Our admin team carefully matches you with compatible partners based on your goals, communication preferences, and commitment level.",
    color: "bg-[#E0F2CC]",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Track your journey with our intuitive 1-12 scale system. Update progress, add notes, and visualize your achievements over time.",
    color: "bg-[#BCE8E7]",
  },
  {
    icon: Mail,
    title: "Automated Communications",
    description:
      "Receive automated check-in reminders (Mon/Thu) and reflection prompts (Wed) to keep you and your partner accountable and engaged.",
    color: "bg-[#E0F2CC]",
  },
  {
    icon: RefreshCw,
    title: "Rematch Requests",
    description:
      "Need a change? Submit a rematch request anytime. Our admin team will review and pair you with a new accountability partner that fits better.",
    color: "bg-[#BCE8E7]",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-[#053D3D] mb-4">
            Everything You Need to
            <span className="text-[#A6FF48]"> Stay Accountable</span>
          </h2>
          <p className="text-xl text-gray-600">
            GatherUp provides a complete accountability partnership system, from
            matching to progress tracking and beyond.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group"
            >
              <div className="bg-white border border-gray-200 rounded-2xl p-8 h-full hover:shadow-xl hover:border-[#A6FF48]/30 transition-all duration-300">
                <div
                  className={`w-16 h-16 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-[#053D3D]" />
                </div>
                <h3 className="text-2xl font-bold text-[#053D3D] mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-4">
            Ready to start your accountability journey?
          </p>
          <a
            href="/sign-in"
            className="inline-flex items-center gap-2 bg-[#053D3D] hover:bg-[#0a5555] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Get Started Today
          </a>
        </motion.div>
      </div>
    </section>
  );
}
