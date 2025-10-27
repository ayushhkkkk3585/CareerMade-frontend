"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    specialization: "",
    description: "",
    jobType: "Full-time",
    shift: "Day",
    minYears: "",
    maxYears: "",
    minSalary: "",
    maxSalary: "",
    currency: "INR",
    period: "Annual",
    isRemote: false,
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("accessToken");

    const payload = {
      title: formData.title,
      specialization: formData.specialization,
      description: formData.description,
      jobType: formData.jobType,
      shift: formData.shift,
      experienceRequired: {
        minYears: Number(formData.minYears),
        maxYears: Number(formData.maxYears),
      },
      salary: {
        min: Number(formData.minSalary),
        max: Number(formData.maxSalary),
        currency: formData.currency,
        period: formData.period,
      },
      isRemote: formData.isRemote,
    };

    try {
      const res = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Job created successfully!");
        router.push("/dashboard/employee/jobs");
      } else {
        alert(data.message || "Error creating job");
      }
    } catch (err) {
      console.error("Error creating job:", err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "700px", margin: "auto" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "16px" }}>
        Create Job
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input name="title" placeholder="Job Title" value={formData.title} onChange={handleChange} required />
        <input name="specialization" placeholder="Specialization" value={formData.specialization} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} rows={4} />

        <div style={{ display: "flex", gap: "10px" }}>
          <select name="jobType" value={formData.jobType} onChange={handleChange}>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </select>

          <select name="shift" value={formData.shift} onChange={handleChange}>
            <option>Day</option>
            <option>Night</option>
            <option>Rotating</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <input name="minYears" type="number" placeholder="Min Exp (yrs)" value={formData.minYears} onChange={handleChange} />
          <input name="maxYears" type="number" placeholder="Max Exp (yrs)" value={formData.maxYears} onChange={handleChange} />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <input name="minSalary" type="number" placeholder="Min Salary" value={formData.minSalary} onChange={handleChange} />
          <input name="maxSalary" type="number" placeholder="Max Salary" value={formData.maxSalary} onChange={handleChange} />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <select name="currency" value={formData.currency} onChange={handleChange}>
            <option>INR</option>
            <option>USD</option>
          </select>

          <select name="period" value={formData.period} onChange={handleChange}>
            <option>Annual</option>
            <option>Monthly</option>
            <option>Hourly</option>
          </select>
        </div>

        <label>
          <input type="checkbox" name="isRemote" checked={formData.isRemote} onChange={handleChange} /> Remote Job
        </label>

        <button type="submit" disabled={loading} style={{ padding: "10px 16px", background: "#2563eb", color: "white", border: "none", borderRadius: "6px" }}>
          {loading ? "Creating..." : "Create Job"}
        </button>
      </form>
    </div>
  );
}
