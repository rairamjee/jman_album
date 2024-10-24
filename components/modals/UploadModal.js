"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ImagePlus, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const UploadModal = ({ onUploadComplete }) => {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const abortController = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    if (open) {
      fetchEvents();
    }
  }, [open]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !selectedEvent) {
      setMessage("Please select files and an event.");
      return;
    }

    setUploading(true);
    setMessage("");
    setUploadProgress(0);
    abortController.current = new AbortController();

    try {
      const totalFiles = selectedFiles.length;
      const uploadedImageIds = [];

      for (let i = 0; i < totalFiles; i++) {
        const file = selectedFiles[i];
        const response = await fetch("/api/album/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            original_filename: file.name,
            content_type: file.type,
            event_id: selectedEvent,
            // Removed event_type from here
          }),
          signal: abortController.current.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error && data.error.includes("Duplicate key")) {
            setMessage(`Error: ${data.error}`);
            setUploading(false);
            return;
          }
          throw new Error("Failed to generate presigned URL.");
        }

        const { presigned_upload_url, key } = data;

        const s3Response = await fetch(presigned_upload_url, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
          signal: abortController.current.signal,
        });

        if (!s3Response.ok) {
          throw new Error("Failed to upload the file to S3.");
        }

        const newImage = await fetch("/api/album/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key,
            fileName: file.name,
            contentType: file.type,
            eventId: selectedEvent,
            // Removed eventType from here
          }),
        });

        const newImageData = await newImage.json();
        if (!newImage.ok) {
          throw new Error("Failed to save image details in the database.");
        }
        uploadedImageIds.push(newImageData.image_id);

        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      setMessage(`${totalFiles} ${totalFiles === 1 ? 'file' : 'files'} uploaded successfully!`);
      if (onUploadComplete) {
        onUploadComplete(uploadedImageIds);
      }

      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 2000);
      
    } catch (error) {
      if (abortController.current?.signal.aborted) {
        setMessage("Upload was aborted.");
      } else {
        setMessage("Error uploading files. Please try again.");
        console.error("Upload error:", error);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAbort = () => {
    if (abortController.current) {
      abortController.current.abort();
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    setSelectedEvent(null);
    setMessage("");
    setUploadProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button>
          <ImagePlus className="h-4 w-4 mr-2" />
          Upload Images
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Images to Event</DialogTitle>
          <DialogDescription>
            Select One or Multiple Image(s)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Event</label>
            <Select onValueChange={setSelectedEvent} value={selectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.eventName} - {format(new Date(event.eventDate), "PPP")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Choose Images</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImagePlus className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop multiple images
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
              </label>
            </div>
          </div>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    type="button"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                Uploading {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || !selectedEvent || uploading}
              className="flex-1"
            >
              {uploading ? "Uploading..." : `Upload ${selectedFiles.length || 'No'} Image${selectedFiles.length !== 1 ? 's' : ''}`}
            </Button>
            {uploading && (
              <Button onClick={handleAbort} variant="destructive">
                Cancel
              </Button>
            )}
          </div>

          {message && (
            <p className={`text-sm text-center font-medium ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
