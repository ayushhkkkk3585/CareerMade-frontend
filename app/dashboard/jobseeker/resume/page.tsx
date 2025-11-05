'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '@/app/components/Navbar';
import GradientLoader from '@/app/components/GradientLoader';
// Assuming these icons are available or you'd use a library like 'lucide-react'
import { FileText, PlusCircle, Trash2, Edit, Eye, Download, Star } from 'lucide-react';
import Link from 'next/link';

interface Resume {
    _id: string;
    title: string;
    personalInfo: {
        fullName: string;
        email: string;
    };
    isDefault: boolean;
    stats: {
        views: number;
        downloads: number;
    };
    createdAt: string;
    updatedAt: string;
}

export default function ResumePage() {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/resume/list`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            // Ensure response structure is correct based on your API
            setResumes(response.data.data.resumes);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load resumes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
            try {
                await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/resume/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });
                // Optimistically update the UI
                setResumes(resumes.filter(r => r._id !== id));
            } catch (err: any) {
                // Check for specific error message or fallback
                const errorMessage = err.response?.data?.message || 'Failed to delete resume.';
                alert(errorMessage);
            }
        }
    };

    // Helper function for date formatting (optional but nice for UI)
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
                <GradientLoader />
                <p className="mt-4 text-gray-500">Loading your resumes...</p>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className=" bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">

                    {/* Header Section */}
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b pb-4">
                        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center mb-4 sm:mb-0">
                            {/* <FileText className="w-8 h-8 mr-3 text-blue-600" /> */}
                            📝 My Resumes
                        </h1>
                        <Link
                            href="/dashboard/jobseeker/resume/build"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-blue-600 hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-[1.02]"
                        >
                            {/* <PlusCircle className="w-5 h-5 mr-2" /> */}
                            ✨ Build New Resume
                        </Link>
                    </header>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                            <strong className="font-bold">Error:</strong>
                            <span className="block sm:inline ml-2">{error}</span>
                        </div>
                    )}

                    {/* Empty State */}
                    {resumes.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-gray-300 p-12 rounded-xl text-center shadow-inner mt-10">
                            <p className="text-xl text-gray-600 mb-6">
                                It looks like you haven't created any resumes yet.
                            </p>
                            <Link
                                href="/dashboard/jobseeker/resume/build"
                                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 text-lg font-medium transition duration-300"
                            >
                                🚀 Create Your First Resume
                            </Link>
                        </div>
                    ) : (
                        // Resumes List
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {resumes.map(resume => (
                                <div
                                    key={resume._id}
                                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition duration-300 flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Title and Default Tag */}
                                        <div className="flex justify-between items-start mb-3">
                                            <h2 className="text-2xl font-bold text-gray-900 truncate pr-2">
                                                {resume.title}
                                            </h2>
                                            {resume.isDefault && (
                                                <span className="flex items-center bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap border border-green-200">
                                                    <Star className="w-3 h-3 mr-1 fill-current" />
                                                    ⭐ Default
                                                </span>
                                            )}
                                        </div>

                                        {/* Meta Info */}
                                        <p className="text-sm text-gray-500 mb-4">
                                            Created: {formatDate(resume.createdAt)}
                                        </p>

                                        {/* Stats */}
                                        <div className="flex justify-between text-sm text-gray-700 mb-6 border-t pt-4">
                                            <p className="flex items-center">
                                                <Eye className="w-4 h-4 mr-1 text-blue-500" />
                                                Views: <span className="font-semibold ml-1 text-blue-600">{resume.stats.views}</span>
                                            </p>
                                            <p className="flex items-center">
                                                <Download className="w-4 h-4 mr-1 text-purple-500" />
                                                Downloads: <span className="font-semibold ml-1 text-purple-600">{resume.stats.downloads}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                                        {/* Edit Button */}
                                        <Link
                                            href={`/dashboard/jobseeker/resume/edit/${resume._id}`}
                                            // ADDED: flex, items-center, justify-center for perfect alignment
                                            className="flex-1 min-w-[80px] flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition"
                                        >
                                            {/* Make sure the icon has a consistent right margin */}
                                            {/* Assuming Edit is available */}
                                            <Edit className="w-4 h-4 mr-1" />
                                            Edit
                                        </Link>

                                        {/* Preview Button (Fixed to include text for alignment) */}
                                        <Link
                                            href={`/dashboard/jobseeker/resume/preview/${resume._id}`}
                                            // ADDED: flex, items-center, justify-center for perfect alignment
                                            className="flex-1 min-w-[80px] flex items-center justify-center px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 font-medium text-sm transition"
                                        >
                                            {/* Make sure the icon has a consistent right margin */}
                                            {/* Assuming Eye is available */}
                                            <Eye className="w-4 h-4 mr-1" />
                                            Preview
                                        </Link>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDelete(resume._id)}
                                            // ADDED: flex, items-center, justify-center for perfect alignment
                                            className="flex-1 min-w-[80px] flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition"
                                        >
                                            {/* Make sure the icon has a consistent right margin */}
                                            {/* Assuming Trash2 is available */}
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}