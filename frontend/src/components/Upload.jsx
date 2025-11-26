import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload as UploadIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Upload({ onUploadComplete }) {
    const [file, setFile] = useState(null);
    const [taskId, setTaskId] = useState(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('idle'); // idle, uploading, processing, completed, error
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setStatus('idle');
        setProgress(0);
        setMessage('');
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setStatus('uploading');
            const response = await axios.post(`${API_URL}/api/upload/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setTaskId(response.data.task_id);
            setStatus('processing');
        } catch (error) {
            setStatus('error');
            setMessage('Upload failed: ' + error.message);
        }
    };

    useEffect(() => {
        let interval;
        if (status === 'processing' && taskId) {
            interval = setInterval(async () => {
                try {
                    const response = await axios.get(`${API_URL}/api/upload/${taskId}`);
                    const { status: taskStatus, result } = response.data;

                    if (taskStatus === 'PROGRESS') {
                        const { current, total, status: progressMsg } = result;
                        setProgress(Math.round((current / total) * 100));
                        setMessage(progressMsg);
                    } else if (taskStatus === 'SUCCESS') {
                        setStatus('completed');
                        setProgress(100);
                        setMessage(result.result);
                        clearInterval(interval);
                        if (onUploadComplete) onUploadComplete();
                    } else if (taskStatus === 'FAILURE') {
                        setStatus('error');
                        setMessage('Processing failed: ' + result);
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.error("Error polling status", error);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status, taskId, onUploadComplete]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <UploadIcon className="w-5 h-5" /> Bulk Import Products
            </h2>

            <div className="flex items-center gap-4 mb-4">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
                />
                <button
                    onClick={handleUpload}
                    disabled={!file || status === 'uploading' || status === 'processing'}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {status === 'uploading' ? 'Uploading...' : 'Upload CSV'}
                </button>
            </div>

            {status !== 'idle' && (
                <div className="mt-4">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-blue-700">{message || 'Processing...'}</span>
                        <span className="text-sm font-medium text-blue-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full ${status === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    {status === 'completed' && (
                        <div className="mt-2 text-green-600 flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4" /> Import successful!
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="mt-2 text-red-600 flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4" /> Error occurred.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
