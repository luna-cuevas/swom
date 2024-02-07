'use client';
import GoogleMapComponent from '@/components/GoogleMapComponent';
import ListingCard from '@/components/ListingCard';
import { useStateContext } from '@/context/StateContext';
import { supabaseClient } from '@/utils/supabaseClient';
import React, { useEffect, useState } from 'react';
import Stripe from 'stripe';
import { sanityClient } from '@/utils/sanityClient';
import ImageUrlBuilder from '@sanity/image-url';

type Props = {};

const Page = (props: Props) => {
  const [listings, setListings] = useState<any>([]);
  const [allListings, setAllListings] = useState<any>([]);
  const [favorite, setFavorite] = useState(
    [] as {
      favorite: boolean;
      listingId: string;
    }[]
  );

  const stripeActivation = new Stripe(
    process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!,
    {
      apiVersion: '2023-08-16',
    }
  );
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [whereIsIt, setWhereIsIt] = useState<string>('');
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const supabase = supabaseClient();
  const { state, setState } = useStateContext();
  const builder = ImageUrlBuilder(sanityClient);

  function urlFor(source: any) {
    return builder.image(source);
  }

  useEffect(() => {
    if (state.loggedInUser) {
      fetchListings();
    }
  }, [state.user, state.loggedInUser, state.loggedInUser?.id]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const query = `*[_type == "listing"]{
        ...,
      "imageUrl": image.asset->url
    }`;
      const data = await sanityClient.fetch(query);

      const subscribedListings = await Promise.all(
        data.map(async (listing: any) => {
          const isSubscribed = await isUserSubscribed(listing.userInfo.email);
          if (isSubscribed) {
            return listing;
          } else {
            return null;
          }
        })
      );

      const filteredListings = subscribedListings.filter(
        (listing: any) => listing !== null
      );

      setAllListings(filteredListings);
      setListings(filteredListings);

      const { data: allLiked, error: allLikedError } = await supabase
        .from('appUsers')
        .select('favorites')
        .eq('id', state.loggedInUser.id);

      if (allLikedError) {
        console.log('fetch liked listings error:', allLikedError);
      }

      if (allLiked) {
        // setListing all liked listings
        allLiked[0]?.favorites?.map((favorite: any) => {
          setListings((prev: any) => {
            return prev.map((listing: any) => {
              if (listing.userInfo.email === favorite.listingId) {
                return { ...listing, favorite: true };
              }
              return listing;
            });
          });
          setAllListings((prev: any) => {
            return prev.map((listing: any) => {
              if (listing.userInfo.email === favorite.listingId) {
                return { ...listing, favorite: true };
              }
              return listing;
            });
          });
        });
      }
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    }
  };

  const filteredListings = async () => {
    if (whereIsIt.length > 0) {
      const filteredListingsByLocation = allListings.filter((listing: any) => {
        const city = listing.homeInfo.city.toLowerCase();
        const searchQuery = whereIsIt.toLowerCase();
        return city.includes(searchQuery);
      });

      setListings(filteredListingsByLocation);
    } else {
      setListings(allListings);
    }
  };

  // ... [rest of your imports and component code]

  // Utility function to sleep for a given number of milliseconds
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  async function isUserSubscribed(
    email: string,
    attempts = 3,
    delay = 1000
  ): Promise<boolean> {
    if (attempts <= 0) {
      throw new Error('Maximum retry attempts reached');
    }

    try {
      if (!stripeActivation) {
        console.log('Stripe.js has not loaded yet.');
        return false;
      }

      const customers = await stripeActivation.customers.list({ email: email });
      const customer = customers.data[0];

      if (customer) {
        const subscriptions = await stripeActivation.subscriptions.list({
          customer: customer.id,
          limit: 1,
        });

        return subscriptions.data.length > 0;
      } else {
        console.log('Customer not found');
        return false;
      }
    } catch (error) {
      // Wait for delay milliseconds and then retry
      console.log(`Retrying in ${delay}ms...`);
      await sleep(delay);
      return isUserSubscribed(email, attempts - 1, delay * 2);
    }
  }

  // ... [rest of your component code]

  useEffect(() => {
    filteredListings();
  }, [isIdle, whereIsIt]);

  return (
    <main className="pt-6  flex   flex-col bg-[#F2E9E7] min-h-screen">
      {isLoading ? (
        <div
          role="status"
          className=" flex min-h-screen m-auto h-fit w-fit my-auto mx-auto px-3 py-2 text-white rounded-xl">
          <svg
            aria-hidden="true"
            className="m-auto w-[100px] h-[100px] text-gray-200 animate-spin dark:text-gray-600 fill-[#7F8119]"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="#fff"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      ) : (
        <>
          <div className="md:w-3/4 w-[90%] h-fit pt-12 pb-4 max-w-[1000px] mx-auto mt-12 mb-4">
            <GoogleMapComponent
              setIsSearching={setIsSearching}
              hideMap={whereIsIt.length === 0}
              listings={listings && listings}
              setWhereIsIt={setWhereIsIt}
              // setIsIdle={setIsIdle}
            />
          </div>
          <div className="flex flex-col  flex-grow mx-auto w-full mt-8 justify-between">
            <div className={`flex pb-8`}>
              <div
                className={`m-auto  ${
                  isSearching || whereIsIt.length > 0
                    ? 'flex flex-col w-fit'
                    : 'hidden'
                }`}>
                <p className="text-2xl">Say hello to</p>
                <h2 className="text-3xl capitalize">
                  {isSearching ? 'the world' : whereIsIt}
                </h2>
              </div>
              <h1
                className={`text-3xl m-auto ${
                  !isSearching && whereIsIt.length == 0 ? 'text-center' : ''
                }
            `}>
                Let&apos;s discover <br />
                your new adventure.
              </h1>
            </div>
            <div className="bg-[#EADEDB] pt-8  flex-grow h-full ">
              {listings.length > 0 && (
                <div className="m-auto gap-4 mb-4 justify-end max-w-[1000px] flex w-full flex-wrap">
                  <button
                    onClick={() => {
                      if (whereIsIt.length > 0) {
                        filteredListings();
                      } else {
                        setListings(allListings);
                      }
                    }}
                    className=" w-fit hover:bg-[#686926] bg-[#7F8119] text-white px-2 py-1 rounded-md">
                    All Listings
                  </button>
                  {/* favorites */}
                  {listings.filter((listing: any) => listing.favorite === true)
                    .length > 0 && (
                    <button
                      onClick={() =>
                        setListings(
                          listings.filter(
                            (listing: any) => listing.favorite === true
                          )
                        )
                      }
                      className=" w-fit hover:bg-[#686926] bg-[#7F8119] text-white px-2 py-1 rounded-md">
                      Favorites
                    </button>
                  )}
                </div>
              )}
              <div className="m-auto justify-between max-w-[1000px] flex w-full flex-wrap">
                {listings.length > 0 ? (
                  listings.map((listing: any, index: number) => (
                    <ListingCard
                      setListings={setListings}
                      setAllListings={setAllListings}
                      key={index}
                      listingInfo={listing}
                    />
                  ))
                ) : (
                  <div className="m-auto">
                    <p className="text-xl">No listings found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default Page;
