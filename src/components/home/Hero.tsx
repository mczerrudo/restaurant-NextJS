// components/home/Hero.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, Utensils, Clock, Star } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
  showSearch?: boolean;
  stats?: Array<{ value: string; label: string; icon: React.ReactNode }>;
};

export default function Hero({
  title,
  subtitle,
  imageSrc,
  imageAlt = "",
  primaryHref,
  primaryLabel = "Order now",
  secondaryHref,
  secondaryLabel = "Browse restaurants",
  className,
  showSearch = false,
  stats = [
    { value: "1000+", label: "Restaurants", icon: <Utensils className="h-4 w-4" /> },
    { value: "4.8", label: "Average rating", icon: <Star className="h-4 w-4" /> }
  ]
}: Props) {
  return (
    <section
      className={[
        "relative overflow-hidden rounded-3xl border-0 shadow-2xl",
        "min-h-[500px] md:min-h-[600px] lg:min-h-[700px]",
        imageSrc ? "" : "bg-gradient-to-br from-primary/90 via-primary/80 to-primary/60",
        className ?? "",
      ].join(" ")}
    >
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      )}

      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

      <div className="relative z-10 px-6 md:px-12 lg:px-16 h-full flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-4 md:mt-6 text-white/90 text-lg md:text-xl lg:text-2xl font-light max-w-2xl"
              >
                {subtitle}
              </motion.p>
            )}

            {/* Search bar */}
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8 max-w-2xl"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search for restaurants or cuisine..."
                    className="w-full pl-12 pr-6 py-4 rounded-full border-0 bg-white/95 shadow-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none text-base"
                  />
                </div>
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              {primaryHref && (
                <Button asChild size="lg" className="rounded-full px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                  <Link href={primaryHref}>{primaryLabel}</Link>
                </Button>
              )}
              {secondaryHref && (
                <Button asChild size="lg" variant="outline" className="rounded-full px-8 py-6 text-base font-semibold bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
                  <Link href={secondaryHref}>{secondaryLabel}</Link>
                </Button>
              )}
            </motion.div>
          </motion.div>

          {/* Stats section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 md:mt-16 lg:mt-20"
          >
            <div className="flex flex-wrap gap-6 md:gap-10">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3 text-white/90">
                  <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm md:text-base opacity-80">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent opacity-10" />
      <div className="absolute top-1/4 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
    </section>
  );
}