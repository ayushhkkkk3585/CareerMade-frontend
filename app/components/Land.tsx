"use client";

import React, { useState } from "react";
import {
    Search,
    Stethoscope,
} from "lucide-react";

// ✅ In Next.js, images should go in the /public folder.
// So move your images to public/... and use "/..." paths.



const Land = () => {
    return (
        <>
            {/* font can also be poppins */}
            <div className="min-h-screen p-3 bg-[#cdb7f3e7] pb-20">
                {/* HEADER */}
                <header>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="bg-[#8F59ED] p-2 rounded-lg">
                                    <Stethoscope className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                                    DocJob
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-4">
                                <button className="text-gray-700 font-medium transition hidden sm:block">
                                    Sign In
                                </button>
                                <button className="bg-[#8F59ED] hover:bg-[#693eb4] text-white px-4 sm:px-6 py-2 rounded-full font-medium transition text-sm sm:text-base">
                                    Post A Job
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="w-full flex justify-center">
                    <div className="w-full h-[1px] md:mr-24 md:ml-24 mt-2 md:mt-5 bg-black opacity-10"></div>
                </div>

                {/* HERO SECTION */}
                <div className="flex flex-col justify-center items-center text-center mt-8 sm:mt-12 space-y-4 sm:space-y-6 px-4">
                    <p className="font-medium text-sm sm:text-base">Remove Your Doubts</p>
                    <p className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight">
                        Find the Right doctor
                    </p>
                    <p className="font-normal text-gray-600 text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl">
                        With skilled and educated doctors available 24/7, you can count on
                        expert care whenever you need it.
                    </p>

                    {/* SEARCH BAR */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 sm:p-4 rounded-2xl md:rounded-full w-full max-w-2xl mx-auto shadow-md">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search job titles"
                                className="pl-10 pr-4 py-2.5 sm:py-3 rounded-full w-full focus:outline-none text-sm sm:text-base"
                            />
                        </div>

                        <button className="bg-[#8F59ED] hover:bg-[#693eb4] text-white px-6 py-2.5 sm:py-3 rounded-2xl md:rounded-full font-medium transition w-full sm:w-auto text-sm sm:text-base">
                            Search
                        </button>
                    </div>

                    {/* CATEGORIES */}
                    <p className="text-sm text-center sm:text-base">Are you looking for?</p>
                    <div className="flex flex-row flex-wrap justify-center gap-2 sm:gap-3">
                        <button className="bg-white text-black hover:bg-[#8F59ED] hover:text-white px-4 py-2 rounded-full text-sm sm:text-base transition">
                            Physician
                        </button>
                        <button className="bg-white text-black hover:bg-[#8F59ED] hover:text-white px-4 py-2 rounded-full text-sm sm:text-base transition">
                            Surgeon
                        </button>
                        <button className="bg-white text-black hover:bg-[#8F59ED] hover:text-white px-4 py-2 rounded-full text-sm sm:text-base transition">
                            Cardiologist
                        </button>
                    </div>
                </div>
            </div>

            {/* MAIN IMAGE */}
            <div className="relative -mt-35 sm:-mt-32 md:-mt-30 z-10 flex justify-center px-4">
                <div className="w-full max-w-4xl">
                    <img src="/newer.png" alt="Doctor consultation" className="w-full h-auto" />
                </div>
            </div>

            {/* CATEGORY OVERVIEW */}
            <div className="p-3 sm:p-6 lg:p-10 bg-white pt-24 sm:pt-32 md:pt-40">
                <div className="flex flex-col justify-center items-center text-center space-y-4 sm:space-y-6 px-4 mb-8 sm:mb-12">
                    <p className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight max-w-4xl">
                        Connect with your qualified Doctor
                    </p>
                    <p className="font-normal text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl">
                        With skilled and educated doctors available 24/7, you can count on expert care whenever you need it.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 px-4 py-6 sm:py-8">
                    {[
                        { src: "/baby.png", label: "Baby Health" },
                        { src: "/d.png", label: "Dermatology" },
                        { src: "/heart.png", label: "Cardiology" },
                        { src: "/p.png", label: "Psychiatry" },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="flex flex-col items-center bg-white shadow-md rounded-2xl p-4 sm:p-6 w-28 sm:w-36 md:w-40 hover:shadow-lg transition"
                        >
                            <img src={item.src} alt={item.label} className="w-10 h-10 sm:w-12 sm:h-12 mb-2" />
                            <p className="text-xs sm:text-sm md:text-base font-medium text-gray-700 text-center">
                                {item.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* TESTIMONIAL SECTION */}
            <div className="flex flex-col-reverse md:flex-row items-center justify-center w-full gap-6 sm:gap-8 lg:gap-12 p-4 sm:p-6 lg:p-12 bg-white">
                <div className="w-full md:w-1/2 flex flex-col items-start gap-3 md:pl-28 sm:gap-4">
                    <h2 className="font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-800 leading-tight">
                        What Our Patients Say About Our Service
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                        "Very helpful. Far easier than doing the same things on computer. Allows quick and easy search with speed booking. Even maintains history of doctors visited."
                    </p>

                    <div className="flex items-center gap-3 mt-2 sm:mt-3">
                        <img
                            src="/patient-profile.png"
                            alt="Reviewer"
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-semibold text-gray-800 text-sm sm:text-base">Guy Hawkins</p>
                            <p className="text-gray-500 text-xs sm:text-sm">Founder, Eduflow</p>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-1/2 flex justify-center">
                    <img
                        src="/test.png"
                        alt="Patient and doctor"
                        className="w-full max-w-md object-cover rounded-2xl"
                    />
                </div>
            </div>

            {/* FOOTER */}
            <footer className="bg-gray-900 text-gray-300 py-8 sm:py-12 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
                        {[
                            {
                                title: "For Doctors",
                                links: ["Browse Jobs", "Create Profile", "Career Resources"],
                            },
                            {
                                title: "For Employers",
                                links: ["Post a Job", "Search Doctors", "Pricing"],
                            },
                            {
                                title: "Company",
                                links: ["About Us", "Contact", "Blog"],
                            },
                            {
                                title: "Support",
                                links: ["Help Center", "Privacy Policy", "Terms of Service"],
                            },
                        ].map((section) => (
                            <div key={section.title}>
                                <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                                    {section.title}
                                </h4>
                                <ul className="space-y-2 text-xs sm:text-sm">
                                    {section.links.map((link) => (
                                        <li key={link}>
                                            <a href="#" className="hover:text-[#8F59ED] transition">
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <div className="bg-[#8F59ED] p-2 rounded-lg">
                                <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <span className="text-lg sm:text-xl font-bold text-white">
                                DocJob
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-400">
                            © 2025 DocJob. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}
export default Land