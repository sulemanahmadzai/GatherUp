import AboutSection from "@/components/sections/AboutSection";
import StatsSection from "@/components/sections/StatsSection";
import TestimonialSection from "@/components/sections/TestimonialSection";
import Footer from "@/components/sections/Footer";
import BreadcrumbSection from "@/components/sections/BreadcrumbSection";
import ServicesSection from "@/components/sections/ServicesSection";

export default function AboutPage() {
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "About" }];

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <BreadcrumbSection title="About Us" items={breadcrumbItems} />

      <AboutSection />
      <StatsSection />

      {/* Enhanced Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-semibold text-lg">
              Meet Our Expertise
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">
              Our Awesome Team
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {[
              {
                name: "Calvy Jenefar",
                role: "Master Technician",
                experience: "15+ Years",
              },
              {
                name: "Jemy Walton",
                role: "Engine Specialist",
                experience: "12+ Years",
              },
              {
                name: "Lucy Grace",
                role: "Diagnostic Expert",
                experience: "10+ Years",
              },
            ].map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
              >
                <div className="h-64 bg-gradient-to-br from-orange-100 to-orange-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600">
                        <span className="text-white text-sm">f</span>
                      </div>
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600">
                        <span className="text-white text-sm">t</span>
                      </div>
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600">
                        <span className="text-white text-sm">i</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-orange-500 font-medium mb-1">
                    {member.role}
                  </p>
                  <p className="text-gray-600">{member.experience}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServicesSection />

      <TestimonialSection />
      <Footer />
    </div>
  );
}
