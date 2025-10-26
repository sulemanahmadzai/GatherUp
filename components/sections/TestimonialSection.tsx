"use client";

import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function TestimonialSection() {
  const testimonials = [
    {
      name: "Sarah Thompson",
      role: "Member",
      rating: 5,
      text: "Being matched with an accountability partner who shares my fitness goals has been game-changing. The automated check-ins keep us both on track, and the progress tracking makes it easy to see how far I've come!",
      image: "ST",
      goal: "Complete 5K Training Program",
    },
    {
      name: "Marcus Williams",
      role: "Member",
      rating: 5,
      text: "The onboarding process was thorough and thoughtful. I was matched with a partner within 48 hours, and we've been crushing our goals together. The 1-12 progress scale is perfect for tracking without overthinking.",
      image: "MW",
      goal: "Build Consistent Morning Routine",
    },
    {
      name: "Emily Rodriguez",
      role: "Member",
      rating: 5,
      text: "I love the automated reminders! Every Monday and Thursday, I get a check-in prompt, and Wednesdays are for reflection. It's the structure I needed to stay accountable to my writing goals.",
      image: "ER",
      goal: "Write First Novel Draft",
    },
    {
      name: "David Chen",
      role: "Member",
      rating: 5,
      text: "When my first accountability partner moved away, I submitted a rematch request. Within a week, I was paired with someone even more aligned with my goals. The admin team really cares about good matches!",
      image: "DC",
      goal: "Launch Side Business",
    },
    {
      name: "Jessica Park",
      role: "Member",
      rating: 5,
      text: "The progress tracking dashboard is fantastic. Seeing my progress visualized over time keeps me motivated. My partner and I check in twice weekly, and it's made all the difference in staying committed.",
      image: "JP",
      goal: "Complete Certification Course",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-[#E0F2CC]/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-20 left-0 w-96 h-96 bg-[#A6FF48]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-[#BCE8E7]/20 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 bg-[#A6FF48]/20 text-[#053D3D] font-semibold rounded-full mb-4">
            Success Stories
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#053D3D] mb-4">
            Real Members, Real
            <span className="text-[#A6FF48]"> Results</span>
          </h2>
          <p className="text-lg text-gray-600">
            Hear from members who are achieving their goals with accountability
            partners on GatherUp.
          </p>
        </motion.div>

        {/* Main Testimonial Card */}
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-8 left-8 w-16 h-16 bg-[#A6FF48]/10 rounded-full flex items-center justify-center">
                <Quote className="w-8 h-8 text-[#A6FF48]" />
              </div>

              <div className="lg:flex lg:gap-12 items-center">
                {/* Text Content */}
                <div className="flex-1 mt-12 lg:mt-0">
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-6 h-6 fill-[#A6FF48] text-[#A6FF48]"
                      />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-8 italic">
                    "{currentTestimonial.text}"
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A6FF48] to-[#BCE8E7] flex items-center justify-center text-[#053D3D] font-bold text-xl">
                      {currentTestimonial.image}
                    </div>
                    <div>
                      <div className="font-bold text-[#053D3D] text-lg">
                        {currentTestimonial.name}
                      </div>
                      <div className="text-gray-600">
                        {currentTestimonial.role}
                      </div>
                    </div>
                  </div>

                  {/* Goal Badge */}
                  <div className="mt-6">
                    <span className="inline-block text-sm text-[#053D3D] font-medium bg-[#E0F2CC] px-4 py-2 rounded-full">
                      🎯 Goal: {currentTestimonial.goal}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="w-12 h-12 rounded-full border-[#053D3D] text-[#053D3D] hover:bg-[#053D3D] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "bg-[#053D3D] w-8"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="w-12 h-12 rounded-full border-[#053D3D] text-[#053D3D] hover:bg-[#053D3D] hover:text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-4 text-lg">
            Ready to achieve your goals with accountability?
          </p>
          <a
            href="/sign-in"
            className="inline-flex items-center gap-2 bg-[#053D3D] hover:bg-[#0a5555] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Join GatherUp Today
          </a>
        </motion.div>
      </div>
    </section>
  );
}
