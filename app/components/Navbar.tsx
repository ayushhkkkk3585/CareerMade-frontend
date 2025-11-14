"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileText,
  Bookmark,
  Stethoscope,
  LogOut,
  User,
  Briefcase,
  Building2,
  Star,
  Bell,
} from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (err) {
          console.error("Error parsing user:", err);
        }
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role === "employer") router.push("/dashboard/employee/profile");
    else if (user.role === "jobseeker") router.push("/dashboard/jobseeker/profile");
    else router.push("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleSavedJobsClick = () => router.push("/dashboard/jobseeker/bookmarks");
  const handleResume = () => router.push("/dashboard/jobseeker/resume");

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Role-based nav items */}
          <div className="flex items-center space-x-4">
            <motion.div
              className="flex items-center space-x-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push("/")}
            >
              <img src="/logo.png" alt="CareerMade" className="h-8" />
            </motion.div>

            {/* Desktop nav items next to the logo */}
            {user?.role === "jobseeker" && (
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={() => router.push("/dashboard/jobseeker")}
                  className="px-6 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  Jobs
                </button>

                <button
                  onClick={() => router.push("/dashboard/jobseeker/employers")}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  Employers
                </button>
              </div>
            )}

            {user?.role === "employer" && (
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={() => router.push("/dashboard/employee/jobs")}
                  className="px-6 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  My Jobs Postings
                </button>

                <button
                  onClick={() => router.push("/dashboard/employee/jobs/create")}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  Create Job
                </button>
              </div>
            )}
          </div>

          {/* Profile Icon - visible on all screens */}
          <div className="relative flex gap-1" ref={dropdownRef}>
            {/* Profile Icon */}
            {/* InstantCV Button (for jobseeker only) */}
            {user?.role === "jobseeker" && (
              <button
                onClick={() => router.push("/dashboard/jobseeker/resume")}
                className="flex items-center justify-center gap-1 px-2 text-sm font-medium"
              >
                <Image src="/star.png" alt="InstantCV" width={16} height={16} />
                InstantCV
              </button>
            )}
            <button
              // onClick={() => router.push("/dashboard/jobseeker/resume")}
              className="flex items-center justify-center gap-1 px-3 text-sm font-medium"
            >
              <Bell className="text-black" size={18} />

            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center w-9 h-9 bg-blue-600 rounded-full hover:bg-blue-700 transition"
            >
              <User className="text-white" size={18} />
            </button>



            {/* Dropdown Menu (for both desktop & mobile) */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-72 bg-white border rounded-2xl shadow-xl p-5 z-50"
                >
                  {/* Profile Header */}
                  <div className="flex items-center space-x-3 border-b pb-4 mb-4">
                    <div className="w-12 h-12 bg-linear-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user?.firstName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-semibold">
                        {user?.firstName
                          ? `${user.firstName} ${user.lastName || ""}`
                          : "Guest User"}
                      </h3>
                      <p className="text-gray-500 text-sm capitalize">
                        {user?.role || "Jobseeker"}
                      </p>
                      {user && (
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            handleProfileClick();
                          }}
                          className="text-blue-600 text-sm font-medium mt-1"
                        >
                          View Profile
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="flex flex-col space-y-3 text-gray-700">
                    <button
                      onClick={() => {
                        router.push("/");
                        setMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 hover:text-blue-600"
                    >
                      <Home size={18} />
                      <span>Home</span>
                    </button>

                    {user?.role === "jobseeker" && (
                      <>
                        <button
                          onClick={() => {
                            router.push("/dashboard/jobseeker/applications");
                            setMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 hover:text-blue-600"
                        >
                          <FileText size={18} />
                          <span>My Applications</span>
                        </button>

                        <button
                          onClick={() => {
                            handleSavedJobsClick();
                            setMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 hover:text-blue-600"
                        >
                          <Bookmark size={18} />
                          <span>Saved Jobs</span>
                        </button>

                        <button
                          onClick={() => {
                            handleResume();
                            setMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 hover:text-blue-600"
                        >
                          <Stethoscope size={18} />
                          <span>Resume</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 text-red-500 hover:text-red-600"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </motion.header>
  );
}
