import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormValues } from "../types";
import { supabaseClient } from "@/utils/supabaseClient";
import { toast } from "react-toastify";
import { SupabaseClient } from "@supabase/supabase-js";

export const useBecomeMember = () => {
  const [signUpActive, setSignUpActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [whereIsIt, setWhereIsIt] = useState<{
    lat: number;
    lng: number;
    query: string;
  }>({
    query: "",
    lat: 0,
    lng: 0,
  });

  const supabase = supabaseClient() as SupabaseClient;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
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
        openToOtherDestinations: false,
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
        bike: false,
        car: false,
        tv: false,
        dishwasher: false,
        pingpong: false,
        billiards: false,
        washer: false,
        dryer: false,
        wifi: false,
        elevator: false,
        terrace: false,
        scooter: false,
        bbq: false,
        computer: false,
        wcAccess: false,
        pool: false,
        playground: false,
        babyGear: false,
        ac: false,
        fireplace: false,
        parking: false,
        hotTub: false,
        sauna: false,
        other: false,
        doorman: false,
        cleaningService: false,
        videoGames: false,
        tennisCourt: false,
        gym: false,
      },
      privacyPolicy: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!data.privacyPolicy) {
      toast.error("You must agree to the privacy policy.");
      return;
    }

    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    if (!captchaToken) {
      toast.error("Please complete the captcha");
      return;
    }

    try {
      // Generate a unique ID for this submission
      const submissionId = crypto.randomUUID();

      // Upload Images to Supabase Storage
      const imageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `public/${submissionId}/${fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('listing-images')
            .upload(filePath, file);

          if (uploadError) {
            throw uploadError;
          }

          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('listing-images')
            .getPublicUrl(filePath);

          return publicUrl;
        })
      );

      // Create user_info record
      const { data: userInfoData, error: userInfoError } = await supabase
        .from('user_info')
        .insert({
          submission_id: submissionId,
          email: data.userInfo.email,
          name: data.userInfo.name,
          dob: data.userInfo.dob,
          phone: data.userInfo.phone,
          profession: data.userInfo.profession,
          about_me: data.userInfo.about_me,
          children: data.userInfo.children,
          recommended: data.userInfo.recommended,
          open_to_other_cities: data.userInfo.openToOtherCities,
          open_to_other_destinations: data.userInfo.openToOtherDestinations
        })
        .select()
        .single();

      if (userInfoError) throw userInfoError;

      // Create home_info record
      const { data: homeInfoData, error: homeInfoError } = await supabase
        .from('home_info')
        .insert({
          submission_id: submissionId,
          title: data.homeInfo.title,
          property_type: data.homeInfo.property,
          description: data.homeInfo.description,
          located_in: data.homeInfo.locatedIn,
          bathrooms: parseInt(data.homeInfo.bathrooms),
          area: data.homeInfo.area,
          main_or_second: data.homeInfo.mainOrSecond,
          address: { lat: whereIsIt.lat, lng: whereIsIt.lng, query: whereIsIt.query },
          city: whereIsIt.query,
          how_many_sleep: parseInt(data.homeInfo.howManySleep),
          listing_images: imageUrls
        })
        .select()
        .single();

      if (homeInfoError) throw homeInfoError;

      // Create amenities record
      const { data: amenitiesData, error: amenitiesError } = await supabase
        .from('amenities')
        .insert({
          submission_id: submissionId,
          bike: data.amenities.bike,
          car: data.amenities.car,
          tv: data.amenities.tv,
          dishwasher: data.amenities.dishwasher,
          pingpong: data.amenities.pingpong,
          billiards: data.amenities.billiards,
          washer: data.amenities.washer,
          dryer: data.amenities.dryer,
          wifi: data.amenities.wifi,
          elevator: data.amenities.elevator,
          terrace: data.amenities.terrace,
          scooter: data.amenities.scooter,
          bbq: data.amenities.bbq,
          computer: data.amenities.computer,
          wc_access: data.amenities.wcAccess,
          pool: data.amenities.pool,
          playground: data.amenities.playground,
          baby_gear: data.amenities.babyGear,
          ac: data.amenities.ac,
          fireplace: data.amenities.fireplace,
          parking: data.amenities.parking,
          hot_tub: data.amenities.hotTub,
          sauna: data.amenities.sauna,
          other: data.amenities.other,
          doorman: data.amenities.doorman,
          cleaning_service: data.amenities.cleaningService,
          video_games: data.amenities.videoGames,
          tennis_court: data.amenities.tennisCourt,
          gym: data.amenities.gym
        })
        .select()
        .single();

      if (amenitiesError) throw amenitiesError;

      // Create needs_approval record
      const { error: approvalError } = await supabase
        .from('needs_approval')
        .insert({
          submission_id: submissionId,
          user_info_id: userInfoData.id,
          home_info_id: homeInfoData.id,
          amenities_id: amenitiesData.id,
          privacy_policy_accepted: true,
          privacy_policy_date: new Date().toISOString(),
          status: 'pending'
        });

      if (approvalError) throw approvalError;

      setSubmitted(true);
      toast.success("Your listing has been submitted for approval!");
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || "An error occurred while submitting the form");
    }
  };

  const onError = (errors: any) => {
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

  return {
    signUpActive,
    setSignUpActive,
    submitted,
    imageFiles,
    setImageFiles,
    captchaToken,
    setCaptchaToken,
    whereIsIt,
    setWhereIsIt,
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    onSubmit,
    onError,
  };
}; 