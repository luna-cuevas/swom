'use client';
import CarouselPage from '@/components/Carousel';
import DropZone from '@/components/DropZone';
import GoogleMapComponent from '@/components/GoogleMapComponent';
import { useStateContext } from '@/context/StateContext';
import Image from 'next/image';
import React, { use, useCallback, useEffect, useRef, useState } from 'react';
import { set, useForm, Controller } from 'react-hook-form';
import { supabaseClient } from '@/utils/supabaseClient';
import ProfilePicDropZone from '@/components/ProfilePicDropZone';
import citiesData from '@/data/citiesDescriptions.json';
import BecomeMemberDropzone from '@/components/BecomeMemberDropzone';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Props = {};

const Page = (props: Props) => {
  const [editUserInfo, setEditUserInfo] = useState(false);
  const [userName, setUserName] = useState('');
  const { state, setState } = useStateContext();
  const [profileImage, setProfileImage] = useState<File[]>([]);
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const supabase = supabaseClient();
  const [selectedImage, setSelectedImage] = useState(0); // Track selected image
  const aboutYourHomeRef = useRef<HTMLTextAreaElement | null>(null);
  const [whereIsIt, setWhereIsIt] = useState('');
  const [listings, setListings] = useState<any>([]);
  const [downloadedImages, setDownloadedImages] = useState<any>([]);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  const {
    register,
    handleSubmit,
    getValues,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userInfo: {
        profileImage: '',
        name: '',
        userName: '',
        dob: '',
        email: '',
        phone: '',
        age: 0,
        profession: '',
        about_me: '',
        children: '',
        recommended: '',
        whereTo: '',
        openToOtherCities: {
          cityVisit1: '',
          cityVisit2: '',
          cityVisit3: '',
        },
        openToOtherDestinations: 'false',
      },
      homeInfo: {
        title: '',
        address: '',
        description: '',
        listingImages: [],
        property: '',
        howManySleep: '',
        locatedIn: '',
        city: '',
        mainOrSecond: '',
        bathrooms: '',
        area: '',
        whereIsIt: '',
      },

      city: '',

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

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setWindowWidth(window.innerWidth);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }
    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  const handleInputChange = (e: any) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 0) {
      setCitySearchOpen(true);
    }
  };

  const filteredCities = citiesData.filter((city) => {
    return city.city
      .toLowerCase()
      .includes(searchTerm.split(',')[0].toLowerCase());
  });

  const handleCitySelect = (city: any) => {
    setSelectedCity(city);
    setCitySearchOpen(false);
    setSearchTerm(`${city.city}, ${city.country}`);
    setValue('homeInfo.city', `${city.city}, ${city.country}`);
  };

  const handleSearch = () => {
    const matchedCity = citiesData.find(
      (city) => city.city.toLowerCase() === searchTerm.toLowerCase()
    );
    if (matchedCity) {
      setSelectedCity(matchedCity as any);
    }
  };

  const { ref, ...rest } = register('homeInfo.description');

  const fetchListings = async () => {
    try {
      const listings = await fetch('/api/getListings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: state.user.id }),
      });
      const listingsJson = await listings.json();

      setListings(listingsJson);
      console.log('listing', listingsJson);
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    const textarea = aboutYourHomeRef.current;

    // Adjust the textarea's height based on its scrollHeight
    if (textarea) {
      textarea.style.height = 'auto'; // Set the starting height
      textarea.style.height = textarea.scrollHeight + 'px';

      // Set a maximum height of 300px
      if (textarea.scrollHeight > 300) {
        textarea.style.height = '300px';
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [watch('homeInfo.description')]);

  useEffect(() => {
    setValue('homeInfo.whereIsIt', whereIsIt);
    console.log(watch('homeInfo.whereIsIt'));
  }, [whereIsIt]);

  useEffect(() => {
    if (state.user) {
      fetchListings();
      setUserName(state?.user?.email);
      setValue('userInfo.name', state?.user?.user_metadata.name);
      setValue('userInfo.userName', state?.user?.email);
    }
  }, [state?.user]);

  useEffect(() => {
    if (listings.length > 0) {
      const dob = new Date(listings[0].userInfo.dob);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      setValue('userInfo.profession', listings[0].userInfo.profession);
      if (listings[0].userInfo.age != null) {
        setValue('userInfo.age', listings[0].userInfo.age);
      } else {
        setValue('userInfo.age', age);
      }
      setValue('userInfo.name', listings[0].userInfo.name);
      setValue('userInfo.profileImage', listings[0].userInfo.profileImage);
      setValue('userInfo.about_me', listings[0].userInfo.about_me);
      setValue('userInfo.children', listings[0].userInfo.children);
      setValue('userInfo.recommended', listings[0].userInfo.recommended);
      setValue('userInfo.email', listings[0].userInfo.email);
      setValue('userInfo.phone', listings[0].userInfo.phone);
      setValue('homeInfo.title', listings[0].homeInfo.title);
      setValue('homeInfo.address', listings[0].homeInfo.address);
      setValue('homeInfo.description', listings[0].homeInfo.description);
      setValue('userInfo.dob', listings[0].userInfo.dob);
      setValue('homeInfo.description', listings[0].homeInfo.description);
      setValue('homeInfo.listingImages', listings[0].homeInfo.listingImages);

      setValue(
        'userInfo.openToOtherCities.cityVisit1',
        listings[0].userInfo.openToOtherCities.cityVisit1
      );
      setValue(
        'userInfo.openToOtherCities.cityVisit2',
        listings[0].userInfo.openToOtherCities.cityVisit2
      );
      setValue(
        'userInfo.openToOtherCities.cityVisit3',
        listings[0].userInfo.openToOtherCities.cityVisit3
      );
      setValue(
        'userInfo.openToOtherDestinations',
        listings[0].userInfo.openToOtherDestinations
      );
      setValue('homeInfo.city', listings[0].homeInfo.city);
      if (listings[0].homeInfo.city) {
        handleSearch();
      }
      setDownloadedImages(listings[0].homeInfo.listingImages);
      setValue('homeInfo.description', listings[0].homeInfo.description);
      setValue('homeInfo.property', listings[0].homeInfo.property);
      setValue('homeInfo.howManySleep', listings[0].homeInfo.howManySleep);
      setValue('homeInfo.locatedIn', listings[0].homeInfo.locatedIn);
      setValue('homeInfo.mainOrSecond', listings[0].homeInfo.mainOrSecond);
      setValue('homeInfo.bathrooms', listings[0].homeInfo.bathrooms);
      setValue('homeInfo.area', listings[0].homeInfo.area);
      Object.keys(listings[0].amenities).forEach((amenityKey) => {
        // Set the default value for each amenity using setValue
        // @ts-ignore
        setValue(`amenities.${amenityKey}`, listings[0].amenities[amenityKey]);
      });
      setSearchTerm(listings[0].homeInfo.city);
      handleSearch();
    }
  }, [listings]);

  const onSubmit = async (data: any) => {
    const uploadImageToCloudinary = async (imageFile: any, folder: string) => {
      try {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', 'zttdzjqk');
        formData.append('folder', folder);

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

    if (profileImage && profileImage.length > 0) {
      // Upload profile image to Cloudinary
      const profileImageFile = profileImage[0];
      const profileImageUrl = await uploadImageToCloudinary(
        profileImageFile,
        `${state.user?.id}/profileImage`
      );

      // Use the Cloudinary URL directly
      data.userInfo.profileImage = profileImageUrl;
    }

    if (imageFiles && imageFiles.length > 0) {
      // Upload images to the listingImages bucket
      const uploadPromises = imageFiles.map((imageFile) =>
        uploadImageToCloudinary(imageFile, `${state.user?.id}/listingImages`)
      );
      const results = await Promise.all(uploadPromises);

      if (results.some((result) => result.length === 0)) {
        console.error('Error uploading listing images:', results);
      } else {
        data.homeInfo.listingImages = results;
        console.log('results', results);
      }
    }

    const editListingData = await fetch('/api/profile/editProfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: state.user.id,
        data,
      }),
    });
    const editListingDataJson = await editListingData.json();
    console.log('editListingDataJson', editListingDataJson);

    if (!editListingDataJson) {
      console.error('Error updating user info:', editListingDataJson);
    } else {
      setState({
        ...state,
        loggedInUser: {
          ...state.loggedInUser,
          profileImage: data.userInfo.profileImage,
        },
      });
      console.log('User info updated successfully!', editListingDataJson);
      toast.success('User info updated successfully!');
      // router.refresh();
    }
  };

  const onError = (errors: any, e: any) => {
    console.log(errors, e);
  };

  return (
    <div className="bg-[#F7F1EE]">
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className=" max-w-[1440px] mx-auto relative">
        <div className="py-8  px-8 lg:px-16 flex-col lg:flex-row flex justify-between gap-4">
          <div className="lg:w-[35%] my-4 flex justify-center text-center flex-col">
            {editUserInfo ? (
              <>
                {profileImage.length > 0 ? (
                  <div className="relative w-[100px] mx-auto mb-4 h-[100px]">
                    <Image
                      src={
                        profileImage.length > 0
                          ? URL.createObjectURL(profileImage[0])
                          : '/placeholder.png'
                      }
                      alt="hero"
                      fill
                      objectPosition="center"
                      // objectFit="cover"
                      className="object-cover rounded-full"
                    />
                  </div>
                ) : (
                  <ProfilePicDropZone setProfileImage={setProfileImage} />
                )}
                <div className="px-4 flex gap-2 flex-col">
                  <input
                    className="bg-transparent border-b border-[#172544] focus:outline-none"
                    placeholder="Name"
                    {...register('userInfo.name')}
                  />
                  <input
                    className="bg-transparent border-b border-[#172544] focus:outline-none"
                    placeholder="Profession"
                    {...register('userInfo.profession')}
                  />
                  <input
                    className="bg-transparent border-b border-[#172544] focus:outline-none"
                    placeholder="Age"
                    {...register('userInfo.age')}
                  />
                  {/* save button */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditUserInfo(!editUserInfo);
                    }}>
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="relative w-[80px] my-4 mx-auto h-[80px]">
                  <Image
                    src={
                      profileImage.length > 0
                        ? URL.createObjectURL(profileImage[0])
                        : listings[0]?.userInfo.profileImage ||
                          '/placeholder.png'
                    }
                    alt="hero"
                    fill
                    objectPosition="center"
                    // objectFit="cover"
                    className="object-cover rounded-full"
                  />
                  <div className="absolute bg-[#F87C1B] rounded-full w-[30px] -right-2 align-middle my-auto flex h-[30px]">
                    <button
                      type="button"
                      onClick={() => {
                        setEditUserInfo(!editUserInfo);
                      }}>
                      <Image
                        fill
                        // objectFit="contain"
                        className="m-auto filter-invert object-contain"
                        src="https://img.icons8.com/ios/50/000000/pencil-tip.png"
                        alt=""
                      />
                    </button>
                  </div>
                </div>

                <h2 className="font-serif break-all text-4xl ">
                  {getValues('userInfo.name')}
                </h2>
                <p className="font-sans my-1 break-all font-bold uppercase tracking-[0.1rem]">
                  {getValues('userInfo.profession')}
                </p>
                <p className="font-sans  uppercase">
                  {getValues('userInfo.age')} years
                </p>
              </>
            )}
          </div>
          <div className="lg:w-[65%]">
            <div className="grid py-2 text-center grid-cols-5 border-b border-[#172544]">
              <h3>First Name</h3>
              <h3>Last Name</h3>
              <h3>User Name</h3>
              <h3>Age</h3>
              <h3>Profession</h3>
            </div>
            <div className="grid py-2 text-center grid-cols-5 border-b border-[#172544]">
              <h3>
                {getValues('userInfo.name')
                  ? getValues('userInfo.name').split(' ')[0]
                  : 'First Name'}
              </h3>
              <h3>
                {getValues('userInfo.name')
                  ? getValues('userInfo.name').split(' ')[1]
                  : 'Last Name'}
              </h3>
              <h3>{userName ? userName.split('@')[0] : 'User Name'}</h3>
              <h3>
                {getValues('userInfo.age') ? getValues('userInfo.age') : 'Age'}
              </h3>
              <h3>
                {getValues('userInfo.profession')
                  ? getValues('userInfo.profession')
                  : 'Profession'}
              </h3>
            </div>
            <div className="flex justify-between py-2 border-b border-[#172544]">
              <h2>About you</h2>

              <button
                type="button"
                onClick={() => {
                  setState({ ...state, aboutYou: !state.aboutYou });
                }}>
                <div className="relative w-[30px] align-middle my-auto flex h-[30px]">
                  <Image
                    fill
                    // objectFit="contain"
                    className="m-auto object-contain"
                    src="https://img.icons8.com/ios/50/000000/pencil-tip.png"
                    alt=""
                  />
                </div>
              </button>
            </div>
            {state.aboutYou ? (
              <div className="flex flex-col">
                <textarea
                  {...register('userInfo.about_me')}
                  placeholder="Tell us more about you."
                  className="bg-transparent w-full mt-4 p-2 outline-none border-b border-[#c5c5c5]"
                />
                <button
                  onClick={() => {
                    setState({ ...state, aboutYou: !state.aboutYou });
                  }}
                  type="button"
                  className="bg-[#FE8217] my-2 mx-auto text-white py-1 px-2 rounded-xl">
                  Save
                </button>
              </div>
            ) : (
              <p className="my-4">
                {getValues('userInfo.about_me') ||
                  'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam.'}
              </p>
            )}

            <div className="flex flex-col md:flex-row gap-8 py-4 border-y border-[#172544]">
              <h4 className="text-2xl font-serif italic">
                Where would you like to go?
              </h4>

              <div className="gap-4 flex">
                <input
                  className="w-1/3 h-fit my-auto bg-transparent border-b border-[#172544] focus:outline-none"
                  {...register('userInfo.openToOtherCities.cityVisit1')}
                />
                <input
                  className="w-1/3 h-fit my-auto bg-transparent border-b border-[#172544] focus:outline-none"
                  {...register('userInfo.openToOtherCities.cityVisit2')}
                />
                <input
                  className="w-1/3 h-fit my-auto bg-transparent border-b border-[#172544] focus:outline-none"
                  {...register('userInfo.openToOtherCities.cityVisit3')}
                />
              </div>
            </div>

            <div className="flex flex-col justify-between py-4 ">
              <h4 className="text-2xl font-serif italic">
                Open to other destinations?
              </h4>
              <div className="flex my-2">
                <input
                  className="appearance-none h-fit my-auto bg-transparent checked:bg-[#7F8119] rounded-full border border-[#172544] p-2 mx-2"
                  type="radio"
                  id="yesRadio"
                  value="true"
                  {...register('userInfo.openToOtherDestinations')}
                />
                <label htmlFor="yesRadio">Yes</label>

                <input
                  className="appearance-none ml-4 h-fit my-auto bg-transparent checked:bg-[#7F8119] rounded-full border border-[#172544] p-2 mx-2"
                  type="radio"
                  value="false"
                  id="noRadio"
                  {...register('userInfo.openToOtherDestinations')}
                />
                <label htmlFor="noRadio">No</label>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col px-8 md:px-16 m-auto">
          <div className="flex my-4 flex-col md:flex-row border-y border-[#172544] py-4 justify-between">
            <h2 className="text-xl">
              {watch('homeInfo.city') ? getValues('homeInfo.city') : ''}
            </h2>
            <div className="flex gap-2 justify-evenly">
              <div className="relative w-[20px] my-auto h-[20px]">
                <Image
                  fill
                  // objectFit="contain"
                  className="h-full object-contain"
                  src="/logo-icons.png"
                  alt=""
                />
              </div>
              <h2 className="text-xl my-auto font-sans">
                Listing{' '}
                <span className="font-bold">{state?.user?.id?.slice(-6)}</span>
              </h2>
              <button
                className="ml-4 bg-[#FE8217] my-auto py-2 px-4 text-white rounded-xl"
                onClick={() => {
                  setState({ ...state, imgUploadPopUp: !state.imgUploadPopUp });
                }}
                type="button">
                Upload Photos
              </button>
            </div>
          </div>
          {state.imgUploadPopUp && (
            <div className=" z-50 h-fit w-full bg-white flex m-auto top-0 bottom-0 left-0 right-0">
              <BecomeMemberDropzone
                imageFiles={imageFiles}
                setImageFiles={setImageFiles}
              />
            </div>
          )}
          <div>
            {imageFiles.length > 0 && !state.imgUploadPopUp && (
              <>
                <div className="relative mt-8 mb-6 w-[95%] mx-auto h-[50vh]">
                  <Image
                    src={
                      imageFiles[selectedImage]
                        ? URL.createObjectURL(imageFiles[selectedImage])
                        : '/placeholder.png'
                    }
                    alt=""
                    className="rounded-3xl object-contain"
                    fill
                    objectPosition="center"
                  />
                </div>

                <div className="relative w-[95%] mx-auto h-[30vh]">
                  <CarouselPage
                    picturesPerSlide={
                      // check if mobile or desktop
                      windowWidth > 1025 ? 4 : windowWidth > 768 ? 3 : 1
                    }
                    selectedImage={selectedImage}
                    setSelectedImage={setSelectedImage}
                    overlay={false}
                    contain={false}
                    images={imageFiles.map((file) => ({
                      src: URL.createObjectURL(file),
                    }))}
                  />
                </div>
              </>
            )}
            {downloadedImages?.length > 0 && imageFiles.length == 0 && (
              <>
                <div className="relative mt-8 mb-6 w-[95%] mx-auto h-[50vh]">
                  <Image
                    src={
                      downloadedImages[selectedImage]
                        ? downloadedImages[selectedImage]
                        : '/placeholder.png'
                    }
                    alt=""
                    className="rounded-3xl object-contain"
                    fill
                    objectPosition="center"
                  />
                </div>

                <div className="relative w-[95%] mx-auto h-[30vh]">
                  <CarouselPage
                    picturesPerSlide={
                      // check if mobile or desktop
                      windowWidth > 1025 ? 4 : windowWidth > 768 ? 3 : 1
                    }
                    selectedImage={selectedImage}
                    setSelectedImage={setSelectedImage}
                    overlay={false}
                    contain={false}
                    images={downloadedImages.map((file: any) => ({
                      src: file,
                    }))}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex my-4 border-b border-[#172544] py-4 justify-between">
            <h2 className="text-xl italic font-serif">Name of the city</h2>
          </div>

          <div className="w-full relative flex p-2 my-4 rounded-xl border border-[#172544]">
            <input
              className="bg-transparent w-full outline-none"
              type="text"
              placeholder="What's the city?"
              {...register('homeInfo.city')}
              value={searchTerm}
              onChange={handleInputChange}
            />
            <button type="button" onClick={handleSearch}>
              {' '}
              <img
                className="w-[20px] my-auto h-[20px]"
                src="/search-icon.svg"
                alt=""
              />
            </button>

            {filteredCities.length > 0 && citySearchOpen && (
              <ul className="absolute bg-white w-full p-2 top-full left-0 max-h-[200px] overflow-y-scroll">
                {filteredCities.map((city) => (
                  <li
                    key={city.id}
                    onClick={() => handleCitySelect(city)}
                    style={{ cursor: 'pointer' }}>
                    {city.city}, {city.country}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedCity != null && filteredCities.length !== 0 && (
            <p className="font-sans text-sm my-6">
              {(selectedCity as { description?: string | undefined })
                ?.description ?? 'No description available'}
            </p>
          )}
          {filteredCities.length === 0 && (
            <p className="font-sans text-sm my-6">No description available</p>
          )}

          <div className="flex my-4  border-y border-[#172544] py-4 justify-between">
            <h2 className="text-xl italic font-serif">
              Tell us about your home
            </h2>
          </div>

          <textarea
            {...rest}
            name="description"
            ref={(e) => {
              ref(e);
              aboutYourHomeRef.current = e;
            }}
            onChange={(e) => {
              setValue('homeInfo.description', e.target.value);
            }}
            value={watch('homeInfo.description')}
            className="w-full h-fit max-h-[300px] my-4 p-2 bg-transparent outline-none border-b border-[#c5c5c5] resize-none"
            placeholder="Villa linda is dolor sit amet, consectetuer adipiscing elit, sed diam
          nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
          volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
          ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
          Duis autem vel eum iriure dolor in hen. Lorem ipsum dolor sit amet,
          consec- tetuer adipiscing elit, sed diam nonummy nibh euismod
          tincidunt ut laoreet dolore magna aliquam erat volutpat."></textarea>

          <div className="px-8 py-4 flex flex-col md:flex-row border rounded-xl my-8 border-[#172544]">
            <div className="flex flex-col text-center justify-center py-2 md:py-0 h-full md:w-1/3 border-b md:border-b-0 md:border-r border-[#172544]">
              <label className="font-bold" htmlFor="property">
                Type of property*
              </label>

              <select
                {...register('homeInfo.property')}
                className="w-fit m-auto bg-transparent outline-none p-2 my-2 rounded-lg border-[#172544] border"
                id="property">
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
              </select>
            </div>

            <div className="flex flex-col text-center justify-center h-full py-2 md:py-0 md:w-1/3 border-b md:border-b-0 md:border-r border-[#172544]">
              <label className="font-bold" htmlFor="howManySleep">
                Bedrooms
              </label>
              <select
                className="w-fit m-auto bg-transparent outline-none p-2 my-2 rounded-lg border-[#172544] border"
                {...register('homeInfo.howManySleep')}
                id="howManySleep">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5+">5+</option>
              </select>
            </div>

            <div className="flex flex-col text-center justify-center h-full border-b  py-2 md:py-0 md:w-1/3 ">
              <label className="font-bold" htmlFor="locatedIn">
                Property located in
              </label>
              <select
                className="w-fit m-auto bg-transparent outline-none p-2 my-2 rounded-lg border-[#172544] border"
                {...register('homeInfo.locatedIn')}
                id="locatedIn">
                <option value="condominium">a condominium</option>
                <option value="gated community">a gated community</option>
                <option value="neighborhood">a neighborhood</option>
                <option value="rural">a rural area</option>
              </select>
            </div>
          </div>

          <div className="px-8 py-4 flex flex-col md:flex-row border rounded-xl my-8 border-[#172544]">
            <div className="flex flex-col py-2 md:py-0 text-center justify-center h-full md:w-1/3 border-b md:border-b-0 md:border-r border-[#172544]">
              <label className="font-bold" htmlFor="mainOrSecond">
                Kind of property
              </label>
              <select
                className="w-fit m-auto bg-transparent outline-none p-2 my-2 rounded-lg border-[#172544] border"
                {...register('homeInfo.mainOrSecond')}
                id="mainOrSecond">
                <option value="main">Main property </option>
                <option value="second">Second property</option>
                {/* <option value="Third">Third property</option> */}
              </select>
            </div>

            <div className="flex flex-col text-center py-2 md:py-0 justify-center h-full border-b md:w-1/3 md:border-b-0 md:border-r border-[#172544]">
              <label className="font-bold" htmlFor="bathrooms">
                Bathrooms
              </label>
              <select
                className="w-fit m-auto bg-transparent outline-none p-2 my-2 rounded-lg border-[#172544] border"
                {...register('homeInfo.bathrooms')}
                id="bathrooms">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4+">4+</option>
              </select>
            </div>

            <div className="flex flex-col py-2 md:py-0 text-center justify-center h-full md:w-1/3 ">
              <label className="font-bold" htmlFor="area">
                Area
              </label>
              <select
                className="w-fit m-auto bg-transparent outline-none p-2 my-2 rounded-lg border-[#172544] border"
                {...register('homeInfo.area')}
                id="area">
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
          </div>
          <div className="flex my-4  border-y border-[#172544] py-4 flex-col">
            <h2 className="text-xl italic font-serif">Where is it? </h2>
            <p className="font-serif">
              {' '}
              Write down the exact address so google can identify the location
              of your property.
            </p>
          </div>

          <div className={`w-full h-[30vh] my-4 mb-8 rounded-xl`}>
            <GoogleMapComponent
              exactAddress={listings[0]?.homeInfo.address}
              setWhereIsIt={setWhereIsIt}
            />
          </div>

          <div className="flex my-4  border-y border-[#172544] py-4 justify-between">
            <h2 className="text-xl italic font-serif">
              Amenities and advantages
            </h2>
          </div>

          <div className="flex flex-wrap pb-8">
            <div className="md:w-1/5 w-1/2 gap-2 flex flex-col">
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

            <div className="md:w-1/5 w-1/2 gap-2 flex flex-col">
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

            <div className="md:w-1/5 w-1/2 gap-2 flex flex-col">
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

            <div className="md:w-1/5 w-1/2 gap-2 flex flex-col">
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

            <div className="md:w-1/5 w-1/2 gap-2 flex flex-col">
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
            className="uppercase mb-8 mx-auto rounded-lg w-fit text-white text-lg px-4 font-extralight bg-[#F87C1B] py-2">
            Save Changes
          </button>
        </div>
      </form>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={true}
        draggable={true}
        pauseOnHover={true}
      />
    </div>
  );
};

export default Page;
