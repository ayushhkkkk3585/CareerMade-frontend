"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Menu, X } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

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
  const handleCreateJobClick = () => router.push("/dashboard/employee/jobs/create");

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white shadow-sm sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push("/")}
          >
            
            <img src="/logo.png" alt="CareerMade" className="h-13" />
          </motion.div>

          {/* Desktop Buttons */}
          <div className="hidden sm:flex items-center space-x-4">
            {/* Show user's name if available */}
            {/* {user && (
              <span className="text-gray-700 font-medium">
                Hi, {user.firstName}
              </span>
            )} */}

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleProfileClick}
              className="text-gray-700 font-medium"
            >
              Profile
            </motion.button>


            {/* Employer-only buttons */}
            {user?.role === "jobseeker" && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleSavedJobsClick}
                  className="text-gray-700 font-medium"
                >
                  Saved Jobs
                </motion.button>
                {/* <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateJobClick}
                  className="bg-[#8F59ED] hover:bg-[#693eb4] text-white px-4 py-2 rounded-full font-medium shadow-md"
                >
                  Create Job
                </motion.button> */}
              </>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-full font-medium shadow-md"
            >
              Logout
            </motion.button>

            {/* <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleLogout}
              className="text-gray-700 font-medium"
            >
              Logout
            </motion.button> */}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden text-gray-700"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="sm:hidden bg-white border-t shadow-md"
          >
            <div className="flex flex-col items-start px-4 py-2 space-y-3">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleProfileClick();
                }}
                className="text-gray-700 text-left font-medium"
              >
                Profile
              </button>

              {/* Employer Buttons */}
              {user?.role === "jobseeker" && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleSavedJobsClick}
                    className="text-gray-700 font-medium"
                  >
                    Saved Jobs
                  </motion.button>
                  {/* <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateJobClick}
                  className="bg-[#8F59ED] hover:bg-[#693eb4] text-white px-4 py-2 rounded-full font-medium shadow-md"
                >
                  Create Job
                </motion.button> */}
                </>
              )}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="text-gray-700 text-left font-medium"
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
