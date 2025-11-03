"use client";
// bg-linear-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6]
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
  Mail,
  Phone,
} from "lucide-react";
import GradientLoader from "@/app/components/GradientLoader";
import { toast } from "react-hot-toast";

export default function JobSeekerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // helper UI state & nested update helpers (same approach as create page)
  const specializationsOptions = [
    'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Dermatology', 'Psychiatry', 'Radiology', 'Anesthesiology', 'Emergency Medicine', 'Internal Medicine', 'Surgery', 'Oncology', 'Pathology', 'Ophthalmology', 'ENT', 'Urology', 'Gastroenterology', 'Pulmonology', 'Endocrinology', 'Rheumatology', 'Nephrology', 'Hematology', 'Infectious Disease', 'Physical Therapy', 'Occupational Therapy', 'Speech Therapy', 'Nursing', 'Pharmacy', 'Medical Technology', 'Other'
  ];

  const updateProfileAtPath = (path: string, value: any) => {
    setProfile((prev: any) => {
      const base = prev ? JSON.parse(JSON.stringify(prev)) : {};
      const parts = path.split('.');
      let cur: any = base;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isIndex = /^\d+$/.test(part);
        if (i === parts.length - 1) {
          if (isIndex) {
            const idx = parseInt(part, 10);
            if (!Array.isArray(cur)) cur = [];
            cur[idx] = value;
          } else {
            cur[part] = value;
          }
        } else {
          if (isIndex) {
            const idx = parseInt(part, 10);
            if (!Array.isArray(cur)) cur = [];
            if (!cur[idx]) cur[idx] = {};
            cur = cur[idx];
          } else {
            if (!cur[part]) {
              const next = parts[i + 1];
              cur[part] = /^\d+$/.test(next) ? [] : {};
            }
            cur = cur[part];
          }
        }
      }
      return base;
    });
  };

  const toggleArrayValue = (path: string, value: string) => {
    setProfile((prev: any) => {
      const base = prev ? JSON.parse(JSON.stringify(prev)) : {};
      const parts = path.split('.');
      let arrParent: any = base;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (!arrParent[p]) arrParent[p] = {};
        arrParent = arrParent[p];
      }
      const key = parts[parts.length - 1];
      if (!Array.isArray(arrParent[key])) arrParent[key] = [];
      const idx = arrParent[key].indexOf(value);
      if (idx === -1) arrParent[key].push(value);
      else arrParent[key].splice(idx, 1);
      return base;
    });
  };

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
        console.log(data);
        const seeker = data.data?.jobSeeker || data;
        setProfile(seeker);
        setResume(seeker.resume || null);
        setCoverLetter(seeker.coverLetter || null);
      })
      .catch(() => toast.error("Failed to fetch profile"))
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
      if (res.ok) toast.error("Profile updated!");
      else toast.error(data.message || "Update failed");
    } catch {
      toast.error("Error updating profile");
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
      toast.error(`${type === "resume" ? "Resume" : "Cover letter"} uploaded!`);
    } else toast.error(data.message || "Upload failed");
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
      toast.error(`${type} deleted!`);
    } else toast.error("Failed to delete");
  };

  // ---------------- LOADING STATES ----------------
 if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <GradientLoader />
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
          <div className="absolute inset-0 bg-linear-to-r from-[#001b3e]/90 via-[#002b6b]/60 to-transparent"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                Job Seeker{" "}
                <span className="bg-linear-to-r from-[#00A3FF] to-[#00E0FF] bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
              <p className="text-base sm:text-lg text-blue-100 mt-3">
                Manage your profile, resume, and cover letter to apply for jobs seamlessly.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-start sm:justify-end w-full sm:w-auto">
              <button
                onClick={() => router.push("/dashboard/jobseeker/profile")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white rounded-full text-sm sm:text-base font-semibold transition-all shadow-lg whitespace-nowrap"
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
          <div className="bg-white rounded-2xl shadow-sm p-6 border sm:h-64 border-gray-100 flex flex-col items-center text-center">
            {/* Profile Icon */}
            <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <User2 className="w-12 h-12 text-gray-400" />
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <div className="flex flex-col items-center gap-1 mb-2">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <p className="text-sm text-gray-500">{user?.phone}</p>
              </div>
            </div>


            {/* <div className="w-full border-t border-gray-200 my-4"></div> */}

            {/* ===== Edit Profile Button ===== */}
            {/* <button
              onClick={() =>
                router.push("/dashboard/jobseeker/profile/edit")
              }
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-linear-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white rounded-lg text-sm font-medium shadow-md transition-all"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button> */}
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
                    onChange={(e) => updateProfileAtPath('title', e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Registered Nurse"
                  />
                </div>

                {/* Specializations (multi) */}
                <div>
                  <label className="text-sm text-gray-600">Specializations</label>
                  <div className="mt-2 max-h-40 overflow-auto border rounded p-2">
                    {specializationsOptions.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-sm mb-1">
                        <input
                          type="checkbox"
                          checked={Array.isArray(profile.specializations) ? profile.specializations.includes(opt) : false}
                          onChange={() => toggleArrayValue('specializations', opt)}
                          className="w-4 h-4"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                    {Array.isArray(profile.specializations) && profile.specializations.includes('Other') && (
                      <input
                        type="text"
                        value={profile.specializationsOther || ''}
                        onChange={(e) => updateProfileAtPath('specializationsOther', e.target.value)}
                        className="mt-2 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Please specify other specialization"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Total Experience (years)</label>
                  <input
                    type="number"
                    value={profile.experience?.totalYears ?? ''}
                    onChange={(e) => updateProfileAtPath('experience.totalYears', e.target.value === '' ? undefined : Number(e.target.value))}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. 3"
                    min={0}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600">Bio</label>
                  <textarea
                    name="bio"
                    value={profile.bio || ""}
                    onChange={(e) => updateProfileAtPath('bio', e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[90px]"
                    placeholder="Write something about yourself..."
                  />
                </div>

                {/* Education (single entry) */}
                <div className="sm:col-span-2 border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Education</h3>
                  {(profile.education || []).map((edu: any, index: number) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 border p-3 rounded-lg bg-gray-50">
                      <select
                        value={edu.degree || ""}
                        onChange={(e) => updateProfileAtPath(`education.${index}.degree`, e.target.value)}
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="">Select Degree</option>
                        {['MBBS', 'MD', 'MS', 'BDS', 'MDS', 'BPT', 'MPT', 'BSc Nursing', 'MSc Nursing', 'BPharm', 'MPharm', 'BSc', 'MSc', 'PhD', 'Diploma', 'Certificate', 'Other'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Field"
                        value={edu.field || ""}
                        onChange={(e) => updateProfileAtPath(`education.${index}.field`, e.target.value)}
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Institution"
                        value={edu.institution || ""}
                        onChange={(e) => updateProfileAtPath(`education.${index}.institution`, e.target.value)}
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Year of Completion"
                        value={edu.yearOfCompletion || ""}
                        onChange={(e) =>
                          updateProfileAtPath(`education.${index}.yearOfCompletion`, e.target.value === '' ? undefined : Number(e.target.value))
                        }
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        min={1950}
                        max={new Date().getFullYear() + 5}
                      />
                      <input
                        type="text"
                        placeholder="Grade (optional)"
                        value={edu.grade || ""}
                        onChange={(e) => updateProfileAtPath(`education.${index}.grade`, e.target.value)}
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setProfile((prev: any) => ({
                            ...prev,
                            education: prev.education.filter((_: any, i: number) => i !== index),
                          }))
                        }
                        className="text-red-500 text-sm mt-1 hover:underline col-span-full text-right"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setProfile((prev: any) => ({
                        ...prev,
                        education: [...(profile.education || []), {}],
                      }))
                    }
                    className="mt-2 text-indigo-600 text-sm font-medium hover:underline"
                  >
                    + Add Education
                  </button>
                </div>

                {/* Work Experience (multiple) */}
                {/* === Work Experience (multiple) === */}
                <div className="sm:col-span-2 border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Work Experience</h3>
                  {(profile.workExperience || []).map((exp: any, index: number) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 border p-3 rounded-lg bg-gray-50">
                      <input
                        type="text"
                        placeholder="Position"
                        value={exp.position || ""}
                        onChange={(e) => updateProfileAtPath(`workExperience.${index}.position`, e.target.value)}
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Company / Hospital"
                        value={exp.company || ""}
                        onChange={(e) => updateProfileAtPath(`workExperience.${index}.company`, e.target.value)}
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={exp.location || ""}
                        onChange={(e) => updateProfileAtPath(`workExperience.${index}.location`, e.target.value)}
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="date"
                        value={exp.startDate ? new Date(exp.startDate).toISOString().slice(0, 10) : ""}
                        onChange={(e) => updateProfileAtPath(`workExperience.${index}.startDate`, e.target.value)}
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="date"
                        value={exp.endDate ? new Date(exp.endDate).toISOString().slice(0, 10) : ""}
                        onChange={(e) => updateProfileAtPath(`workExperience.${index}.endDate`, e.target.value)}
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setProfile((prev: any) => ({
                            ...prev,
                            workExperience: prev.workExperience.filter((_: any, i: number) => i !== index),
                          }))
                        }
                        className="text-red-500 text-sm mt-1 hover:underline col-span-full text-right"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setProfile((prev: any) => ({
                        ...prev,
                        workExperience: [...(prev.workExperience || []), {}],
                      }))
                    }
                    className="mt-2 text-indigo-600 text-sm font-medium hover:underline"
                  >
                    + Add Work Experience
                  </button>
                </div>

                {/* Skills (comma separated) full width */}
                <div className="sm:col-span-2 border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(profile.skills || []).map((s: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 border rounded-full px-3 py-1 bg-gray-100">
                        <span>{s.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setProfile((prev: any) => ({
                              ...prev,
                              skills: prev.skills.filter((_: any, i: number) => i !== index),
                            }))
                          }
                          className="text-red-500 text-xs hover:underline"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a skill and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value.trim()) {
                        e.preventDefault();
                        const skill = { name: e.currentTarget.value.trim(), level: "Intermediate" };
                        setProfile((prev: any) => ({
                          ...prev,
                          skills: [...(prev.skills || []), skill],
                        }));
                        e.currentTarget.value = "";
                      }
                    }}
                    className="mt-3 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Job Preferences: one location and job types */}
                <div>
                  <label className="text-sm text-gray-600">Preferred City</label>
                  <input
                    type="text"
                    value={profile.jobPreferences?.preferredLocations?.[0]?.city || ''}
                    onChange={(e) => updateProfileAtPath('jobPreferences.preferredLocations.0.city', e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Mumbai"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Preferred State</label>
                  <input
                    type="text"
                    value={profile.jobPreferences?.preferredLocations?.[0]?.state || ''}
                    onChange={(e) => updateProfileAtPath('jobPreferences.preferredLocations.0.state', e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Maharashtra"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Preferred Country</label>
                  <input
                    type="text"
                    value={profile.jobPreferences?.preferredLocations?.[0]?.country || 'India'}
                    onChange={(e) => updateProfileAtPath('jobPreferences.preferredLocations.0.country', e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600">Preferred Job Types</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Volunteer'].map((jt) => (
                      <label key={jt} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={profile.jobPreferences?.preferredJobTypes?.includes(jt)} onChange={() => toggleArrayValue('jobPreferences.preferredJobTypes', jt)} className="w-4 h-4" />
                        <span>{jt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Privacy settings and profile completion */}
                <div className="sm:col-span-2 border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700">Privacy Settings</h3>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={profile.privacySettings?.showContactInfo ?? true} onChange={(e) => updateProfileAtPath('privacySettings.showContactInfo', e.target.checked)} className="w-4 h-4" /> Show contact info</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={profile.privacySettings?.showCurrentSalary ?? false} onChange={(e) => updateProfileAtPath('privacySettings.showCurrentSalary', e.target.checked)} className="w-4 h-4" /> Show current salary</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={profile.privacySettings?.showProfileToEmployers ?? true} onChange={(e) => updateProfileAtPath('privacySettings.showProfileToEmployers', e.target.checked)} className="w-4 h-4" /> Show profile to employers</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={profile.privacySettings?.allowDirectMessages ?? true} onChange={(e) => updateProfileAtPath('privacySettings.allowDirectMessages', e.target.checked)} className="w-4 h-4" /> Allow direct messages</label>
                  </div>
                </div>
                {/* Certifications (multiple) */}
                <div className="sm:col-span-2 border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Certifications</h3>
                  {(profile.certifications || []).map((cert: any, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 border p-3 rounded-lg bg-gray-50"
                    >
                      <input
                        type="text"
                        placeholder="Certification Name"
                        value={cert.name || ""}
                        onChange={(e) =>
                          updateProfileAtPath(`certifications.${index}.name`, e.target.value)
                        }
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Issuing Organization"
                        value={cert.issuingOrganization || ""}
                        onChange={(e) =>
                          updateProfileAtPath(`certifications.${index}.issuingOrganization`, e.target.value)
                        }
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="date"
                        placeholder="Issue Date"
                        value={cert.issueDate ? new Date(cert.issueDate).toISOString().slice(0, 10) : ""}
                        onChange={(e) =>
                          updateProfileAtPath(`certifications.${index}.issueDate`, e.target.value ? new Date(e.target.value).toISOString() : "")
                        }
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="date"
                        placeholder="Expiry Date (optional)"
                        value={cert.expiryDate ? new Date(cert.expiryDate).toISOString().slice(0, 10) : ""}
                        onChange={(e) =>
                          updateProfileAtPath(`certifications.${index}.expiryDate`, e.target.value ? new Date(e.target.value).toISOString() : "")
                        }
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Credential ID (optional)"
                        value={cert.credentialId || ""}
                        onChange={(e) =>
                          updateProfileAtPath(`certifications.${index}.credentialId`, e.target.value)
                        }
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="url"
                        placeholder="Credential URL (optional)"
                        value={cert.credentialUrl || ""}
                        onChange={(e) =>
                          updateProfileAtPath(`certifications.${index}.credentialUrl`, e.target.value)
                        }
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setProfile((prev: any) => ({
                            ...prev,
                            certifications: prev.certifications.filter(
                              (_: any, i: number) => i !== index
                            ),
                          }))
                        }
                        className="text-red-500 text-sm mt-1 hover:underline col-span-full text-right"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setProfile((prev: any) => ({
                        ...prev,
                        certifications: [...(prev.certifications || []), {}],
                      }))
                    }
                    className="mt-2 text-indigo-600 text-sm font-medium hover:underline"
                  >
                    + Add Certification
                  </button>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600">Profile Completion</label>
                  <div className="mt-1 text-sm text-indigo-700 font-medium">{profile.profileCompletion ?? 0}%</div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-linear-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white px-6 py-2.5 rounded-lg shadow-md transition-all"
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
