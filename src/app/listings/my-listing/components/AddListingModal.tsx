"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { Upload, X } from "lucide-react";
import dynamic from "next/dynamic";
import { Checkbox } from "@/components/ui/checkbox";
import { getSupabaseClient } from "@/utils/supabaseClient";
import { useAtom } from "jotai";
import { globalStateAtom } from "@/context/atoms";
import Link from "next/link";
const propertyTypes = [
  "House",
  "Apartment",
  "Villa",
  "Farm",
  "Boat",
  "RV",
  "Other",
];

const locationTypes = [
  "a condominium",
  "a gated community",
  "it rests freely",
  "other",
];

const sleepCapacity = ["1", "2", "3", "4", "5", "6", "7+"];
const bathroomOptions = ["1", "2", "3", "4+"];
const areaRanges = [
  "60-100",
  "100-150",
  "150-200",
  "200-250",
  "250-300",
  "300-350",
  "350-400",
  "400-450",
  "450-500",
  "500-550",
  "550-600",
];

const amenityGroups = [
  {
    title: "Comfort & Entertainment",
    items: [
      { id: "tv", label: "TV" },
      { id: "wifi", label: "WiFi" },
      { id: "ac", label: "Air Conditioning" },
      { id: "fireplace", label: "Fireplace" },
      { id: "computer", label: "Computer" },
      { id: "video_games", label: "Video Games" },
    ],
  },
  {
    title: "Appliances",
    items: [
      { id: "dishwasher", label: "Dishwasher" },
      { id: "washer", label: "Washer" },
      { id: "dryer", label: "Dryer" },
    ],
  },
  {
    title: "Outdoor & Recreation",
    items: [
      { id: "pool", label: "Pool" },
      { id: "hot_tub", label: "Hot Tub" },
      { id: "sauna", label: "Sauna" },
      { id: "terrace", label: "Terrace" },
      { id: "bbq", label: "BBQ" },
      { id: "playground", label: "Playground" },
      { id: "tennis_court", label: "Tennis Court" },
      { id: "gym", label: "Gym" },
    ],
  },
  {
    title: "Transportation",
    items: [
      { id: "car", label: "Car" },
      { id: "bike", label: "Bike" },
      { id: "scooter", label: "Scooter" },
      { id: "parking", label: "Parking" },
    ],
  },
  {
    title: "Services & Accessibility",
    items: [
      { id: "elevator", label: "Elevator" },
      { id: "doorman", label: "Doorman" },
      { id: "cleaning_service", label: "Cleaning Service" },
      { id: "wc_access", label: "Wheelchair Access" },
      { id: "baby_gear", label: "Baby Equipment" },
    ],
  },
  {
    title: "Recreation",
    items: [
      { id: "pingpong", label: "Ping Pong" },
      { id: "billiards", label: "Billiards" },
    ],
  },
];

type AddListingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type FormData = {
  // User Info
  name: string;
  email: string;
  phone: string;
  profession: string;
  age: string;
  dob: string;
  about_me: string;
  children: "always" | "sometimes" | "never";
  open_to_other_cities: {
    cityVisit1?: string;
    cityVisit2?: string;
    cityVisit3?: string;
  };
  open_to_other_destinations: boolean;
  recommended: string;

  // Home Info
  title: string;
  city: string;
  description: string;
  property_type: string;
  how_many_sleep: string;
  bathrooms: string;
  area: string;
  located_in: string;
  main_or_second: string;
  address: {
    lat: number;
    lng: number;
    query: string;
  };

  // Amenities
  amenities: {
    [key: string]: boolean;
  };
  other: string;
};

