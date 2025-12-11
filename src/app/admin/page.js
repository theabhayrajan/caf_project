"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SuperAdminHeader from "@/components/SuperAdminHeader";

export default function AdminLogin() {

  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Prevent body scroll only on large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        document.body.style.overflow = "hidden";
        document.body.style.height = "100vh";
      } else {
        document.body.style.overflow = "auto";
        document.body.style.height = "auto";
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "auto";
      document.body.style.height = "auto";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (res.status === 200 && data.token) {

      // Save token
      localStorage.setItem("caf_admin_token", data.token);

      // IMPORTANT: CLEAR previous dashboard data
      localStorage.removeItem("selectedClass");
      localStorage.removeItem("testCode");

      // Hide question sets until first submission
      localStorage.setItem("hasSubmitted", "false");

      // Redirect
      router.push(`/admin/edit-homepage`);
    } else {
      alert(data.error || "Invalid credentials");
    }
  };

  return (
    <>
      <SuperAdminHeader />
      <div className="min-h-screen flex flex-col lg:overflow-hidden">

        <div className="flex-1 flex items-start lg:mt-15 justify-center px-4 overflow-y-auto lg:overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 place-items-center w-full max-w-9xl py-6 lg:py-0">

            {/* Image for small screens */}
            <div className="flex lg:hidden items-center justify-center mt-0">
              <Image
                src={`${process.env.NEXT_PUBLIC_PROD_URL}/superadmin-image.png`}
                alt="Illustration"
                width={360}
                height={300}
                className="max-h-[300px] sm:max-h-[320px] md:max-h-[350px] w-90 md:w-100 object-contain"
                priority
              />
            </div>

            {/* Left Section */}
            <div className="flex flex-col justify-center lg:self-start px-8 md:px-20 w-full sm:w-150 ml-5 mt-3 md:mt-5 lg:mt-0 lg:ml-0 xl:ml-10">
              <div className="flex flex-col gap-5 text-center md:text-left lg:gap-0">
                <h1 className="text-black text-2xl font-semibold mb-3 md:mb-5 lg:mb-10">
                  Admin Login
                </h1>
                <h1 className="text-xl font-semibold mb-10 lg:mb-12 text-black">
                  Enter your credentials
                </h1>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="flex flex-col gap-2 mb-10">
                  <label className="block text-[1.05rem] 2xl:text-[1.15rem] font-medium text-black">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-[100%] lg:w-[80%] border border-gray-300 p-3 py-4 bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    required
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2 mb-10">
                  <label className="block text-[1.05rem] 2xl:text-[1.15rem] font-medium text-black">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-[100%] lg:w-[80%] border border-gray-300 p-3 py-4 bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    required
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-[100%] lg:w-[80%] py-4 bg-[#6ebdfc] hover:bg-sky-400 text-white text-[1.2rem] transition"
                >
                  Login
                </button>
              </form>
            </div>

            {/* Right Image */}
            <div className="hidden lg:flex lg:self-end items-center justify-center mt-20">
              <Image
                src={`${process.env.NEXT_PUBLIC_PROD_URL}/superadmin-image.png`}
                alt="Illustration"
                width={540}
                height={420}
                className="max-h-[420px] 2xl:max-h-[500px] w-135 object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
