'use client';
import { globalStateAtom } from '@/context/atoms';
import { useAtom } from 'jotai';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Inline from 'yet-another-react-lightbox/plugins/inline';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import 'yet-another-react-lightbox/plugins/counter.css';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import 'yet-another-react-lightbox/styles.css';

type Props = {
  images: {
    src: string;
    slug?: string;
    listingNum?: string;
  }[];
  homePage?: boolean;
  overlay?: boolean;
  lightbox?: boolean;
  thumbnails?: boolean;
};

const CarouselPage = (props: Props) => {
  const [state, setState] = useAtom(globalStateAtom);
  const [openLightbox, setOpenLightbox] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState(0); // Updated
  const slideshowRef = useRef(null);

  return (
    <div className=" overflow-hidden !h-full  w-full gap-4 flex flex-col">
      <div className={`!h-full gap-4 md:gap-8 flex w-full`}>
        <Lightbox
          index={selectedImage}
          slides={[
            ...props.images.map((image) => ({
              src: image.src,
              slug: image.slug,
              listingNum: image.listingNum,
            })),
          ]}
          styles={{
            container: {
              borderRadius: props.homePage ? '' : '20px 20px 0 0',
              height: '100%',
              width: '100%',
            },
            slide: {
              objectFit: 'cover',
              objectPosition: 'center',
            },
            thumbnailsContainer: {
              backgroundColor: '#7F8119',
              borderRadius: '0 0 20px 20px',
            },
            thumbnail: {
              border: 'none',
              borderRadius: '10px',
              backgroundColor: '#ffffff77',
            },
          }}
          slideshow={{
            ref: slideshowRef,
            autoplay: true,
            delay: 5000,
          }}
          plugins={[
            Inline,
            ...(props.thumbnails ? [Thumbnails] : []),
            ...(props.thumbnails ? [Counter] : []),
            Slideshow,
          ]}
          thumbnails={{
            position: 'bottom',
            padding: 0,
            gap: 16,
            showToggle: true,
            vignette: false,
            imageFit: 'cover',
          }}
          counter={{
            container: {
              style: {
                top: 'unset',
                bottom: 0,
                right: 0,
                left: 'unset',
              },
            },
          }}
          on={{
            view: () => selectedImage,
            click: (clickProps) => {
              if (props.homePage) return null;
              setSelectedImage(clickProps.index);
              setOpenLightbox(true);
            },
          }}
          carousel={{
            padding: 0,
            spacing: 0,
            imageFit: 'cover',
            imageProps: {
              height: '100%',
              width: '100%',
              style: {
                objectFit: 'cover',
                objectPosition: 'center',
                width: '100%',
                height: '100%',
                maxHeight: '100%',
                maxWidth: '100%',
              },
            },
            preload: 2,
          }}
          inline={{
            style: {
              width: '100%',
              maxWidth: '100%',
              height: '100%',
              aspectRatio: '3 / 2',
              margin: '0 auto',
            },
          }}
          render={{
            slideContainer: (slideProps) => {
              return (
                <div className=" !h-full my-auto w-full">
                  <div
                    className={`${props.overlay ? 'opacity-50' : ''} ${
                      !props.homePage && 'cursor-pointer'
                    } !h-full  w-full`}>
                    {slideProps.children}
                  </div>
                  <div
                    className={`absolute top-[10%] -right-4 text-md ${
                      !props.homePage && 'hidden'
                    }`}>
                    <div className="absolute inset-0 transform skew-x-[10deg]  bg-[#f4ece7b3]" />
                    {state.user == null ? (
                      <div className=" z-50  py-4 px-8 text-[#172544]">
                        Let&apos;s meet your new favorite home. <br />
                        <strong>
                          {/* @ts-ignore */}
                          Listing No. {slideProps.slide.slug}{' '}
                        </strong>
                      </div>
                    ) : (
                      <>
                        {/* @ts-ignore */}
                        <Link href={`/listings/${slideProps.slide.listingNum}`}>
                          <div className="z-50  py-4 px-8 text-[#172544]">
                            Let&apos;s meet your new favorite home. <br />
                            <strong>
                              Listing No. {/* @ts-ignore */}
                              {slideProps.slide.slug}
                            </strong>
                          </div>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            },
            slide: ({ slide }) => {
              return (
                <div className="relative h-full w-full">
                  <Image
                    src={slide.src}
                    alt={`Image ${slide.src}`}
                    fill
                    priority
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 100vw, 100vw"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              );
            },
          }}
        />
      </div>

      <Lightbox
        className="!z-[20000000] "
        open={openLightbox}
        close={() => setOpenLightbox(false)}
        index={selectedImage} // Use the selectedImage state
        slides={[
          ...props.images.map((image) => ({
            src: image.src,
            title: 'Image',
          })),
        ]}
        styles={{
          thumbnailsContainer: {
            backgroundColor: '#7F8119',
          },
          thumbnail: {
            border: 'none',
            borderRadius: '10px',
            backgroundColor: '#ffffff77',
          },
        }}
        plugins={[Thumbnails, Counter]}
        thumbnails={{
          position: 'bottom',
          padding: 0,
          gap: 16,
          showToggle: true,
          vignette: false,
          imageFit: 'cover',
        }}
        counter={{
          container: {
            style: {
              top: 'unset',
              bottom: 0,
              right: 0,
              left: 'unset',
            },
          },
        }}
      />
    </div>
  );
};

export default CarouselPage;
