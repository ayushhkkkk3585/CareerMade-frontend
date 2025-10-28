"use client";
import { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  Trash2,
  User,
  Briefcase,
  Loader2,
  File,
  Save,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";

export default function JobSeekerDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [resume, setResume] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  // ---------------- FETCH PROFILE ----------------
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5000/api/jobseeker/profile", {
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
  }, []);

  // ---------------- HANDLE PROFILE UPDATE ----------------
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/jobseeker/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok) alert("Profile updated!");
      else alert(data.message || "Update failed");
    } catch {
      alert("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- HANDLE FILE UPLOAD ----------------
  const handleFileUpload = async (e: any, type: "resume" | "coverLetter") => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(type, file);

    const endpoint =
      type === "resume"
        ? "http://localhost:5000/api/jobseeker/resume"
        : "http://localhost:5000/api/jobseeker/cover-letter";

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

  const handleDelete = async (type: "resume" | "coverLetter") => {
    if (!confirm(`Delete ${type}?`)) return;

    const endpoint =
      type === "resume"
        ? "http://localhost:5000/api/jobseeker/resume"
        : "http://localhost:5000/api/jobseeker/cover-letter";

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

  // ---------------- UI ----------------
  if (loading)
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin text-indigo-500 w-8 h-8 mb-3" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );

  if (!profile)
    return (
      <div className="p-6 text-center text-red-500">
        Profile not found. Please create one.
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-8 my-10 border border-gray-100">
        {/* Header */}
        <div className="flex items-center gap-3 border-b pb-4 mb-6">
          <User className="text-indigo-600 w-8 h-8" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Job Seeker Profile
            </h1>
            <p className="text-sm text-gray-500">
              Manage your profile, resume, and cover letter
            </p>
          </div>
        </div>

        {/* PROFILE FORM */}
        <form onSubmit={handleSave} className="space-y-5">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            Profile Information
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
                name="specialization"
                value={profile.specialization || ""}
                onChange={handleChange}
                className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Pediatrics"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Experience (years)</label>
              <input
                type="number"
                name="experience"
                value={profile.experience || ""}
                onChange={handleChange}
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
            className="flex items-center gap-2 bg-[#8F59ED] hover:bg-[#5e399d] text-white px-6 py-2.5 rounded-lg shadow-md transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" /> Saving...
              </>
            ) : (
              <>
                <Save  className=" w-4 h-4 " /> Save Profile
              </>
            )}
          </button>
        </form>

        {/* FILE SECTIONS */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
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
              <div className="mt-4">
                <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <Upload className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    Upload your resume (PDF/DOC)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "resume")}
                  />
                </label>
              </div>
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
              <div className="mt-4">
                <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <Upload className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    Upload your cover letter (PDF/DOC)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "coverLetter")}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
