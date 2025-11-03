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
  // helper UI state
  const specializationsOptions = [
    'General Medicine','Cardiology','Neurology','Orthopedics','Pediatrics','Gynecology','Dermatology','Psychiatry','Radiology','Anesthesiology','Emergency Medicine','Internal Medicine','Surgery','Oncology','Pathology','Ophthalmology','ENT','Urology','Gastroenterology','Pulmonology','Endocrinology','Rheumatology','Nephrology','Hematology','Infectious Disease','Physical Therapy','Occupational Therapy','Speech Therapy','Nursing','Pharmacy','Medical Technology','Other'
  ];

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  // ---------------- FETCH PROFILE ----------------
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
  }, []);

  // ---------------- HANDLE PROFILE UPDATE ----------------
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  // update nested profile fields using a dot-path string (e.g. "experience.totalYears" or "education.0.degree")
  const updateProfileAtPath = (path: string, value: any) => {
    setProfile((prev: any) => {
      const base = prev ? JSON.parse(JSON.stringify(prev)) : {};
      const parts = path.split('.');
      let cur: any = base;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isIndex = /^\d+$/.test(part);
        // last part -> set
        if (i === parts.length - 1) {
          if (isIndex) {
            const idx = parseInt(part, 10);
            if (!Array.isArray(cur)) cur = [];
            cur[idx] = value;
          } else {
            cur[part] = value;
          }
        } else {
          // ensure next exists
          if (isIndex) {
            const idx = parseInt(part, 10);
            if (!Array.isArray(cur)) {
              // if cur is root and not array, replace with array in parent
              // but simplest: create array and continue
              cur = [];
            }
            if (!cur[idx]) cur[idx] = {};
            cur = cur[idx];
          } else {
            if (!cur[part]) {
              // decide next part: if next token is a number, create array
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
      // only support single-level array path like "specializations" or "jobPreferences.preferredJobTypes"
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

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      console.log(data);
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
                {/* other text when "Other" selected */}
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

            {/* Experience expanded */}
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

            <div>
              <label className="text-sm text-gray-600">Current Position</label>
              <input
                type="text"
                value={profile.experience?.currentPosition || ''}
                onChange={(e) => updateProfileAtPath('experience.currentPosition', e.target.value)}
                className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Senior Nurse"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Current Company</label>
              <input
                type="text"
                value={profile.experience?.currentCompany || ''}
                onChange={(e) => updateProfileAtPath('experience.currentCompany', e.target.value)}
                className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. City Hospital"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="isCurrentlyEmployed"
                type="checkbox"
                checked={profile.experience?.isCurrentlyEmployed ?? true}
                onChange={(e) => updateProfileAtPath('experience.isCurrentlyEmployed', e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="isCurrentlyEmployed" className="text-sm text-gray-600">Currently Employed</label>
            </div>

            {/* Bio full width */}
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

            {/* Education - single entry (education[0]) */}
            <div>
              <label className="text-sm text-gray-600">Highest Degree</label>
              <input
                type="text"
                value={profile.education?.[0]?.degree || ''}
                onChange={(e) => updateProfileAtPath('education.0.degree', e.target.value)}
                className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. MBBS"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Field</label>
              <input
                type="text"
                value={profile.education?.[0]?.field || ''}
                onChange={(e) => updateProfileAtPath('education.0.field', e.target.value)}
                className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Pediatrics"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Institution</label>
              <input
                type="text"
                value={profile.education?.[0]?.institution || ''}
                onChange={(e) => updateProfileAtPath('education.0.institution', e.target.value)}
                className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. ABC Medical College"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Year of Completion</label>
              <input
                type="number"
                value={profile.education?.[0]?.yearOfCompletion ?? ''}
                onChange={(e) => updateProfileAtPath('education.0.yearOfCompletion', e.target.value === '' ? undefined : Number(e.target.value))}
                className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                min={1950}
                max={new Date().getFullYear() + 5}
              />
            </div>

            {/* Work Experience - single entry */}
            <div>
              <label className="text-sm text-gray-600">Recent Position</label>
              <input
                type="text"
                value={profile.workExperience?.[0]?.position || ''}
                onChange={(e) => updateProfileAtPath('workExperience.0.position', e.target.value)}
                className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Charge Nurse"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Company / Hospital</label>
              <input
                type="text"
                value={profile.workExperience?.[0]?.company || ''}
                onChange={(e) => updateProfileAtPath('workExperience.0.company', e.target.value)}
                className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. City Hospital"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Location</label>
              <input
                type="text"
                value={profile.workExperience?.[0]?.location || ''}
                onChange={(e) => updateProfileAtPath('workExperience.0.location', e.target.value)}
                className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="City, State"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Start Date</label>
              <input
                type="date"
                value={profile.workExperience?.[0]?.startDate ? new Date(profile.workExperience[0].startDate).toISOString().slice(0,10) : ''}
                onChange={(e) => updateProfileAtPath('workExperience.0.startDate', e.target.value ? new Date(e.target.value) : undefined)}
                className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">End Date</label>
              <input
                type="date"
                value={profile.workExperience?.[0]?.endDate ? new Date(profile.workExperience[0].endDate).toISOString().slice(0,10) : ''}
                onChange={(e) => updateProfileAtPath('workExperience.0.endDate', e.target.value ? new Date(e.target.value) : undefined)}
                className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Skills (comma separated) */}
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-600">Skills (comma separated)</label>
              <input
                type="text"
                value={(Array.isArray(profile.skills) ? profile.skills.map((s:any)=>s.name).join(', ') : '')}
                onChange={(e) => {
                  const arr = e.target.value.split(',').map((s:any)=>s.trim()).filter(Boolean).map((n:string)=>({ name: n, level: 'Intermediate' }));
                  updateProfileAtPath('skills', arr);
                }}
                className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. IV cannulation, patient assessment, CPR"
              />
            </div>

            {/* Job Preferences - one location */}
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
                {['Full-time','Part-time','Contract','Freelance','Internship','Volunteer'].map((jt)=> (
                  <label key={jt} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={profile.jobPreferences?.preferredJobTypes?.includes(jt)} onChange={()=>toggleArrayValue('jobPreferences.preferredJobTypes', jt)} className="w-4 h-4" />
                    <span>{jt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Privacy settings */}
            <div className="sm:col-span-2 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700">Privacy Settings</h3>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2"><input type="checkbox" checked={profile.privacySettings?.showContactInfo ?? true} onChange={(e)=>updateProfileAtPath('privacySettings.showContactInfo', e.target.checked)} className="w-4 h-4"/> Show contact info</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={profile.privacySettings?.showCurrentSalary ?? false} onChange={(e)=>updateProfileAtPath('privacySettings.showCurrentSalary', e.target.checked)} className="w-4 h-4"/> Show current salary</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={profile.privacySettings?.showProfileToEmployers ?? true} onChange={(e)=>updateProfileAtPath('privacySettings.showProfileToEmployers', e.target.checked)} className="w-4 h-4"/> Show profile to employers</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={profile.privacySettings?.allowDirectMessages ?? true} onChange={(e)=>updateProfileAtPath('privacySettings.allowDirectMessages', e.target.checked)} className="w-4 h-4"/> Allow direct messages</label>
              </div>
            </div>

            {/* Profile completion read-only */}
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-600">Profile Completion</label>
              <div className="mt-1 text-sm text-indigo-700 font-medium">{profile.profileCompletion ?? 0}%</div>
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
                <Save className=" w-4 h-4 " /> Save Profile
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
