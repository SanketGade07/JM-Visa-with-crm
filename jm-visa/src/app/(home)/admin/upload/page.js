"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file!");

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setMessage("");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMessage("File uploaded successfully!");
      } else {
        setMessage("Upload failed!");
      }
    } catch (error) {
      setMessage("Error uploading file!");
    }

    setUploading(false);
  };

  return (
    <div className="p-5 mt-[90px] min-h-screen flex justify-center items-center">
      <form onSubmit={handleUpload} className="flex flex-col gap-3">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {message && <p className="mt-3 text-green-500">{message}</p>}
    </div>
  );
}
