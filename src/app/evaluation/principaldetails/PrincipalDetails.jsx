"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Header from "../../../components/Header";
import toast from "react-hot-toast";

export default function PrincipalDetails() {
    const router = useRouter();
    const params = useSearchParams();
    const userId = params.get("userId");

    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [pincode, setPincode] = useState("");
    const [testCode, setTestCode] = useState("");
    const [agreeToMembership, setAgreeToMembership] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (window.innerWidth >= 1024) {
            document.body.style.overflow = "hidden";
            document.body.style.height = "100vh";
        }
        return () => {
            document.body.style.overflow = "auto";
            document.body.style.height = "auto";
        };
    }, []);

    const validateForm = () => {
        const formErrors = {};
        if (!name.trim()) formErrors.name = "Principal name is required.";
        if (!city.trim()) formErrors.city = "City is required.";
        if (!pincode.trim()) formErrors.pincode = "Pin code is required.";
        if (!testCode.trim()) formErrors.testCode = "Test code is required.";
        if (!agreeToMembership) formErrors.agree = "You must agree to become a member.";

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    // ⭐ SAVE DETAILS
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (!userId) {
            toast.error("Missing user ID.");
            return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/principal/save-details`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                name,
                test_code: testCode,
                city,
                pincode,
                is_member: agreeToMembership
            }),
        });

        const data = await res.json();

        if (data.success) {
            toast.success("Details submitted successfully!");
            router.push("/");
        } else {
            toast.error(data.message || "Failed to save details");
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:overflow-hidden">
            <Header />
            <div className="flex-1 flex items-start lg:mt-20 justify-center px-4 overflow-y-auto lg:overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 place-items-center w-full max-w-9xl py-6 lg:py-0">

                    <div className="flex lg:hidden items-center justify-center mt-5">
                        <Image
                            src={`${process.env.NEXT_PUBLIC_PROD_URL}/principallogin.png`}
                            alt="Illustration"
                            width={360}
                            height={300}
                            className="max-h-[300px] object-contain"
                            priority
                        />
                    </div>

                    {/* LEFT SECTION (unchanged UI) */}
                    <div className="flex flex-col justify-center lg:self-start px-8 md:px-20 w-full sm:w-150 ml-5 mt-5 lg:mt-0 lg:ml-0 xl:ml-10">
                        
                        <h1 className="text-lg md:text-xl font-semibold mb-10 lg:mb-7 text-black">
                            If you are using it for the first time, Enter the below details
                        </h1>

                        <form onSubmit={handleSubmit}>

                            {/* NAME */}
                            <div className="flex flex-col gap-2 mb-10">
                                <label className="text-[1.05rem] font-medium">Name of the principal</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`w-[100%] lg:w-[80%] border ${
                                        errors.name ? "border-red-500" : "border-gray-300"
                                    } p-3 bg-gray-100`}
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            {/* TEST CODE */}
                            <div className="flex flex-col gap-2 mb-10">
                                <label className="text-[1.05rem] font-medium">Test Code</label>
                                <input
                                    type="text"
                                    value={testCode}
                                    onChange={(e) => setTestCode(e.target.value)}
                                    className={`w-[100%] lg:w-[80%] border ${
                                        errors.testCode ? "border-red-500" : "border-gray-300"
                                    } p-3 bg-gray-100`}
                                />
                                {errors.testCode && <p className="text-xs text-red-500">{errors.testCode}</p>}
                            </div>

                            {/* CITY + PINCODE */}
                            <div className="flex flex-col md:flex-row gap-8 mb-10 lg:w-[350px]">
                                <div className="flex-1">
                                    <label className="text-[1.05rem] font-medium">City</label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className={`w-[100%] border ${errors.city ? "border-red-500" : "border-gray-300"
                                            } p-3 bg-gray-100`}
                                    />
                                    {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                                </div>

                                <div>
                                    <label className="text-[1.05rem] font-medium">Pin code</label>
                                    <input
                                        type="number"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value)}
                                        className={`w-[100%] border ${
                                            errors.pincode ? "border-red-500" : "border-gray-300"
                                        } p-3 bg-gray-100`}
                                    />
                                    {errors.pincode && <p className="text-xs text-red-500">{errors.pincode}</p>}
                                </div>
                            </div>

                            {/* MEMBERSHIP CHECKBOX */}
                            <div className="flex flex-col gap-2 mb-7">
                                <div className="flex gap-5 items-start">
                                    <input
                                        type="checkbox"
                                        checked={agreeToMembership}
                                        onChange={(e) => setAgreeToMembership(e.target.checked)}
                                        className="w-6 h-6 mt-1"
                                    />
                                    <label className="text-lg">I will be a member of CAF.</label>
                                </div>
                                {errors.agree && <p className="text-xs text-red-500 ml-11">{errors.agree}</p>}
                            </div>

                            {/* SUBMIT */}
                            <button
                                type="submit"
                                className="w-[100%] lg:w-[80%] py-4 bg-[#6ebdfc] text-white text-[1.2rem]"
                            >
                                Submit
                            </button>
                        </form>
                    </div>

                    <div className="hidden lg:flex justify-center">
                        <Image
                            src={`${process.env.NEXT_PUBLIC_PROD_URL}/principallogin.png`}
                            width={540}
                            height={420}
                            alt="Illustration"
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
