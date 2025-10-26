"use client";

import { motion } from "framer-motion";
import { Mail, UserPlus, Users, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Mail,
    step: "Step 1",
    title: "Receive Invitation",
    description:
      "Get invited by your program admin via a unique one-time link. Click the link to begin your accountability journey.",
  },
  {
    icon: UserPlus,
    step: "Step 2",
    title: "Complete Onboarding",
    description:
      "Fill out your profile with your SMART goal, preferences, communication style, and commitment level. This helps us match you perfectly.",
  },
  {
    icon: Users,
    step: "Step 3",
    title: "Get Matched",
    description:
      "Our admin team reviews your profile and carefully matches you with a compatible accountability partner (1:1 or group).",
  },
  {
    icon: TrendingUp,
    step: "Step 4",
    title: "Track & Achieve",
    description:
      "Update your progress regularly, receive automated check-ins, and work with your partner to achieve your goals together.",
  },
];

export default function AboutSection() {
  return (
    <section
      id="how-it-works"
      className="py-20 lg:py-32 bg-gradient-to-br from-[#E0F2CC] to-white"
    >
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
            How GatherUp
            <span className="text-[#A6FF48]"> Works</span>
          </h2>
          <p className="text-xl text-gray-600">
            From invitation to achievement, here's how GatherUp helps you stay
            accountable and reach your goals.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-8 h-full border-2 border-[#A6FF48]/20 hover:border-[#A6FF48] hover:shadow-xl transition-all duration-300">
                {/* Step Number */}
                <div className="inline-block bg-[#A6FF48] text-[#053D3D] text-sm font-bold px-3 py-1 rounded-full mb-4">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 bg-[#E0F2CC] rounded-xl flex items-center justify-center mb-4">
                  <step.icon className="w-7 h-7 text-[#053D3D]" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[#053D3D] mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector Arrow (desktop only) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    className="text-[#A6FF48]"
                  >
                    <path
                      d="M16 4L26 16L16 28M26 16H6"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <a
            href="/sign-in"
            className="inline-flex items-center gap-2 bg-[#053D3D] hover:bg-[#0a5555] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Start Your Journey
          </a>
        </motion.div>
      </div>
    </section>
  );
}
