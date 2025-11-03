"use client";

import { useState } from "react";
import { 
  Briefcase, 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Home, 
  Clock, 
  Tag, 
  Layers, 
  FileText,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import GradientLoader from "@/app/components/GradientLoader";
import toast from "react-hot-toast";

const FormSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-xl mb-6 border border-gray-200 shadow-sm">
    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
      {icon}
      {title}
    </h2>
    <div className="space-y-6">{children}</div>
  </div>
);

const FormField = ({ label, children, className = "", required = false }: { 
  label: string; 
  children: React.ReactNode; 
  className?: string;
  required?: boolean;
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

type ExperienceRequired = {
  minYears: string | number;
  maxYears: string | number;
};

type Salary = {
  min: string | number;
  max: string | number;
  currency: string;
  period: string;
};

type Location = {
  city: string;
  state: string;
  country: string;
};

interface FormData {
  title: string;
  specialization: string;
  description: string;
  jobType: string;
  shift: string;
  isRemote: boolean;
  experienceRequired: ExperienceRequired;
  salary: Salary;
  location: Location;
}

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<FormData>({
    title: "",
    specialization: "",
    description: "",
    jobType: "Full-time",
    shift: "Day",
    isRemote: false,
    experienceRequired: { minYears: "", maxYears: "" },
    salary: { min: "", max: "", currency: "INR", period: "Annual" },
    location: { city: "", state: "", country: "India" },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';
    
    if (formData.experienceRequired.minYears && formData.experienceRequired.maxYears) {
      if (Number(formData.experienceRequired.minYears) > Number(formData.experienceRequired.maxYears)) {
        newErrors.experience = 'Minimum years cannot be greater than maximum years';
      }
    }
    
    if (formData.salary.min && formData.salary.max) {
      if (Number(formData.salary.min) > Number(formData.salary.max)) {
        newErrors.salary = 'Minimum salary cannot be greater than maximum salary';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      setFormData(prev => {
        if (parent === 'experienceRequired' || parent === 'salary' || parent === 'location') {
          return {
            ...prev,
            [parent]: {
              ...(prev[parent as keyof FormData] as Record<string, any>),
              [child]: isCheckbox ? checked : value
            }
          };
        }
        return { ...prev };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: isCheckbox ? checked : value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please log in again to continue.");
      return;
    }

    const payload = {
      title: formData.title,
      specialization: formData.specialization,
      description: formData.description,
      jobType: formData.jobType,
      shift: formData.shift,
      isRemote: formData.isRemote,
      location: formData.isRemote ? undefined : {
        city: formData.location.city,
        state: formData.location.state,
        country: formData.location.country,
      },
      experienceRequired: {
        minYears: formData.experienceRequired.minYears ? Number(formData.experienceRequired.minYears) : 0,
        maxYears: formData.experienceRequired.maxYears ? Number(formData.experienceRequired.maxYears) : 0,
      },
      salary: {
        min: formData.salary.min ? Number(formData.salary.min) : 0,
        max: formData.salary.max ? Number(formData.salary.max) : 0,
        currency: formData.salary.currency,
        period: formData.salary.period,
      },
    };

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error creating job:", data);
        toast.error(data.message || "Failed to create job");
      } else {
        toast.success("Job created successfully!");
        router.push("/dashboard/employee/jobs");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong while creating the job.");
    } finally {
      setLoading(false);
    }
  };

 if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <GradientLoader />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header Banner */}
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
                Create{" "}
                <span className="bg-gradient-to-r from-[#00A3FF] to-[#00E0FF] bg-clip-text text-transparent">
                  Job Posting
                </span>
              </h1>
              <p className="text-base sm:text-lg text-blue-100 mt-3">
                Post a new job opportunity and find the perfect candidate for your team.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-start sm:justify-end w-full sm:w-auto">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white rounded-full text-sm sm:text-base font-semibold transition-all shadow-lg whitespace-nowrap"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Jobs
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-gray-50 rounded-2xl shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Job Information */}
            <FormSection title="Job Information" icon={<Briefcase className="w-5 h-5 text-[#007BFF]" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Job Title" required>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent transition-colors`}
                    placeholder="e.g. Doctor"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </FormField>

                <FormField label="Specialization" required>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 border ${errors.specialization ? 'border-red-300' : 'border-gray-300'} rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent transition-colors`}
                    placeholder="e.g. Nursing"
                  />
                  {errors.specialization && <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>}
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Job Description" required>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      className={`w-full px-3.5 py-2.5 border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent transition-colors`}
                      placeholder="Enter job description and requirements..."
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </FormField>
                </div>
              </div>
            </FormSection>

            {/* Job Type & Shift */}
            <FormSection title="Job Type & Shift" icon={<Clock className="w-5 h-5 text-[#007BFF]" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Job Type" required>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </FormField>

                <FormField label="Shift" required>
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent"
                  >
                    <option value="Day">Day</option>
                    <option value="Night">Night</option>
                    <option value="Rotating">Rotating</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </FormField>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRemote"
                    name="isRemote"
                    checked={formData.isRemote}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#007BFF] focus:ring-[#007BFF] border-gray-300 rounded"
                  />
                  <label htmlFor="isRemote" className="text-sm font-medium text-gray-700">
                    This is a remote position
                  </label>
                </div>
              </div>
            </FormSection>

            {/* Experience & Salary */}
            <FormSection title="Experience & Salary" icon={<DollarSign className="w-5 h-5 text-[#007BFF]" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Minimum Experience (years)">
                  <input
                    type="number"
                    name="experienceRequired.minYears"
                    value={formData.experienceRequired.minYears}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-3.5 py-2.5 border ${errors.experience ? 'border-red-300' : 'border-gray-300'} rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent`}
                    placeholder="e.g. 2"
                  />
                  {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience}</p>}
                </FormField>

                <FormField label="Maximum Experience (years)">
                  <input
                    type="number"
                    name="experienceRequired.maxYears"
                    value={formData.experienceRequired.maxYears}
                    onChange={handleChange}
                    min={formData.experienceRequired.minYears || "0"}
                    className={`w-full px-3.5 py-2.5 border ${errors.experience ? 'border-red-300' : 'border-gray-300'} rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent`}
                    placeholder="e.g. 5"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Salary Range</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                      <FormField label="Currency">
                        <select
                          name="salary.currency"
                          value={formData.salary.currency}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </FormField>
                    </div>

                    <div className="md:col-span-1">
                      <FormField label="Min">
                        <input
                          type="number"
                          name="salary.min"
                          value={formData.salary.min}
                          onChange={handleChange}
                          min="0"
                          className={`w-full px-3.5 py-2.5 border ${errors.salary ? 'border-red-300' : 'border-gray-300'} rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent`}
                          placeholder="Min"
                        />
                      </FormField>
                    </div>

                    <div className="md:col-span-1">
                      <FormField label="Max">
                        <input
                          type="number"
                          name="salary.max"
                          value={formData.salary.max}
                          onChange={handleChange}
                          min={formData.salary.min || "0"}
                          className={`w-full px-3.5 py-2.5 border ${errors.salary ? 'border-red-300' : 'border-gray-300'} rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent`}
                          placeholder="Max"
                        />
                      </FormField>
                    </div>

                    <div className="md:col-span-1">
                      <FormField label="Period">
                        <select
                          name="salary.period"
                          value={formData.salary.period}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent"
                        >
                          <option value="Hourly">Per Hour</option>
                          <option value="Daily">Per Day</option>
                          <option value="Monthly">Per Month</option>
                          <option value="Annual">Per Year</option>
                        </select>
                      </FormField>
                    </div>
                  </div>
                  {errors.salary && <p className="mt-1 text-sm text-red-600">{errors.salary}</p>}
                </div>
              </div>
            </FormSection>

            {!formData.isRemote && (
              <FormSection title="Location" icon={<MapPin className="w-5 h-5 text-[#007BFF]" />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField label="City">
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent"
                      placeholder="e.g. Mumbai"
                    />
                  </FormField>

                  <FormField label="State/Province">
                    <input
                      type="text"
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent"
                      placeholder="e.g. Maharashtra"
                    />
                  </FormField>

                  <FormField label="Country">
                    <select
                      name="location.country"
                      value={formData.location.country}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent"
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </FormField>
                </div>
              </FormSection>
            )}

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007BFF] transition-all shadow-sm"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-gradient-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007BFF] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating Job...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Create Job Posting</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
