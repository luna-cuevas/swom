'use client';
import CarouselPage from '@/components/Carousel';
import ListingsNav from '@/components/ListingsNav';
import Image from 'next/image';
import React from 'react';

type Props = {};

const Page = (props: Props) => {
  return (
    <main className="min-h-screen  flex flex-col ">
      <ListingsNav />
      <div className="flex flex-col py-10 justify-evenly h-full gap-4 my-auto">
        <div className="relative w-10/12  h-[40vh]">
          <CarouselPage
            images={[
              '/listings/listings-hero-1.png',
              '/listings/listings-hero-1.png',
            ]}
            roundedRight
          />
        </div>
        <div className="relative w-10/12  mr-0 mx-auto  h-[40vh] ">
          <CarouselPage
            images={[
              '/listings/listings-hero-2.png',
              '/listings/listings-hero-2.png',
            ]}
            roundedLeft
          />
        </div>
        <div className="relative w-10/12   h-[40vh] ">
          <CarouselPage
            images={[
              '/listings/listings-hero-3.png',
              '/listings/listings-hero-3.png',
            ]}
            roundedRight
          />
        </div>
      </div>
    </main>
  );
};

export default Page;
