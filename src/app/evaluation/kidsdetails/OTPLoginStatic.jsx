"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Header from "../../../components/Header";
import toast from "react-hot-toast";

export default function OTPLoginStatic() {
    const router = useRouter();
    const params = useSearchParams();
    const userId = params.get("userId"); 

    const [name, setName] = useState("");
    const [grade, setGrade] = useState("");
    const [accreditation, setAccreditation] = useState("");
    // const [testCode, setTestCode] = useState("");
    const [errors, setErrors] = useState({});

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

    const validateForm = () => {
        const formErrors = {};
        if (!name.trim()) formErrors.name = "Full name is required.";
        if (!grade) formErrors.grade = "Please select your class.";
        if (!accreditation) formErrors.accreditation = "Please select accreditation.";
        // if (!testCode.trim()) formErrors.testCode = "Test code is required.";
        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!userId) {
        toast.error("Missing user ID");
        return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/kids/save-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId,
            name,
            grade,
            accreditation,
            // testCode
        })
    });

    const data = await res.json();

    if (data.success) {
        toast.success("Details saved successfully!");
        router.push("/");
    } else {
        toast.error(data.message || "Something went wrong");
    }
};

    return (
        <div className="min-h-screen flex flex-col lg:overflow-hidden">
            <Header />
            <div className="flex-1 flex items-start lg:mt-20 justify-center px-4 overflow-y-auto lg:overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 place-items-center w-full max-w-9xl py-6 lg:py-0">
                    {/* Image for small screens */}
                    <div className="flex lg:hidden items-center justify-center mt-5">
                        <Image
                            src={`${process.env.NEXT_PUBLIC_PROD_URL}/kidsotp.png`}
                            alt="Illustration"
                            width={360}
                            height={300}
                            className="max-h-[300px] sm:max-h-[320px] md:max-h-[350px] w-90 object-contain"
                            priority
                        />
                    </div>

                    {/* Left Section */}
                    <div className="flex flex-col justify-center lg:self-start px-8 md:px-20 w-full sm:w-150 ml-5 mt-5 md:mt-10 lg:mt-0 lg:ml-0 xl:ml-10">
                        <h1 className="text-lg md:text-xl font-semibold mb-10 lg:mb-14 text-black xl:-translate-x-22">
                            Enter your details
                        </h1>

                        <form onSubmit={handleSubmit}>
                            {/* Full Name */}
                            <div className="flex flex-col gap-2 mb-10">
                                <label className="block text-[1.05rem] font-medium text-black">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`w-[100%] lg:w-[80%] border ${errors.name ? "border-red-500" : "border-gray-300"
                                        } p-3 py-4 bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400`}
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            {/* Class + Accreditation */}
                            <div className="flex flex-col md:flex-row gap-8 mb-10">
                                <div>
                                    <label className="block text-[1.05rem] font-medium text-black">
                                        Class (Grade)
                                    </label>
                                    <select
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                        className={`w-[100%] md:w-[200px] border ${errors.grade ? "border-red-500" : "border-gray-300"
                                            } p-3 py-4 bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400`}
                                    >
                                        <option value="">Select</option>
                                        <option value="8th">8th</option>
                                        <option value="9th">9th</option>
                                        <option value="10th">10th</option>
                                        <option value="11th">11th</option>
                                        <option value="12th">12th</option>
                                    </select>
                                    {errors.grade && <p className="text-xs text-red-500">{errors.grade}</p>}
                                </div>

                                <div>
                                    <label className="block text-[1.05rem] font-medium text-black">
                                        Accreditation
                                    </label>
                                    <select
                                        value={accreditation}
                                        onChange={(e) => setAccreditation(e.target.value)}
                                        className={`w-[100%] md:w-[200px] border ${errors.accreditation ? "border-red-500" : "border-gray-300"
                                            } px-5 py-4 bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400`}
                                    >
                                        <option value="">Select</option>
                                        <option value="ICSE">ICSE</option>
                                        <option value="CBSE">CBSE</option>
                                        <option value="IB">IB</option>
                                        <option value="State Board">State Board</option>
                                    </select>
                                    {errors.accreditation && (
                                        <p className="text-xs text-red-500">{errors.accreditation}</p>
                                    )}
                                </div>
                            </div>

                            {/* Test Code */}
                            {/* <div className="flex flex-col gap-2 mb-10">
                                <label className="block text-[1.05rem] font-medium text-black">
                                    Test Code
                                </label>
                                <input
                                    type="text"
                                    value={testCode}
                                    onChange={(e) => setTestCode(e.target.value)}
                                    className={`w-[100%] lg:w-[80%] border ${errors.testCode ? "border-red-500" : "border-gray-300"
                                        } p-3 py-4 bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400`}
                                />
                                {errors.testCode && (
                                    <p className="text-xs text-red-500">{errors.testCode}</p>
                                )}
                            </div> */}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-[100%] lg:w-[80%] py-4 bg-[#6ebdfc] hover:bg-sky-400 text-white text-[1.2rem] transition"
                            >
                                Submit
                            </button>
                        </form>
                    </div>

                    {/* Right Section - Image */}
                    <div className="hidden lg:flex lg:self-end lg:translate-y-25 items-center justify-center">
                        <Image
                            src={`${process.env.NEXT_PUBLIC_PROD_URL}/kidsotp.png`}
                            alt="Illustration"
                            width={360}
                            height={420}
                            className="max-h-[420px] 2xl:max-h-[500px] w-90 object-contain"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
