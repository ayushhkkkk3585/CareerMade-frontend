"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useRef } from 'react';
import {
  ArrowLeft,
  FileText,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Star,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import Navbar from "@/app/components/Navbar";


// Helper function to safely convert any value to string
const toText = (value: any): string => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(toText).join(" ");
  if (typeof value === "object") {
    if (value.text) return value.text;
    if (value.content) return value.content;
    if (value.blocks) return value.blocks.map(toText).join(" ");
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return String(value);
};

type User = {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  role?: string;
};

type Application = {
  _id: string;
  jobSeeker: {
    _id: string;
    user: User;
    experience?: {
      totalYears?: number;
      years?: number;
    };
    fullName?: string;
    resume?: {
      url: string;
    };
  };
  status: string;
  resume?: string | { url: string };
  coverLetter?: any;
  answers?: Array<{
    question: string;
    answer: string;
  }>;
  history?: Array<{
    status: string;
    at: string;
  }>;
  rating?: number;
};

const statusColors: Record<string, string> = {
  Applied: "bg-blue-100 text-blue-800",
  "Under Review": "bg-amber-100 text-amber-800",
  Interview: "bg-purple-100 text-purple-800",
  Offered: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  default: "bg-gray-100 text-gray-800",
};

const StarRating = ({
  rating,
  setRating,
  filter = false,
}: {
  rating: number;
  setRating?: (rating: number) => void;
  filter?: boolean;
}) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating && setRating(star)}
          className={`${filter ? "cursor-pointer" : "pointer-events-none"
            } ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
        >
          <Star
            className={`w-5 h-5 ${star <= rating ? "fill-current" : ""}`}
          />
        </button>
      ))}
      {filter && (
        <button
          onClick={() => setRating && setRating(0)}
          className="ml-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Clear
        </button>
      )}
    </div>
  );
};


export default function JobApplicationsPage() {
  const { id: jobId } = useParams();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 8;
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", []);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(user);

    // Role check — only allow employers
    if (parsedUser.role !== "employer") {
      toast.error("Access denied. Employers only.");
      router.push("/login");
      return;
    }

    const fetchApplications = async () => {
      try {
        const res = await fetch(`${apiBase}/api/applications/job/${jobId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("Error fetching applications:", data.message);
          setApplications([]);
          throw new Error(data.message || "Failed to fetch applications");
        } else {
          setApplications(Array.isArray(data.data?.applications) ? data.data.applications : []);
        }
      } catch (err) {
        console.error("Network error:", err);
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchApplications();
  }, [jobId, router, apiBase]);


  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${apiBase} / api / applications / ${applicationId} / status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: ` Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      setApplications(prev =>
        prev.map(app =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      toast.success("Status updated successfully");
    } catch (err: any) {
      console.error("Error updating status:", err);
      toast.error(err.message || "Failed to update status");
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...applications];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(app => {
        const js = app.jobSeeker || {};
        const u = js.user || {};
        const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ").toLowerCase() ||
          js.fullName?.toLowerCase() || "";
        const email = u.email?.toLowerCase() || "";

        return fullName.includes(term) ||
          email.includes(term) ||
          app.status?.toLowerCase().includes(term);
      });
    }

    if (statusFilter) {
      result = result.filter(app => app.status === statusFilter);
    }

    if (minRating > 0) {
      result = result.filter(app => (app.rating || 0) >= minRating);
    }

    setFilteredApplications(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [applications, searchTerm, statusFilter, minRating]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setMinRating(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSkeleton />
      </div>
    );
  }

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApps = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const hasFilters = searchTerm || statusFilter || minRating > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster position="top-right" />
      <div className="w-full relative bg-[#002B6B] text-white overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ backgroundImage: "url('/new1.png')" }}
        ></div>

        {/* Overlay (optional subtle gradient for text contrast) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#001b3e]/90 via-[#002b6b]/60 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left Text */}
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Job{" "}
              <span className="bg-gradient-to-r from-[#00A3FF] to-[#00E0FF] bg-clip-text text-transparent">
                Applications
              </span>
            </h1>
            <p className="text-base sm:text-lg text-blue-100 mt-3">
              Monitor your job posted application status
            </p>
          </div>


          
        </div>
      </div>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 mb-6">
          {/* Filter toolbar (below banner) */}
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center justify-end">
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-[#155DFC] hover:bg-[#1e45f6] text-white rounded-lg text-sm font-medium transition-all shadow-md flex items-center gap-2"
                >
                  <Filter className="h-4 w-4 mr-1.5" />
                  Filter
                  {hasFilters && (
                    <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-white text-[#155DFC] text-xs">
                      {[searchTerm, statusFilter, minRating > 0 ? 1 : 0].filter(Boolean).length}
                    </span>
                  )}
                </button>
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <div className="p-4 space-y-4">
                      <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                          Search
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="focus:ring-[#155DFC] focus:border-[#155DFC] block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                            placeholder="Search applicants..."
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#155DFC] focus:border-[#155DFC] sm:text-sm rounded-md"
                        >
                          <option value="">All Statuses</option>
                          {Object.keys(statusColors).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Rating
                        </label>
                        <div className="flex items-center space-x-2">
                          <StarRating
                            rating={minRating}
                            setRating={setMinRating}
                            filter={true}
                          />
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-200 flex justify-between">
                        <button
                          onClick={clearFilters}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Clear all
                        </button>
                        <button
                          onClick={() => setShowFilters(false)}
                          className="px-3 py-1.5 bg-[#155DFC] text-white text-sm font-medium rounded-md hover:bg-[#1e45f6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#155DFC]"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Active filters */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 justify-end">
                {searchTerm && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F3E8FF] text-[#155DFC]">
                    Search: {searchTerm}
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-[#155DFC] text-white"
                    >
                      ×
                    </button>
                  </span>
                )}
                {statusFilter && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E0F2FE] text-[#0369A1]">
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter('')}
                      className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-[#0369A1] text-white"
                    >
                      ×
                    </button>
                  </span>
                )}
                {minRating > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#92400E]">
                    Min Rating: {minRating}★
                    <button
                      onClick={() => setMinRating(0)}
                      className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-[#92400E] text-white"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-lg border-2 border-dashed border-gray-300">
              <div className="flex justify-center mb-4">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No applications found</h3>
              <p className="text-gray-500 mb-4">
                {hasFilters
                  ? "No applications match your current filters."
                  : "No applications have been submitted for this job yet."}
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#155DFC] hover:bg-[#7c4dd4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#155DFC]"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applicant
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Experience
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedApps.map((app) => {
                      const js = app.jobSeeker || {};
                      const u = js.user || {};
                      const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ") || js.fullName || "Unknown";
                      const email = u.email || "N/A";
                      const phone = u.phone || "N/A";
                      const experienceYears = js.experience?.totalYears ?? js.experience?.years;
                      const resumeUrl = typeof app.resume === "string" ? app.resume : app.resume?.url;
                      const status = app.status || "Applied";

                      return (
                        <tr key={app._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                {u.profileImage ? (
                                  <img
                                    className="h-10 w-10 rounded-full"
                                    src={u.profileImage}
                                    alt={fullName}
                                  />
                                ) : (
                                  <span className="text-gray-500">
                                    {fullName.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{fullName}</div>
                                <div className="text-xs text-gray-500">{email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{phone}</div>
                            <div className="text-xs text-gray-500">{email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {experienceYears ? ` ${experienceYears} years` : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {app.rating ? (
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {app.rating.toFixed(1)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">Not rated</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative group">
                              {/* <button 
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  statusColors[status] || statusColors.default
                                }`}
                              > */}
                              {status}
                              {/* <ChevronDown className="ml-1 h-3 w-3" /> */}
                              {/* </button> */}
                              <div className="absolute z-10 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                                <div className="py-1">
                                  {Object.entries(statusColors).map(([statusValue, statusClass]) => (
                                    <button
                                      key={statusValue}
                                      onClick={() => updateApplicationStatus(app._id, statusValue)}
                                      className={`block w-full text-left px-4 py-2 text-sm ${status === statusValue
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                      {statusValue}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => router.push(`/dashboard/employee/applications/${app._id}`)}
                                className="text-[#155DFC]"
                                title="View details"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              </button>
                              {resumeUrl && (
                                <a
                                  href={resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-600 hover:text-gray-800"
                                  title="View resume"
                                >
                                  <FileText className="h-5 w-5" />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, filteredApplications.length)}
                        </span>{" "}
                        of <span className="font-medium">{filteredApplications.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Previous</span>
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                                ? "z-10 bg-[#155DFC] border-[#155DFC] text-white"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Next</span>
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-10 bg-gray-100 rounded-md w-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="grid grid-cols-5 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16 my-auto"></div>
                    <div className="h-8 bg-gray-200 rounded-full w-24 my-auto"></div>
                    <div className="flex justify-end space-x-2">
                      <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}