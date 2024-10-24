"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const ImageModal = ({ image, onClose }) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = image.s3Url; // URL of the image
    link.download = image.fileName; // Name for the downloaded file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up
  };

  return (
    <Dialog open={!!image} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl mx-auto">
        <div className="relative">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="absolute top-2 right-2 z-10"
          >
            Close
          </Button>
          <img 
            src={image.s3Url} 
            alt="" 
            className="w-full h-auto rounded-md" 
            style={{ objectFit: 'contain' }} // Ensures the image is properly framed
          />
          <div className="flex justify-center mt-4">
            <Button onClick={handleDownload}>
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
