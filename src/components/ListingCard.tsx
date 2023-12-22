import React from 'react';
import CarouselPage from './Carousel';
import Link from 'next/link';

type Props = {
  listingInfo: any;
};

const ListingCard = (props: Props) => {
  const formattedImages = props.listingInfo.homeInfo.listingImages.map(
    (image: any) => {
      return { src: image, listingNum: props.listingInfo.user_id.slice(-5) };
    }
  );

  return (
    <div className="rounded-xl p-[10px] flex-col md:m-2 bg-white relative flex h-[40vh] my-2 m-auto w-[90%] md:w-[45%]">
      <CarouselPage
        images={formattedImages}
        picturesPerSlide={1}
        contain={false}
        listingPage={true}
      />
      <div>
        <div className="border-b border-[#172544] pb-2 my-2 flex justify-between align-middle">
          <div>
            <h1 className="text-xl">{props.listingInfo.homeInfo.title}</h1>
            <p className="">{props.listingInfo.homeInfo.city}</p>
          </div>
          <div className="flex">
            <button>
              <svg
                className="m-auto"
                width="24"
                height="24"
                xmlns="http://www.w3.org/2000/svg"
                fill-rule="evenodd"
                clip-rule="evenodd">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402m5.726-20.583c-2.203 0-4.446 1.042-5.726 3.238-1.285-2.206-3.522-3.248-5.719-3.248-3.183 0-6.281 2.187-6.281 6.191 0 4.661 5.571 9.429 12 15.809 6.43-6.38 12-11.148 12-15.809 0-4.011-3.095-6.181-6.274-6.181" />
              </svg>
            </button>
          </div>
        </div>
        <p className="">
          {props.listingInfo.homeInfo.description.slice(0, 200)}
        </p>
        <div className="flex justify-between">
          <p>Did you love it? &gt;&gt;&gt;</p>
          <Link
            href={`/listings/${props.listingInfo.user_id}`}
            className="bg-[#F28A38] py-1 px-2 rounded-xl text-white text-sm">
            Let&apos;s reserve
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
