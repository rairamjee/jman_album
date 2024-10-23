"use client";

import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const abortController = useRef(null); // Ref to control aborting the upload

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const handleUpload = async () => {
  if (selectedFiles.length === 0 || !selectedEvent) {
    setMessage("Please select both files and an event.");
    return;
  }

  setUploading(true);
  setMessage("");
  setUploadProgress(0);
  abortController.current = new AbortController();

  try {
    const totalFiles = selectedFiles.length;

    for (let i = 0; i < selectedFiles.length; i++) {
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
        }),
        signal: abortController.current.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error && data.error.includes("Duplicate key")) {
          setMessage(`Error: ${data.error}`);
          setUploading(false);
          return; // Stop further uploads if a duplicate key error occurs
        }
        throw new Error("Failed to generate presigned URL.");
      }

      const { presigned_upload_url } = data;

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

      setUploadProgress(((i + 1) / totalFiles) * 100);
    }

    setMessage(`${totalFiles} ${totalFiles === 1 ? 'file' : 'files'} uploaded successfully!`);
    if (onUploadComplete) {
      onUploadComplete();
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

  return (
    <div>
      <h1>Upload an Image</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Selected Image"
          style={{ maxWidth: "300px", marginTop: "10px" }}
        />
      )}
      <br />
      <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
        {uploading ? "Uploading..." : "Upload Image"}
      </Button>
      {uploading && <button onClick={handleAbort}>Abort Upload</button>}
      {message && <p>{message}</p>}
    </div>
  );
}
