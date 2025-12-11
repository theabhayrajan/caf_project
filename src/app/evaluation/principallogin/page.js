"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Header from "../../../components/Header";
import { FaArrowRight } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function OTPLoginStatic() {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [errors, setErrors] = useState({});
    const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    // Prevent body scroll only on large screens (lg breakpoint = 1024px)
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

        handleResize(); // Initial check
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            document.body.style.overflow = "auto";
            document.body.style.height = "auto";
        };
    }, []);

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        setPhone(value);
    };

    const handleOtpChange = (index, value) => {
        if (!/^[0-9]?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 3) otpRefs[index + 1].current.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs[index - 1].current.focus();
        }
    };

    const validateForm = () => {
        let formErrors = {};
        if (phone.length !== 10) {
            formErrors.phone = "Please enter a valid 10-digit phone number.";
        }
        if (otp.join("").length !== 4) {
            formErrors.otp = "Please enter all 4 OTP digits.";
        }
        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/auth/verify-otp`, {
            method: "POST",
            body: JSON.stringify({ phone, otp: otp.join("") })
        });

        const data = await res.json();

        if (data.success) {
            toast.success("OTP Verified!");

            if (data.profileComplete) {
                router.push("/"); // Home page
            } else {
                router.push(`/evaluation/principaldetails?userId=${data.userId}`);
            }
        } else {
            toast.error(data.message || "Invalid OTP");
        }
    };

const sendOTP = async () => {
    if (phone.length !== 10) {
        setErrors({ phone: "Enter valid 10-digit number" });
        return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, role_id:2 })
    });

    const data = await res.json();

    // ⭐ Console log OTP clearly in browser
    console.log("OTP for principal: " + data.otp,);

    if (data.success) {
        toast.success("Demo OTP generated! Check console.");
    } else {
        toast.error(data.message || "Failed to send OTP");
    }
};

    return (
        <div className="min-h-screen flex flex-col lg:overflow-hidden">
            <Header />
            <div className="flex-1 flex items-start lg:mt-10 justify-center px-4 overflow-y-auto lg:overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 place-items-center w-full max-w-9xl py-6 lg:py-0">
                    <div className="flex lg:hidden items-center justify-center mt-5">
                        <Image
                         src={`${process.env.NEXT_PUBLIC_PROD_URL}/principallogin.png`}
                            alt="Illustration"
                            width={360}
                            height={300}
                            className="max-h-[300px] sm:max-h-[320px] md:max-h-[350px] w-100 object-contain"
                            priority
                        />
                    </div>

                    {/* Left Section */}
                    <div className="flex flex-col justify-center lg:self-start px-8 md:px-20 w-full sm:w-150 ml-5 mt-5 md:mt-10 lg:mt-0 lg:ml-0 xl:ml-10">
                        <h1 className="text-lg md:text-2xl font-semibold mb-10 text-black">
                            Principals, School Management
                        </h1>

                        <h1 className="text-lg md:text-xl font-semibold mb-10 lg:mb-14 text-black">
                            Login through OTP
                        </h1>

                        <form onSubmit={handleSubmit}>
                            {/* Phone Number Field */}
                            <div className="flex flex-col gap-2 mb-10">
                                <label className="block text-[1.05rem] font-medium text-black">
                                    Phone Number (for OTP)
                                </label>
                                {errors.phone && (
                                    <p className="text-sm text-red-500">{errors.phone}</p>
                                )}
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        className={`w-[80%] border ${errors.phone ? "border-red-500" : "border-gray-300"
                                            } p-3 py-4 bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400`}
                                    />
                                    <button type="button" onClick={sendOTP} className="bg-[#6ebdfc] text-white p-4">
                                        <FaArrowRight size={25} />
                                    </button>
                                </div>
                            </div>

                            {/* OTP Fields */}
                            <label className="block text-[1.05rem] font-medium text-black mb-2">
                                OTP
                            </label>
                            {errors.otp && (
                                <p className="text-sm text-red-500 mb-3">{errors.otp}</p>
                            )}
                            <div className="flex gap-2 mb-2">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={otpRefs[i]}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        className={`w-12 h-12 border ${errors.otp ? "border-red-500" : "border-gray-300"
                                            } text-center text-lg font-semibold bg-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-400`}
                                    />
                                ))}
                            </div>

                            <p className="text-[12px] text-black mb-5">
                                Enter the OTP received via SMS
                            </p>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-[80%] py-4 bg-[#6ebdfc] hover:bg-sky-400 text-white text-[1.2rem] transition"
                            >
                                Submit
                            </button>
                        </form>
                    </div>

                    {/* Right Section - Image */}
                    <div className="hidden lg:flex lg:self-end items-center justify-center">
                        <Image
                         src={`${process.env.NEXT_PUBLIC_PROD_URL}/principallogin.png`}
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
    );
}
