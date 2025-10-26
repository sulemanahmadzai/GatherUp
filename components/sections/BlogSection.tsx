export default function BlogSection() {
  const blogPosts = [
    "When Is It Time to Replace Your Tires?",
    "Does the Brand of Gas I Use Actually Matter?",
    "Why Does My Car Heater Blow Cold Air?",
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-orange-500 font-semibold text-lg">
            From Our Blog
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2">Latest News</h2>
        </div>
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {blogPosts.map((title, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow-lg"
            >
              <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <span>By Lily Anne</span>
                  <span>Oct 12, 2019</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
