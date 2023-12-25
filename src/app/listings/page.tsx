'use client';
import ListingCard from '@/components/ListingCard';
import { useStateContext } from '@/context/StateContext';
import { supabaseClient } from '@/utils/supabaseClient';
import React, { useEffect, useState } from 'react';
import Stripe from 'stripe';

type Props = {
  listings: any;
};

const Page = (props: Props) => {
  const [listings, setListings] = useState<any>([]);
  const { state, setState } = useStateContext();
  const stripeActivation = new Stripe(
    process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!,
    {
      apiVersion: '2023-08-16',
    }
  );

  const fetchListings = async () => {
    try {
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

      setListings(filteredListings);
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
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

  return (
    <main className="py-6  flex flex-col bg-[#F2E9E7] min-h-screen">
      <form className="flex m-auto w-fit gap-4 my-10">
        <input type="text" placeholder="Location" className="rounded-xl p-1" />
        <button
          type="submit"
          className="bg-[#F28A38] px-2 py-1 rounded-xl text-white">
          Search
        </button>
      </form>
      <div className="flex flex-col mx-auto w-full my-8 justify-between">
        <div className="flex">
          <div className="m-auto">
            <p className="text-2xl">Say hello to</p>
            <h2 className="text-3xl">Lorem Ipsum</h2>
          </div>
          <h1 className="text-3xl m-auto">
            Let&apos;s discover <br />
            your new adventure
          </h1>
        </div>

        <div className="bg-[#EADEDB] h-max">
          <div className="m-auto justify-between max-w-[1000px] flex w-full flex-wrap">
            {listings &&
              listings.map((listing: any, index: number) => (
                <ListingCard key={index} listingInfo={listing} />
              ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