export function AddListingModal({
  isOpen,
  onClose,
  onSuccess,
}: AddListingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [state, setState] = useAtom(globalStateAtom);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>();

  // Fetch user data when modal opens
  useEffect(() => {
    if (!state.user) return;

    const fetchUserData = async () => {
      const user = state.user;

      if (!isOpen) return;

      setIsLoadingUser(true);
      try {
        const response = await fetch("/api/members/my-listing/getUserInfo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user.email }),
        });
        const data = await response.json();
        console.log("data", data);

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch user info");
        }

        if (data) {
          // Prefill all user information
          setValue("name", data.name);
          setValue("email", data.email);
          setValue("phone", data.phone);
          setValue("profession", data.profession);
          setValue("age", data.age);
          setValue("dob", data.dob);
          setValue("about_me", data.about_me);
          setValue("children", data.children);
          setValue(
            "open_to_other_destinations",
            data.open_to_other_destinations
          );
          setValue("recommended", data.recommended);

          // Handle cities array to object conversion
          if (Array.isArray(data.open_to_other_cities)) {
            data.open_to_other_cities.forEach((city: string, index: number) => {
              setValue(
                `open_to_other_cities.cityVisit${index + 1}` as keyof FormData,
                city
              );
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, [isOpen, setValue, state.user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setIsUploading(true);
    const formData = new FormData();
    Array.from(e.target.files).forEach((file) => {
      formData.append("files", file);
    });
    formData.append("user_id", state.user.id);

    try {
      const response = await fetch("/api/members/uploadImages", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload images");
      }

      const { urls } = await response.json();
      setUploadedImages((prev) => [...prev, ...urls]);
      toast.success("Images uploaded successfully");
    } catch (error: any) {
      console.error("Error uploading images:", error);
      toast.error(error.message || "Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const searchAddress = async (query: string) => {
    if (!query) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/shared/geocode?address=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Failed to geocode address");

      const data = await response.json();
      if (data.results && data.results[0]) {
        const result = data.results[0];
        const cityComponent = result.address_components?.find(
          (component: any) => component.types.includes("locality")
        );

        setValue("city", cityComponent?.long_name || "");
        setValue("address", {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          query: result.formatted_address,
        });
        setAddressInput(result.formatted_address);
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      toast.error("Failed to find address");
    } finally {
      setIsSearching(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting form data:", data);
      console.log("Uploaded images:", uploadedImages);

      const response = await fetch("/api/members/my-listing/createListing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email: state.user.email,
          user_id: state.user.id,
          user_info: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            profession: data.profession,
            age: data.age,
            dob: data.dob,
            about_me: data.about_me,
            children: data.children,
            open_to_other_cities: Object.values(
              data.open_to_other_cities
            ).filter(Boolean),
            open_to_other_destinations: data.open_to_other_destinations,
            recommended: data.recommended,
          },
          home_info: {
            title: data.title,
            city: data.city,
            description: data.description,
            property_type: data.property_type,
            how_many_sleep: parseInt(data.how_many_sleep),
            bathrooms: parseInt(data.bathrooms),
            area: data.area,
            located_in: data.located_in,
            main_or_second: data.main_or_second,
            address: data.address,
            listing_images: uploadedImages,
          },
          amenities: {
            ...data.amenities,
            other: data.other || "",
          },
        }),
      });

      const responseData = await response.json();
      console.log("Response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create listing");
      }

      toast.success("Listing created successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating listing:", error);
      toast.error(error.message || "Failed to create listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add New Listing</DialogTitle>
        </DialogHeader>

        {isLoadingUser ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F8119]"></div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8 max-h-[60vh] overflow-y-auto">
            {/* User Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">User Information</h3>
                <Link
                  href="/profile"
                  className="text-sm text-primary hover:text-primary/80 underline">
                  Edit Profile
                </Link>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Name:</span>
                    <p className="font-medium">{watch("name")}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="font-medium">{watch("email")}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Phone:</span>
                    <p className="font-medium">{watch("phone")}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Profession:</span>
                    <p className="font-medium">{watch("profession")}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Children:</span>
                    <p className="font-medium">
                      {watch("children") || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Preferred Cities:
                    </span>
                    <p className="font-medium">
                      {Object.values(watch("open_to_other_cities") || {})
                        .filter(Boolean)
                        .join(", ") || "None specified"}
                    </p>
                  </div>
                </div>
                <input type="hidden" {...register("name")} />
                <input type="hidden" {...register("email")} />
                <input type="hidden" {...register("phone")} />
                <input type="hidden" {...register("profession")} />
                <input type="hidden" {...register("age")} />
                <input type="hidden" {...register("dob")} />
                <input type="hidden" {...register("about_me")} />
                <input type="hidden" {...register("children")} />
                <input
                  type="hidden"
                  {...register("open_to_other_destinations")}
                />
                <input type="hidden" {...register("recommended")} />
                <input
                  type="hidden"
                  {...register("open_to_other_cities.cityVisit1")}
                />
                <input
                  type="hidden"
                  {...register("open_to_other_cities.cityVisit2")}
                />
                <input
                  type="hidden"
                  {...register("open_to_other_cities.cityVisit3")}
                />
              </div>
            </div>

            {/* Home Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Home Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...register("title", { required: "Title is required" })}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register("city", { required: "City is required" })}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">
                      {errors.city.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="located_in">Located In</Label>
                  <select
                    {...register("located_in", { required: true })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                    <option value="">Select location type</option>
                    {locationTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <div className="relative">
                    <Input
                      id="address-search"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      onBlur={() => {
                        if (addressInput) {
                          searchAddress(addressInput);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          searchAddress(addressInput);
                        }
                      }}
                      placeholder="Enter address"
                      className="w-full"
                    />
                    {isSearching && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property_type">Property Type</Label>
                  <select
                    {...register("property_type", { required: true })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                    <option value="">Select property type</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="main_or_second">
                    Is this your main property or second home? *
                  </Label>
                  <select
                    {...register("main_or_second", {
                      required: "Please select an option",
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                    <option value="">Select option</option>
                    <option value="main">Main Home</option>
                    <option value="second">Second Home</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="how_many_sleep">Sleeps</Label>
                  <select
                    {...register("how_many_sleep", { required: true })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                    <option value="">Select sleep capacity</option>
                    {sleepCapacity.map((capacity) => (
                      <option key={capacity} value={capacity}>
                        {capacity}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <select
                    {...register("bathrooms", { required: true })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                    <option value="">Select number of bathrooms</option>
                    {bathroomOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Area (m²)</Label>
                  <select
                    {...register("area", { required: true })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                    <option value="">Select area range</option>
                    {areaRanges.map((range) => (
                      <option key={range} value={range}>
                        {range} m²
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description", {
                      required: "Description is required",
                    })}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Amenities</h3>
              {amenityGroups.map((group) => (
                <div key={group.title} className="space-y-2">
                  <h4 className="text-sm font-medium">{group.title}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-2">
                        <Checkbox
                          id={item.id}
                          {...register(`amenities.${item.id}`)}
                        />
                        <label
                          htmlFor={item.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="col-span-3 space-y-2">
                <Label htmlFor="other">Other Amenities</Label>
                <Input id="other" {...register("other")} />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Upload Photos of Your Home
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                <div className="flex flex-col items-center justify-center w-full">
                  <label
                    htmlFor="images"
                    className="flex flex-col items-center justify-center w-full cursor-pointer">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <input
                      id="images"
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            </div>

            {isUploading && (
              <div className="text-center text-sm text-gray-500">
                Uploading images...
              </div>
            )}

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedImages.map((url, index) => (
                  <div
                    key={url}
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Listing"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
