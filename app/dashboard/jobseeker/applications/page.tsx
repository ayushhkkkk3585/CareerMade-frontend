"use client";
import React from "react";
import Navbar from "@/app/components/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Share2,
  Eye,
  Heart,
  TrendingUp,
  Award,
} from "lucide-react";
import { toast } from "react-toastify";

interface ApplicationDetail {
  _id: string;
  job: {
    _id: string;
    title: string;
    organizationName: string;
    department: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    location: {
      city: string;
      state: string;
      country: string;
    };
    salary: {
      min: number;
      max: number;
      currency: string;
    };
    jobType: string;
    experienceLevel: string;
    postedDate: string;
    applicationDeadline: string;
  };
  status: "Applied" | "Under Review" | "Interview" | "Offered" | "Rejected";
  appliedAt: string;
  viewedAt?: string;
  notes?: string;
  resume?: { _id: string; title: string; url: string };
  interviewDate?: string;
  interviewTime?: string;
  interviewLink?: string;
  rejectionReason?: string;
  coverLetter?: string;
  offerDetails?: {
    salary: number;
    startDate: string;
    benefits: string[];
    offerExpiry: string;
  };
  lastUpdatedAt?: string;
}

export default function MyApplications() {
  const [applications, setApplications] = useState<ApplicationDetail[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    applied: 0,
    underReview: 0,
    interview: 0,
    offered: 0,
    rejected: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const router = useRouter();

  // Helper function to format address
  const formatAddress = (address: any) => {
    if (!address) return "Not specified";
    const parts = [];
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.country) parts.push(address.country);
    return parts.length > 0 ? parts.join(", ") : "Not specified";
  };

  // Helper function to format salary
  const formatSalary = (salary: any) => {
    if (!salary) return "Not specified";
    if (typeof salary === "object" && salary.min && salary.max) {
      const currency = salary.currency || "USD";
      return `${currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
    }
    return salary;
  };

  // Calculate days since applied
  const daysSinceApplied = (appliedDate: string) => {
    const days = Math.floor(
      (Date.now() - new Date(appliedDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  // Get application timeline progress
  const getApplicationTimeline = (app: ApplicationDetail) => {
    const timeline = [
      { status: "Applied", date: app.appliedAt, completed: true },
      { status: "Under Review", date: app.viewedAt, completed: app.viewedAt ? true : false },
      { status: "Interview", date: app.interviewDate, completed: app.interviewDate ? true : false },
      { status: "Offered", date: app.offerDetails?.startDate, completed: app.status === "Offered" },
      { status: "Rejected", date: null, completed: app.status === "Rejected" },
    ];
    return timeline;
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/applications/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        const items = (data.data?.items || data.items || []) as ApplicationDetail[];

        setApplications(items);
        if (items.length > 0) {
          setSelectedApp(items[0]);
        }

        // Calculate stats from applications
        const statsData = {
          totalApplications: items.length,
          applied: items.filter((app) => app.status === "Applied").length,
          underReview: items.filter((app) => app.status === "Under Review").length,
          interview: items.filter((app) => app.status === "Interview").length,
          offered: items.filter((app) => app.status === "Offered").length,
          rejected: items.filter((app) => app.status === "Rejected").length,
        };
        setStats(statsData);
      } catch (error) {
        console.error("Failed to fetch applications", error);
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [router]);

  // Filter applications based on search and status
  const filteredApplications = applications.filter((app) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      app.job?.title?.toLowerCase().includes(searchLower) ||
      app.job?.organizationName?.toLowerCase().includes(searchLower) ||
      app.job?.department?.toLowerCase().includes(searchLower);

    const matchesStatus = filterStatus === "All" || app.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Get status color and icon
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bgColor: string; icon: JSX.Element }> = {
      Applied: {
        color: "text-blue-700",
        bgColor: "bg-blue-50",
        icon: <Clock className="w-4 h-4" />,
      },
      "Under Review": {
        color: "text-yellow-700",
        bgColor: "bg-yellow-50",
        icon: <Eye className="w-4 h-4" />,
      },
      Interview: {
        color: "text-purple-700",
        bgColor: "bg-purple-50",
        icon: <AlertCircle className="w-4 h-4" />,
      },
      Offered: {
        color: "text-green-700",
        bgColor: "bg-green-50",
        icon: <Award className="w-4 h-4" />,
      },
      Rejected: {
        color: "text-red-700",
        bgColor: "bg-red-50",
        icon: <XCircle className="w-4 h-4" />,
      },
    };
    return configs[status] || configs["Applied"];
  };

  const statusOptions = ["All", "Applied", "Under Review", "Interview", "Offered", "Rejected"];

  return (
    <>
      <Navbar />
      {/* Main container for the dashboard content, using min-h-screen */}
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Header (Fixed Height) */}
        <div className="bg-[#002B6B] text-white py-10 relative overflow-hidden flex-shrink-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-90"
            style={{ backgroundImage: "url('/new1.png')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#001b3e]/90 via-[#002b6b]/60 to-transparent"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold leading-tight">
                Track{" "}
                <span className="bg-gradient-to-r from-[#00A3FF] to-[#00E0FF] bg-clip-text text-transparent">
                  Your Applications
                </span>
              </h1>
              <p className="text-blue-100 mt-3">
                Monitor your job application status and upcoming interviews in real-time.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/jobseeker")}
              className="px-5 py-2.5 bg-gradient-to-r from-[#00A3FF] to-[#00E0FF] text-[#1A0152] rounded-full text-sm font-semibold shadow-md flex items-center gap-2 hover:shadow-lg transition flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Stats Overview (Fixed Height) */}
        <div className="max-w-7xl w-full mx-auto px-6 py-6 flex-shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                  <p className="text-xs text-gray-600 mt-1">Total</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-500 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.applied}</p>
                  <p className="text-xs text-gray-600 mt-1">Applied</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.underReview}</p>
                  <p className="text-xs text-gray-600 mt-1">Under Review</p>
                </div>
                <Eye className="w-8 h-8 text-yellow-500 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.interview}</p>
                  <p className="text-xs text-gray-600 mt-1">Interview</p>
                </div>
                <AlertCircle className="w-8 h-8 text-purple-500 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.offered}</p>
                  <p className="text-xs text-gray-600 mt-1">Offer</p>
                </div>
                <Award className="w-8 h-8 text-green-500 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                  <p className="text-xs text-gray-600 mt-1">Rejected</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Section (Takes up remaining space) */}
        <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="bg-white rounded-xl border h-full border-gray-100 shadow-sm flex flex-col">
            {/* Search and Filter (Fixed Height) */}
            <div className="p-4 border-b border-gray-100 space-y-3 flex-shrink-0">
              <input
                type="text"
                placeholder="Search by role or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 text-sm px-3 py-2 focus:ring-2 focus:ring-[#00B8DB] focus:border-[#00B8DB] outline-none"
              />
              <div className="flex gap-2 flex-wrap">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition ${filterStatus === status
                      ? "bg-[#00B8DB] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Applications List (Scrollable) */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B8DB]"></div>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="flex-1 flex items-center justify-center flex-col text-center">
                <Briefcase className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-gray-500 text-sm">{applications.length === 0 ? "No applications yet" : "No matching results"}</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {filteredApplications.map((app) => {
                  const statusConfig = getStatusConfig(app.status);
                  const isActive = selectedApp?._id === app._id;
                  return (
                    <div
                      key={app._id}
                      onClick={() => setSelectedApp(app)}
                      className={`cursor-pointer p-4 transition ${isActive ? "bg-blue-50 border-l-4 border-[#00B8DB]" : "hover:bg-gray-50"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-2 rounded-lg flex-shrink-0 ${statusConfig.bgColor}`}>
                          {statusConfig.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {app.job?.title || "Untitled Position"}
                          </h3>
                          <p className="text-xs text-gray-600 truncate">{app.job?.organizationName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {daysSinceApplied(app.appliedAt)}
                          </p>
                          <div className="mt-2">
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 w-fit ${statusConfig.bgColor} ${statusConfig.color}`}
                            >
                              {statusConfig.icon}
                              {app.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Details */}
          <div className="lg:col-span-2 bg-white rounded-xl border h-full border-gray-100 shadow-sm flex flex-col">
            {selectedApp ? (
              <>
                {/* Details Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 space-y-6">
                    {/* Header Section */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-2xl font-bold text-gray-900 truncate">
                            {selectedApp.job?.title}
                          </h2>
                          <p className="text-sm text-gray-600 mt-2">
                            {selectedApp.job?.organizationName} •{" "}
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">
                              {selectedApp.job?.department}
                            </span>
                          </p>
                        </div>
                        <div className={`text-xs font-semibold px-3 py-2 rounded-full flex items-center gap-2 flex-shrink-0 whitespace-nowrap ${getStatusConfig(selectedApp.status).bgColor} ${getStatusConfig(selectedApp.status).color}`}>
                          {getStatusConfig(selectedApp.status).icon}
                          {selectedApp.status}
                        </div>
                      </div>
                    </div>

                    {/* Key Info */}
                    <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                      {selectedApp.job?.location && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                          <div className="text-sm min-w-0">
                            <p className="text-gray-600">Location</p>
                            <p className="font-semibold text-gray-900 truncate">
                              {formatAddress(selectedApp.job.location)}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedApp.job?.salary && (
                        <div className="flex items-start gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                          <div className="text-sm min-w-0">
                            <p className="text-gray-600">Salary</p>
                            <p className="font-semibold text-gray-900 truncate">
                              {formatSalary(selectedApp.job.salary)}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedApp.job?.jobType && (
                        <div className="flex items-start gap-2">
                          <Briefcase className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="text-gray-600">Job Type</p>
                            <p className="font-semibold text-gray-900">{selectedApp.job.jobType}</p>
                          </div>
                        </div>
                      )}
                      {selectedApp.job?.experienceLevel && (
                        <div className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="text-gray-600">Experience</p>
                            <p className="font-semibold text-gray-900">{selectedApp.job.experienceLevel}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Application Timeline */}
                    <div className="py-4 border-t border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 mb-4">Application Timeline</p>
                      <div className="space-y-3">
                        {getApplicationTimeline(selectedApp).map((item, idx) => {
                          const isCompleted = item.completed;
                          const isCurrent = selectedApp.status === item.status;
                          const isRejected = selectedApp.status === "Rejected";

                          return (
                            <div key={idx}>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-semibold ${isCompleted || isCurrent
                                    ? "border-[#00A3FF] bg-[#00A3FF] text-white"
                                    : "border-gray-300 text-gray-400"
                                    } ${isRejected && item.status === "Rejected"
                                      ? "border-red-500 bg-red-500 text-white"
                                      : ""
                                    }`}
                                >
                                  {isCompleted || isCurrent ? "✓" : idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-semibold ${isCompleted || isCurrent ? "text-gray-900" : "text-gray-500"
                                    }`}>
                                    {item.status}
                                  </p>
                                  {item.date && (
                                    <p className="text-xs text-gray-500">
                                      {new Date(item.date).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {idx < getApplicationTimeline(selectedApp).length - 1 && (
                                <div className="ml-3 mt-2 mb-2 h-4 border-l-2 border-gray-200"></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interview Details */}
                    {selectedApp.status === "Interview" && selectedApp.interviewDate && (
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0" /> Interview Scheduled
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-700">
                            <span className="font-semibold">Date:</span>{" "}
                            {new Date(selectedApp.interviewDate).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          {selectedApp.interviewTime && (
                            <p className="text-gray-700">
                              <span className="font-semibold">Time:</span> {selectedApp.interviewTime}
                            </p>
                          )}
                          {selectedApp.interviewLink && (
                            <a
                              href={selectedApp.interviewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:underline flex items-center gap-2 mt-3 w-fit"
                            >
                              <Share2 className="w-4 h-4" />
                              Join Interview Link
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Offer Details */}
                    {selectedApp.status === "Offered" && selectedApp.offerDetails && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Award className="w-4 h-4 flex-shrink-0" /> Offer Details
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-700">
                            <span className="font-semibold">Salary:</span>{" "}
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(selectedApp.offerDetails.salary)}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-semibold">Start Date:</span>{" "}
                            {new Date(selectedApp.offerDetails.startDate).toLocaleDateString()}
                          </p>
                          {selectedApp.offerDetails.benefits && selectedApp.offerDetails.benefits.length > 0 && (
                            <div>
                              <p className="font-semibold text-gray-900 mb-2">Benefits:</p>
                              <ul className="space-y-1 ml-4">
                                {selectedApp.offerDetails.benefits.map((benefit, idx) => (
                                  <li key={idx} className="text-gray-700 flex items-center gap-2">
                                    <span className="text-green-600 flex-shrink-0">•</span>
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {selectedApp.offerDetails.offerExpiry && (
                            <p className="text-red-600 font-semibold mt-3">
                              Offer expires on:{" "}
                              {new Date(selectedApp.offerDetails.offerExpiry).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Job Description */}
                    {selectedApp.job?.description && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Job Description</h3>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                          {selectedApp.job.description}
                        </p>
                      </div>
                    )}

                    {/* Requirements */}
                    {selectedApp.job?.requirements && selectedApp.job.requirements.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
                        <ul className="space-y-2 max-h-40 overflow-y-auto">
                          {selectedApp.job.requirements.map((req, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex gap-2">
                              <span className="text-[#00B8DB] font-bold flex-shrink-0">•</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Responsibilities */}
                    {selectedApp.job?.responsibilities && selectedApp.job.responsibilities.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Responsibilities</h3>
                        <ul className="space-y-2 max-h-40 overflow-y-auto">
                          {selectedApp.job.responsibilities.map((resp, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex gap-2">
                              <span className="text-[#00B8DB] font-bold flex-shrink-0">•</span>
                              <span>{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Application Notes */}
                    {selectedApp.notes && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 flex-shrink-0" /> Your Notes
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{selectedApp.notes}</p>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {selectedApp.status === "Rejected" && selectedApp.rejectionReason && (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                        <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                          <XCircle className="w-4 h-4 flex-shrink-0" /> Feedback
                        </h3>
                        <p className="text-sm text-red-700">{selectedApp.rejectionReason}</p>
                      </div>
                    )}

                    {/* Last Updated */}
                    {selectedApp.lastUpdatedAt && (
                      <p className="text-xs text-gray-500 border-t pt-4">
                        Last updated:{" "}
                        {new Date(selectedApp.lastUpdatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
                {/* Action Buttons (Fixed Height) */}
              </>
            ) : (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">Select an application to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div >
    </>
  );
}