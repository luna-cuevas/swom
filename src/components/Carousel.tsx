import Image from 'next/image';
import React, { useState, useEffect } from 'react';

type Props = {
  roundedLeft?: boolean;
  roundedRight?: boolean;
  images: string[];
};

const CarouselPage = (props: Props) => {
  const [currentImage, setCurrentImage] = useState(0);

  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? props.images.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImage((prev) =>
      prev === props.images.length - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    // Automatically change slides every 5 seconds
    const intervalId = setInterval(() => {
      nextImage();
    }, 8000);

    return () => {
      // Clear the interval to prevent memory leaks
      clearInterval(intervalId);
    };
  }, [currentImage]);

  return (
    <div className="relative h-fit">
      <button
        onClick={prevImage}
        className="absolute z-50 bg-[#2c2c2c6a] text-white top-2/4 left-4 -translate-y-2/4 p-2 rounded-full">
        Previous
      </button>
      <button
        onClick={nextImage}
        className="absolute z-50 bg-[#2c2c2c6a] text-white top-2/4 right-4 -translate-y-2/4 p-2 rounded-full">
        Next
      </button>
      <div
        className={`relative h-fit flex w-full ${
          props.roundedLeft && 'rounded-l-xl'
        } ${props.roundedRight && 'rounded-r-xl'}`}>
        {props.images.map((image, index) => (
          <div
            key={index}
            className={`h-[80vh] w-full relative ${
              index === currentImage ? 'block' : 'hidden'
            } transition-transform duration-[2s] ease-in-out transform ${
              index === currentImage ? 'translate-x-0' : 'translate-x-full'
            }`}>
            <div className="w-full h-full m-auto top-0 z-20 absolute bg-[#00000049]"></div>
            <Image src={image} alt="image" fill objectFit="cover" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarouselPage;
