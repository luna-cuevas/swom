import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useStateContext } from '@/context/StateContext';

type Props = {
  roundedLeft?: boolean;
  roundedRight?: boolean;
  images: {
    src: string;
    listingNum?: string;
  }[];
  listingPage?: boolean;
  picturesPerSlide?: number | 1;
  overlay?: boolean;
  contain?: boolean;
  selectedImage?: number;
  setSelectedImage?: React.Dispatch<React.SetStateAction<number>>;
};

const CarouselPage = (props: Props) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { state, setState } = useStateContext();

  useEffect(() => {
    // Automatically change slides every 5 seconds
    const intervalId = setInterval(() => {
      nextSlide();
    }, 10000);

    return () => {
      // Clear the interval to prevent memory leaks
      clearInterval(intervalId);
    };
  }, [currentSlide]);

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 && props.picturesPerSlide != undefined
        ? Math.ceil(props.images.length / props.picturesPerSlide) - 1
        : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const totalSlides = Math.ceil(
        props.images.length / (props.picturesPerSlide ?? 1)
      );

      if (props.picturesPerSlide !== undefined && prev < totalSlides - 1) {
        return prev + 1;
      }

      return 0;
    });
  };

  // Function to handle image selection
  const handleImageSelection = (index: any) => {
    if (props.setSelectedImage) {
      props.setSelectedImage(index);
    }
  };

  return (
    <div className="relative h-full w-full">
      <button
        type="button"
        onClick={() => prevSlide()}
        className="absolute z-[200] bg-[#2c2c2c6a] text-white top-2/4 left-4 -translate-y-2/4 p-2 rounded-full">
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
        type="button"
        onClick={() => nextSlide()}
        className="absolute z-[200] bg-[#2c2c2c6a] text-white top-2/4 right-4 -translate-y-2/4 p-2 rounded-full">
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
        className={`relative h-full gap-8 flex w-full ${
          props.roundedLeft && 'rounded-l-xl'
        } ${props.roundedRight && 'rounded-r-xl'}`}>
        {props.images.map((image, index) => (
          <div
            key={index}
            onClick={() => handleImageSelection(index)} // Add click handler
            className={`h-full w-full overflow-hidden relative ${
              props.picturesPerSlide != undefined &&
              Math.floor(index / props.picturesPerSlide) === currentSlide
                ? 'block'
                : 'hidden'
            } transition-transform z-0 duration-[2s] ease-in-out transform ${
              props.picturesPerSlide != undefined &&
              Math.floor(index / props.picturesPerSlide) === currentSlide
                ? 'translate-x-0'
                : 'translate-x-full'
            }${
              props.selectedImage === index
                ? ' rounded-2xl border-4 border-[#7F8119]'
                : ''
            }`}>
            <div className="w-full h-full z-[50] m-auto top-0  absolute ">
              {props.listingPage && (
                <div className=" absolute bg-white rounded-b-xl px-4 text-xs right-4">
                  Listing No. {image.listingNum}
                </div>
              )}
              {image.listingNum && !props.listingPage && (
                <div className="absolute  top-[10%] -right-4 text-md ">
                  <div className="absolute  inset-0 transform skew-x-[10deg]  bg-[#f4ece7b3]" />
                  {state.user == null ? (
                    <div className="relative  py-4 px-8 text-[#172544]">
                      Let&apos;s meet your new favorite home. <br />
                      <strong>Listing No. {image.listingNum}</strong>
                    </div>
                  ) : (
                    <Link href={`/listings/${image.listingNum}`}>
                      <div className="relative  py-4 px-8 text-[#172544]">
                        Let&apos;s meet your new favorite home. <br />
                        <strong>Listing No. {image.listingNum}</strong>
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {props.overlay && (
              <div className="w-full z-10 absolute top-0 left-0 right-0 bottom-0 h-full bg-[#00000052]" />
            )}

            <Image
              className={`rounded-xl z-0 ${
                props.contain ? 'object-contain' : 'object-cover'
              } h-full`}
              src={image.src}
              alt="image"
              fill
              priority
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARgAAABYCAYAA"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarouselPage;
