import BookingForm from "@/components/BookingForm";

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Book Your <span className="text-primary">Appointment</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Schedule your vehicle service with our expert technicians. We're
            here to keep your car running smoothly.
          </p>
        </div>

        {/* Booking Form */}
        <BookingForm />

        {/* Additional Info */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Quick Response</h3>
            <p className="text-sm text-gray-600">
              We respond to all bookings within 24 hours
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔧</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Expert Service</h3>
            <p className="text-sm text-gray-600">
              ASE-certified technicians you can trust
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">12-Month Warranty</h3>
            <p className="text-sm text-gray-600">
              All repairs backed by our guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
