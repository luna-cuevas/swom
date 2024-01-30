'use client';
import ProfilePicDropZone from '@/components/ProfilePicDropZone';
import { useStateContext } from '@/context/StateContext';
import { supabaseClient } from '@/utils/supabaseClient';
import Image from 'next/image';
import React, { ChangeEvent, use, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Props = {};

const Page = (props: Props) => {
  const { state, setState } = useStateContext();
  const [profileImage, setProfileImage] = useState<File[]>([]);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [imageUpload, setImageUpload] = useState(false);
  const supabase = supabaseClient();
  const [isLoading, setIsLoading] = useState(false);

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
      firstName: '',
      lastName: '',
      emailAddress: '',
      // userName: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handlePasswordChange = (password: any) => {
    // i want it to add all the characters to the array to form newPassword
    // then when the user clicks update details it will update the password in the database
    setNewPassword(password);
    setIsPasswordChanged(true);
  };

  const handleConfirmPasswordChange = (password: any) => {
    // i want it to add all the characters to the array to form newPassword
    // then when the user clicks update details it will update the password in the database
    setConfirmPassword(password);
  };

  const comparePasswords = () => {
    if (newPassword === confirmPassword) {
      console.log('passwords match');
      return true;
    } else {
      toast.error('Passwords do not match');
      return false;
    }
  };

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

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    const passwordResults = comparePasswords();
    if (passwordResults && newPassword !== '') {
      setIsPasswordChanged(false);
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        toast.error('Password not updated');
      } else {
        toast.success('Password updated');
      }
    }

    if (profileImage && profileImage.length > 0) {
      // Upload profile image to Cloudinary
      const profileImageFile = profileImage[0];
      const profileImageUrl = await uploadImageToCloudinary(
        profileImageFile,
        `${state.user?.id}/profileImage`
      );
      data.profileImage = profileImageUrl;
    }

    data.name = `${data.firstName} ${data.lastName}`;

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
    const editListingJson = await editListingData?.json();

    if (!editListingJson) {
      toast.error('Details not updated');
      console.log('error', editListingJson);
    } else {
      setIsLoading(false);
      console.log('editListingJson', editListingJson);
      setState({
        ...state,
        loggedInUser: {
          ...state.loggedInUser,
          name: data.name,
          email: data.emailAddress,
          profileImage: data.profileImage && data.profileImage,
        },
      });
      toast.success('Details updated');
    }
  };

  useEffect(() => {
    if (state.loggedInUser) {
      setValue('firstName', state.loggedInUser?.name.split(' ')[0]);
      setValue('lastName', state.loggedInUser?.name.split(' ')[1]);
      setValue('emailAddress', state.loggedInUser?.email);
      // setValue('userName', state.loggedInUser?.email.split('@')[0]);
    }
  }, [state.loggedInUser]);

  return (
    <main className="bg-[#F7F1EE] min-h-[80vh] relative flex flex-col">
      <h1 className="py-4 px-12 bg-[#172544] text-white font-sans tracking-[0.3rem] uppercase">
        My Profile
      </h1>
      <div className="w-full relative max-w-[1000px] my-auto py-12 lg:px-16 px-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex md:flex-row flex-col px-4 relative  z-20 justify-evenly">
          <div className="flex justify-center  flex-col md:w-1/3">
            {imageUpload ? (
              profileImage.length == 0 ? (
                <ProfilePicDropZone setProfileImage={setProfileImage} />
              ) : (
                <div className="relative w-[100px] mx-auto mb-4 h-[100px]">
                  <Image
                    src={
                      profileImage.length > 0
                        ? URL.createObjectURL(profileImage[0])
                        : state?.loggedInUser?.profileImage ||
                          '/placeholder.png'
                    }
                    alt="hero"
                    fill
                    objectPosition="center"
                    // objectFit="cover"
                    className="object-cover rounded-full"
                  />
                </div>
              )
            ) : (
              <div className="relative w-[100px] mx-auto mb-4 h-[100px]">
                <Image
                  src={
                    profileImage.length > 0
                      ? URL.createObjectURL(profileImage[0])
                      : state?.loggedInUser?.profileImage || '/placeholder.png'
                  }
                  alt="hero"
                  fill
                  objectPosition="center"
                  // objectFit="cover"
                  className="object-cover rounded-full"
                />
              </div>
            )}

            <h4 className="font-bold mx-auto my-4 tracking-widest text-center uppercase">
              {state?.loggedInUser?.name}
            </h4>
            <button
              type="button"
              onClick={() => {
                if (imageUpload) {
                  // upload image
                }
                setImageUpload(!imageUpload);
              }}
              className="bg-[#172544] py-2 px-4 mx-auto w-fit text-white rounded-3xl">
              {imageUpload ? 'Close' : 'Update Profile Picture'}
            </button>
          </div>

          <div className="h-auto w-[2px] border-x-[1px] border-[#172544]" />
          <div className="md:w-1/2 flex flex-col  pl-6 gap-12 my-4">
            <h2 className="text-[#D68834] font-sans text-center md:text-left tracking-[0.3rem] uppercase font-bold">
              Profile Settings
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div>
                <label
                  className="tracking-widest font-bold uppercase text-sm"
                  htmlFor="">
                  First Name
                </label>
                <input
                  {...register('firstName')}
                  className="w-full focus-visible:outline-none bg-transparent border-b-[1px] border-[#172544]"
                  type="text"
                />
              </div>
              <div>
                <label
                  className="tracking-widest font-bold uppercase text-sm"
                  htmlFor="">
                  Last Name
                </label>
                <input
                  {...register('lastName')}
                  className="w-full focus-visible:outline-none bg-transparent border-b-[1px] border-[#172544]"
                  type="text"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label
                className="tracking-widest font-bold uppercase text-sm"
                htmlFor="">
                Email
              </label>
              <input
                disabled={true}
                {...register('emailAddress')}
                className=" border-b-[1px] focus-visible:outline-none bg-[#bebebe6e] border-[#172544]"
                type="email"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* <div className="">
                <label
                  className="tracking-widest font-bold uppercase text-sm"
                  htmlFor="">
                  Username
                </label>
                <input
                  {...register('userName')}
                  className="w-full focus-visible:outline-none bg-transparent border-b-[1px] border-[#172544]"
                  type="text"
                />
              </div> */}
              <div className="">
                <label
                  className="tracking-widest font-bold uppercase text-sm"
                  htmlFor="">
                  Reset Password
                </label>
                <input
                  onChange={(e) => {
                    handlePasswordChange(e.target.value);
                  }}
                  value={newPassword}
                  className="w-full focus-visible:outline-none bg-transparent border-b-[1px] border-[#172544]"
                  type="password"
                />
              </div>
            </div>
            {isPasswordChanged && (
              <div className="md:w-1/2 md:ml-auto md:pl-4">
                <label
                  className="tracking-widest font-bold uppercase text-sm"
                  htmlFor="">
                  Confirm Password
                </label>
                <input
                  onChange={(e) => {
                    handleConfirmPasswordChange(e.target.value);
                  }}
                  value={confirmPassword}
                  className="w-full focus-visible:outline-none bg-transparent border-b-[1px] border-[#172544]"
                  type="password"
                />
              </div>
            )}
            {isLoading ? (
              <div
                role="status"
                className="bg-[#D68834] hover:bg-[#e88427ca] h-fit w-fit my-auto px-3 py-2 text-white rounded-xl">
                <svg
                  aria-hidden="true"
                  className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-[#e88427ca]"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="#fff"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              <button
                type="submit"
                className="w-fit mx-auto font-sans md:mx-0 bg-[#D68834] rounded-3xl px-8 py-2 text-white">
                Update Details
              </button>
            )}
          </div>
        </form>
      </div>
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
      <div className="  h-[45vh]  w-1/4 z-10 right-0 bottom-0 absolute">
        <Image
          src="/profile/profile-bg.png"
          alt="hero"
          fill
          objectFit="contain"
        />
      </div>
    </main>
  );
};

export default Page;
