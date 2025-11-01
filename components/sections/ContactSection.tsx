"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Users } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ContactSection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-[#053D3D] to-[#0a5555] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#A6FF48]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#BCE8E7]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#A6FF48] rounded-2xl mb-4">
              <Users className="w-10 h-10 text-[#053D3D]" />
            </div>

            {/* Heading */}
            <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
              Ready to Achieve Your Goals
              <span className="block text-[#A6FF48] mt-2">
                With Accountability?
              </span>
            </h2>

            {/* Subheading */}
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join GatherUp today. Get matched with an accountability partner,
              track your progress, and achieve success together.
            </p>

            {/* Benefits List */}
            <div className="grid md:grid-cols-3 gap-6 my-12">
              {[
                "Smart partner matching",
                "Progress tracking system",
                "Automated reminders",
              ].map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                  className="flex items-center justify-center gap-2 text-white"
                >
                  <CheckCircle className="w-5 h-5 text-[#A6FF48] flex-shrink-0" />
                  <span className="font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <Link href="/sign-in">
                <Button
                  size="lg"
                  className="bg-[#A6FF48] hover:bg-[#95ee37] text-[#053D3D] px-10 py-7 text-xl font-semibold shadow-2xl hover:shadow-[#A6FF48]/50 transition-all duration-300 group"
                >
                  Get Started
                  <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-black hover:bg-gray-300 hover:text-[#053D3D] px-10 py-7 text-xl font-semibold backdrop-blur-sm"
                >
                  Contact Us
                </Button>
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="pt-8 flex items-center justify-center gap-4 text-gray-300"
            >
              <div className="flex -space-x-3">
                {["ST", "MW", "ER", "DC", "JP"].map((initials, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A6FF48] to-[#BCE8E7] border-2 border-[#053D3D] flex items-center justify-center text-[#053D3D] font-bold text-sm"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-sm">
                <span className="font-bold text-[#A6FF48]">Join</span> our
                growing community
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
