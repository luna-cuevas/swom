"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Carousel from "@/components/Carousel";
import HomeMapComponent from "@/components/HomeMapComponent";

interface HomeContentProps {
  highlightedListings: any[];
}

export const HomeContent = ({ highlightedListings }: HomeContentProps) => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[calc(100vh-155px)] w-full overflow-hidden">
        {/* Full-screen carousel */}
        <Carousel
          images={highlightedListings?.map((listing: any) => ({
            src: listing.homeInfo.firstImage,
            highlightTag: listing.highlightTag,
            slug: listing.slug.current,
            listingNum: listing._id,
          }))}
          thumbnails={false}
          overlay={true}
          homePage={true}
        />

        {/* Content overlay */}
        <div className="absolute w-fit h-fit m-auto inset-0 flex flex-col">
          {/* Hero content */}
          <div className="flex-grow flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-center text-white max-w-4xl mx-auto space-y-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-wide drop-shadow-lg">
                MAKE MEMORIES
                <br />
                ALL OVER THE WORLD
              </h1>
              <p className="text-lg sm:text-xl md:text-xl font-light max-w-2xl mx-auto text-white/90 drop-shadow px-4 sm:px-0">
                Join our exclusive community of travelers and swap your home for
                free.
                <br className="hidden sm:block" />
                No rent, no hidden fees, just authentic experiences.
              </p>
              <div className="flex flex-row items-center justify-center gap-4 sm:gap-6 pt-4 px-4 sm:px-0">
                <Link
                  href="/become-member"
                  className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-[#7F8119] hover:bg-[#8a8c25] transition-all duration-300 rounded-lg text-base sm:text-lg tracking-wide shadow-lg text-center">
                  Join Now
                </Link>
                <Link
                  href="/how-it-works"
                  className="w-full sm:w-auto px-8 py-3 sm:py-4 text-[#172544] bg-white/60 hover:bg-white/80 transition-all duration-300 rounded-lg text-base sm:text-lg tracking-wide backdrop-blur-sm shadow-lg text-center">
                  How It Works
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cities banner */}
      <div className="w-full py-6 sm:py-8 bg-[#7F8119]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-x-6 sm:gap-x-12 gap-y-3 sm:gap-y-4">
            {[
              "LONDON",
              "PARIS",
              "NEW YORK",
              "VIETNAM",
              "COLOMBIA",
              "SWITZERLAND",
            ].map((city, index) => (
              <motion.span
                key={city}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-white/90 text-base sm:text-lg tracking-[0.2em]">
                {city}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <section className="py-20 bg-[#FDF8F6]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Image
            src="/logo-icons.png"
            alt="SWOM"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h2 className="text-2xl md:text-3xl font-light mb-4">
            Swap your home
          </h2>
          <p className="text-xl md:text-2xl font-light mb-6">
            Welcome to our members-only community of travelers around the globe.
          </p>
          <p className="text-xl md:text-2xl font-light mb-8">
            Exchange your home for free, for travel, for work, for fun!
          </p>
          <Link
            href="/become-member"
            className="inline-block px-8 py-3 bg-[#172544] text-white rounded-full text-lg hover:bg-[#2a3b5e] transition-colors duration-300">
            Become a Member
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-4xl sm:text-6xl font-light text-[#172544] mb-3 sm:mb-4">
                  SWOM
                </h2>
                <p className="text-xl sm:text-2xl text-gray-600 font-light">
                  (Verb): to swap your home
                </p>
              </div>
              <p className="text-lg sm:text-xl leading-relaxed text-gray-700">
                Get ready to SWOM your way to a whole new address and a suitcase
                full of memories. Experience authentic living in destinations
                worldwide.
              </p>
              <Link
                href="/listings"
                className="inline-block w-full sm:w-auto text-center bg-[#172544] text-white px-6 sm:px-10 py-3 sm:py-4 rounded-lg text-base sm:text-lg transition-all duration-300 hover:bg-[#2a3b5e]">
                Explore Homes
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="aspect-[4/3] relative rounded-2xl overflow-hidden">
              <Image
                src="/homepage/hero-image-6.png"
                alt="Featured home"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Culture Section with Rotating Text */}
      <section className="lg:py-0 py-4 bg-[#F4ECE8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8">
              <h2 className="text-4xl font-light text-[#172544]">
                WE ARE A REVOLUTION
                <br />
                IN THE WAY OF TRAVELING
              </h2>
              <p className="text-xl leading-relaxed text-gray-700">
                Get ready to gain diverse cultural experiences and broaden your
                perspective on life. Every home tells a unique story.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, rotate: -180 }}
              whileInView={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative aspect-square">
              <div className="circle-button">
                <div className="main_circle_text">
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <defs>
                      <path
                        id="circle"
                        d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                      />
                    </defs>
                    <text>
                      <textPath
                        xlinkHref="#circle"
                        className="text-[#172544] text-[8px] uppercase tracking-[0.45em]"
                        startOffset="0%">
                        WE CELEBRATE OTHER CULTURES
                      </textPath>
                    </text>
                  </svg>
                </div>
                <style jsx>{`
                  .circle-button {
                    width: 100%;
                    height: 100%;
                    animation: rotate 40s linear infinite;
                  }
                  @keyframes rotate {
                    from {
                      transform: rotate(0deg);
                    }
                    to {
                      transform: rotate(360deg);
                    }
                  }
                `}</style>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="relative py-32 bg-[#172544]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-light text-white mb-6">
                EXPLORE THE WORLD
              </h2>
              <p className="text-xl text-white/80">
                Discover unique homes across the globe. Our interactive map
                helps you find the perfect swap in your dream destination.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <HomeMapComponent />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="col-span-12 md:col-span-4 space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl font-light text-[#172544]">
                  THE JOY OF
                  <br />
                  BEGINNING
                </h2>
                <h3 className="text-lg tracking-widest text-[#7F8119]">
                  HOME, SWEET HOME
                </h3>
                <div className="space-y-4">
                  <h2 className="text-3xl font-light text-[#172544] leading-tight">
                    WE ARE A REVOLUTION IN
                    <br />
                    THE WAY OF TRAVELING
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Get ready to gain diverse cultural experiences and broaden
                    your perspective on life
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="aspect-[3/4] relative rounded-xl overflow-hidden">
                <Image
                  src="/homepage/bottom-1.jpg"
                  alt="Cultural experience"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            </motion.div>

            {/* Middle Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="col-span-12 md:col-span-4 space-y-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="aspect-[3/4] relative rounded-xl overflow-hidden">
                <Image
                  src="/homepage/bottom-2.jpg"
                  alt="Travel experience"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="aspect-[3/4] relative rounded-xl overflow-hidden">
                <Image
                  src="/homepage/bottom-3.jpg"
                  alt="Home experience"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            </motion.div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="col-span-12 md:col-span-4 space-y-8">
              <h2 className="text-3xl font-light text-[#172544] leading-relaxed">
                A photo,
                <br />
                a moment
                <br />a short story
              </h2>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="aspect-[3/4] relative rounded-xl overflow-hidden">
                <Image
                  src="/homepage/bottom-4.jpg"
                  alt="Travel story"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="aspect-[3/4] relative rounded-xl overflow-hidden">
                <Image
                  src="/homepage/bottom-5.jpg"
                  alt="Travel moment"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Community Section */}
      <section className="pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative border border-[#7F8119]/30 rounded-[40px] p-16 md:p-20">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 lg:gap-20">
              <h2 className="text-4xl lg:text-5xl font-light text-[#172544] max-w-2xl leading-tight">
                BE PART OF A HARMONIOUS COOPERATIVE GLOBAL COMMUNITY
              </h2>
              <p className="text-xl lg:text-2xl text-gray-600/90 max-w-xl font-light">
                Opening your home to others fosters your capacity for trust and
                generosity.
              </p>
            </div>
            {/* Logo in the corner */}
            <div className="absolute -top-6 -right-6 w-24 h-24">
              <Image
                src="/logo-icons.png"
                alt="SWOM"
                fill
                className="object-contain rotate-12"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};
