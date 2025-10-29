"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">Loading profile...</p>
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
    <Navbar/>
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              {profile.organizationName}
            </h1>
            <p className="text-sm text-gray-500">
              {profile.organizationType || "Organization"}
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/employee/profile/create")}
            className="bg-[#8F59ED] hover:bg-[#7c4dd4] text-white px-5 py-2 rounded-lg font-medium shadow-md transition-all"
          >
            Edit Profile
          </button>
        </div>

        <hr className="border-gray-100 mb-6" />

        {/* Content Sections */}
        <div className="space-y-8 text-gray-700">
          {/* About */}
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
                <span className="font-medium text-gray-800">
                  Employee Count:
                </span>{" "}
                {profile.employeeCount || "N/A"}
              </p>
              {profile.website && (
                <p className="col-span-2">
                  <span className="font-medium text-gray-800">Website:</span>{" "}
                  <a
                    href={profile.website}
                    target="_blank"
                    className="text-[#8F59ED] hover:underline"
                  >
                    {profile.website}
                  </a>
                </p>
              )}
            </div>
          </section>

          {/* Contact Person */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Contact Person
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <p>{profile.contactPerson?.name || "N/A"}</p>
              <p>{profile.contactPerson?.designation || ""}</p>
              <p>{profile.contactPerson?.phone || ""}</p>
              <p>{profile.contactPerson?.email || ""}</p>
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
