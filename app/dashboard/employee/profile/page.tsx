"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { ArrowLeft, User2, Edit } from "lucide-react";
import GradientLoader from "@/app/components/GradientLoader";
import toast from "react-hot-toast";

export default function ViewEmployerProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employer/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) setProfile(data.data.employer);
        else setError(data.message || "Profile not found");
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [router]);

 if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <GradientLoader />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center px-6">
        <p className="text-gray-700 mb-4">{error}</p>
        <button
          onClick={() => router.push("/dashboard/employee/profile/create")}
          className="bg-[#8F59ED] hover:bg-[#7c4dd4] text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all"
        >
          Create Profile
        </button>
      </div>
    );

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
                Employee{" "}
                <span className="bg-gradient-to-r from-[#00A3FF] to-[#00E0FF] bg-clip-text text-transparent">
                  Profile
                </span>
              </h1>
              <p className="text-base sm:text-lg text-blue-100 mt-3">
                Explore verified opportunities from India’s leading hospitals and healthcare facilities.
              </p>
            </div>

            {/* <div className="flex flex-wrap gap-3 justify-start sm:justify-end w-full sm:w-auto">
              <button
                onClick={() => router.push("/dashboard/employee/jobs")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white rounded-full text-sm sm:text-base font-semibold transition-all shadow-lg whitespace-nowrap"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {/* ===== PROFILE SECTION ===== */}
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ===== LEFT COLUMN ===== */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col items-center text-center">
            {/* Profile Picture */}
            <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <User2 className="w-12 h-12 text-gray-400" />
            </div>

            {/* Contact Info */}
            <h2 className="text-lg font-semibold text-gray-900">
              {profile.contactPerson?.name || "N/A"}
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              {profile.contactPerson?.designation || "—"}
            </p>

            <div className="w-full border-t border-gray-200 my-4"></div>

            <div className="text-sm text-gray-700 space-y-2 mb-5">
              <p>{profile.contactPerson?.phone || "—"}</p>
              <p>{profile.contactPerson?.email || "—"}</p>
            </div>

            {/* ===== Edit Profile Button ===== */}
            <button
              onClick={() =>
                router.push("/dashboard/employee/profile/create")
              }
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white rounded-lg text-sm font-medium shadow-md transition-all"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-8 border border-gray-100 space-y-8">
            {/* About Section */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                About the Organization
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {profile.description || "No description provided."}
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
                <p>
                  <span className="font-medium text-gray-800">Founded:</span>{" "}
                  {profile.foundedYear || "N/A"}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Employee Count:</span>{" "}
                  {profile.employeeCount || "N/A"}
                </p>
                {profile.website && (
                  <p className="col-span-2">
                    <span className="font-medium text-gray-800">Website:</span>{" "}
                    <a
                      href={profile.website}
                      target="_blank"
                      className="text-[#155DFC] hover:underline"
                    >
                      {profile.website}
                    </a>
                  </p>
                )}
              </div>
            </section>

            {/* Address */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Address
              </h2>
              <p className="text-sm text-gray-600">
                {[
                  profile.address?.street,
                  profile.address?.city,
                  profile.address?.state,
                  profile.address?.pincode,
                  profile.address?.country,
                ]
                  .filter(Boolean)
                  .join(", ") || "N/A"}
              </p>
            </section>

            {/* Specializations */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Specializations
              </h2>
              <p className="text-sm text-gray-600">
                {profile.specializations?.length
                  ? profile.specializations.join(", ")
                  : "None"}
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
