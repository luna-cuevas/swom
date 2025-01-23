import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormValues } from "../types";
import { toast } from "react-toastify";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const useBecomeMember = () => {
  const [signUpActive, setSignUpActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const onSubmit = async (formData: FormValues) => {
    if (!formData.privacyPolicy) {
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
      setIsSubmitting(true);
      // Convert image files to base64
      const imageFilesData = await Promise.all(
        imageFiles.map(async (file) => ({
          name: file.name,
          base64: await fileToBase64(file),
        }))
      );

      const response = await fetch('/api/become-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          imageFilesData,
          captchaToken,
          whereIsIt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred while submitting the form');
      }

      setSubmitted(true);
      toast.success("Your listing has been submitted for approval!");
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || "An error occurred while submitting the form");
    } finally {
      setIsSubmitting(false);
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
    isSubmitting,
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