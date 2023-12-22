'use client';
import ListingCard from '@/components/ListingCard';
import { useStateContext } from '@/context/StateContext';
import { supabaseClient } from '@/utils/supabaseClient';
import React, { useEffect, useState } from 'react';
import Stripe from 'stripe';

type Props = {};

const Page = (props: Props) => {
  const supabase = supabaseClient();

  const [listings, setListings] = useState<any>([]);
  const { state, setState } = useStateContext();
  const [stripe, setStripe] = useState<Stripe | null>(null);

  console.log('listings', listings);

  const fetchListings = async () => {
    try {
      // Replace 'listings' with your actual table name
      const { data, error } = await supabase.from('listings').select('*');

      if (error) {
        throw error;
      }

      console.log('data', data);

      const subscribedListings = await Promise.all(
        data.map(async (listing: any) => {
          const isSubscribed = await isUserSubscribed(listing.userInfo.email);
          // only return the listing if the user is subscribed
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
      console.log('subscribedListings', filteredListings);

      setListings(filteredListings || []);
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    }
  };

  const fetchStripe = async () => {
    // const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

    const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
      apiVersion: '2023-08-16',
    });
    setStripe(stripe as Stripe | null); // Use type assertion
  };

  async function isUserSubscribed(email: string): Promise<boolean> {
    console.log('email', email);

    try {
      if (!stripe) {
        console.log('Stripe.js has not loaded yet.');
        return false;
      }
      // Retrieve the customer by email
      const customers = await stripe.customers.list({ email: email });
      const customer = customers.data[0]; // Assuming the first customer is the desired one

      if (customer) {
        // Retrieve the customer's subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          limit: 1, // Assuming only checking the latest subscription
        });

        console.log('subscriptions', subscriptions);

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
    if (state.session) {
      fetchListings();
      fetchStripe();
    }
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

        <div className="bg-[#EADEDB]">
          <div className="m-auto justify-between max-w-[1000px] flex w-full flex-wrap">
            {listings &&
              listings.map((listing: any) => (
                <ListingCard key={listing.id} listingInfo={listing} />
              ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
