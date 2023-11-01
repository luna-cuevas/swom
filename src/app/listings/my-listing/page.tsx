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

type Props = {};

const Page = (props: Props) => {
  const [editUserInfo, setEditUserInfo] = useState(false);
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [profession, setProfession] = useState('');
  const [age, setAge] = useState('');
  const [aboutYou, setAboutYou] = useState('');
  const { state, setState } = useStateContext();
  const [profileImage, setProfileImage] = useState<File[]>([]);
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const supabase = supabaseClient();
  const [selectedImage, setSelectedImage] = useState(0); // Track selected image
  const aboutYourHomeRef = useRef<HTMLTextAreaElement | null>(null);
  const [whereIsIt, setWhereIsIt] = useState('');

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
        name: '',
        userName: '',
        age: '',
        profession: '',
        aboutYou: '',
        whereTo: '',
        otherDestinations: false,
      },
      homeInfo: {
        property: '',
        bedrooms: '',
        locatedIn: '',
        kindOfProperty: '',
        bathrooms: '',
        area: '',
        aboutYourHome: '',
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

  const { ref, ...rest } = register('homeInfo.aboutYourHome');

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
  }, [watch('homeInfo.aboutYourHome')]);

  useEffect(() => {
    setValue('homeInfo.whereIsIt', whereIsIt);
    console.log(watch('homeInfo.whereIsIt'));
  }, [whereIsIt]);

  useEffect(() => {
    if (state.user) {
      setName(state.user.user_metadata.name);
      setUserName(state.user.email);
      setValue('userInfo.name', state.user.user_metadata.name);
      setValue('userInfo.userName', state.user.email);
    }
  }, [state?.user]);

  const uploadImage = async (imageFile: any, bucket: any) => {
    return supabase.storage
      .from(bucket) // Specify the folder name here
      .upload(
        `${state.user.user_metadata.name} - ${state.user.id}/${imageFile.name}`,
        imageFile,
        {
          upsert: true,
        }
      );
  };

  const onSubmit = async (data: any) => {
    if (profileImage && profileImage.length > 0) {
      // Upload profile image
      const profileImageFile = profileImage[0];
      const { data: profileImg, error: profileImageError } = await uploadImage(
        profileImageFile,
        'profileImages'
      );

      if (profileImageError) {
        console.error('Error uploading profile image:', profileImageError);
      } else {
        // Get the image URL from the downloaded Supabase Storage
        const { data: profileImageUrl } = await supabase.storage
          .from('profileImages') // Specify the folder name here
          .getPublicUrl(
            `${state.user.user_metadata.name} - ${state.user.id}/${profileImageFile.name}`
          );

        data.userInfo.profileImage = profileImageUrl;
      }
    }

    if (imageFiles && imageFiles.length > 0) {
      // Upload images to the listingImages bucket
      const uploadPromises = imageFiles.map((imageFile) =>
        uploadImage(imageFile, 'listingImages')
      );
      const results = await Promise.all(uploadPromises);

      if (results.some((result) => result.error)) {
        console.error('Error uploading listing images:', results);
      } else {
        // Get the image URLs from the downloaded Supabase Storage
        const { data: listingImageUrls } = await supabase.storage
          .from('listingImages') // Specify the folder name here
          .list(`${state.user.user_metadata.name} - ${state.user.id}`);

        if (listingImageUrls) {
          const publicUrls = listingImageUrls.map((image) => {
            return supabase.storage
              .from('listingImages')
              .getPublicUrl(
                `${state.user.user_metadata.name} - ${state.user.id}/${image.name}`
              );
          });
          // Set the listing image URLs to data.homeInfo.listingImages
          data.homeInfo.listingImages = publicUrls;
        }
      }
    }

    // if no errors uploading images, then update the user info on the database
    const { data: user, error: userError } = await supabase
      .from('listings')
      .upsert(
        {
          user_id: state.user.id,
          userInfo: data.userInfo,
          homeInfo: data.homeInfo,
          city: data.city,
          amenities: data.amenities,
        },
        {
          ignoreDuplicates: false,
        }
      );

    if (userError) {
      console.error('Error updating user info:', userError);
    } else {
      console.log('User info updated successfully!', user);
    }
  };

  const onError = (errors: any, e: any) => {
    console.log(errors, e);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);

  const handleInputChange = (e: any) => {
    const value = e.target.value;
    setCitySearchOpen(true);
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
    setValue('city', `${city.city}, ${city.country}`);
  };

  const handleSearch = () => {
    const matchedCity = citiesData.find(
      (city) => city.city.toLowerCase() === searchTerm.toLowerCase()
    );
    if (matchedCity) {
      setSelectedCity(matchedCity as any);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="bg-[#F7F1EE] relative">
      <div className="py-8 px-8 md:px-16 flex-col md:flex-row flex justify-center">
        <div className="md:w-1/4 my-4 flex justify-center text-center flex-col">
          {editUserInfo ? (
            <>
              <ProfilePicDropZone setProfileImage={setProfileImage} />
              <div className="px-4 flex gap-2 flex-col">
                <input
                  className="bg-transparent border-b border-[#172544] focus:outline-none"
                  placeholder="Name"
                  {...register('userInfo.name')}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="bg-transparent border-b border-[#172544] focus:outline-none"
                  placeholder="Profession"
                  {...register('userInfo.profession')}
                  onChange={(e) => setProfession(e.target.value)}
                />
                <input
                  className="bg-transparent border-b border-[#172544] focus:outline-none"
                  placeholder="Age"
                  {...register('userInfo.age')}
                  onChange={(e) => setAge(e.target.value)}
                />
                {/* save button */}
                <button
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
                      : '/placeholder.png'
                  }
                  alt="hero"
                  fill
                  objectPosition="center"
                  // objectFit="cover"
                  className="object-cover rounded-full"
                />
                <div className="absolute bg-[#F87C1B] rounded-full w-[30px] -right-2 align-middle my-auto flex h-[30px]">
                  <button
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

              <h2 className="font-serif text-4xl ">{name ? name : 'Name'}</h2>
              <p className="font-sans my-1 font-bold uppercase tracking-[0.1rem]">
                {profession ? profession : 'Profession'}
              </p>
              <p className="font-sans  uppercase">{age ? age : 'Age'}</p>
            </>
          )}
        </div>
        <div className="md:w-3/4">
          <div className="grid py-2 text-center grid-cols-5 border-b border-[#172544]">
            <h3>First Name</h3>
            <h3>Last Name</h3>
            <h3>User Name</h3>
            <h3>Age</h3>
            <h3>Profession</h3>
          </div>
          <div className="grid py-2 text-center grid-cols-5 border-b border-[#172544]">
            <h3>{name ? name.split(' ')[0] : 'First Name'}</h3>
            <h3>{name ? name.split(' ')[1] : 'Last Name'}</h3>
            <h3>{userName ? userName.split('@')[0] : 'User Name'}</h3>
            <h3>
              {age ? age : ''} {age ? 'years' : ''}
            </h3>
            <h3>{profession ? profession : ''}</h3>
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
            <textarea
              {...register('userInfo.aboutYou')}
              onChange={(e) => setAboutYou(e.target.value)}
              placeholder="Tell us more about you."
              className="bg-transparent w-full my-4 p-2 outline-none border-b border-[#c5c5c5]"
            />
          ) : (
            <p className="my-4">
              {aboutYou ? aboutYou : 'Tell us more about you.'}
            </p>
          )}

          <div className="flex flex-col md:flex-row gap-8 py-4 border-y border-[#172544]">
            <h4 className="text-2xl font-serif italic">
              Where would you like to go?
            </h4>

            <select
              {...register('userInfo.whereTo')}
              className="bg-transparent focus:outline-none  rounded-xl border w-1/3 border-[#172544]">
              <option value="bogota">Bogota, Colombia</option>
              <option value="paris">Paris, France</option>
              <option value="london">London, England</option>
              <option value="newYork">New York, USA</option>
              <option value="tokyo">Tokyo, Japan</option>
              <option value="sydney">Sydney, Australia</option>
              <option value="dubai">Dubai, UAE</option>
              <option value="rome">Rome, Italy</option>
              <option value="barcelona">Barcelona, Spain</option>
              <option value="berlin">Berlin, Germany</option>
              <option value="amsterdam">Amsterdam, Netherlands</option>
              <option value="madrid">Madrid, Spain</option>
              <option value="miami">Miami, USA</option>
              <option value="istanbul">Istanbul, Turkey</option>
              <option value="singapore">Singapore, Singapore</option>
            </select>
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
                value="yes"
                {...register('userInfo.otherDestinations')}
              />
              <label htmlFor="yesRadio">Yes</label>

              <input
                className="appearance-none ml-4 h-fit my-auto bg-transparent checked:bg-[#7F8119] rounded-full border border-[#172544] p-2 mx-2"
                type="radio"
                value="no"
                id="noRadio"
                {...register('userInfo.otherDestinations')}
              />
              <label htmlFor="noRadio">No</label>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col px-8 md:px-16 m-auto">
        <div className="flex my-4 flex-col md:flex-row border-y border-[#172544] py-4 justify-between">
          <h2 className="text-xl">{watch('city') ? getValues('city') : ''}</h2>
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

            {state.imgUploadPopUp && (
              <DropZone imageFiles={imageFiles} setImageFiles={setImageFiles} />
            )}
          </div>
        </div>
        <div>
          {imageFiles.length > 0 && (
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
                  picturesPerSlide={3}
                  selectedImage={selectedImage}
                  setSelectedImage={setSelectedImage}
                  overlay={false}
                  contain={true}
                  images={imageFiles.map((file) => ({
                    src: URL.createObjectURL(file),
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
            {...register('city')}
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
          <h2 className="text-xl italic font-serif">Tell us about your home</h2>
        </div>

        <textarea
          {...rest}
          name="aboutYourHome"
          ref={(e) => {
            ref(e);
            aboutYourHomeRef.current = e;
          }}
          onChange={(e) => {
            setValue('homeInfo.aboutYourHome', e.target.value);
          }}
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
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
              <option value="Condo">Condo</option>
              <option value="Townhouse">Townhouse</option>
            </select>
          </div>

          <div className="flex flex-col text-center justify-center h-full py-2 md:py-0 md:w-1/3 border-b md:border-b-0 md:border-r border-[#172544]">
            <label className="font-bold" htmlFor="bedrooms">
              Bedrooms
            </label>
            <select
              className="w-fit m-auto bg-transparent outline-none p-2 my-2 rounded-lg border-[#172544] border"
              {...register('homeInfo.bedrooms')}
              id="bedrooms">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4+">4+</option>
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
              <option value="Condominium">a condiminium</option>
              <option value="Gated Community">a gated community</option>
              <option value="Neighborhood">a neighborhood</option>
              <option value="Rural">a rural area</option>
            </select>
          </div>
        </div>

        <div className="px-8 py-4 flex flex-col md:flex-row border rounded-xl my-8 border-[#172544]">
          <div className="flex flex-col py-2 md:py-0 text-center justify-center h-full md:w-1/3 border-b md:border-b-0 md:border-r border-[#172544]">
            <label className="font-bold" htmlFor="kindOfProperty">
              Kind of property
            </label>
            <select
              className="w-fit m-auto bg-transparent outline-none p-2 my-2 rounded-lg border-[#172544] border"
              {...register('homeInfo.kindOfProperty')}
              id="kindOfProperty">
              <option value="Main">Main property </option>
              <option value="Second">Second property</option>
              <option value="Third">Third property</option>
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
        <div className="flex my-4  border-y border-[#172544] py-4 justify-between">
          <h2 className="text-xl  font-serif">Where is it?</h2>
        </div>

        <div className={`w-full h-[30vh] my-4 rounded-xl`}>
          <GoogleMapComponent setWhereIsIt={setWhereIsIt} />
        </div>

        <div className="flex my-4  border-y border-[#172544] py-4 justify-between">
          <h2 className="text-xl  font-serif">Amenities and advantages</h2>
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
              <label className="" htmlFor="pinpong">
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
  );
};

export default Page;
