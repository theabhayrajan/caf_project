"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Header from "../../../components/Header";
import { FaArrowRight } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function OTPLoginStatic() {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [errors, setErrors] = useState({});
    const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

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
        if (phone.length !== 10) formErrors.phone = "Please enter 10-digit valid number.";
        if (otp.join("").length !== 4) formErrors.otp = "Enter all 4 OTP digits.";
        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    // ⭐ DEMO OTP (Merged user table)
const sendOTP = async () => {
    if (phone.length !== 10) {
        setErrors({ phone: "Enter valid phone number" });
        return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, role_id: 1 }),
    });

    const data = await res.json();

    // ⭐ ADD THIS → This prints the OTP in browser console
    console.log("OTP for psychologist:", data.otp);

    if (data.success) toast.success("Demo OTP generated! Check console.");
    else toast.error(data.message || "OTP generation failed");
};

    // ⭐ VERIFY OTP (Merged user table)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/auth/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, otp: otp.join("") }),
        });

        const data = await res.json();
        

        if (!data.success) {
            toast.error(data.message || "Invalid OTP");
            return;
        }

        toast.success("OTP Verified!");

        // ⭐ User has profile → redirect to articles
        if (data.hasDetails) {
            router.push("/articles");
        } else {
            // ⭐ First-time user → go to psychologist detail form
            router.push(`/memberlogin/psychologistsdetails?userId=${data.userId}`);
        }
    };

    const handleGoogleLogin = () => toast.success("Google login clicked!");

    return (
        <div className="min-h-screen flex flex-col lg:overflow-hidden">
            <Header />
            <div className="flex-1 flex items-center justify-center px-4 overflow-y-auto lg:overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 place-items-center w-full max-w-9xl py-6 lg:py-0">
                    <div className="flex lg:hidden items-center justify-center mt-5">
                        <Image src="/principallogin.png" alt="Illustration" width={360} height={300}
                            className="max-h-[300px] sm:max-h-[320px] md:max-h-[350px] w-90 object-contain" priority />
                    </div>

                    {/* 🔥 UI SAME - NO CHANGES */}
                    <div className="flex flex-col justify-center px-8 md:px-20 w-full sm:w-150 ml-5 mt-5 md:mt-10 lg:mt-0 lg:ml-0 xl:ml-10">
                        <h1 className="text-lg md:text-xl lg:text-2xl font-semibold mb-6 lg:mb-8 text-black">
                            For Educationists, child psychologists
                        </h1>
                        <h2 className="text-base md:text-lg lg:text-xl font-semibold mb-6 lg:mb-10 text-black">
                            Login through OTP
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-2 mb-8">
                                <label className="text-sm md:text-base text-black font-medium">Phone Number (for OTP)</label>
                                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}

                                <div className="flex items-center gap-2">
                                    <input type="tel" value={phone} onChange={handlePhoneChange}
                                        className={`w-[80%] border ${errors.phone ? "border-red-500" : "border-gray-300"}
                                        p-3 py-4 bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400`} />

                                    <button type="button" onClick={sendOTP}
                                        className="bg-[#6ebdfc] hover:bg-sky-400 text-white p-4">
                                        <FaArrowRight size={25} />
                                    </button>
                                </div>
                            </div>

                            <label className="text-sm md:text-base font-medium text-black mb-2 block">OTP</label>
                            {errors.otp && <p className="text-sm text-red-500 mb-3">{errors.otp}</p>}

                            <div className="flex gap-2 mb-2">
                                {otp.map((d, i) => (
                                    <input key={i} ref={otpRefs[i]} maxLength="1" value={d}
                                        onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        className={`w-12 h-12 text-center text-lg font-bold bg-gray-100 border 
                                        ${errors.otp ? "border-red-500" : "border-gray-300"}
                                        focus:outline-none focus:ring-2 focus:ring-sky-400`} />
                                ))}
                            </div>

                            <p className="text-xs text-gray-600 mb-6">Enter OTP shown in console</p>

                            <button type="submit"
                                className="w-[80%] py-4 bg-[#6ebdfc] text-white text-base md:text-lg font-medium">
                                Submit
                            </button>
                        </form>

                        <div className="flex items-center gap-4 my-8 pt-7">
                            <div className="flex-1 border-t border-black"></div>
                            <span className="text-black font-medium text-lg">OR</span>
                            <div className="flex-1 border-t border-black"></div>
                        </div>

                        <button onClick={handleGoogleLogin}
                            className="w-[100%] md:w-[45%] flex items-center justify-center gap-3 py-3 bg-white border-2 border-gray-300">
                            <FcGoogle className="text-2xl" />
                            <span className="text-gray-700 font-medium">Log in with Google</span>
                        </button>
                    </div>

                    <div className="hidden lg:flex items-center justify-center">
                        <Image src="/principallogin.png" width={540} height={420} alt="Illustration"
                            className="max-h-[420px] xl:max-h-[480px] 2xl:max-h-[520px] object-contain" priority />
                    </div>
                </div>
            </div>
        </div>
    );
}
