"use client";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import SortableList, { SortableItem } from "react-easy-sort";
import { arrayMoveImmutable } from "array-move";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { useAtom } from "jotai";
import { globalStateAtom } from "@/context/atoms";
import heic2any from "heic2any";

type Props = {
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
  imageFiles: File[];
  downloadURLs?: string[];
};

const BecomeMemberDropzone: React.FC<Props> = (props) => {
  const [state, setState] = useAtom(globalStateAtom);
  const [orderedImageFiles, setOrderedImageFiles] = useState<File[]>(
    props.imageFiles
  );

  const handleClose = () => {
    setState({
      ...state,
      imgUploadPopUp: false,
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDropRejected: (fileRejections) => {
      const fileRejectionErrors = fileRejections.map((fileRejection) => {
        return fileRejection.errors.map((error) => error.message);
      });
      fileRejectionErrors.forEach((error) => toast.error(error));
      toast.error("File rejected. Please check the file's size and type.");
    },
    onDrop: async (acceptedFiles) => {
      const totalFilesAfterAdding =
        orderedImageFiles.length + acceptedFiles.length;
      if (totalFilesAfterAdding > 15) {
        toast.error("You can only upload up to 15 images.");
        return;
      }
      const existingFileNames = orderedImageFiles.map((file) => file.name);
      const newImageFiles = acceptedFiles.filter(
        (file) => !existingFileNames.includes(file.name)
      );

      if (newImageFiles.length < acceptedFiles.length) {
        // Display a toast alert for duplicates
        toast.warn("Some images were not added as they are duplicates.");
      }

      // Convert HEIC files to JPG
      const convertedFiles = await Promise.all(
        newImageFiles.map(async (file) => {
          if (file.type === "image/heic") {
            const arrayBuffer = await file.arrayBuffer();
            const jpegBlob = await heic2any({
              blob: new Blob([arrayBuffer]),
              toType: "image/jpeg",
            });
            return new File(
              [jpegBlob as Blob],
              `${file.name.replace(/\.heic$/, ".jpg")}`,
              { type: "image/jpeg" }
            );
          }
          return file;
        })
      );

      // Combine the new files with the existing files
      const updatedImageFiles = [...orderedImageFiles, ...convertedFiles];

      props.setImageFiles(updatedImageFiles);
      setOrderedImageFiles(updatedImageFiles);
      setItems(
        updatedImageFiles.map((file, index) => ({
          index,
          name: `Image ${index + 1}`,
          image: URL.createObjectURL(file),
        }))
      );
    },
  });

  const handleRemoveImage = (index: number) => {
    console.log("index", index);
    const updatedImageFiles = [...orderedImageFiles];
    updatedImageFiles.splice(index, 1);
    props.setImageFiles(updatedImageFiles);
    setOrderedImageFiles(updatedImageFiles);
    setItems(
      updatedImageFiles.map((file, index) => ({
        index,
        name: `Image ${index + 1}`,
        image: URL.createObjectURL(file),
      }))
    );
  };

  const [items, setItems] = useState(
    props.imageFiles.map((file, index) => ({
      index,
      name: `Image ${index + 1}`,
      image: URL.createObjectURL(file),
    }))
  );

  useEffect(() => {
    const convertURLsToFileObjects = async () => {
      if (props.downloadURLs) {
        const files = await Promise.all(
          props.downloadURLs.map(async (url) => {
            const response = await fetch(url);
            const blob = await response.blob();
            return new File([blob], url.split("/").pop() || "downloaded", {
              type: blob.type,
            });
          })
        );
        props.setImageFiles(files);
        setOrderedImageFiles(files);
        setItems(
          files.map((file, index) => ({
            index,
            name: `Image ${index + 1}`,
            image: URL.createObjectURL(file),
          }))
        );
      }
    };
    convertURLsToFileObjects();
  }, [props.downloadURLs, props.setImageFiles]);

  const onSortEnd = (oldIndex: number, newIndex: number) => {
    setItems((array) => arrayMoveImmutable(array, oldIndex, newIndex));
    setOrderedImageFiles((array) =>
      arrayMoveImmutable(array, oldIndex, newIndex)
    );
    props.setImageFiles((array) =>
      arrayMoveImmutable(array, oldIndex, newIndex)
    );
  };

  return (
    <div className="flex relative bg-white shadow-xl rounded-xl flex-col h-fit w-full top-0 bottom-0 left-0 right-0 m-auto p-4">
      <button
        type="button"
        className="ml-auto text-gray-500 hover:text-gray-700 transition-colors"
        onClick={handleClose}>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div
        {...getRootProps({
          className:
            "w-full relative flex h-full m-auto cursor-pointer p-8 text-center border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg my-4",
        })}>
        <input {...getInputProps()} />
        <div className="m-auto space-y-4">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-600">
            Drag and drop image(s) here, or click to select files
          </p>
        </div>
      </div>

      <div className="bg-gray-50 px-4 py-3 border-t border-b">
        <p className="text-center text-sm text-gray-600">
          You can upload up to 15 images. Drag to rearrange the order. The first
          image will be the cover image.
        </p>
      </div>

      <div className="max-h-[50vh] overflow-y-auto p-4">
        <style jsx global>{`
          .dragged {
            cursor: grabbing !important;
            background: white;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            transform: scale(1.02);
            z-index: 50;
            height: 200px !important;
            width: 200px !important;
          }
          .dragged > div {
            height: 100% !important;
            padding-top: 0 !important;
          }
          .dragged img {
            object-fit: cover !important;
            height: 100% !important;
            width: 100% !important;
          }
        `}</style>
        <SortableList
          onSortEnd={onSortEnd}
          draggedItemClassName="dragged"
          className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map(({ image, name, index }) => (
            <div
              key={name}
              className={`relative group cursor-grab active:cursor-grabbing h-[200px] w-full ${
                index === items[0].index
                  ? "ring-2 ring-blue-500 ring-offset-2"
                  : ""
              } rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
              <SortableItem>
                <div className="relative h-full">
                  <div className="absolute inset-0">
                    <Image
                      className="object-cover w-full h-full select-none"
                      fill
                      alt={name}
                      src={image}
                      draggable={false}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-white bg-opacity-75 hover:bg-opacity-100 text-gray-600 hover:text-red-500 p-1.5 rounded-full transition-all transform opacity-0 group-hover:opacity-100 z-10">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </SortableItem>
            </div>
          ))}
        </SortableList>
      </div>
    </div>
  );
};

export default BecomeMemberDropzone;
