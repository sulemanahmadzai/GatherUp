import ServicesSection from "@/components/sections/ServicesSection";
import StatsSection from "@/components/sections/StatsSection";
import WorkProcessSection from "@/components/sections/WorkProcessSection";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/sections/Footer";
import BreadcrumbSection from "@/components/sections/BreadcrumbSection";
import { Settings, Car, Wrench, Gauge, Battery } from "lucide-react";

export default function ServicesPage() {
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Services" }];
  const detailedServices = [
    {
      icon: Settings,
      title: "Engine Repair & Maintenance",
      description:
        "Complete engine diagnostics, repair, and regular maintenance services to keep your vehicle running smoothly.",
      features: [
        "Engine Diagnostics",
        "Oil Changes",
        "Tune-ups",
        "Engine Rebuilds",
      ],
    },
    {
      icon: Car,
      title: "Tire Services",
      description:
        "Professional tire installation, balancing, rotation, and replacement services for all vehicle types.",
      features: [
        "Tire Installation",
        "Wheel Balancing",
        "Tire Rotation",
        "Flat Tire Repair",
      ],
    },
    {
      icon: Wrench,
      title: "Transmission Services",
      description:
        "Expert transmission repair, maintenance, and replacement services for manual and automatic transmissions.",
      features: [
        "Transmission Repair",
        "Fluid Changes",
        "Clutch Service",
        "Transmission Rebuilds",
      ],
    },
    {
      icon: Gauge,
      title: "Advanced Diagnostics",
      description:
        "State-of-the-art computer diagnostics to identify and resolve complex vehicle issues quickly.",
      features: [
        "Computer Diagnostics",
        "Error Code Reading",
        "System Analysis",
        "Performance Testing",
      ],
    },
    {
      icon: Battery,
      title: "Electrical Services",
      description:
        "Comprehensive electrical system services including battery, alternator, and starter repairs.",
      features: [
        "Battery Testing",
        "Alternator Repair",
        "Starter Service",
        "Wiring Repairs",
      ],
    },
    {
      icon: Settings,
      title: "Brake Services",
      description:
        "Complete brake system inspection, repair, and replacement to ensure your safety on the road.",
      features: [
        "Brake Inspection",
        "Pad Replacement",
        "Rotor Service",
        "Brake Fluid Change",
      ],
    },
  ];

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <BreadcrumbSection title="Our Services" items={breadcrumbItems} />

      {/* Detailed Services */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {detailedServices.map((service, index) => (
              <div key={index} className="flex space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center">
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Standard Services Grid */}
      <ServicesSection />

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
              { name: "Calvy Jenefar", role: "Master Technician" },
              { name: "Jemy Walton", role: "Engine Specialist" },
              { name: "Lucy Grace", role: "Diagnostic Expert" },
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
                  <p className="text-orange-500 font-medium">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WorkProcessSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
