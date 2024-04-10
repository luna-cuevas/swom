'use client';
import React, { useState } from 'react';
import GoogleMapComponent from './GoogleMapComponent';
import Link from 'next/link';
import { useAtom } from 'jotai';
import { globalStateAtom } from '@/context/atoms';

type Props = {};

const HomeMapComponent = (props: Props) => {
  const [whereIsIt, setWhereIsIt] = useState({
    lat: 0,
    lng: 0,
  });
  const [state, setState] = useAtom(globalStateAtom);
  console.log('state', state);
  console.log('whereIsIt', whereIsIt);
  return (
    <div>
      <div className=" w-full flex flex-col justify-center md:flex-row gap-4">
        <div className="w-full">
          <GoogleMapComponent hideMap={true} setWhereIsIt={setWhereIsIt} />
        </div>
        <Link
          href={
            state.loggedInUser && whereIsIt.lat !== 0 && whereIsIt.lng !== 0
              ? `/listings?lat=${whereIsIt.lat}&lng=${whereIsIt.lng}`
              : `/become-member`
          }
          className="bg-[#E88527] rounded-3xl mx-auto md:mx-0 text-white h-fit w-fit py-2 px-8 my-auto">
          Search
        </Link>
      </div>
    </div>
  );
};

export default HomeMapComponent;
