import Image from 'next/image';
import React from 'react';
import { Carousel } from '@material-tailwind/react';

type Props = {};

const CarouselPage = (props: Props) => {
  return (
    <Carousel className="relative h-[87vh] w-full">
      <Image src="/homepage/hero.jpg" alt="logo" fill objectFit="cover" />
      <Image src="/homepage/hero.jpg" alt="logo" fill objectFit="cover" />
    </Carousel>
  );
};

export default CarouselPage;
