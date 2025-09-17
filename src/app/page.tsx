"use server";

import { listTopRestaurants } from "@/actions/restaurants";
import TopRestaurants from "@/components/restaurant/TopRestaurants";
import RestaurantsCarousel from "@/components/home/RestaurantCarousel";
import { listRandomRestaurants } from "@/actions/restaurants";
import Hero from "@/components/home/Hero";
import { Users, Clock, ShieldCheck, Utensils, Star } from "lucide-react";
import { getHeroStats } from "@/actions/restaurants";

export default async function HomePage() {
  const items = await listRandomRestaurants(12);
  const stats = await getHeroStats();

  function formatCount(n: number) {
    if (n >= 1_000_000)
      return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}m+`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k+`;
    return `${n}+`;
  }

  const heroStats = [
    {
      value: formatCount(stats.totalRestaurants), // e.g. "1.2k+"
      label: "Restaurants",
      icon: <Utensils className="h-4 w-4" />,
    },
    {
      value: stats.averageRating ? stats.averageRating.toFixed(1) : "—",
      label: "Average rating",
      icon: <Star className="h-4 w-4" />,
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <div className="mb-16 ">
        <Hero
          title="Find your next favorite bite"
          subtitle="Order from nearby restaurants with quick delivery and honest reviews."
          imageSrc="/hero.jpg"
          imageAlt="A table filled with delicious food."
          primaryHref="/restaurants"
          primaryLabel="Explore restaurants"
          secondaryHref="/orders"
          secondaryLabel="Track my orders"
          className="min-h-[340px] md:min-h-[400px] rounded-none border-0"
          stats={heroStats}
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Restaurants Section */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Top Rated Restaurants
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the most loved restaurants in your area, curated based on
              customer ratings and reviews.
            </p>
          </div>
          <TopRestaurants limit={6} includeUnrated={true} />
        </section>

        {/* Featured Restaurants Carousel */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Featured Restaurants
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore these hand-picked restaurants offering amazing food and
              great service.
            </p>
          </div>
          <RestaurantsCarousel items={items} />
        </section>

        {/* App Features Section */}
        <section className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-3xl p-8 md:p-12 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Why Choose Us?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make food ordering simple, fast, and delightful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users />
              </div>
              <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
              <p className="text-gray-600">
                Choose from hundreds of restaurants offering diverse cuisines.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Get your food delivered quickly with our optimized delivery
                network.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                Enjoy safe and secure payment options with encryption
                protection.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to order?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who enjoy delicious meals
            delivered to their doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/restaurants"
              className="bg-primary text-white px-8 py-4 rounded-full font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
            >
              Browse All Restaurants
            </a>
            <a
              href="/about"
              className="border-2 border-primary text-primary px-8 py-4 rounded-full font-semibold hover:bg-primary/10 transition-colors"
            >
              Learn More About Us
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
