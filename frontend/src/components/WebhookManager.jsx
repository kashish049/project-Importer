import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Webhook as WebhookIcon, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function WebhookManager() {
    const [webhooks, setWebhooks] = useState([]);
    const [newUrl, setNewUrl] = useState('');
    const [eventType, setEventType] = useState('upload_completed');
    const [editingId, setEditingId] = useState(null);
    const [editUrl, setEditUrl] = useState('');
    const [editEventType, setEditEventType] = useState('');

    const fetchWebhooks = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/webhooks/`);
            setWebhooks(response.data);
        } catch (error) {
            console.error("Error fetching webhooks", error);
        }
    };

    useEffect(() => {
        fetchWebhooks();
    }, []);

    const handleAdd = async () => {
        if (!newUrl) return;
        try {
            await axios.post(`${API_URL}/api/webhooks/`, {
                url: newUrl,
                event_type: eventType,
                is_active: true
            });
            setNewUrl('');
            fetchWebhooks();
        } catch (error) {
            alert("Failed to add webhook: " + (error.response?.data?.detail || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this webhook?")) return;
        try {
            await axios.delete(`${API_URL}/api/webhooks/${id}`);
            fetchWebhooks();
        } catch (error) {
            alert("Failed to delete webhook: " + (error.response?.data?.detail || error.message));
        }
    };

    const startEdit = (webhook) => {
        setEditingId(webhook.id);
        setEditUrl(webhook.url);
        setEditEventType(webhook.event_type);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditUrl('');
        setEditEventType('');
    };

    const saveEdit = async (id) => {
        try {
            await axios.put(`${API_URL}/api/webhooks/${id}`, {
                url: editUrl,
                event_type: editEventType,
                is_active: true
            });
            setEditingId(null);
            fetchWebhooks();
        } catch (error) {
            alert("Failed to update webhook: " + (error.response?.data?.detail || error.message));
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">

            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <WebhookIcon className="w-5 h-5" /> Webhooks
            </h2>

            {/* ============================= */}
            {/*      UPDATED LAYOUT HERE      */}
            {/* ============================= */}

            <div className="flex flex-col gap-4 mb-6 w-full">

                {/* Full-width URL input */}
                <input
                    type="text"
                    placeholder="https://example.com/webhook"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                />

                {/* Second row: dropdown + Add button */}
                <div className="flex items-center gap-4">

                    <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="border rounded-md px-3 py-2 text-sm bg-white"
                    >
                        <option value="upload_completed">Upload Completed</option>
                    </select>

                    <button
                        onClick={handleAdd}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add
                    </button>

                </div>
            </div>

            
            {/*        WEBHOOK LIST          */}
            

            <div className="space-y-2">
                {webhooks.length === 0 ? (
                    <p className="text-gray-500 text-sm">No webhooks configured.</p>
                ) : (
                    webhooks.map((webhook) => (
                        <div
                            key={webhook.id}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-md border"
                        >

                            {editingId === webhook.id ? (
                                <>
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            value={editUrl}
                                            onChange={(e) => setEditUrl(e.target.value)}
                                            className="flex-1 border rounded-md px-2 py-1 text-sm"
                                        />
                                        <select
                                            value={editEventType}
                                            onChange={(e) => setEditEventType(e.target.value)}
                                            className="border rounded-md px-2 py-1 text-sm bg-white"
                                        >
                                            <option value="upload_completed">Upload Completed</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-2 ml-2">
                                        <button
                                            onClick={() => saveEdit(webhook.id)}
                                            className="text-green-600 hover:text-green-800"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="text-gray-600 hover:text-gray-800"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{webhook.url}</p>
                                        <p className="text-xs text-gray-500">
                                            Event: {webhook.event_type}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                                            Active
                                        </span>

                                        <button
                                            onClick={() => startEdit(webhook)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(webhook.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}

                        </div>
                    ))
                )}
            </div>

        </div>
    );
}
