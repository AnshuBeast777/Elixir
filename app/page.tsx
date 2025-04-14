import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Scissors, Clock, Star, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/salon-interior.jpg" alt="Elixir Salon Interior" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Transform Your Look</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Experience the magic of Elixir - Where style meets expertise.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center bg-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Book Now <ArrowRight className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-black">Why Choose Elixir</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Scissors, title: "Expert Stylists", description: "Professional team with years of experience" },
              { icon: Clock, title: "Flexible Hours", description: "Open 7 days a week for your convenience" },
              { icon: Star, title: "Premium Service", description: "Luxury experience at competitive prices" },
              { icon: Users, title: "Satisfied Clients", description: "Thousands of happy customers" },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-lg shadow-md">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-black">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-black">Our Services</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Haircut & Styling", price: "from $50", image: "/haircut-and-styling.jpg" },
              { title: "Beard Grooming", price: "from $25", image: "/beard-grooming.jpg" },
              { title: "Color & Highlights", price: "from $75", image: "/color-and-highlights.jpg" },
            ].map((service, index) => (
              <div key={index} className="group relative rounded-lg overflow-hidden shadow-lg">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={service.image || "/placeholder.svg"}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                  <h3 className="text-xl font-semibold mb-1">{service.title}</h3>
                  <p>{service.price}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/services"
              className="inline-flex items-center bg-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              View All Services <ArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-black">What Our Clients Say</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "John Doe",
                comment: "Absolutely love my new haircut! The stylist really understood what I wanted.",
                rating: 5,
              },
              {
                name: "Jane Smith",
                comment: "The color treatment I received was fantastic. My hair looks and feels amazing!",
                rating: 5,
              },
              {
                name: "Mike Johnson",
                comment: "Great atmosphere and friendly staff. Will definitely be coming back!",
                rating: 4,
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-md">
                <p className="text-gray-900 mb-4">"{testimonial.comment}"</p>
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400" : "text-gray-300"}`}
                          fill="currentColor"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
