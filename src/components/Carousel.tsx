import Image from 'next/image';
import React from 'react';
import { Carousel } from '@material-tailwind/react';

type Props = {
  roundedLeft?: boolean;
  roundedRight?: boolean;
  images: string[];
};

const CarouselPage = (props: Props) => {
  return (
    <Carousel
      className={`relative  w-full ${props.roundedLeft && 'rounded-l-xl'} ${
        props.roundedRight && 'rounded-r-xl'
      }`}>
      {props.images.map((image, index) => (
        <Image src={image} alt="image" fill objectFit="cover" />
      ))}
    </Carousel>
  );
};

export default CarouselPage;
