'use client';
import React, { useState, useEffect } from 'react';

import { supabaseClient } from '@/utils/supabaseClient';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Listing {
  user_id: number;
  city: string;
  created_at: string;
  homeInfo: {
    address: string;
  };
  userInfo: {
    email: string;
    name: string;
  };
  amenities: object;
}

const Dashboard: React.FC = () => {
  const [needsApprovalListings, setNeedsApprovalListings] = useState<Listing[]>(
    []
  );
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const supabase = supabaseClient();

  useEffect(() => {
    // Fetch listings that need approval from the 'needs_approval' table
    const fetchNeedsApprovalListings = async () => {
      try {
        const { data, error } = await supabase
          .from('needs_approval')
          .select('*');
        if (error) {
          console.error('Error fetching listings:', error.message);
        } else {
          console.log('data', data);
          setNeedsApprovalListings(data ?? []);
        }
      } catch (error: any) {
        console.error('Error fetching listings:', error.message);
      }
    };

    fetchNeedsApprovalListings();
  }, []);

  const handleReject = async (listingObj: any) => {
    try {
      // Move the listing to the 'rejected_listings' table
      const { data, error } = await supabase
        .from('needs_approval')
        .delete()
        .eq('user_id', listingObj.user_id);

      if (error) {
        console.error('Error rejecting listing:', error.message);
      } else {
        // Add the rejected listing to the 'rejected_listings' table
        const { data: listingUpdate, error: updateError } = await supabase
          .from('rejected_listings')
          .insert({
            user_id: listingObj.user_id,
            userInfo: listingObj.userInfo,
            homeInfo: listingObj.homeInfo,
            city: listingObj.city,
            amenities: listingObj.amenities,
          });
        if (updateError) {
          console.error('Error approving listing:', updateError.message);
        } else {
          console.log('listingData', listingUpdate);
          // Remove the listing from the local state
          setNeedsApprovalListings(
            needsApprovalListings.filter(
              (listing) => listing.user_id !== listingObj.user_id
            )
          );
        }
      }
    } catch (error: any) {
      console.error('Error rejecting listing:', error.message);
    }
  };

  const handleApprove = async (listingObj: any) => {
    const dob = new Date(listingObj.userInfo.dob);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();

    try {
      const { data: userCreationData, error: userCreationError } =
        await supabase.auth.resetPasswordForEmail(listingObj.userInfo.email, {
          redirectTo:
            'http://localhost:3000/auth/callback?next=/update-password',
        });

      const {
        data: { user },
      } = await supabase.auth.admin.getUserById(listingObj.user_id);

      if (user) {
        const { data: listingUpdate, error: listingError } = await supabase
          .from('listings')
          .insert({
            user_id: user.id,
            userInfo: listingObj.userInfo,
            homeInfo: listingObj.homeInfo,
            amenities: listingObj.amenities,
          });

        const { data: userInfo, error: userError } = await supabase
          .from('appUsers')
          .insert({
            id: user.id,
            email: listingObj.userInfo.email,
            role: 'member',
            name: listingObj.userInfo.name,
            profession: listingObj.userInfo.profession,
            age: age,
          });
        if (listingError || userError || userCreationError) {
          console.error(
            'Error adding listing or user data:',
            (listingError && listingError.message) ||
              (userError && userError.message) ||
              (userCreationError && userCreationError.message)
          );
        } else {
          // Move the listing to the 'listings' table only if both insertions are successful
          const { data, error } = await supabase
            .from('needs_approval')
            .delete()
            .eq('user_id', listingObj.user_id);

          if (error) {
            console.error(
              'Error deleting listing from needs_approval:',
              error.message
            );
          } else {
            console.log('Successfully approved listing:', data);
            toast.success('Successfully approved listing');
            // Remove the listing from the local state
            setNeedsApprovalListings(
              needsApprovalListings.filter(
                (listing) => listing.user_id !== listingObj.user_id
              )
            );
          }
        }
      }
    } catch (error: any) {
      console.error('Error approving listing:', error.message);
    }
  };

  const handleView = (listing: Listing) => {
    setSelectedListing(listing);
  };

  const handleClosePopup = () => {
    setSelectedListing(null);
  };

  return (
    <div className="bg-gray-200">
      <div className=" w-full py-8  md:w-2/3 m-auto min-h-screen">
        <h1 className="text-xl text-center my-4 font-sans">
          Listings Needing Approval
        </h1>
        <table className="w-[500px]   bg-white md:w-full h-fit">
          <thead className="border-b-2 border-gray-200">
            <tr>
              <th className="py-4">User</th>
              <th>Address</th>
              <th>View</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="text-center    my-2 border-b-2 ">
            {needsApprovalListings.map((listing) => (
              <tr key={listing.user_id} className="">
                <td className="py-4">{listing.userInfo.name}</td>
                <td className="py-4">{listing.homeInfo.address}</td>
                <td className="py-4">
                  <button
                    onClick={() => {
                      handleView(listing);
                    }}>
                    {/* unicode for eye */}
                    &#128065;
                  </button>
                </td>
                <td className="flex py-4 align-middle  justify-evenly">
                  <button onClick={() => handleReject(listing)}>
                    {/* unicode for x */}
                    &#10005;
                  </button>
                  <button onClick={() => handleApprove(listing)}>
                    {/* unicode for checkmark */}
                    &#10003;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selectedListing && (
          <div className="fixed inset-0 px-2   bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white md:w-2/3 max-h-[80vh] p-4  m-auto overflow-y-scroll">
              <div className="flex md:flex-row flex-col md:text-center border-b border-gray-600 text-lg justify-evenly my-2">
                <p>
                  User: <br /> {selectedListing.userInfo.name}
                </p>
                <p>
                  Email: <br /> {selectedListing.userInfo.email}
                </p>
                <p>
                  Address: <br /> {selectedListing.homeInfo.address}
                </p>
              </div>
              <div className="flex w-full  m-auto md:justify-evenly flex-wrap">
                <div className="w-1/3">
                  <p className="mt-2 text-lg">Home Information:</p>
                  <ul className="overflow-scroll">
                    {Object.entries(selectedListing.homeInfo).map(
                      ([key, value]) => {
                        if (key !== 'listingImages') {
                          return (
                            <li
                              key={key}
                              className={`${
                                key !== 'email' ? 'capitalize' : ''
                              } break-all `}>
                              {key}: {value}
                            </li>
                          );
                        }
                      }
                    )}
                  </ul>
                </div>
                <div className="w-1/3 text-center">
                  <p className="mt-2 text-lg">Amenities:</p>
                  <ul>
                    {Object.entries(selectedListing.amenities).map(
                      ([key, value]) => {
                        return value ? (
                          <li key={key} className="capitalize">
                            {key}: {value ? 'Yes' : 'No'}
                          </li>
                        ) : null;
                      }
                    )}
                  </ul>
                </div>
                <div className="w-1/3">
                  <p className="mt-2 text-lg">User Information:</p>
                  <ul>
                    {Object.entries(selectedListing.userInfo).map(
                      ([key, value]) => {
                        if (key !== 'openToOtherCities') {
                          return (
                            <li
                              key={key}
                              className={key !== 'email' ? 'capitalize' : ''}>
                              {key}: {value}
                            </li>
                          );
                        }
                      }
                    )}
                  </ul>
                </div>
                <div className="flex gap-2 w-full my-4">
                  {Object.entries(selectedListing.homeInfo).map(
                    ([key, value]) => {
                      if (key === 'listingImages' && Array.isArray(value)) {
                        return value.map((image) => (
                          <div
                            key={image}
                            className="flex relative h-[200px] w-1/4 object-cover">
                            <Image
                              priority
                              placeholder="blur"
                              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARgAAABYCAYAA"
                              src={image}
                              alt="listing image"
                              fill
                              objectFit="cover"
                            />
                          </div>
                        ));
                      }
                      return null; // or any other fallback JSX if needed
                    }
                  )}
                </div>
              </div>
              <button
                className="m-auto flex my-4 w-fit"
                onClick={handleClosePopup}>
                Close
              </button>
            </div>
          </div>
        )}
        <ToastContainer
          position="bottom-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </div>
  );
};

export default Dashboard;
