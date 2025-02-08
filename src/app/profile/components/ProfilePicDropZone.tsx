"use client";
import Image from "next/image";
import React from "react";
import { useDropzone } from "react-dropzone";
import { Camera, Upload } from "lucide-react";

type Props = {
  setProfileImage: React.Dispatch<React.SetStateAction<File[]>>;
  setImageUpload?: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProfilePicDropZone = (props: Props) => {
  const onDrop = (acceptedFiles: any) => {
    props.setProfileImage(acceptedFiles);
    props.setImageUpload && props.setImageUpload(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative w-32 h-32 mx-auto rounded-full 
        border-4 border-dashed transition-all duration-200 ease-in-out
        flex flex-col items-center justify-center
        cursor-pointer
        ${
          isDragActive
            ? "border-[#172544] bg-[#172544]/10"
            : "border-gray-300 hover:border-[#172544] hover:bg-gray-50"
        }
      `}>
      <input {...getInputProps()} />
      <Camera
        className={`w-8 h-8 mb-2 ${isDragActive ? "text-[#172544]" : "text-gray-400"}`}
      />
      <p className="text-xs text-center text-gray-500 px-2">
        {isDragActive
          ? "Drop image here"
          : "Drop image here or click to upload"}
      </p>
    </div>
  );
};

export default ProfilePicDropZone;
