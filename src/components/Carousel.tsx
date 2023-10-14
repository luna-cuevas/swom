import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

type Props = {
  roundedLeft?: boolean;
  roundedRight?: boolean;
  images: {
    src: string;
    listingNum?: string;
  }[];
  picturesPerSlide?: number | 1;
};

const CarouselPage = (props: Props) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 && props.picturesPerSlide != undefined
        ? Math.ceil(props.images.length / props.picturesPerSlide) - 1
        : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      props.picturesPerSlide != undefined &&
      prev === Math.ceil(props.images.length / props.picturesPerSlide) - 1
        ? 0
        : prev + 1
    );
  };

  useEffect(() => {
    // Automatically change slides every 5 seconds
    const intervalId = setInterval(() => {
      nextSlide();
    }, 8000);

    return () => {
      // Clear the interval to prevent memory leaks
      clearInterval(intervalId);
    };
  }, [currentSlide]);

  return (
    <div className="relative h-full">
      <button
        onClick={prevSlide}
        className="absolute z-50 bg-[#2c2c2c6a] text-white top-2/4 left-4 -translate-y-2/4 p-2 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#fff">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute z-50 bg-[#2c2c2c6a] text-white top-2/4 right-4 -translate-y-2/4 p-2 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#fff">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div
        className={`relative h-full gap-4 flex w-full ${
          props.roundedLeft && 'rounded-l-xl'
        } ${props.roundedRight && 'rounded-r-xl'}`}>
        <div className="w-full absolute top-0 left-0 right-0 bottom-0 h-full bg-[#ffffff80]" />

        {props.images.map((image, index) => (
          <div
            key={index}
            className={`h-full w-full relative ${
              props.picturesPerSlide != undefined &&
              Math.floor(index / props.picturesPerSlide) === currentSlide
                ? 'block'
                : 'hidden'
            } transition-transform duration-[2s] ease-in-out transform ${
              props.picturesPerSlide != undefined &&
              Math.floor(index / props.picturesPerSlide) === currentSlide
                ? 'translate-x-0'
                : 'translate-x-full'
            }`}>
            <div className="w-full h-full m-auto top-0 z-20 absolute ">
              {image.listingNum && (
                <div className="absolute z-50 top-[10%] -right-4 text-md ">
                  <div className="absolute inset-0 transform skew-x-[10deg]  bg-[#f4ece7b3]" />
                  <Link href={`/listings/${image.listingNum}`}>
                    <div className="relative py-4 px-8 text-[#172544]">
                      Let&apos;s meet your new favorite home. <br />
                      <strong>Listing No. {image.listingNum}</strong>
                    </div>
                  </Link>
                </div>
              )}
            </div>
            <Image
              className="rounded-xl"
              priority
              src={image.src}
              alt="image"
              fill
              objectFit="cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarouselPage;
