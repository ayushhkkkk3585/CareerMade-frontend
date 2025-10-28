"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Stethoscope, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogle = () => {
    const backend = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    // default role can be jobseeker when logging in with OAuth
    const role = "jobseeker";
    window.location.href = `${backend}/api/auth/google?role=${encodeURIComponent(role)}`;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ensures cookies (refresh token) are saved
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMsg(data.message || "Invalid email or password.");
        return;
      }

      const { accessToken, user } = data.data;

      // ✅ Store tokens and user in localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Redirect based on user role
      if (user.role === "jobseeker") {
        router.push("/dashboard/jobseeker");
      } else if (user.role === "employer") {
        router.push("/dashboard/employee/jobs");
      } else {
        router.push("/dashboard"); // fallback
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Something went wrong. Please try again.");
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Section - Image */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -40 }}
        transition={{ duration: 0.8 }}
        className="hidden md:flex md:w-1/2 items-center justify-center"
      >
        <img
          src="/login.png"
          alt="Login illustration"
          className="w-3/4 h-auto hover:scale-105 transition-transform duration-500"
        />
      </motion.div>

      {/* Right Section - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 40 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex flex-col h-screen justify-center items-center md:w-1/2 p-6 sm:p-10"
      >
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05, rotate: 2 }}
          className="flex items-center mb-6 space-x-2"
        >
          <div className="bg-[#8F59ED] p-2 rounded-lg shadow-md">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">DocJob</span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2"
        >
          Welcome Back
        </motion.h2>
        <p className="text-gray-600 mb-8 text-center max-w-sm">
          Sign in to continue your journey with trusted healthcare experts.
        </p>

        {/* Login Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm space-y-5"
        >
          {/* Email */}
          <div className="relative group">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#8F59ED] transition-colors"
              size={18}
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              required
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:border-[#8F59ED] focus:ring-2 focus:ring-[#cdb7f3] outline-none text-gray-700 transition-all"
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#8F59ED] transition-colors"
              size={18}
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:border-[#8F59ED] focus:ring-2 focus:ring-[#cdb7f3] outline-none text-gray-700 transition-all"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <p className="text-red-500 text-center text-sm">{errorMsg}</p>
          )}

          {/* Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#8F59ED] hover:bg-[#693eb4] text-white py-3 rounded-full font-medium transition shadow-md disabled:opacity-70"
          >
            {loading ? "Signing In..." : "Sign In"}
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-gray-300 flex-1" />
            <span className="text-xs text-gray-500">OR</span>
            <div className="h-px bg-gray-300 flex-1" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 py-3 rounded-full font-medium transition"
          >
            Continue with Google
          </button>

          {/* Footer Link */}
          <p className="text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <a href="/register" className="text-[#8F59ED] hover:underline">
              Register here
            </a>
          </p>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Login;
