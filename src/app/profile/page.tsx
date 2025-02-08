"use client";

import ProfilePicDropZone from "@/app/profile/components/ProfilePicDropZone";
import { getSupabaseClient } from "@/utils/supabaseClient";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAtom } from "jotai";
import { globalStateAtom } from "@/context/atoms";
import {
  ChevronDown,
  ChevronUp,
  Settings,
  Key,
  User,
  Phone,
  Briefcase,
  Calendar,
} from "lucide-react";

type Props = {};

const STORAGE_BUCKET = "profileImages";

const Page = (props: Props) => {
  const [state, setState] = useAtom(globalStateAtom);
  const [profileImage, setProfileImage] = useState<File[]>([]);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imageUpload, setImageUpload] = useState(false);
  const supabase = getSupabaseClient();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>();
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      emailAddress: "",
      profession: "",
      age: "",
      phone: "",
    },
  });

  const handlePasswordChange = (password: string) => {
    setNewPassword(password);
    setIsPasswordChanged(true);
  };

  const handleConfirmPasswordChange = (password: string) => {
    setConfirmPassword(password);
  };

  const comparePasswords = () => {
    if (newPassword === confirmPassword) {
      return true;
    } else {
      toast.error("Passwords do not match");
      return false;
    }
  };

  const uploadProfileImage = async (
    file: File,
    userId: string
  ): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const timestamp = Date.now();
    const filePath = `${userId}/${timestamp}_profile.${fileExt}`;

    try {
      // Simple direct upload
      const { data, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false, // Changed to false to avoid update operations
        });

      if (uploadError) {
        console.error("Upload error details:", {
          message: uploadError.message,
          name: uploadError.name,
        });
        throw uploadError;
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading image:", {
        message: error.message,
        name: error.name,
      });
      throw new Error(
        "Failed to upload image: " + (error.message || "Unknown error")
      );
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Handle password update if changed
      if (isPasswordChanged && newPassword) {
        const passwordResults = comparePasswords();
        if (passwordResults) {
          const response = await fetch("/api/members/updatePassword", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              newPassword,
              userId: state.loggedInUser.id,
              email: state.loggedInUser.email,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update password");
          }

          const result = await response.json();
          toast.success(result.message);
          setIsPasswordChanged(false);
          setNewPassword("");
          setConfirmPassword("");
        }
      }

      // Create FormData for profile update
      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          email: state.loggedInUser.email,
          userId: state.loggedInUser.id,
          name: `${data.firstName} ${data.lastName}`,
          profileImage: userData?.profileImage,
          profession: data.profession,
          age: data.age,
          phone: data.phone,
        })
      );

      // Add image if one was selected
      if (profileImage.length > 0) {
        formData.append("image", profileImage[0]);
      }

      // Update profile via API route
      const response = await fetch("/api/members/updateProfile", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const result = await response.json();
      toast.success(result.message || "Profile updated successfully!");
      await fetchUserData(); // Refresh user data
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      if (!state.loggedInUser?.email || !state.loggedInUser?.id) {
        console.error("Missing user data:", { state: state.loggedInUser });
        toast.error("User information not available");
        return;
      }

      console.log("Fetching user data for:", {
        email: state.loggedInUser.email,
        userId: state.loggedInUser.id,
      });

      const response = await fetch(
        `/api/members/getUserData?email=${encodeURIComponent(state.loggedInUser.email)}&userId=${encodeURIComponent(state.loggedInUser.id)}`,
        {
          method: "GET",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(
          errorData.error || `Failed to fetch user data: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("User data received:", result);

      if (!result.user) {
        console.error("No user data in response:", result);
        throw new Error("No user data received");
      }

      setUserData(result.user);

      // Set form values with null checks
      const [firstName = "", ...lastNameParts] = (result.user.name || "").split(
        " "
      );
      setValue("firstName", firstName);
      setValue("lastName", lastNameParts.join(" "));
      setValue("emailAddress", result.user.email || "");
      setValue("profession", result.user.profession || "");
      setValue("age", result.user.age || "");
      setValue("phone", result.user.phone || "");
    } catch (error: any) {
      console.error("Error in fetchUserData:", {
        message: error.message,
        stack: error.stack,
      });
      toast.error(error.message || "Failed to load user data");
    }
  };

  useEffect(() => {
    if (state.loggedInUser) {
      fetchUserData();
    }
  }, [state.loggedInUser]);

  useEffect(() => {
    if (profileImage.length > 0) {
      setImageUpload(false);
    }
  }, [profileImage]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Account Settings
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your profile and account preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile Picture Column */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative w-40 h-40">
                  {imageUpload ? (
                    <ProfilePicDropZone
                      setProfileImage={setProfileImage}
                      setImageUpload={setImageUpload}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-100 shadow-md">
                      <Image
                        src={
                          profileImage.length > 0
                            ? URL.createObjectURL(profileImage[0])
                            : userData?.profileImage || "/placeholder.png"
                        }
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
                <h2 className="mt-4 text-xl font-medium text-gray-900">
                  {state?.loggedInUser?.name}
                </h2>
                <p className="text-gray-500 text-sm">
                  {userData?.profession || "Member"}
                </p>
                <button
                  type="button"
                  onClick={() => setImageUpload(!imageUpload)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  {imageUpload ? "Cancel" : "Change Photo"}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details Column */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Personal Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        {...register("firstName")}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        {...register("lastName")}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        {...register("emailAddress")}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-1" />
                          Phone
                        </div>
                      </label>
                      <input
                        {...register("phone")}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 text-gray-400 mr-1" />
                          Profession
                        </div>
                      </label>
                      <input
                        {...register("profession")}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          Age
                        </div>
                      </label>
                      <input
                        {...register("age")}
                        type="number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setIsPasswordSectionOpen(!isPasswordSectionOpen)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between text-left border-b border-gray-200 hover:bg-gray-50">
                  <div className="flex items-center">
                    <Key className="h-5 w-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Password
                    </h3>
                  </div>
                  {isPasswordSectionOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {isPasswordSectionOpen && (
                  <div className="p-6 bg-gray-50 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          autoComplete="new-password"
                        />
                      </div>
                      {isPasswordChanged && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                              handleConfirmPasswordChange(e.target.value)
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            autoComplete="new-password"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
