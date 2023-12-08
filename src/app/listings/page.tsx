'use client';
import ListingCard from '@/components/ListingCard';
import { useStateContext } from '@/context/StateContext';
import { supabaseClient } from '@/utils/supabaseClient';
import React, { useEffect, useState } from 'react';

type Props = {};

const Page = (props: Props) => {
  const supabase = supabaseClient();

  const [listings, setListings] = useState<any>([]);
  const { state, setState } = useStateContext();

  console.log('listings', listings);

  const fetchListings = async () => {
    try {
      // Replace 'listings' with your actual table name
      const { data, error } = await supabase.from('listings').select('*');

      if (error) {
        throw error;
      }

      console.log('data', data);

      setListings(data);
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [supabase]);

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
            Let's discover <br />
            your new adventure
          </h1>
        </div>

        <div className="bg-[#EADEDB]">
          <div className="m-auto justify-between max-w-[1000px] flex w-full flex-wrap">
            {listings.map((listing: any) => (
              <ListingCard key={listing.id} listingInfo={listing} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
