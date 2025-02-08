"use client";
import Image from "next/image";
import React from "react";
import { useDropzone } from "react-dropzone";
import { Camera } from "lucide-react";

type Props = {
  onImageSelected: (file: File) => void;
  currentImage?: string;
};

const ProfilePicDropZone = ({ onImageSelected, currentImage }: Props) => {
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageSelected(acceptedFiles[0]);
    }
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
        transition-all duration-200 ease-in-out
        cursor-pointer group
      `}>
      {/* Profile Image or Placeholder */}
      <div className="w-full  h-full rounded-full overflow-hidden border-4 border-white/20 transition-all duration-200 group-hover:border-[#E88527]/50">
        {currentImage ? (
          <Image
            src={currentImage}
            alt="Profile"
            fill
            className="object-cover rounded-full"
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <Camera className="w-8 h-8 text-white/50" />
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-200">
        <div className="opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-95 transition-all duration-200 text-center">
          <Camera className="w-6 h-6 text-white mx-auto mb-1" />
          <span className="text-xs text-white font-medium">Change Photo</span>
        </div>
      </div>

      <input {...getInputProps()} />
    </div>
  );
};

export default ProfilePicDropZone;
