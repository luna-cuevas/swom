import Image from 'next/image';
import React from 'react';
import { Carousel, IconButton } from '@material-tailwind/react';

type Props = {
  roundedLeft?: boolean;
  roundedRight?: boolean;
  images: string[];
};

const CarouselPage = (props: Props) => {
  return (
    <Carousel
      prevArrow={({ handlePrev }) => (
        <IconButton
          variant="text"
          color="white"
          size="lg"
          onClick={handlePrev}
          className="!absolute bg-[#ffffff35] text-white top-2/4 left-4 -translate-y-2/4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="#fff"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="#fff"
            className="h-8 w-8">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </IconButton>
      )}
      nextArrow={({ handleNext }) => (
        <IconButton
          variant="text"
          color="white"
          size="lg"
          onClick={handleNext}
          className="!absolute bg-[#ffffff35] top-2/4 !right-4 -translate-y-2/4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="#fff"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="#fff"
            className="h-8 w-8">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </IconButton>
      )}
      className={`relative  w-full ${props.roundedLeft && 'rounded-l-xl'} ${
        props.roundedRight && 'rounded-r-xl'
      }`}>
      {props.images.map((image, index) => (
        <Image key={index} src={image} alt="image" fill objectFit="cover" />
      ))}
    </Carousel>
  );
};

export default CarouselPage;
