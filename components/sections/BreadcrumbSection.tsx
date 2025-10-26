interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbSectionProps {
  title: string;
  items: BreadcrumbItem[];
}

export default function BreadcrumbSection({
  title,
  items,
}: BreadcrumbSectionProps) {
  return (
    <section className="py-20 bg-gradient-to-r from-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-6">{title}</h1>
          <nav className="flex justify-center">
            <ol className="flex items-center space-x-2 text-lg">
              {items.map((item, index) => (
                <li key={index} className="flex items-center">
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-gray-300">{item.label}</span>
                  )}
                  {index < items.length - 1 && (
                    <span className="text-gray-500 mx-3">/</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
}
