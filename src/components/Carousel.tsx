"use client";
import { globalStateAtom } from "@/context/atoms";
import { useAtom } from "jotai";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Inline from "yet-another-react-lightbox/plugins/inline";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/counter.css";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import "yet-another-react-lightbox/styles.css";
import { usePathname } from "next/navigation";

type Props = {
  images: {
    src: string;
    slug?: string;
    listingNum?: string;
    highlightTag?: string;
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
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  console.log("pathname", pathname);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="bg-white w-full h-full absolute flex z-[10000000]">
        <div role="status" className="m-auto">
          <svg
            aria-hidden="true"
            className="w-[100px] h-[100px] text-gray-200 animate-spin dark:text-gray-600 fill-[#7F8119]"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex justify-center mx-auto ">
      <div
        className={`h-full w-full mx-auto ${pathname !== "/" && "max-w-[1140px]"}`}>
        <Lightbox
          index={selectedImage}
          slides={[
            ...props.images.map((image) => ({
              src: image.src,
              slug: image.slug,
              listingNum: image.listingNum,
              highlightTag: image.highlightTag,
            })),
          ]}
          styles={{
            container: {
              backgroundColor: "#fff",
              height: "100%",
              width: "100%",
              maxWidth: pathname !== "/" ? "1140px" : "100%",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
            slide: {
              objectFit: "cover",
              objectPosition: "center",
              width: "100%",
              height: "100%",
            },
            thumbnailsContainer: {
              backgroundColor: "#000000c0",
              padding: "12px",
              borderRadius: "0",
              width: "100%",
            },
            thumbnail: {
              border: "none",
              borderRadius: "8px",
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s ease",
              opacity: 0.8,
            },
            thumbnailsTrack: {
              gap: "8px",
            },
            navigationNext: {
              backgroundColor: "rgba(255, 255, 255, 0.375)",
              backdropFilter: "blur(4px)",
              borderRadius: "50%",
              padding: "4px",
              color: "#000000",
              zIndex: 50,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            },
            navigationPrev: {
              backgroundColor: "rgba(255, 255, 255, 0.375)",
              backdropFilter: "blur(4px)",
              borderRadius: "50%",
              padding: "4px",
              color: "#000000",
              zIndex: 50,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            },
          }}
          slideshow={{
            ref: slideshowRef,
            autoplay: true,
            delay: 8000,
          }}
          plugins={[
            Inline,
            // ...(props.thumbnails ? [Thumbnails] : []),
            ...(props.thumbnails ? [Counter] : []),
            Slideshow,
          ]}
          thumbnails={{
            position: "bottom",
            padding: 0,
            gap: 16,
            showToggle: true,
            vignette: false,
            imageFit: "cover",
          }}
          counter={{
            container: {
              style: {
                width: "fit-content",
                top: "unset",
                left: "unset",
                bottom: "16px",
                right: "16px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                padding: "6px 12px",
                borderRadius: "16px",
                fontSize: "14px",
                color: "#172544",
              },
            },
          }}
          on={{
            view: (e) => {
              return selectedImage;
            },
            click: (clickProps) => {
              if (props.homePage) return null;
              setSelectedImage(clickProps.index);
              setOpenLightbox(true);
            },
          }}
          carousel={{
            padding: 0,
            spacing: 0,
            imageFit: "cover",
            imageProps: {
              style: {
                objectFit: "cover",
                objectPosition: "center",
                width: "100%",
                height: "100%",
                aspectRatio: props.homePage ? "3/2" : "16/9",
              },
            },
            preload: 2,
          }}
          inline={{
            style: {
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          }}
          render={{
            slideContainer: (slideProps: any) => {
              return (
                <div
                  onClick={(e) => {
                    if (props.homePage) return null;
                    const index = props.images.findIndex(
                      (img) => img.src === slideProps.slide.src
                    );
                    setSelectedImage(index);
                    setOpenLightbox(true);
                  }}
                  className="h-full w-full relative">
                  {props.overlay && (
                    <div className="absolute inset-0 bg-black/30 z-10" />
                  )}
                  <div
                    className={`${!props.homePage && "cursor-pointer"} h-full w-full`}>
                    {slideProps.children}
                  </div>
                  {props.homePage && (
                    <div className="absolute z-[100000] top-[10%] -right-4 text-md">
                      <div className="absolute z-0 inset-0 transform skew-x-[10deg] bg-white/80 backdrop-blur-md shadow-lg" />
                      {state.session == null ? (
                        <div className="relative z-50 py-4 px-8 text-[#172544] select-none cursor-default">
                          {slideProps.slide.highlightTag ||
                            "Let's meet your new favorite home."}
                          <br />
                          <strong className="font-medium">
                            Listing No. {slideProps.slide.slug}
                          </strong>
                        </div>
                      ) : (
                        <Link
                          href={`/listings/${slideProps.slide.listingNum}`}
                          className="block transition-transform hover:scale-105 select-none">
                          <div className="relative z-50 py-4 px-8 text-[#172544] cursor-pointer">
                            {slideProps.slide.highlightTag ||
                              "Let's meet your new favorite home."}
                            <br />
                            <strong className="font-medium">
                              Listing No. {slideProps.slide.slug}
                            </strong>
                          </div>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            },
            slide: ({ slide }) => {
              return (
                <div
                  className="relative h-full w-full"
                  onClick={(e) => {
                    if (props.homePage) return null;
                    const index = props.images.findIndex(
                      (img) => img.src === slide.src
                    );
                    setSelectedImage(index);
                    setOpenLightbox(true);
                  }}>
                  <Image
                    src={slide.src}
                    alt={`Image ${slide.src}`}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              );
            },
          }}
        />
      </div>

      <Lightbox
        className="!z-[20000000]"
        open={openLightbox}
        close={() => setOpenLightbox(false)}
        index={selectedImage}
        slides={[
          ...props.images.map((image) => ({
            src: image.src,
            title: "Image",
          })),
        ]}
        styles={{
          container: {
            backgroundColor: "rgba(0, 0, 0, 0.95)",
          },
          thumbnailsContainer: {
            backgroundColor: "#000000c0",
            padding: "12px",
          },
          thumbnail: {
            border: "none",
            borderRadius: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            transition: "all 0.2s ease",
            opacity: 0.7,
          },
          thumbnailsTrack: {
            gap: "8px",
          },
          navigationNext: {
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(4px)",
            borderRadius: "50%",
            padding: "8px",
            color: "#2A4074",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          },
          navigationPrev: {
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(4px)",
            borderRadius: "50%",
            padding: "8px",
            color: "#2A4074",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          },
        }}
        plugins={[Thumbnails, Counter]}
        thumbnails={{
          position: "bottom",
          padding: 0,
          gap: 16,
          showToggle: true,
          vignette: false,
          imageFit: "cover",
        }}
        counter={{
          container: {
            style: {
              width: "fit-content",
              top: "unset",
              bottom: "16px",
              left: "unset",
              right: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              padding: "6px 12px",
              borderRadius: "16px",
              fontSize: "14px",
              color: "#172544",
            },
          },
        }}
      />
    </div>
  );
};

export default CarouselPage;
