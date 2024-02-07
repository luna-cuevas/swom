'use client';
import React, { useState, useEffect } from 'react';

import { supabaseClient } from '@/utils/supabaseClient';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import generatePassword from '@/utils/generatePassword';
import { useForm } from 'react-hook-form';
import BecomeMemberDropzone from '@/components/BecomeMemberDropzone';

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
  const [addUser, setAddUser] = useState(false);

  const isDev = process.env.NODE_ENV === 'development';

  const [signUpActive, setSignUpActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const supabase = supabaseClient();
  const temporaryPassword = generatePassword();
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userInfo: {
        name: '',
        dob: '',
        email: '',
        phone: '',
        profession: '',
        about_me: '',
        children: '',
        recommended: '',
        openToOtherCities: {
          cityVisit1: '',
          cityVisit2: '',
          cityVisit3: '',
        },
        openToOtherDestinations: 'false',
      },
      homeInfo: {
        title: '',
        property: '',
        description: '',
        locatedIn: '',
        bathrooms: '',
        area: '',
        mainOrSecond: '',
        address: '',
        city: '',
        howManySleep: '',
      },

      amenities: {
        bike: false, // Default value for the "bike" radio button
        car: false, // Default value for the "car" radio button
        tv: false, // Default value for the "tv" radio button
        dishwasher: false, // Default value for the "dishwasher" radio button
        pingpong: false, // Default value for the "pingpong" radio button
        billiards: false, // Default value for the "billiards" radio button
        washer: false, // Default value for the "washer" radio button
        dryer: false, // Default value for the "dryer" radio button
        wifi: false, // Default value for the "wifi" radio button
        elevator: false, // Default value for the "elevator" radio button
        terrace: false, // Default value for the "terrace" radio button
        scooter: false, // Default value for the "scooter" radio button
        bbq: false, // Default value for the "bbq" radio button
        computer: false, // Default value for the "computer" radio button
        wcAccess: false, // Default value for the "wcAccess" radio button
        pool: false, // Default value for the "pool" radio button
        playground: false, // Default value for the "playground" radio button
        babyGear: false, // Default value for the "babyGear" radio button
        ac: false, // Default value for the "ac" radio button
        fireplace: false, // Default value for the "fireplace" radio button
        parking: false, // Default value for the "parking" radio button
        hotTub: false, // Default value for the "hotTub" radio button
        sauna: false, // Default value for the "sauna" radio button
        other: false, // Default value for the "other" radio button
        doorman: false, // Default value for the "doorman" radio button
        cleaningService: false, // Default value for the "cleaningService" radio button
        videoGames: false, // Default value for the "videoGames" radio button
        tennisCourt: false, // Default value for the "tennisCourt" radio button
        gym: false,
      },
    },
  });

  const onSubmit = async (data: any) => {
    if (imageFiles.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    const { data: userData, error } = await supabase.auth.admin.createUser({
      email: data.userInfo.email,
      email_confirm: true,
      password: temporaryPassword,
      user_metadata: {
        name: data.userInfo.name,
        dob: data.userInfo.dob,
        phone: data.userInfo.phone,
        role: 'member',
      },
    });

    if (error) {
      console.log(error);
      toast.error(error.message);
    } else {
      console.log('userData', userData);

      if (userData.user) {
        const uploadImageToCloudinary = async (imageFile: any) => {
          try {
            const formData = new FormData();
            formData.append('file', imageFile);
            formData.append('upload_preset', 'zttdzjqk');
            formData.append('folder', `${userData.user?.id}/listingImages}`);

            const response = await fetch(
              'https://api.cloudinary.com/v1_1/dxfz8k7g8/image/upload',
              {
                method: 'POST',
                body: formData,
              }
            );

            if (!response.ok) {
              throw new Error('Failed to upload image to Cloudinary');
            }

            const result = await response.json();
            console.log('Uploaded image to Cloudinary:', result);

            // Include transformation parameters to reduce image size
            const transformedUrl = `${result.secure_url.replace(
              '/upload/',
              '/upload/w_auto,c_scale,q_auto:low/'
            )}`;

            console.log('Transformed URL:', transformedUrl);

            return transformedUrl;
          } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            throw error;
          }
        };

        if (imageFiles && imageFiles.length > 0) {
          // Upload images to the listingImages bucket
          const uploadPromises = imageFiles.map((imageFile) =>
            uploadImageToCloudinary(imageFile)
          );
          const results = await Promise.all(uploadPromises);

          if (results.some((result) => result.length === 0)) {
            console.error('Error uploading listing images:', results);
          } else {
            data.homeInfo.listingImages = results;
            console.log('results', results);
          }
        }

        const { data: userListing, error: userError } = await supabase
          .from('needs_approval')
          .upsert(
            {
              user_id: userData.user?.id,
              userInfo: data.userInfo,
              homeInfo: data.homeInfo,
              amenities: data.amenities,
              city: '',
            },
            {
              ignoreDuplicates: false,
            }
          );

        if (userError) {
          console.log(userError);
          toast.error(userError.message);
        } else {
          console.log('user', userListing);
          toast.success('Application submitted successfully');
        }
      }
      setSignUpActive(false);
      setAddUser(false);
      setSubmitted(true);
    }
  };

  const onError = (errors: any, e: any) => {
    const printErrorMessages = (errorObject: any) => {
      Object.entries(errorObject).forEach(([key, value]: [string, any]) => {
        if (typeof value === 'object' && value !== null && !value.message) {
          printErrorMessages(value);
        } else {
          console.log(value.message);
          toast.error(value.message);
        }
      });
    };

    if (errors) {
      printErrorMessages(errors);
    }
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    let formattedNumber = '';

    for (let i = 0; i < cleaned.length; i++) {
      if (i === 0) formattedNumber += '+';
      if (i === 1) formattedNumber += ' (';
      if (i === 4) formattedNumber += ') ';
      if (i === 7) formattedNumber += '-';

      formattedNumber += cleaned[i];
    }

    return formattedNumber.substring(0, 17);
  };

  const handlePhoneInputChange = (e: React.FocusEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setValue('userInfo.phone', formattedNumber);
  };

  // const addUser = async () => {
  //   const age = '';

  //   const userInfo = {
  //     name: 'Luna Cuevas',
  //     dob: '',
  //     email: 's.cuevas14+1@gmail.com',
  //     phone: '1234567890',
  //     profession: 'Entrepreneur',
  //     about_me: 'I am the developer of Swom Travel',
  //     children: 'never',
  //     recommended: 'Ana Gomez',
  //     openToOtherCities: {
  //       cityVisit1: 'Mexico',
  //       cityVisit2: 'Buenos Aires',
  //       cityVisit3: 'Santiago',
  //     },
  //     openToOtherDestinations: 'true',
  //   };

  //   const homeInfo = {
  //     title: 'Lunas House',
  //     property: 'house',
  //     description: 'Description',
  //     locatedIn: 'gated community',
  //     bathrooms: '3',
  //     area: '200-250',
  //     mainOrSecond: 'main',
  //     address: '',
  //     city: 'Medellin, Colombia',
  //     howManySleep: '4',
  //     listingImages: [],
  //   };

  //   const amenities = {
  //     bike: false,
  //     car: false,
  //     tv: true,
  //     dishwasher: true,
  //     pingpong: false,
  //     billiards: false,
  //     washer: true,
  //     dryer: true,
  //     wifi: true,
  //     elevator: false,
  //     terrace: true,
  //     scooter: false,
  //     bbq: true,
  //     computer: false,
  //     wcAccess: false,
  //     pool: false,
  //     playground: false,
  //     babyGear: false,
  //     ac: false,
  //     fireplace: false,
  //     parking: false,
  //     hotTub: true,
  //     sauna: false,
  //     other: false,
  //     doorman: true,
  //     cleaningService: false,
  //     videoGames: false,
  //     tennisCourt: false,
  //     gym: false,
  //   };

  //   // const { data: userCreationData, error: userCreationError } =
  //   //   await supabase.auth.resetPasswordForEmail(email, {
  //   //     redirectTo: 'http://localhost:3000/sign-up',
  //   //   });

  //   const { data: user, error } = await supabase.auth.signUp({
  //     email: userInfo.email,
  //     password: 'password',
  //     options: {
  //       emailRedirectTo: 'http://localhost:3000/sign-up',
  //       data: {
  //         name: userInfo.name,
  //         dob: userInfo.dob,
  //         phone: userInfo.phone,
  //         role: 'member',
  //       },
  //     },
  //   });

  //   if (error) {
  //     console.error('Error adding user:', error.message);
  //   } else {
  //     if (user.user) {
  //       const { data: listingUpdate, error: listingError } = await supabase
  //         .from('listings')
  //         .insert({
  //           user_id: user.user.id,
  //           userInfo: userInfo,
  //           homeInfo: homeInfo,
  //           amenities: amenities,
  //         });

  //       const { data: appUserInfo, error: userError } = await supabase
  //         .from('appUsers')
  //         .insert({
  //           id: user.user.id,
  //           email: userInfo.email,
  //           role: 'member',
  //           name: userInfo.name,
  //           profession: userInfo.profession,
  //           age: age,
  //         });

  //       if (listingError || userError) {
  //         console.error(
  //           'Error adding listing or user data:',
  //           (listingError && listingError.message) ||
  //             (userError && userError.message)
  //         );
  //       } else {
  //         console.log('listingData', listingUpdate);
  //         console.log('appUserInfo', appUserInfo);
  //       }
  //     }
  //   }
  // };

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
  }, [submitted]);

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
          redirectTo: isDev
            ? 'http://localhost:3000/sign-up'
            : 'https://swom.travel/sign-up',
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

  const uploadUser = async () => {
    const age = '';

    const userInfo = {
      name: 'Luna Cuevas',
      dob: '',
      email: '',
    };
  };

  return (
    <div className="bg-gray-200">
      <div className=" w-full py-8 flex flex-col md:w-2/3 m-auto min-h-screen">
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
            {needsApprovalListings.length == 0 ? (
              <tr>
                <td colSpan={4} className="py-4">
                  No listings found
                </td>
              </tr>
            ) : (
              needsApprovalListings.map((listing: any) => (
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
              ))
            )}
          </tbody>
        </table>

        {!addUser ? (
          <button
            onClick={() => setAddUser(true)}
            className="mx-auto w-fit hover:bg-[#7f8119d1] bg-[#7F8119] text-white p-2 rounded-xl my-4 ">
            Add User
          </button>
        ) : (
          <h1 className="text-xl text-center mt-8 my-4 font-sans">
            Add a new user
          </h1>
        )}

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

        {addUser && (
          <div className="bg-white flex flex-col">
            <button
              onClick={() => setAddUser(false)}
              className="mr-2 mt-2 ml-auto w-fit hover:bg-red-400 bg-red-300 text-sm text-white p-1 py-0 rounded-full  ">
              {/* unicode for an x */}
              &#10005;
            </button>
            <form
              onSubmit={handleSubmit(onSubmit, onError)}
              className=" max-w-[1000px] gap-4  py-4 flex flex-col  m-auto">
              <div className="flex md:flex-row flex-col gap-4 md:gap-12 w-2/3 mx-auto">
                <div className="m-auto flex-col w-full flex">
                  <label htmlFor="name">Name</label>
                  <input
                    {...register('userInfo.name', {
                      required: 'Please enter your name',
                    })}
                    className="w-full bg-transparent border-b border-[#172544] focus:outline-none"
                    type="text"
                    id="name"
                  />
                </div>
                <div className="m-auto flex-col w-full flex">
                  <label htmlFor="email">Email</label>
                  <input
                    {...register('userInfo.email', {
                      required: 'Please enter your email',
                    })}
                    className="w-full bg-transparent border-b border-[#172544] focus:outline-none"
                    type="email"
                    id="email"
                  />
                </div>
              </div>

              <div className="flex md:flex-row flex-col gap-4 md:gap-12 w-2/3 mx-auto">
                <div className="m-auto flex-col w-2/3 flex">
                  <label htmlFor="phone">Phone</label>
                  <input
                    {...register('userInfo.phone', {
                      required: 'Please enter your phone number',
                      pattern: {
                        value: /^\+\d{1} \(\d{3}\) \d{3}-\d{4}$/, // Update this regex based on your formatting
                        message:
                          'Please enter a valid phone number with country code',
                      },
                    })}
                    onChange={handlePhoneInputChange}
                    className="w-full bg-transparent border-b border-[#172544] focus:outline-none"
                    type="tel"
                    placeholder="+1 (555) 555-5555"
                    id="phone"
                  />
                  {errors.userInfo?.phone && (
                    <p>{errors.userInfo.phone.message}</p>
                  )}
                </div>
                <div className="m-auto flex-col w-2/3 flex">
                  <label htmlFor="dob">What is your date of birth?</label>
                  <input
                    {...register('userInfo.dob', {
                      required: 'Please enter your date of birth',
                    })}
                    className="w-full bg-transparent border-b border-[#172544] focus:outline-none"
                    type="date"
                    id="dob"
                  />
                </div>
              </div>

              <div className="m-auto flex-col w-2/3 flex">
                <label htmlFor="profession">What do you do for a living?</label>
                <input
                  {...register('userInfo.profession', {
                    required: 'Please enter your profession',
                  })}
                  className="w-full bg-transparent border-b border-[#172544] focus:outline-none"
                  type="input"
                  id="profession"
                />
              </div>
              <div className="m-auto flex-col w-2/3 flex">
                <label htmlFor="about_me">Tell us more about yourself.</label>
                <input
                  {...register('userInfo.about_me', {
                    required: 'Please tell us more about yourself.',
                  })}
                  className="w-full bg-transparent border-b border-[#172544] focus:outline-none"
                  type="input"
                  id="about_me"
                />
              </div>
              <div className="m-auto flex-col w-2/3 flex">
                <label htmlFor="children">
                  Do you travel with small children?
                </label>
                <div className="flex gap-2">
                  <input
                    {...register('userInfo.children')}
                    className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                    type="radio"
                    value="always"
                    id="always"
                  />
                  <label htmlFor="always">Always</label>
                  <input
                    {...register('userInfo.children')}
                    className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                    type="radio"
                    value="sometimes"
                    id="sometimes"
                  />
                  <label htmlFor="sometimes">Sometimes</label>
                  <input
                    {...register('userInfo.children')}
                    className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                    type="radio"
                    value="never"
                    id="never"
                  />
                  <label htmlFor="never">Never</label>
                </div>
              </div>
              <div className="m-auto flex-col w-2/3 flex">
                <label htmlFor="recommended">
                  Name of the person who invited you to SWOM?
                </label>
                <input
                  {...register('userInfo.recommended', {
                    required:
                      'Please enter the name of the person who invited you',
                  })}
                  className="w-full bg-transparent border-b border-[#172544] focus:outline-none"
                  type="text"
                  id="recommended"
                />
              </div>

              <div className="m-auto gap-4 flex-col w-2/3 flex ">
                <label htmlFor="children">
                  What kind of property do you have for exchange?
                </label>

                <div className="flex flex-wrap gap-3">
                  <div className="gap-2 flex">
                    <input
                      className="w-fit bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="radio"
                      value="house"
                      {...register('homeInfo.property')}
                      id="house"
                    />
                    <label htmlFor="house">House</label>
                  </div>
                  <div className="gap-2 flex">
                    <input
                      className="w-fit bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="radio"
                      value="apartment"
                      {...register('homeInfo.property')}
                      id="apartment"
                    />
                    <label htmlFor="apartment">Apartment</label>
                  </div>
                  <div className="gap-2 flex">
                    <input
                      className="w-fit bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="radio"
                      value="villa"
                      {...register('homeInfo.property')}
                      id="villa"
                    />

                    <label htmlFor="villa">Villa</label>
                  </div>
                  <div className="gap-2 flex">
                    <input
                      className="w-fit bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="radio"
                      value="farm"
                      {...register('homeInfo.property')}
                      id="farm"
                    />
                    <label htmlFor="farm">Farm</label>
                  </div>
                  <div className="gap-2 flex">
                    <input
                      className="w-fit bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="radio"
                      value="boat"
                      {...register('homeInfo.property')}
                      id="boat"
                    />
                    <label htmlFor="boat">Boat</label>
                  </div>
                  <div className="gap-2 flex">
                    <input
                      {...register('homeInfo.property')}
                      className="w-fit bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="radio"
                      value="rv"
                      id="rv"
                    />
                    <label htmlFor="rv">RV</label>
                  </div>
                  <div className="gap-2 flex">
                    <input
                      className="w-fit bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="radio"
                      value="otherProperty"
                      {...register('homeInfo.property')}
                      id="otherProperty"
                    />
                    <label htmlFor="otherProperty">Other</label>
                  </div>
                </div>
                <div className="flex md:flex-row flex-col gap-4 md:gap-12 w-full mx-auto">
                  <div className="m-auto flex-col w-full flex">
                    <label htmlFor="address">
                      What is the exact address of the property?
                    </label>
                    <textarea
                      rows={1}
                      id="address"
                      {...register('homeInfo.address', {
                        required: 'Please enter the address of the property',
                      })}
                      className="w-full bg-transparent border-b border-[#172544] focus:outline-none"
                    />
                  </div>
                  <div className=" flex-col w-full flex">
                    <label htmlFor="city">What is your city?</label>
                    <input
                      id="city"
                      {...register('homeInfo.city', {
                        required: 'Please enter the city of the property',
                      })}
                      className="w-full bg-transparent border-b border-[#172544] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="">Is your property located in:</label>
                  <div className="flex gap-2 flex-wrap">
                    <div className="flex gap-2">
                      <input
                        className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                        type="radio"
                        id="condominium"
                        value="condominium"
                        {...register('homeInfo.locatedIn', {})}
                      />
                      <label htmlFor="condominium">a condominium</label>
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                        type="radio"
                        id="gated"
                        value="gated"
                        {...register('homeInfo.locatedIn')}
                      />
                      <label htmlFor="gated">a gated community</label>
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                        type="radio"
                        id="itRestsFreely"
                        value="itRestsFreely"
                        {...register('homeInfo.locatedIn')}
                      />
                      <label htmlFor="itRestsFreely">it rests freely</label>
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                        type="radio"
                        id="other"
                        value="other"
                        {...register('homeInfo.locatedIn')}
                      />
                      <label htmlFor="other">other</label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <label htmlFor="">How many people does it sleep?</label>
                  <select
                    className="bg-transparent focus:outline-none  rounded-xl border w-fit px-2 border-[#172544]"
                    {...register('homeInfo.howManySleep', {
                      required: 'Please select how many people it sleeps',
                    })}
                    id="">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7+">7+</option>
                  </select>
                </div>
                <div className="gap-4 flex">
                  <label htmlFor="">How many bathrooms?</label>
                  <select
                    className="bg-transparent focus:outline-none  rounded-xl border w-fit px-2 border-[#172544]"
                    {...register('homeInfo.bathrooms', {
                      required: 'Please select how many bathrooms',
                    })}
                    id="">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
                </div>
                <div className="gap-4 flex">
                  <label htmlFor="">
                    Is this your main property or your second home?
                  </label>
                  <select
                    className="bg-transparent focus:outline-none  rounded-xl border w-fit px-2 border-[#172544]"
                    {...register('homeInfo.mainOrSecond', {
                      required:
                        'Please select if this is your main or second home',
                    })}
                    id="">
                    <option value="main">Main</option>
                    <option value="second">Second</option>
                  </select>
                </div>
                <div className="gap-4 flex">
                  <label htmlFor="">Size in square meters.</label>
                  <select
                    className="bg-transparent focus:outline-none  rounded-xl border w-fit px-2 border-[#172544]"
                    {...register('homeInfo.area', {
                      required: 'Please select the size of your home',
                    })}
                    id="">
                    <option value="60-100">60 - 100 m2</option>
                    <option value="100-150">100 - 150 m2</option>
                    <option value="150-200">150 - 200 m2</option>
                    <option value="200-250">200 - 250 m2</option>
                    <option value="250-300">250 - 300 m2</option>
                    <option value="300-350">300 - 350 m2</option>
                    <option value="350-400">350 - 400 m2</option>
                    <option value="400-450">400 - 450 m2</option>
                    <option value="450-500">450 - 500 m2</option>
                    <option value="500-550">500 - 550 m2</option>
                    <option value="550-600">550 - 600 m2</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="">Upload some photos.</label>
                  <BecomeMemberDropzone
                    imageFiles={imageFiles}
                    setImageFiles={setImageFiles}
                  />
                </div>
                <div>
                  <label htmlFor="">Give your property a title.</label>
                  <input
                    {...register('homeInfo.title', {
                      required: 'Please give your listing a title.',
                    })}
                    className="w-full mb-4 bg-transparent border-b border-[#172544] focus:outline-none"
                    type="text"
                    id="title"
                  />
                  <label htmlFor="">Write a description of the property.</label>
                  <textarea
                    id="description"
                    {...register('homeInfo.description', {
                      required: 'Please enter a description of your property',
                    })}
                    className="w-full bg-transparent border-b border-[#172544] focus:outline-none"
                  />
                  <label htmlFor="">Three cities you would visit?</label>
                  <div className="flex gap-8">
                    <input
                      className="w-1/3 bg-transparent border-b border-[#172544] focus:outline-none"
                      {...register('userInfo.openToOtherCities.cityVisit1')}
                    />
                    <input
                      className="w-1/3 bg-transparent border-b border-[#172544] focus:outline-none"
                      {...register('userInfo.openToOtherCities.cityVisit2')}
                    />
                    <input
                      className="w-1/3 bg-transparent border-b border-[#172544] focus:outline-none"
                      {...register('userInfo.openToOtherCities.cityVisit3')}
                    />
                  </div>
                  <div className="flex gap-4 mt-4">
                    <label htmlFor="">
                      Are you open to other destinations?
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                        type="radio"
                        value="true"
                        {...register('userInfo.openToOtherDestinations', {
                          required:
                            'Please select if you are open to other destinations',
                        })}
                        id="true"
                      />
                      <label htmlFor="true">Yes</label>
                      <input
                        className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                        type="radio"
                        value="false"
                        {...register('userInfo.openToOtherDestinations', {
                          required:
                            'Please select if you are open to other destinations',
                        })}
                        id="false"
                      />
                      <label htmlFor="false">No</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="m-auto flex-col w-2/3 flex">
                <label htmlFor="">
                  What amenities does your property have?
                </label>
              </div>
              <div className="flex w-2/3 m-auto flex-wrap pb-8">
                <div className="w-1/3 gap-2 flex flex-col">
                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.bike')}
                      id="bike"
                    />
                    <label className="" htmlFor="bike">
                      Bike
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.car')}
                      id="car"
                    />
                    <label className="" htmlFor="car">
                      Car
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.tv')}
                      id="tv"
                    />
                    <label className="" htmlFor="tv">
                      TV
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.dishwasher')}
                      id="dishwasher"
                    />
                    <label className="" htmlFor="dishwasher">
                      Dishwasher
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.pingpong')}
                      id="pingpong"
                    />
                    <label className="" htmlFor="pingpong">
                      Ping pong
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.billiards')}
                      id="billiards"
                    />
                    <label className="" htmlFor="billiards">
                      Billiards
                    </label>
                  </div>
                </div>

                <div className="w-1/3 gap-2 flex flex-col">
                  <div className="gap-2 flex">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.washer')}
                      id="washer"
                    />
                    <label className="" htmlFor="washer">
                      Washer
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.dryer')}
                      id="dryer"
                    />
                    <label className="" htmlFor="dryer">
                      Dryer
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.wifi')}
                      id="wifi"
                    />
                    <label className="" htmlFor="wifi">
                      Wifi
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.elevator')}
                      id="elevator"
                    />
                    <label className="" htmlFor="elevator">
                      Elevator
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.terrace')}
                      id="terrace"
                    />
                    <label className="" htmlFor="terrace">
                      Terrace
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.scooter')}
                      id="scooter"
                    />
                    <label className="" htmlFor="scooter">
                      Scooter
                    </label>
                  </div>
                </div>

                <div className="w-1/3 gap-2 flex flex-col">
                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.bbq')}
                      id="bbq"
                    />
                    <label className="" htmlFor="bbq">
                      BBQ
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.computer')}
                      id="computer"
                    />
                    <label className="" htmlFor="computer">
                      Home Computer
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      {...register('amenities.wcAccess')}
                      type="checkbox"
                      id="wc"
                    />
                    <label className="" htmlFor="wc">
                      WC Access
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.pool')}
                      id="pool"
                    />
                    <label className="" htmlFor="pool">
                      Pool
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.playground')}
                      id="playground"
                    />
                    <label className="" htmlFor="playground">
                      Playground
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.babyGear')}
                      id="babyGear"
                    />
                    <label className="" htmlFor="babyGear">
                      Baby gear
                    </label>
                  </div>
                </div>

                <div className="w-1/3 gap-2 flex flex-col">
                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.ac')}
                      id="ac"
                    />
                    <label className="" htmlFor="ac">
                      AC
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.fireplace')}
                      id="fireplace"
                    />
                    <label className="" htmlFor="fireplace">
                      Fireplace
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.parking')}
                      id="parking"
                    />
                    <label className="" htmlFor="parking">
                      Private parking
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.hotTub')}
                      id="hotTub"
                    />
                    <label className="" htmlFor="hotTub">
                      Hot tub
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.sauna')}
                      id="sauna"
                    />
                    <label className="" htmlFor="sauna">
                      Sauna
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.other')}
                      id="other"
                    />
                    <label className="" htmlFor="other">
                      Other...
                    </label>
                  </div>
                </div>

                <div className="w-1/3 gap-2 flex flex-col">
                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.doorman')}
                      id="doorman"
                    />
                    <label className="" htmlFor="doorman">
                      Doorman
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.cleaningService')}
                      id="cleaningService"
                    />
                    <label className="" htmlFor="cleaningService">
                      Cleaning service
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.videoGames')}
                      id="videoGames"
                    />
                    <label className="" htmlFor="videoGames">
                      Video games
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.tennisCourt')}
                      id="tennisCourt"
                    />
                    <label className="" htmlFor="tennisCourt">
                      Tennis court
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="checkbox"
                      {...register('amenities.gym')}
                      id="gym"
                    />
                    <label className="" htmlFor="gym">
                      Gym
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="bg-[#E78426] w-fit m-auto hover:bg-[#e78326d8] text-[#fff] font-bold px-4 py-2 rounded-3xl">
                Submit
              </button>
            </form>
          </div>
        )}
      </div>
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
  );
};

export default Dashboard;
