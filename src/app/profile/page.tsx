"use client";

import { globalStateAtom } from "@/context/atoms";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileForm } from "./components/ProfileForm";
import { PasswordSection } from "./components/PasswordSection";
import { getSupabaseClient } from "@/utils/supabaseClient";
import { ToastContainer } from "react-toastify";

const STORAGE_BUCKET = "profileImages";

export default function ProfilePage() {
  const [state] = useAtom(globalStateAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>();
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const supabase = getSupabaseClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      emailAddress: "",
      profession: "",
      age: "",
      phone: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Handle password update if changed
      if (data.newPassword) {
        if (data.newPassword !== data.confirmPassword) {
          toast.error("Passwords do not match");
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/members/updatePassword", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newPassword: data.newPassword,
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

        // Clear password fields after successful update
        setValue("newPassword", "");
        setValue("confirmPassword", "");
      }

      // Create FormData for profile update
      const formData = new FormData();
      const profileData = {
        email: state.loggedInUser.email,
        userId: state.loggedInUser.id,
        name: `${data.firstName} ${data.lastName}`,
        profession: data.profession,
        age: data.age,
        phone: data.phone,
        profileImage: userData?.profileImage, // Keep existing image if no new one
      };

      formData.append("data", JSON.stringify(profileData));

      // Add profile image if one was selected
      if (profileImage) {
        formData.append("image", profileImage);
      }

      // Update profile
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
      await fetchUserData();

      // Clear the profile image state after successful update
      setProfileImage(null);
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
        toast.error("User information not available");
        return;
      }

      const response = await fetch(
        `/api/members/getUserData?email=${encodeURIComponent(
          state.loggedInUser.email
        )}&userId=${encodeURIComponent(state.loggedInUser.id)}`,
        {
          method: "GET",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to fetch user data: ${response.status}`
        );
      }

      const result = await response.json();
      setUserData(result.user);

      // Set form values
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
      console.error("Error fetching user data:", error);
      toast.error(error.message || "Failed to fetch user data");
    }
  };

  useEffect(() => {
    if (state.loggedInUser) {
      fetchUserData();
    }
  }, [state.loggedInUser]);

  return (
    <>
      <ToastContainer position="bottom-right" />
      <main className="min-h-screen bg-[#17212D]">
        {/* Profile Header */}
        <ProfileHeader
          profileImage={userData?.profileImage}
          name={userData?.name}
          email={userData?.email}
          onImageSelected={setProfileImage}
        />

        {/* Main Content */}
        <div className="relative container mx-auto px-4 -mt-20 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 sm:p-8 shadow-xl space-y-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <ProfileForm
                  register={register}
                  errors={errors}
                  isLoading={isLoading}
                />

                <PasswordSection
                  isOpen={isPasswordSectionOpen}
                  onToggle={() =>
                    setIsPasswordSectionOpen(!isPasswordSectionOpen)
                  }
                  isLoading={isLoading}
                  register={register}
                />
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
