"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

    fetch("http://localhost:5000/api/employer/profile", {
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
      const res = await fetch("http://localhost:5000/api/employer/profile", {
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
    <div className="p-8 max-w-3xl mx-auto bg-white shadow-md rounded-xl">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Employer Profile" : "Create Employer Profile"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Organization Info */}
        <input
          type="text"
          name="organizationName"
          placeholder="Organization Name"
          value={formData.organizationName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="organizationType"
          placeholder="Organization Type"
          value={formData.organizationType}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="website"
          placeholder="Website"
          value={formData.website}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="foundedYear"
          placeholder="Founded Year"
          value={formData.foundedYear}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="employeeCount"
          placeholder="Employee Count"
          value={formData.employeeCount}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* Contact Person */}
        <h2 className="text-lg font-semibold mt-4">Contact Person</h2>
        <input
          type="text"
          name="contactPersonName"
          placeholder="Name"
          value={formData.contactPersonName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="contactPersonDesignation"
          placeholder="Designation"
          value={formData.contactPersonDesignation}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="contactPersonPhone"
          placeholder="Phone"
          value={formData.contactPersonPhone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="contactPersonEmail"
          placeholder="Email"
          value={formData.contactPersonEmail}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* Address */}
        <h2 className="text-lg font-semibold mt-4">Address</h2>
        <input
          type="text"
          name="street"
          placeholder="Street"
          value={formData.street}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="pincode"
          placeholder="Pincode"
          value={formData.pincode}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="country"
          placeholder="Country"
          value={formData.country}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* Specializations */}
        <h2 className="text-lg font-semibold mt-4">Specializations</h2>
        <input
          type="text"
          name="specializations"
          placeholder="Comma-separated (e.g., Nursing, Radiology)"
          value={formData.specializations}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-4"
        >
          {loading ? "Saving..." : isEditing ? "Update Profile" : "Create Profile"}
        </button>
      </form>
    </div>
  );
}
