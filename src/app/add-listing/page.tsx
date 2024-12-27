"use client";
import { supabaseClient } from "@/utils/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import generatePassword from "@/utils/generatePassword";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import ReCAPTCHA from "react-google-recaptcha";
import { sanityClient } from "@/utils/sanityClient";
import dynamic from "next/dynamic";
import GoogleMapComponent from "@/components/GoogleMapComponent";
import { useAtom } from "jotai";
import { globalStateAtom } from "@/context/atoms";

type Props = {};

type FormValues = {
  name: string;
};

const BecomeMemberDropzone = dynamic(
  () => import("@/components/BecomeMemberDropzone"),
  {
    loading: () => <p>Loading...</p>,
  }
);

const Page = (props: Props) => {
  const [state, setState] = useAtom(globalStateAtom);
  const [userData, setUserData] = useState<any>([]);
  const [submitted, setSubmitted] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  //const [captchaToken, setCaptchaToken] = useState(false);
  const [whereIsIt, setWhereIsIt] = useState<{
    lat: number;
    lng: number;
    query: string;
  }>({
    query: "",
    lat: 0,
    lng: 0,
  });
  const [hasMaxListings, setHasMaxListings] = useState(false);


  //get user information
    useEffect(() => {
      const fetchListings = async () => {
        if (state.user && state.user.email) {
          try {
            const loggedInUserEmail = state.user.email;
            const data = await fetch("/api/getListings", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email: loggedInUserEmail }),
            }).then((response) => response.json());
  
            // 
            setUserData(data);

          } catch (error: any) {
            console.error("Error fetching data:", error.message);
          }
        }
      };
      fetchListings();

    }, []);

    useEffect(() => {
        if (userData && userData[0] && userData[0].userInfo) {
            console.log("Updated userData:", userData[0].userInfo.name);
        }
    }, [userData]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userInfo: {
        name: "",
        dob: "",
        email: "",
        phone: "",
        profession: "",
        about_me: "",
        children: "",
        recommended: "",
        openToOtherCities: {
          cityVisit1: "",
          cityVisit2: "",
          cityVisit3: "",
        },
        openToOtherDestinations: "false",
      },
      homeInfo: {
        title: "",
        property: "",
        description: "",
        locatedIn: "",
        bathrooms: "",
        area: "",
        mainOrSecond: "",
        address: "",
        city: "",
        howManySleep: "",
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
      privacyPolicy: false,
    },
  });

  const onSubmit = async (data: any) => {
    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    // Check if we have user data
    if (!userData || !userData[0] || !userData[0].userInfo) {
      toast.error("User information not available");
      return;
    }

    try {
      // Upload Images to Sanity
      const uploadPromises = imageFiles.map((file) => {
        return sanityClient.assets.upload("image", file);
      });
      const imageAssets = await Promise.all(uploadPromises);
      const imageReferences = imageAssets.map((asset) => ({
        _type: "image",
        _key: asset._id,
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
      }));

      // Prepare New Listing Data for Sanity
      const newListingData = {
        _type: "listing",
        ...data,
        privacyPolicy: {
          _type: "privacyPolicy",
        },
        userInfo: {
          ...userData[0].userInfo, // Use the existing user info
          openToOtherDestinations: data.userInfo.openToOtherDestinations === "true",
        },
        homeInfo: {
          ...data.homeInfo,
          address: whereIsIt,
          city: whereIsIt.query,
          howManySleep: parseInt(data.homeInfo.howManySleep),
          bathrooms: parseInt(data.homeInfo.bathrooms),
          listingImages: imageReferences,
        },
      };

      // Create the New Listing Document in Sanity
      const createdListing = await sanityClient.create(newListingData);
      
      /* Comment out Supabase code
      // Prepare data for Supabase
      const supabaseData = {
        user_email: state.user.email,
        sanity_listing_id: createdListing._id,
        title: data.homeInfo.title,
        property_type: data.homeInfo.property,
        city: whereIsIt.query,
        country: whereIsIt.query.split(',').slice(-1)[0].trim(),
        location: {
          lat: whereIsIt.lat,
          lng: whereIsIt.lng
        },
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      // Insert into Supabase
      const { data: supabaseResponse, error: supabaseError } = await supabaseClient
        .from('listings')
        .insert([supabaseData]);

      if (supabaseError) {
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }
      */

      // Handle success
      toast.success("New listing created successfully!");
      setSubmitted(true);

    } catch (error) {
      console.error("Error creating new listing:", error);
      toast.error("Failed to create new listing.");
    }
  };

  const onError = (errors: any, e: any) => {
    const printErrorMessages = (errorObject: any) => {
      Object.entries(errorObject).forEach(([key, value]: [string, any]) => {
        if (typeof value === "object" && value !== null && !value.message) {
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

//   const formatPhoneNumber = (phoneNumber: string) => {
//     const cleaned = phoneNumber.replace(/\D/g, "");
//     let formattedNumber = "";

//     // Determine the length of the country code (1 or 2 digits)
//     const countryCodeLength = cleaned.length === 11 ? 1 : 2;

//     for (let i = 0; i < cleaned.length; i++) {
//       if (i === 0) formattedNumber += "+";
//       // Adjust the positions for " (" and ") " based on country code length
//       if (i === countryCodeLength) formattedNumber += " (";
//       if (i === countryCodeLength + 3) formattedNumber += ") ";

//       if (i === countryCodeLength + 6) formattedNumber += "-";

//       formattedNumber += cleaned[i];
//     }

//     return formattedNumber.substring(0, countryCodeLength === 1 ? 16 : 17);
//   };

//   const handlePhoneInputChange = (e: React.FocusEvent<HTMLInputElement>) => {
//     // const formattedNumber = formatPhoneNumber(e.target.value);
//     setValue("userInfo.phone", e.target.value);
//   };

  useEffect(() => {
    const checkListingsCount = async () => {
      if (state.user && state.user.email) {
        try {
          const loggedInUserEmail = state.user.email;
          const data = await fetch("/api/getListings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: loggedInUserEmail }),
          }).then((response) => response.json());

          if (data.length >= 2) {
            setHasMaxListings(true);
          }
        } catch (error: any) {
          console.error("Error fetching data:", error.message);
        }
      }
    };
    checkListingsCount();
  }, [state.user]);

  return (
    <main className="md:min-h-screen relative flex flex-col">
    <div className="">
          <form
            onSubmit={handleSubmit(onSubmit, onError)}
            className=" max-w-[1000px] gap-4 bg-[#F3EBE7] px-4 py-4 flex flex-col  m-auto">

            <div className="m-auto gap-4 flex-col md:w-2/3 flex ">
            <div>
                <label htmlFor="">Give your property a title.</label>
                <input
                  {...register("homeInfo.title", {
                    required: "Please give your listing a title.",
                  })}
                  placeholder="Name of the house, street, or anything distinctive."
                  className="w-full placeholder:text-gray-500 mb-4 bg-transparent border-b border-[#172544] focus:outline-none"
                  type="text"
                  id="title"
                />
                <label htmlFor="">Write a description of the property.</label>
                <textarea
                  id="description"
                  {...register("homeInfo.description", {
                    required: "Please enter a description of your property",
                  })}
                  className="w-full bg-transparent border-b border-[#172544] focus:outline-none"
                />

              </div>
              <label htmlFor="children">
                What kind of property do you have for exchange?
              </label>

              <div className="flex flex-wrap gap-3">
                <div className="gap-2 flex">
                  <input
                    className="w-fit bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                    type="radio"
                    value="House"
                    {...register("homeInfo.property")}
                    id="house"
                  />
                  <label htmlFor="house">House</label>
                </div>
                <div className="gap-2 flex">
                  <input
                    className="w-fit bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                    type="radio"
                    value="Apartment"
                    {...register("homeInfo.property")}
                    id="apartment"
                  />
                  <label htmlFor="Apartment">Apartment</label>
                </div>
                <div className="gap-2 flex">
                  <input
                    className="w-fit bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                    type="radio"
                    value="Villa"
                    {...register("homeInfo.property")}
                    id="villa"
                  />

                  <label htmlFor="villa">Villa</label>
                </div>
                <div className="gap-2 flex">
                  <input
                    className="w-fit bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                    type="radio"
                    value="Farm"
                    {...register("homeInfo.property")}
                    id="farm"
                  />
                  <label htmlFor="farm">Farm</label>
                </div>
                <div className="gap-2 flex">
                  <input
                    className="w-fit bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                    type="radio"
                    value="Boat"
                    {...register("homeInfo.property")}
                    id="boat"
                  />
                  <label htmlFor="boat">Boat</label>
                </div>
                <div className="gap-2 flex">
                  <input
                    {...register("homeInfo.property")}
                    className="w-fit bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                    type="radio"
                    value="RV"
                    id="rv"
                  />
                  <label htmlFor="rv">RV</label>
                </div>
                <div className="gap-2 flex">
                  <input
                    className="w-fit bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                    type="radio"
                    value="Other"
                    {...register("homeInfo.property")}
                    id="otherProperty"
                  />
                  <label htmlFor="otherProperty">Other</label>
                </div>
              </div>
              <div className="flex md:flex-row flex-col gap-4 md:gap-12 w-full mx-auto">
                <div className="m-auto flex-col w-full flex">
                  <label htmlFor="address">
                    What is the city and country where the property is located?
                  </label>
                  <GoogleMapComponent
                    hideMap={true}
                    setWhereIsIt={setWhereIsIt}
                  />
                  {/* <textarea
                    rows={1}
                    id="address"
                    {...register('homeInfo.address', {
                      required: 'Please enter the address of the property',
                    })}
                    className="w-full bg-transparent border-b border-[#172544] focus:outline-none"
                  /> */}
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
                      value="a condominium"
                      {...register("homeInfo.locatedIn", {})}
                    />
                    <label htmlFor="condominium">a condominium</label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="radio"
                      id="gated"
                      value="a gated community"
                      {...register("homeInfo.locatedIn")}
                    />
                    <label htmlFor="gated">a gated community</label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="radio"
                      id="itRestsFreely"
                      value="it rests freely"
                      {...register("homeInfo.locatedIn")}
                    />
                    <label htmlFor="itRestsFreely">it rests freely</label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                      type="radio"
                      id="other"
                      value="other"
                      {...register("homeInfo.locatedIn")}
                    />
                    <label htmlFor="other">other</label>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 md:flex-row flex-col">
                <label htmlFor="">How many people does it sleep?</label>
                <select
                  className="bg-transparent focus:outline-none  rounded-xl border w-fit px-2 border-[#172544]"
                  {...register("homeInfo.howManySleep", {
                    required: "Please select how many people it sleeps",
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
              <div className="gap-4 flex md:flex-row flex-col">
                <label htmlFor="">How many bathrooms?</label>
                <select
                  className="bg-transparent focus:outline-none  rounded-xl border w-fit px-2 border-[#172544]"
                  {...register("homeInfo.bathrooms", {
                    required: "Please select how many bathrooms",
                  })}
                  id="">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4+">4+</option>
                </select>
              </div>
              <div className="gap-4 flex md:flex-row flex-col">
                <label htmlFor="">
                  Is this your main property or your second home?
                </label>
                <select
                  className="bg-transparent focus:outline-none  rounded-xl border w-fit px-2 border-[#172544]"
                  {...register("homeInfo.mainOrSecond", {
                    required:
                      "Please select if this is your main or second home",
                  })}
                  id="">
                  <option value="main">Main</option>
                  <option value="second">Second</option>
                </select>
              </div>
              <div className="gap-4 flex md:flex-row flex-col">
                <label htmlFor="">Size in square meters.</label>
                <select
                  className="bg-transparent focus:outline-none  rounded-xl border w-fit px-2 border-[#172544]"
                  {...register("homeInfo.area", {
                    required: "Please select the size of your home",
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

            </div>
            <div className="m-auto flex-col md:w-2/3 flex">
              <label htmlFor="">What amenities does your property have?</label>
            </div>
            <div className="flex md:w-2/3 m-auto flex-wrap pb-8">
              <div className="w-1/3 gap-2 flex flex-col">
                <div className="flex gap-2">
                  <input
                    className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                    type="checkbox"
                    {...register("amenities.bike")}
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
                    {...register("amenities.car")}
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
                    {...register("amenities.tv")}
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
                    {...register("amenities.dishwasher")}
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
                    {...register("amenities.pingpong")}
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
                    {...register("amenities.billiards")}
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
                    {...register("amenities.washer")}
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
                    {...register("amenities.dryer")}
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
                    {...register("amenities.wifi")}
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
                    {...register("amenities.elevator")}
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
                    {...register("amenities.terrace")}
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
                    {...register("amenities.scooter")}
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
                    {...register("amenities.bbq")}
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
                    {...register("amenities.computer")}
                    id="computer"
                  />
                  <label className="" htmlFor="computer">
                    Home Computer
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    className="bg-transparent checked:bg-[#7F8119] appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                    {...register("amenities.wcAccess")}
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
                    {...register("amenities.pool")}
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
                    {...register("amenities.playground")}
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
                    {...register("amenities.babyGear")}
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
                    {...register("amenities.ac")}
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
                    {...register("amenities.fireplace")}
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
                    {...register("amenities.parking")}
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
                    {...register("amenities.hotTub")}
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
                    {...register("amenities.sauna")}
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
                    {...register("amenities.other")}
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
                    {...register("amenities.doorman")}
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
                    {...register("amenities.cleaningService")}
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
                    {...register("amenities.videoGames")}
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
                    {...register("amenities.tennisCourt")}
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
                    {...register("amenities.gym")}
                    id="gym"
                  />
                  <label className="" htmlFor="gym">
                    Gym
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative group">
                <button
                  type="submit"
                  disabled={hasMaxListings}
                  className={`${
                    hasMaxListings 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-[#E78426] hover:bg-[#e78326d8]"
                  } text-[#fff] font-bold px-4 py-2 rounded-3xl`}>
                  Submit
                </button>
                {hasMaxListings && (
                  <div className="absolute hidden group-hover:block bg-black text-white text-sm rounded-md p-2 top-full mt-2 left-1/2 transform -translate-x-1/2 w-48 text-center z-[100000]">
                    Maximum of 2 listings allowed
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      {" "}
      {submitted && (
        // thank you for your submission, someone will be in touch with you shortly
        <div className="flex flex-col my-8 justify-center items-center">
          <h1 className="text-4xl">Thank you for your submission!</h1>
          {/* <p className="text-lg">Someone will be in touch with you shortly.</p> */}
        </div>
      )}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </main>
  );
};

export default Page;
