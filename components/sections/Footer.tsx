import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Footer() {
  const platformLinks = [
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Features", href: "/#features" },
    { name: "Contact", href: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
  ];

  return (
    <footer className="bg-gradient-to-b from-[#053D3D] to-[#042929] text-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#A6FF48] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#BCE8E7] rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Main Footer Content */}
        <div className="py-16 border-b border-white/10">
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1 space-y-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-[#A6FF48] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="text-[#053D3D] font-bold text-xl">G</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">GatherUp</h3>
                  <p className="text-xs text-gray-300">
                    Accountability Platform
                  </p>
                </div>
              </Link>
              <p className="text-gray-300 leading-relaxed">
                Connect with accountability partners, track your goals, and
                achieve success together. Transform your aspirations into
                achievements with the power of accountability.
              </p>

              {/* Social Media */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Follow Us</h4>
                <div className="flex gap-3">
                  {[
                    { icon: Facebook, href: "#" },
                    { icon: Twitter, href: "#" },
                    { icon: Instagram, href: "#" },
                    { icon: Linkedin, href: "#" },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#A6FF48] hover:scale-110 transition-all group"
                    >
                      <social.icon className="w-5 h-5 text-gray-300 group-hover:text-[#053D3D] transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="text-lg font-bold mb-6 relative inline-block">
                Platform
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-[#A6FF48]"></span>
              </h3>
              <ul className="space-y-3">
                {platformLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-[#A6FF48] transition-colors flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-bold mb-6 relative inline-block">
                Get In Touch
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-[#A6FF48]"></span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 group">
                  <div className="w-10 h-10 bg-[#A6FF48]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#A6FF48]/20 transition-colors">
                    <Mail className="w-5 h-5 text-[#A6FF48]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Email</p>
                    <a
                      href="mailto:hello@gatherup.com"
                      className="text-sm text-gray-300 hover:text-[#A6FF48] transition-colors"
                    >
                      hello@gatherup.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-b border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Stay Motivated</h3>
              <p className="text-gray-300">
                Get weekly tips, success stories, and accountability insights
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-[#A6FF48] text-white placeholder:text-gray-400 flex-1 md:w-80"
              />
              <Button className="bg-[#A6FF48] hover:bg-[#95ee37] text-[#053D3D] px-6 font-semibold">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-300">
            <p>© 2025 GatherUp. All rights reserved.</p>
            <div className="flex gap-6">
              {legalLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="hover:text-[#A6FF48] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
