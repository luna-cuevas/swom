import { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const BecomeMemberDropzone = dynamic(
  () => import("@/app/(pages)/become-member/components/BecomeMemberDropzone"),
  {
    loading: () => <p>Loading...</p>,
  }
);

interface ImageUploadSectionProps {
  imageFiles: File[];
  setImageFiles: Dispatch<SetStateAction<File[]>>;
}

export const ImageUploadSection = ({
  imageFiles,
  setImageFiles,
}: ImageUploadSectionProps) => {
  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold text-[#172544] mb-6">
        Upload Photos of Your Home
      </motion.h2>

      <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
        <BecomeMemberDropzone
          imageFiles={imageFiles}
          setImageFiles={setImageFiles}
        />
      </div>

      {imageFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {imageFiles.map((file, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => {
                  const newFiles = [...imageFiles];
                  newFiles.splice(index, 1);
                  setImageFiles(newFiles);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
