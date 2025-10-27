"use client";
import React from "react";
import { useRouter } from "next/navigation";

const page = () => {
  const handleLogout = () => {
    const router = useRouter();
    // Clear tokens and user data from localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.push("/login");
  };
  return (
    <>
      <div>
        <button onClick={handleLogout}>logout</button>
      </div>
    </>
  );
};

export default page;
