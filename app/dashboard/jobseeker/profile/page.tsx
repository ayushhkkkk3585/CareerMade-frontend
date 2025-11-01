"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import {
  ArrowLeft,
  User2,
  Edit,
  FileText,
  File,
  Upload,
  Trash2,
  Loader2,
  Save,
} from "lucide-react";

export default function JobSeekerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  // Fetch user from localStorage
  useEffect(() => {
    const storedUser =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : null;
    setUser(storedUser);
  }, []);

  // Fetch profile
  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const seeker = data.data?.jobSeeker || data;
        setProfile(seeker);
        setResume(seeker.resume || null);
        setCoverLetter(seeker.coverLetter || null);
      })
      .catch(() => console.error("Failed to fetch profile"))
      .finally(() => setLoading(false));
  }, [token]);

  // Handle input change
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save profile
  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profile),
        }
      );
      const data = await res.json();
      if (res.ok) alert("Profile updated!");
      else alert(data.message || "Update failed");
    } catch {
      alert("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  // File upload
  const handleFileUpload = async (e: any, type: "resume" | "coverLetter") => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append(type, file);

    const endpoint =
      type === "resume"
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/resume`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/cover-letter`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      if (type === "resume") setResume(data.data.resume);
      else setCoverLetter(data.data.coverLetter);
      alert(`${type === "resume" ? "Resume" : "Cover letter"} uploaded!`);
    } else alert(data.message || "Upload failed");
  };

  // File delete
  const handleDelete = async (type: "resume" | "coverLetter") => {
    if (!confirm(`Delete ${type}?`)) return;
    const endpoint =
      type === "resume"
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/resume`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/cover-letter`;
    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      if (type === "resume") setResume(null);
      else setCoverLetter(null);
      alert(`${type} deleted!`);
    } else alert("Failed to delete");
  };

  // ---------------- LOADING STATES ----------------
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
      </div>
    );

  if (!profile)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center px-6">
        <p className="text-gray-700 mb-4">Profile not found.</p>
        <button
          onClick={() => router.push("/dashboard/jobseeker/profile/create")}
          className="bg-[#8F59ED] hover:bg-[#7c4dd4] text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all"
        >
          Create Profile
        </button>
      </div>
    );

  // ---------------- UI ----------------
  return (
    <>
      <Navbar />

      {/* ===== HEADER SECTION ===== */}
      <div className="bg-gray-50">
        <div className="w-full relative bg-[#002B6B] text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-90"
            style={{ backgroundImage: "url('/new1.png')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#001b3e]/90 via-[#002b6b]/60 to-transparent"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                Job Seeker{" "}
                <span className="bg-gradient-to-r from-[#00A3FF] to-[#00E0FF] bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
              <p className="text-base sm:text-lg text-blue-100 mt-3">
                Manage your profile, resume, and cover letter to apply for jobs seamlessly.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-start sm:justify-end w-full sm:w-auto">
              <button
                onClick={() => router.push("/dashboard/jobseeker")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white rounded-full text-sm sm:text-base font-semibold transition-all shadow-lg whitespace-nowrap"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== DASHBOARD SECTION ===== */}
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ===== LEFT COLUMN ===== */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col items-center text-center">
            {/* Profile Icon */}
            <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <User2 className="w-12 h-12 text-gray-400" />
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-gray-500 mb-2">{user?.email}</p>
            <p className="text-sm text-gray-500 mb-2">{user?.phone}</p>

            <div className="w-full border-t border-gray-200 my-4"></div>

            {/* ===== Edit Profile Button ===== */}
            <button
              onClick={() =>
                router.push("/dashboard/jobseeker/profile/edit")
              }
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white rounded-lg text-sm font-medium shadow-md transition-all"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-8 border border-gray-100 space-y-8">
            {/* ===== PROFILE FORM ===== */}
            <form onSubmit={handleSave} className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Professional Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-gray-600">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={profile.title || ""}
                    onChange={handleChange}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Registered Nurse"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Specialization</label>
                  <input
                    type="text"
                    name="specializations"
                    value={profile.specializations?.[0] || ""}
                    onChange={(e) =>
                      setProfile((prev: any) => ({
                        ...prev,
                        specializations: [e.target.value],
                      }))
                    }
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Pediatrics"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Experience (years)</label>
                  <input
                    type="number"
                    name="experience"
                    value={profile.experience?.totalYears || ""}
                    onChange={(e) =>
                      setProfile((prev: any) => ({
                        ...prev,
                        experience: { ...prev.experience, totalYears: e.target.value },
                      }))
                    }
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. 3"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600">Bio</label>
                  <textarea
                    name="bio"
                    value={profile.bio || ""}
                    onChange={handleChange}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[90px]"
                    placeholder="Write something about yourself..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white px-6 py-2.5 rounded-lg shadow-md transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Profile
                  </>
                )}
              </button>
            </form>

            {/* ===== DOCUMENTS ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Resume */}
              <div className="p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Resume
                </h2>
                {resume ? (
                  <div className="mt-3 text-sm">
                    <a
                      href={resume.url}
                      target="_blank"
                      className="text-indigo-600 underline"
                    >
                      {resume.filename}
                    </a>
                    <button
                      onClick={() => handleDelete("resume")}
                      className="ml-4 text-red-500 hover:underline"
                    >
                      <Trash2 className="inline w-4 h-4 mr-1" /> Delete
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full px-4 py-3 mt-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <Upload className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-600">
                      Upload Resume (PDF/DOC)
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "resume")}
                    />
                  </label>
                )}
              </div>

              {/* Cover Letter */}
              <div className="p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <File className="w-5 h-5 text-indigo-600" />
                  Cover Letter
                </h2>
                {coverLetter ? (
                  <div className="mt-3 text-sm">
                    <a
                      href={coverLetter.url}
                      target="_blank"
                      className="text-indigo-600 underline"
                    >
                      {coverLetter.filename}
                    </a>
                    <button
                      onClick={() => handleDelete("coverLetter")}
                      className="ml-4 text-red-500 hover:underline"
                    >
                      <Trash2 className="inline w-4 h-4 mr-1" /> Delete
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full px-4 py-3 mt-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <Upload className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-600">
                      Upload Cover Letter (PDF/DOC)
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "coverLetter")}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
