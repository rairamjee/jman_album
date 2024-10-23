"use client";
import React, { useState } from 'react';
import axios from 'axios';

function Dashboard() {
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileChange = (event) => {
        setSelectedFiles(event.target.files);
    };

    const handleClick = async () => {
        if (selectedFiles.length === 0) {
            alert('Please select at least one file to upload.');
            return;
        }

        try {
            for (const file of selectedFiles) {
                //
                const response = await axios.post('/api/images', {
                    params: { filename: file.name, filetype: file.type },
                });
                const { uploadUrl } = response.data;
                console.log(uploadUrl);
                await axios.put(uploadUrl, file, {
                    headers: {
                        'Content-Type': file.type,
                    },
                });
            }
            alert('Files uploaded successfully!');
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('File upload failed.');
        }
    };

    return (
        <div>
            <div className="text-xl font-bold">Dashboard</div>
            <div className="flex flex-col items-center justify-center gap-8">
                <input type="file" multiple onChange={handleFileChange} />
                <button
                    className="w-32 h-10 rounded-lg bg-purple-400 text-white"
                    onClick={handleClick}
                >
                    Upload Files
                </button>
            </div>
        </div>
    );
}

export default Dashboard;
