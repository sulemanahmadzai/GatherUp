import { Settings } from "lucide-react";

export default function WorkProcessSection() {
  const steps = [
    { step: "1", title: "Choose Your Service", image: true },
    { step: "2", title: "Make An Appointment", image: false },
    { step: "3", title: "Confrim Your Request", image: true },
    { step: "4", title: "Pick Your Car", image: false },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-orange-500 font-semibold text-lg">
            Work Prossess
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2">How it Work</h2>
        </div>
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="text-center">
              <div className={`mb-6 ${item.image ? "" : "order-2"}`}>
                <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                  <Settings className="w-16 h-16 text-orange-500" />
                </div>
              </div>
              <div className={item.image ? "" : "order-1 mb-6"}>
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
