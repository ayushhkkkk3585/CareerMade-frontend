"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

    fetch("http://localhost:5000/api/employer/profile", {
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

  if (loading) return <p className="p-8">Loading profile...</p>;
  if (error)
    return (
      <div className="p-8 text-red-600">
        <p>{error}</p>
        <button
          onClick={() => router.push("/dashboard/employee/profile/create")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Profile
        </button>
      </div>
    );

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-6">{profile.organizationName}</h1>

      <div className="space-y-4">
        <p>
          <strong>Type:</strong> {profile.organizationType}
        </p>
        <p>
          <strong>Description:</strong> {profile.description || "N/A"}
        </p>
        <p>
          <strong>Website:</strong>{" "}
          <a href={profile.website} className="text-blue-600" target="_blank">
            {profile.website}
          </a>
        </p>
        <p>
          <strong>Founded:</strong> {profile.foundedYear || "N/A"}
        </p>
        <p>
          <strong>Employee Count:</strong> {profile.employeeCount || "N/A"}
        </p>

        <h2 className="text-xl font-semibold mt-6">Contact Person</h2>
        <p>{profile.contactPerson?.name}</p>
        <p>{profile.contactPerson?.designation}</p>
        <p>{profile.contactPerson?.phone}</p>
        <p>{profile.contactPerson?.email}</p>

        <h2 className="text-xl font-semibold mt-6">Address</h2>
        <p>
          {profile.address?.street}, {profile.address?.city},{" "}
          {profile.address?.state} {profile.address?.pincode},{" "}
          {profile.address?.country}
        </p>

        <h2 className="text-xl font-semibold mt-6">Specializations</h2>
        <p>{profile.specializations?.join(", ") || "None"}</p>
      </div>

      <button
        onClick={() => router.push("/dashboard/employee/profile/create")}
        className="mt-6 bg-green-600 text-white px-4 py-2 rounded"
      >
        Edit Profile
      </button>
    </div>
  );
}
