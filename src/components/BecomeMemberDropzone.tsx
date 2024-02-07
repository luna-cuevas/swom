import { useStateContext } from '@/context/StateContext';
import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import SortableList, { SortableItem } from 'react-easy-sort';
import { arrayMoveImmutable } from 'array-move';
import 'react-toastify/dist/ReactToastify.css';

type Props = {
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
  imageFiles: File[];
  downloadURLs?: string[];
};

const BecomeMemberDropzone: React.FC<Props> = (props) => {
  const { state, setState } = useStateContext();
  const [orderedImageFiles, setOrderedImageFiles] = useState<File[]>(
    props.imageFiles
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDropRejected: (fileRejections) => {
      const fileRejectionErrors = fileRejections.map((fileRejection) => {
        return fileRejection.errors.map((error) => error.message);
      });
      fileRejectionErrors.forEach((error) => toast.error(error));
      toast.error("File rejected. Please check the file's size and type.");
    },
    onDrop: (acceptedFiles) => {
      const existingFileNames = orderedImageFiles.map((file) => file.name);
      const newImageFiles = acceptedFiles.filter(
        (file) => !existingFileNames.includes(file.name)
      );

      if (newImageFiles.length < acceptedFiles.length) {
        // Display a toast alert for duplicates
        toast.warn('Some images were not added as they are duplicates.');
      }

      // Combine the new files with the existing files
      const updatedImageFiles = [...orderedImageFiles, ...newImageFiles];

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
    console.log('index', index);
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
            return new File([blob], url.split('/').pop() || 'downloaded', {
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
    <div className="flex bg-[#d2d2d244] z-0 rounded-lg flex-col h-fit w-full top-0 bottom-0 left-0 right-0 m-auto">
      <button
        type="button"
        className=" ml-auto z-[100000] w-fit mr-2 text-sm bg-red-300 text-white px-1 h-fit rounded-full cursor-pointer"
        onClick={() => {
          setState({
            ...state,
            imgUploadPopUp: false,
          });
        }}>
        X
      </button>
      <div
        {...getRootProps({
          className:
            'w-full flex h-full m-auto cursor-pointer p-4 text-center ',
        })}>
        <input {...getInputProps()} />
        <p className="text-[#000000] m-auto text-base border-2 border-[#939393] p-4">
          Drag and drop image(s) here, or click to select files
        </p>
      </div>
      <div className=" max-h-[50vh]  overflow-y-auto border-[#939393] pt-4">
        <SortableList
          onSortEnd={onSortEnd}
          draggedItemClassName="dragged"
          className="grid grid-cols-3 select-none gap-4 ">
          {items.map(({ image, name, index }) => (
            <div className=" flex   justify-center  m-auto">
              <SortableItem key={name}>
                <div className="drag-item relative w-full pointer-events-none">
                  <img className="m-auto" alt={name} src={image} />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute pointer-events-auto z-[1000] text-sm top-2 right-2 bg-red-300 text-white px-1 h-fit rounded-full cursor-pointer">
                    X
                  </button>
                </div>
              </SortableItem>
            </div>
          ))}
        </SortableList>
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
    </div>
  );
};

export default BecomeMemberDropzone;
