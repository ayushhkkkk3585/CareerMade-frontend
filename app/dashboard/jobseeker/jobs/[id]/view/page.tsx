"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    MapPin,
    Briefcase,
    DollarSign,
    Clock,
    Building2,
    ArrowLeft,
    FileText,
    Trash2,
    Upload,
    CheckCircle,
    BookmarkPlus,
    Globe,
    Rocket,
    Heart,
    Car,
    GraduationCap,
    Dumbbell,
    UtensilsCrossed,
    Star,
    Save,
    IndianRupee,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import GradientLoader from "@/app/components/GradientLoader";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Dialog } from "@headlessui/react";

export default function JobViewPage() {
    const { id } = useParams();
    const router = useRouter();
    const [hasApplied, setHasApplied] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [resume, setResume] = useState<any>(null);
    const [coverLetter, setCoverLetter] = useState<any>(null);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const user = localStorage.getItem("user");
        if (!token || !user) {
            router.push("/login");
            return;
        }
        const parsedUser = JSON.parse(user);
        setUser(parsedUser);
        if (parsedUser.role !== "jobseeker") {
            router.push("/login");
            return;
        }
    }, [router]);

    // Check if user has already applied
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token || !id) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}/applications`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                const applications = data.data?.applications || data.applications || [];
                const userData = localStorage.getItem("user");
                if (userData) {
                    const user = JSON.parse(userData);
                    const hasUserApplied = applications.some((app: any) =>
                        app.jobSeeker?.user?._id === user._id ||
                        app.jobSeeker?._id === user.jobSeekerId
                    );
                    setHasApplied(hasUserApplied);
                }
            })
            .catch((err) => {
                console.error("Error checking application status:", err);
            });
    }, [id]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            toast.error("No access token found. Please log in first!");
            return;
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`;

        fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                return res
                    .json()
                    .catch((e) => {
                        toast.error(`[JobView] Failed to parse JSON: ${String(e)}`);
                        throw e;
                    });
            })
            .then((data) => {
                const dataLayer = data?.data ?? data;
                const base = dataLayer?.job ?? dataLayer;
                const salary = base?.salary ?? {};
                const exp = base?.experienceRequired ?? {};
                const normalized = {
                    ...base,
                    organization: base?.organization ?? base?.organizationName,
                    salary: {
                        min: salary?.min ?? salary?.amountMin ?? salary?.minimum ?? null,
                        max: salary?.max ?? salary?.amountMax ?? salary?.maximum ?? null,
                        currency: salary?.currency ?? salary?.currencyCode ?? salary?.curr,
                    },
                    experienceRequired: {
                        minYears: exp?.minYears ?? exp?.min ?? exp?.minimum ?? null,
                        maxYears: exp?.maxYears ?? exp?.max ?? exp?.maximum ?? null,
                    },
                };
                setJob(normalized);
            })
            .catch((err) => {
                toast.error(`[JobView] Error while loading job details: ${String(err)}`);
                setMessage("Failed to load job details.");
            })
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                const js = data?.data?.jobSeeker ?? data?.jobSeeker ?? data;
                setResume(js?.resume ?? null);
                setCoverLetter(js?.coverLetter ?? null);
            })
            .catch((e) => toast.error(`[JobView] Failed to load profile: ${String(e)}`));
    }, []);

    const handleUploadResume = async (file: File) => {
        try {
            setUploadingResume(true);
            const token = localStorage.getItem("accessToken");
            const fd = new FormData();
            fd.append("resume", file);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/resume`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            const data = await res.json();
            setResume(data?.data?.resume ?? data?.resume ?? null);
            setMessage(data?.message || "Resume uploaded");
            toast.success(data?.message || "Resume uploaded");
        } catch (e) {
            setMessage("Failed to upload resume");
            toast.error("Failed to upload resume");
        } finally {
            setUploadingResume(false);
        }
    };

    const handleDeleteResume = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/resume`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setResume(null);
            setMessage(data?.message || (res.ok ? "Resume deleted" : "Failed to delete resume"));
            if (res.ok) toast.success(data?.message || "Resume deleted");
            else toast.error(data?.message || "Failed to delete resume");
        } catch (e) {
            setMessage("Failed to delete resume");
            toast.error("Failed to delete resume");
        }
    };

    const handleUploadCover = async (file: File) => {
        try {
            setUploadingCover(true);
            const token = localStorage.getItem("accessToken");
            const fd = new FormData();
            fd.append("coverLetter", file);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/cover-letter`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            const data = await res.json();
            setCoverLetter(data?.data?.coverLetter ?? data?.coverLetter ?? null);
            setMessage(data?.message || "Cover letter uploaded");
            toast.success(data?.message || "Cover letter uploaded");
        } catch (e) {
            setMessage("Failed to upload cover letter");
            toast.error("Failed to upload cover letter");
        } finally {
            setUploadingCover(false);
        }
    };

    const handleDeleteCover = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/cover-letter`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setCoverLetter(null);
            setMessage(data?.message || (res.ok ? "Cover letter deleted" : "Failed to delete cover letter"));
            if (res.ok) toast.success(data?.message || "Cover letter deleted");
            else toast.error(data?.message || "Failed to delete cover letter");
        } catch (e) {
            setMessage("Failed to delete cover letter");
            toast.error("Failed to delete cover letter");
        }
    };

    const applyJob = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                toast.error("Please log in to apply.");
                return;
            }

            if (!resume) {
                toast.error("Please upload a resume before applying!");
                return;
            }

            const payload: any = {
                resume: resume.url || resume._id || resume,
            };

            if (coverLetter) {
                payload.coverLetter = coverLetter.url || coverLetter._id || coverLetter;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                setHasApplied(true);
                setMessage(data.message || "Application submitted successfully!");
                toast.success(data.message || "Application submitted successfully!");
            } else {
                setMessage(data.message || "Failed to submit application.");
                toast.error(data.message || "Failed to submit application.");
            }
        } catch (error) {
            console.error("Error applying:", error);
            setMessage("Something went wrong while applying.");
            toast.error("Something went wrong while applying.");
        }
    };

    const saveJob = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/saved-jobs/jobs/${id}/save`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await res.json();
            setMessage(data.message || "Job saved successfully!");
            toast.success(data.message || "Job saved successfully!");
        } catch {
            setMessage("Failed to save job.");
            toast.error("Failed to save job.");
        }
    };

    const extractSkills = () => {
        if (!job) return [];

        if (job.requirements && Array.isArray(job.requirements) && job.requirements.length > 0) {
            const skillKeywords = ["Java", "Python", "JavaScript", "React", "Node.js", "SAP", "Machine Learning", "Artificial Intelligence", "Cloud Platform", "SQL", "MongoDB", "Docker", "Kubernetes", "TypeScript", "Angular", "Vue", "AWS", "Azure", "GCP"];
            const foundSkills: string[] = [];
            job.requirements.forEach((req: string) => {
                skillKeywords.forEach(keyword => {
                    if (req.toLowerCase().includes(keyword.toLowerCase()) && !foundSkills.includes(keyword)) {
                        foundSkills.push(keyword);
                    }
                });
            });
            if (foundSkills.length > 0) return foundSkills.slice(0, 8);
        }

        if (job.description) {
            const skillKeywords = ["Java", "Python", "JavaScript", "React", "Node.js", "SAP", "Machine Learning", "Artificial Intelligence", "Cloud Platform", "SQL", "MongoDB", "Docker", "Kubernetes"];
            const foundSkills = skillKeywords.filter(skill =>
                job.description.toLowerCase().includes(skill.toLowerCase())
            );
            if (foundSkills.length > 0) return foundSkills.slice(0, 8);
        }

        return [];
    };

    const skills = extractSkills();
    const organizationName = job?.organizationName || job?.organization || "Company Name";

    const formatSalary = () => {
        if (!job || !job.salary || (job.salary.min === null && job.salary.max === null)) return "Not specified";
        const min = job.salary.min || 0;
        const max = job.salary.max || 0;
        const currency = job.salary.currency || "INR";
        const period = job.salary.period || "Annual";

        if (currency === "INR" && period === "Annual" && min > 100000) {
            const minLPA = min / 100000;
            const maxLPA = max / 100000;
            return `${minLPA}-${maxLPA} LPA`;
        }
        if (currency === "INR" && period === "Monthly" && min > 0) {
            return `₹${min.toLocaleString()} - ₹${max.toLocaleString()} per month`;
        }
        return `${min} - ${max} ${currency} (${period})`;
    };

    const formatExperience = () => {
        if (!job || !job.experienceRequired || (job.experienceRequired.minYears === null && job.experienceRequired.maxYears === null)) {
            return "Not specified";
        }
        const min = job.experienceRequired.minYears || 0;
        const max = job.experienceRequired.maxYears || 0;
        return `${min}-${max} years`;
    };

    const formatPostedDate = () => {
        if (!job || !job.postedAt) return "";
        const postedDate = new Date(job.postedAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - postedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Posted today";
        if (diffDays === 1) return "Posted 1 day ago";
        return `Posted: ${diffDays} days ago`;
    };

    const getBenefits = () => {
        if (!job) {
            return [
                { name: "Job/Soft skill training", icon: Rocket },
                { name: "Health insurance", icon: Heart },
                { name: "Office cab/shuttle", icon: Car },
                { name: "Professional degree assistance", icon: GraduationCap },
                { name: "Office gym", icon: Dumbbell },
                { name: "Cafeteria", icon: UtensilsCrossed },
            ];
        }

        if (job.benefits && Array.isArray(job.benefits) && job.benefits.length > 0) {
            const benefitIconMap: Record<string, any> = {
                "health insurance": Heart,
                "health": Heart,
                "insurance": Heart,
                "training": Rocket,
                "skill": Rocket,
                "cab": Car,
                "shuttle": Car,
                "transport": Car,
                "degree": GraduationCap,
                "education": GraduationCap,
                "gym": Dumbbell,
                "fitness": Dumbbell,
                "cafeteria": UtensilsCrossed,
                "food": UtensilsCrossed,
            };

            return job.benefits.slice(0, 6).map((benefit: string) => {
                const benefitLower = benefit.toLowerCase();
                let icon = Rocket;

                for (const [key, iconComponent] of Object.entries(benefitIconMap)) {
                    if (benefitLower.includes(key)) {
                        icon = iconComponent;
                        break;
                    }
                }

                return { name: benefit, icon };
            });
        }

        return [
            { name: "Job/Soft skill training", icon: Rocket },
            { name: "Health insurance", icon: Heart },
            { name: "Office cab/shuttle", icon: Car },
            { name: "Professional degree assistance", icon: GraduationCap },
            { name: "Office gym", icon: Dumbbell },
            { name: "Cafeteria", icon: UtensilsCrossed },
        ];
    };

    const benefits = getBenefits();

    const highlights = [
        { name: "Job Security", rating: "Highly rated", icon: Briefcase },
        { name: "Skill Development", rating: "Highly rated", icon: FileText },
        { name: "Company Culture", rating: "Highly rated", icon: Star },
    ];

    if (loading)
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <GradientLoader />
            </div>
        );

    if (!job)
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <p className="text-gray-600 text-lg">Job not found.</p>
            </div>
        );

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Main Content - Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Content Cards */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Job Title and Overview Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
                                <div className="absolute top-4 right-4">
                                    <Building2 className="w-10 h-10 text-gray-600" />
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {job.title || "Job Title"}
                                    </h1>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 border border-green-700 text-xs font-semibold rounded-full">
                                        Verified
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-gray-600 text-sm mb-4">
                                    <span className="font-semibold">{job.organizationName}</span>
                                    <span className="text-gray-400">|</span>
                                    <span>{job.specialization || "Multi-Specialty"}</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200 mb-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Experience</p>
                                        <p className="text-sm font-semibold text-gray-900">{formatExperience()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Salary</p>
                                        <p className="text-sm font-semibold text-gray-900">{formatSalary()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Location</p>
                                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {job.location?.city ? `${job.location.city}, ${job.location.state || ""}` : "Not specified"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Job Type</p>
                                        <p className="text-sm font-semibold text-gray-900">{job.jobType || "Full-time"}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4 pt-4 border-t border-gray-200">
                                    {job.specialization && (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                            {job.specialization}
                                        </span>
                                    )}
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                        {job.jobType || "Full-time"}
                                    </span>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                        {job.isRemote ? "Remote" : "On-site"}
                                    </span>
                                </div>



                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="text-sm text-gray-500"> <span className="text-gray-700 font-medium">{formatPostedDate() ?? '4 days ago'}</span></div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={saveJob}
                                            className="px-4 py-2 border border-[#D1E9FF] text-[#0B74FF] rounded-full text-sm font-medium hover:bg-[#F3F9FF] transition"
                                        >
                                            Save
                                        </button>
                                        {hasApplied ? (
                                            <button
                                                disabled
                                                className="px-4 py-2 bg-gray-300 text-white rounded-full text-sm font-medium cursor-not-allowed"
                                            >
                                                <CheckCircle className="w-4 h-4 inline-block mr-1" /> Already Applied
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    if (!resume) {
                                                        toast.error("Please upload a resume before applying!");
                                                        return;
                                                    }
                                                    setIsApplyModalOpen(true);
                                                }}
                                                className="px-4 py-2 bg-[#007BFF] hover:bg-[#006AE6] text-white rounded-full text-sm font-semibold"
                                            >
                                                Apply
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Description Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                                <h3 className="text-base font-semibold text-gray-800 mb-3">Role & responsibilities</h3>
                                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {job.responsibilities && Array.isArray(job.responsibilities) && job.responsibilities.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-2">
                                            {job.responsibilities.map((resp: string, index: number) => (
                                                <li key={index}>{resp}</li>
                                            ))}
                                        </ul>
                                    ) : job.description ? (
                                        <p>{job.description}</p>
                                    ) : (
                                        <p className="text-gray-500 italic">No description available</p>
                                    )}
                                </div>
                                {job.description && job.description.length > 300 && (
                                    <button className="text-blue-600 text-sm font-medium mt-2 hover:underline">
                                        Read more
                                    </button>
                                )}
                            </div>

                            {/* Key Skills Card */}
                            {skills.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Key Skills</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill: string, index: number) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 cursor-pointer transition"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* About the organization Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">About the organization</h2>
                                <h3 className="text-base font-semibold text-gray-800 mb-3">Overview</h3>
                                <div className="text-gray-700 leading-relaxed mb-4">
                                    {job.employer?.description || job.organizationDescription || (
                                        <p>
                                            {organizationName} is a leading organization in the {job.specialization || "healthcare"} sector, committed to excellence and innovation. We provide exceptional opportunities for professional growth and development. Our team is dedicated to creating a positive impact in the industry.
                                        </p>
                                    )}
                                </div>
                                {(job.employer?.description || job.organizationDescription) && (job.employer?.description?.length > 200 || job.organizationDescription?.length > 200) && (
                                    <button className="text-blue-600 text-sm font-medium mb-4 hover:underline">
                                        Read more
                                    </button>
                                )}
                                <div className="pt-4 border-t border-gray-200">
                                    <h3 className="text-base font-semibold text-gray-800 mb-2">Company Info</h3>
                                    {job.employer?.website || job.organizationWebsite ? (
                                        <a
                                            href={job.employer?.website || job.organizationWebsite}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
                                        >
                                            <Globe className="w-4 h-4" />
                                            {job.employer?.website || job.organizationWebsite}
                                        </a>
                                    ) : (
                                        <p className="text-gray-500 text-sm">Website information not available</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Sidebar Cards */}
                        <div className="space-y-6">
                            {/* Key Highlights Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    Key highlights at {organizationName}
                                </h2>
                                <div className="space-y-4">
                                    {highlights.map((highlight, index) => {
                                        const Icon = highlight.icon;
                                        return (
                                            <div key={index} className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                                        <Icon className="w-4 h-4 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{highlight.name}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{highlight.rating}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Benefits & Perks Card */}
                            {benefits.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-gray-900">Benefits & Perks</h2>
                                        {job.benefits && job.benefits.length > 6 && (
                                            <button className="text-blue-600 text-sm font-medium hover:underline">
                                                View all
                                            </button>
                                        )}
                                    </div>
                                    {job.stats?.applications && job.stats.applications > 0 && (
                                        <p className="text-xs text-gray-500 mb-4">
                                            {job.stats.applications} {job.stats.applications === 1 ? 'User' : 'Users'} reported these benefits
                                        </p>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        {benefits.map((benefit: { name: string; icon: any }, index: number) => {
                                            const Icon = benefit.icon;
                                            return (
                                                <div key={index} className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-gray-50 transition">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
                                                        <Icon className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <p className="text-xs text-gray-700 font-medium leading-tight">{benefit.name}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {job.benefits && job.benefits.length > 0 && (
                                        <p className="text-xs text-gray-400 text-center mt-4">Powered by AmbitionBox</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Apply Modal */}
                    <Dialog
                        open={isApplyModalOpen}
                        onClose={() => setIsApplyModalOpen(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                    >
                        <Dialog.Panel className="bg-white/90 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                            <Dialog.Title className="text-lg font-bold text-gray-900 mb-4">
                                Confirm Application
                            </Dialog.Title>

                            {/* User Info Section */}
                            <div className="space-y-3 mb-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={user?.firstName || ""}
                                        readOnly
                                        className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 text-sm focus:outline-none cursor-not-allowed"
                                    />
                                    <label className="text-sm font-medium text-gray-700 mt-2 block">Last Name</label>
                                    <input
                                        type="text"
                                        value={user?.lastName || ""}
                                        readOnly
                                        className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 text-sm focus:outline-none cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={user?.email || ""}
                                        readOnly
                                        className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 text-sm focus:outline-none cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="text"
                                        value={user?.phone || ""}
                                        readOnly
                                        className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 text-sm focus:outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <p className="text-sm text-gray-700 mb-4">
                                Please confirm your resume and cover letter before applying.
                            </p>

                            {/* Resume Section */}
                            <div className="mb-4">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Resume</label>
                                {resume ? (
                                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <FileText className="w-4 h-4 text-[#1A0152]" />
                                            <span>{resume.filename || "Resume uploaded"}</span>
                                        </div>
                                        <a
                                            href={resume.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 text-sm hover:underline"
                                        >
                                            View
                                        </a>
                                    </div>
                                ) : (
                                    <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-600">
                                        <p className="text-sm">No resume found.</p>
                                        <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg cursor-pointer transition-all">
                                            <Upload className="w-4 h-4" />
                                            {uploadingResume ? "Uploading..." : "Upload Resume"}
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.txt,.rtf"
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0];
                                                    if (f) handleUploadResume(f);
                                                }}
                                                disabled={uploadingResume}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Cover Letter Section */}
                            <div className="mb-4">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Cover Letter (Optional)</label>
                                {coverLetter ? (
                                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <FileText className="w-4 h-4 text-[#1A0152]" />
                                            <span>{coverLetter.filename || "Cover letter uploaded"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={coverLetter.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 text-sm hover:underline"
                                            >
                                                View
                                            </a>
                                            <button
                                                onClick={handleDeleteCover}
                                                className="text-red-600 text-sm hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-600">
                                        <p className="text-sm mb-2">No cover letter uploaded.</p>
                                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg cursor-pointer transition-all">
                                            <Upload className="w-4 h-4" />
                                            {uploadingCover ? "Uploading..." : "Upload Cover Letter"}
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.txt,.rtf"
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0];
                                                    if (f) handleUploadCover(f);
                                                }}
                                                disabled={uploadingCover}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setIsApplyModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (!resume) {
                                            toast.error("Please select or upload a resume before applying!");
                                            return;
                                        }
                                        applyJob();
                                        setIsApplyModalOpen(false);
                                    }}
                                    className="px-5 py-2 bg-[#1A0152] hover:bg-[#2B0D85] text-white rounded-lg text-sm font-semibold transition"
                                >
                                    Submit Application
                                </button>
                            </div>
                        </Dialog.Panel>
                    </Dialog>
                    {message && (
                        <div className="mt-6 text-sm text-[#1A0152] bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-sm">
                            <p className="font-medium">{message}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}