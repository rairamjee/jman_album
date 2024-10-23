"use client";

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
    if (!selectedFile) {
      setMessage("Please select a file first.");
      return;
    }

    setUploading(true);
    setMessage("");
    abortController.current = new AbortController();

    try {
      const filename = selectedFile.name;
      const response = await fetch("/api/album/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          original_filename: filename,
          content_type: selectedFile.type,
          user_id: "12345", // Replace with actual user id
        }),
        signal: abortController.current.signal, // Attach the abort signal
      });

      if (!response.ok) {
        throw new Error("Failed to generate presigned URL.");
      }

      const data = await response.json();
      const { presigned_upload_url, image_id } = data;

      // Upload the file to S3
      const s3Response = await fetch(presigned_upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type,
        },
        body: selectedFile,
        signal: abortController.current.signal, // Attach the abort signal
      });

      if (s3Response.ok) {
        setMessage(`File uploaded successfully! Image ID: ${image_id}`);
      } else {
        throw new Error("Failed to upload the file to S3.");
      }
    } catch (error) {
      if (abortController.current.signal.aborted) {
        setMessage("Upload was aborted.");
      } else {
        setMessage("Error uploading file. Please try again.");
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
      <button onClick={handleUpload} disabled={!selectedFile || uploading}>
        {uploading ? "Uploading..." : "Upload Image"}
      </button>
      {uploading && <button onClick={handleAbort}>Abort Upload</button>}
      {message && <p>{message}</p>}
    </div>
  );
}
