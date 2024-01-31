import { useStateContext } from '@/context/StateContext';
import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

type Props = {
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
  imageFiles: File[];
  downloadURLs?: string[];
};

const BecomeMemberDropzone: React.FC<Props> = (props) => {
  const { state, setState } = useStateContext();

  useEffect(() => {
    const convertURLsToFileObjects = async () => {
      const filePromises =
        props.downloadURLs &&
        props.downloadURLs.map(async (url) => {
          const response = await fetch(url);
          const blob = await response.blob();
          return new File([blob], url.split('/').pop() || 'downloaded', {
            type: blob.type,
          });
        });

      if (filePromises) {
        const files = await Promise.all(filePromises);
        props.setImageFiles(files);
        setOrderedImageFiles(files);
      }
    };

    convertURLsToFileObjects();
  }, [props.downloadURLs]);

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
    },
  });

  // Function to handle reordering
  const handleOnDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(orderedImageFiles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedImageFiles(items);
    props.setImageFiles(items);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImageFiles = [...orderedImageFiles];
    updatedImageFiles.splice(index, 1);
    props.setImageFiles(updatedImageFiles);
    setOrderedImageFiles(updatedImageFiles);
  };

  return (
    <div className="flex bg-[#d2d2d244] z-[2000] rounded-lg flex-col h-fit w-full top-0 bottom-0 left-0 right-0 m-auto">
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
      <div className=" max-h-[50vh] overflow-y-auto border-[#939393] pt-4">
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="droppable">
            {(provided: any) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className=" flex flex-wrap justify-center w-fit gap-2 m-auto overflow-hidden">
                {orderedImageFiles.map((file, index) => (
                  <Draggable
                    key={index}
                    draggableId={index.toString()}
                    index={index}>
                    {(provided: any) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="w-1/4 flex relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Uploaded Image ${index + 1}`}
                          className="m-auto"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute text-sm top-2 right-2 bg-red-300 text-white px-1 h-fit rounded-full cursor-pointer">
                          X
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
