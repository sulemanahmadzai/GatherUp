"use client";

import { Users, Target, TrendingUp, Award } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function StatsSection() {
  const stats = [
    {
      icon: Users,
      number: 1000,
      suffix: "+",
      label: "Active Members",
      duration: 2000,
    },
    {
      icon: Target,
      number: 500,
      suffix: "+",
      label: "Successful Matches",
      duration: 2500,
    },
    {
      icon: TrendingUp,
      number: 95,
      suffix: "%",
      label: "Goal Achievement Rate",
      duration: 1800,
    },
    {
      icon: Award,
      number: 5000,
      suffix: "+",
      label: "Goals Achieved",
      duration: 2200,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#053D3D] to-[#0a5555] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#A6FF48]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#BCE8E7]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Proven Results Through
            <span className="text-[#A6FF48]"> Accountability</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join thousands of members who are achieving their goals with the
            power of accountability partnerships.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} delay={idx * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  number,
  suffix,
  label,
  duration,
  delay,
}: {
  icon: any;
  number: number;
  suffix: string;
  label: string;
  duration: number;
  delay: number;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const endTime = startTime + duration;

          const updateCount = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const currentCount = Math.floor(progress * number);

            setCount(currentCount);

            if (now < endTime) {
              requestAnimationFrame(updateCount);
            } else {
              setCount(number);
            }
          };

          requestAnimationFrame(updateCount);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, duration, number]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 hover:scale-105 transition-all duration-300"
    >
      <div className="w-16 h-16 bg-[#A6FF48] rounded-xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-[#053D3D]" />
      </div>
      <div className="text-5xl font-bold text-white mb-2">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-gray-300 font-medium">{label}</div>
    </motion.div>
  );
}
