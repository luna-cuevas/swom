'use client';
import GoogleMapComponent from '@/components/GoogleMapComponent';
import ListingCard from '@/components/ListingCard';
import React, { useEffect, useState } from 'react';
import Stripe from 'stripe';

type Props = {};

const Page = (props: Props) => {
  const [listings, setListings] = useState<any>([]);
  const [allListings, setAllListings] = useState<any>([]);
  const stripeActivation = new Stripe(
    process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!,
    {
      apiVersion: '2023-08-16',
    }
  );
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [whereIsIt, setWhereIsIt] = useState<string>('');
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const listings = await fetch('/api/getListings', {
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({}),
      });
      const listingsJson = await listings.json();
      console.log('listingsJson', listingsJson);

      const subscribedListings = await Promise.all(
        listingsJson.map(async (listing: any) => {
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
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    }
  };

  const filteredListings = async () => {
    if (whereIsIt) {
      const filteredListingsByLocation = allListings.filter((listing: any) => {
        const city =
          listing.homeInfo.city.split(', ').length > 1
            ? listing.homeInfo.city.split(', ')[0].toLowerCase()
            : listing.homeInfo.city.toLowerCase();
        console.log('city', city);
        console.log('whereIsIt', whereIsIt);
        return city == whereIsIt.toLowerCase();
      });
      console.log('filteredListingsByLocation', filteredListingsByLocation);

      setListings(filteredListingsByLocation);
    }
  };

  async function isUserSubscribed(email: string): Promise<boolean> {
    try {
      if (!stripeActivation) {
        console.log('Stripe.js has not loaded yet.');
        return false;
      }
      // Retrieve the customer by email
      const customers = await stripeActivation.customers.list({ email: email });
      const customer = customers.data[0]; // Assuming the first customer is the desired one

      if (customer) {
        // Retrieve the customer's subscriptions
        const subscriptions = await stripeActivation.subscriptions.list({
          customer: customer.id,
          limit: 1, // Assuming only checking the latest subscription
        });

        return subscriptions.data.length > 0; // User is subscribed if there's at least one subscription
      } else {
        // Customer not found
        console.log('Customer not found');
        return false;
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      throw error;
    }
  }

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filteredListings();
  }, [isIdle, whereIsIt]);

  console.log('listings', listings);

  return (
    <main className="pt-6  flex   flex-col bg-[#F2E9E7] min-h-screen">
      <div className="md:w-3/4 w-[90%] h-fit pt-12 pb-4 max-w-[1000px] mx-auto mt-12 mb-4">
        <GoogleMapComponent
          setIsSearching={setIsSearching}
          hideMap={!isSearching}
          listings={listings && listings}
          setWhereIsIt={setWhereIsIt}
          setIsIdle={setIsIdle}
        />
      </div>
      <div className="flex flex-col  flex-grow mx-auto w-full mt-8 justify-between">
        <div className={`flex pb-8`}>
          <div
            className={`m-auto  ${
              isSearching ? 'flex flex-col w-fit' : 'hidden'
            }`}>
            <p className="text-2xl">Say hello to</p>
            <h2 className="text-3xl capitalize">
              {!isSearching
                ? 'the world'
                : whereIsIt && isIdle
                ? whereIsIt
                : ''}
            </h2>
          </div>
          <h1
            className={`text-3xl m-auto ${isSearching ? 'text-center' : 'w-fit'}
            `}>
            Let&apos;s discover {isSearching && <br />}
            your new adventure.
          </h1>
        </div>
        <div className="bg-[#EADEDB] pt-8  flex-grow h-full ">
          <div className="m-auto justify-between max-w-[1000px] flex w-full flex-wrap">
            {listings.length > 0 ? (
              listings.map((listing: any, index: number) => (
                <ListingCard key={index} listingInfo={listing} />
              ))
            ) : isLoading ? (
              <div className="m-auto">
                <p className="text-xl">No listings found</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
