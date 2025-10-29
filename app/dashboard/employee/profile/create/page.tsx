"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

export default function EmployerProfileCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "",
    description: "",
    website: "",
    foundedYear: "",
    employeeCount: "",
    contactPersonName: "",
    contactPersonDesignation: "",
    contactPersonPhone: "",
    contactPersonEmail: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    specializations: "",
  });

  // ✅ Fetch profile on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employer/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data?.data?.employer) {
          const p = data.data.employer;
          setFormData({
            organizationName: p.organizationName || "",
            organizationType: p.organizationType || "",
            description: p.description || "",
            website: p.website || "",
            foundedYear: p.foundedYear || "",
            employeeCount: p.employeeCount || "",
            contactPersonName: p.contactPerson?.name || "",
            contactPersonDesignation: p.contactPerson?.designation || "",
            contactPersonPhone: p.contactPerson?.phone || "",
            contactPersonEmail: p.contactPerson?.email || "",
            street: p.address?.street || "",
            city: p.address?.city || "",
            state: p.address?.state || "",
            pincode: p.address?.pincode || "",
            country: p.address?.country || "",
            specializations: p.specializations?.join(", ") || "",
          });
          setIsEditing(true);
        }
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, []);

  // 🧠 Handle change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 Submit (Create / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    if (!token) return alert("Please log in again");

    const payload = {
      organizationName: formData.organizationName,
      organizationType: formData.organizationType,
      description: formData.description,
      website: formData.website,
      foundedYear: Number(formData.foundedYear),
      employeeCount: formData.employeeCount,
      contactPerson: {
        name: formData.contactPersonName,
        designation: formData.contactPersonDesignation,
        phone: formData.contactPersonPhone,
        email: formData.contactPersonEmail,
      },
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
      },
      specializations: formData.specializations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employer/profile`, {
        method: "POST", // same endpoint for create or update
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert(isEditing ? "Profile updated successfully!" : "Profile created successfully!");
        router.push("/dashboard/employee/profile");
      } else {
        alert(data.message || "Failed to save profile");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving the profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
     <Navbar />

      <div className="max-w-4xl mx-auto p-6 sm:p-8 mt-8 bg-white rounded-2xl shadow-md border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {isEditing ? "Edit Employer Profile" : "Create Employer Profile"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the details below to manage your organization profile.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/employee/profile/view")}
            className="mt-4 sm:mt-0 px-4 py-2.5 bg-[#8F59ED] text-white rounded-lg text-sm font-medium hover:bg-[#7a48d1] transition-all"
          >
            View Profile
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 ">
          {/* Organization Info */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Organization Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="organizationName"
                placeholder="Organization Name *"
                value={formData.organizationName}
                onChange={handleChange}
                required
                className="input-field"
              />
              <input
                type="text"
                name="organizationType"
                placeholder="Organization Type"
                value={formData.organizationType}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="website"
                placeholder="Website"
                value={formData.website}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="number"
                name="foundedYear"
                placeholder="Founded Year"
                value={formData.foundedYear}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="employeeCount"
                placeholder="Employee Count"
                value={formData.employeeCount}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <textarea
              name="description"
              placeholder="Organization Description"
              value={formData.description}
              onChange={handleChange}
              className="input-field mt-4 h-24"
            />
          </section>

          {/* Contact Person */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Contact Person
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="contactPersonName"
                placeholder="Name"
                value={formData.contactPersonName}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="contactPersonDesignation"
                placeholder="Designation"
                value={formData.contactPersonDesignation}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="contactPersonPhone"
                placeholder="Phone"
                value={formData.contactPersonPhone}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="email"
                name="contactPersonEmail"
                placeholder="Email"
                value={formData.contactPersonEmail}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </section>

          {/* Address */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="street"
                placeholder="Street"
                value={formData.street}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </section>

          {/* Specializations */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Specializations
            </h2>
            <input
              type="text"
              name="specializations"
              placeholder="Comma-separated (e.g., Nursing, Radiology)"
              value={formData.specializations}
              onChange={handleChange}
              className="input-field"
            />
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#8F59ED] text-white rounded-lg font-medium hover:bg-[#7a48d1] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? "Saving..."
                : isEditing
                ? "Update Profile"
                : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
