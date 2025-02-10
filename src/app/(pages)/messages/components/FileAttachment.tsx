import { FileAttachment } from "../types";
import { Button } from "@/components/ui/button";
import {
  FileIcon,
  Download,
  Video,
  FileText,
  Image as ImageIcon,
  Play,
  File,
  X,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface FileAttachmentProps {
  attachment: FileAttachment;
}

export function FileAttachmentView({ attachment }: FileAttachmentProps) {
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(attachment.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      window.open(attachment.url, "_blank");
    }
  };

  const getFileSize = () => {
    const size = attachment.file_size / 1024; // Convert to KB
    if (size < 1024) {
      return `${size.toFixed(1)} KB`;
    }
    return `${(size / 1024).toFixed(1)} MB`;
  };

  const renderPreview = () => {
    if (attachment.file_type.startsWith("image/")) {
      return (
        <>
          <div
            className="group relative w-full aspect-square rounded-lg overflow-hidden bg-gray-50 cursor-zoom-in"
            onClick={() => setImagePreviewOpen(true)}>
            <Image
              src={attachment.thumbnail_url || attachment.url}
              alt={attachment.filename}
              fill
              className="object-cover transition-all duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ZoomIn className="absolute bottom-2 left-2 w-5 h-5 text-white opacity-75" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-2 right-2 bg-white/90 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}>
              <Download className="w-4 h-4 text-gray-700" />
            </Button>
          </div>

          <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
            <DialogContent className="sm:max-w-[90vw] h-[90vh] p-0 bg-black overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-50 text-white hover:bg-white/20"
                  onClick={() => setImagePreviewOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <img
                    src={attachment.url}
                    alt={attachment.filename}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
    }

    if (attachment.file_type.startsWith("video/")) {
      return (
        <>
          <div
            className="group relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer"
            onClick={() => setVideoPreviewOpen(true)}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="w-12 h-12 text-gray-400 group-hover:text-gray-600 transition-all duration-300 group-hover:scale-110" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-2 right-2 bg-white/90 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}>
              <Download className="w-4 h-4 text-gray-700" />
            </Button>
          </div>

          <Dialog open={videoPreviewOpen} onOpenChange={setVideoPreviewOpen}>
            <DialogContent className="sm:max-w-[800px] p-0 bg-black overflow-hidden">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-50 text-white hover:bg-white/20"
                  onClick={() => setVideoPreviewOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
                <video
                  src={attachment.url}
                  controls
                  autoPlay
                  className="w-full h-full"
                  style={{ maxHeight: "80vh" }}>
                  Your browser does not support the video tag.
                </video>
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
    }

    const isPDF = attachment.file_type.includes("pdf");
    const FileTypeIcon =
      isPDF || attachment.file_type.includes("document") ? FileText : File;

    return (
      <>
        <div
          className={`group relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 ${isPDF ? "cursor-pointer" : ""}`}
          onClick={() => isPDF && setDocumentPreviewOpen(true)}>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <FileTypeIcon className="w-12 h-12 text-gray-400 group-hover:text-gray-600 transition-all duration-300 group-hover:scale-110" />
            <span className="mt-2 text-sm text-gray-500 font-medium">
              {attachment.file_type.split("/")[1].toUpperCase()}
            </span>
            {isPDF && (
              <span className="mt-1 text-xs text-gray-400">
                Click to preview
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-2 right-2 bg-white/90 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}>
            <Download className="w-4 h-4 text-gray-700" />
          </Button>
        </div>

        {isPDF && (
          <Dialog
            open={documentPreviewOpen}
            onOpenChange={setDocumentPreviewOpen}>
            <DialogContent className="sm:max-w-[90vw] h-[90vh] p-0">
              <div className="relative w-full h-full">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-50 text-gray-600 hover:bg-gray-100"
                  onClick={() => setDocumentPreviewOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
                <iframe
                  src={`${attachment.url}#toolbar=0`}
                  className="w-full h-full"
                  style={{ height: "90vh" }}
                  title={`PDF preview: ${attachment.filename}`}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  };

  return (
    <div className="group w-[280px] flex flex-col gap-3 p-3 bg-white border rounded-xl hover:border-[#E88527] hover:shadow-lg transition-all duration-300">
      {renderPreview()}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium line-clamp-2 group-hover:text-[#E88527] transition-colors duration-300">
            {attachment.filename}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            {getFileSize()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-[#E88527] hover:bg-[#E88527]/10 transition-colors duration-300"
            onClick={handleDownload}>
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
