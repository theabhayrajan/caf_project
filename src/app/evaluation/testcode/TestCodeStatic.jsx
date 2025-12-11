// app/evaluation/testcode/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Header from "../../../components/Header";
import toast from "react-hot-toast";

export default function TestCodeStatic() {
    const router = useRouter();
    const params = useSearchParams();
    const userId = params.get("userId");
    const kidId = params.get("kidId");

    const [testCode, setTestCode] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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

    const validateForm = () => {
        const formErrors = {};
        if (!testCode.trim()) formErrors.testCode = "Test code is required.";
        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const handleKid = (e) => {
        e.preventDefault();
        router.push(`/evaluation/kidsedit?userId=${userId}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_PROD_URL}/api/kids/class-tests?testCode=${encodeURIComponent(
                    testCode.trim()
                )}`
            );
            const data = await res.json();

            if (data.success && data.tests && data.tests.length > 0) {
                // sahi code → take-test page par redirect
                router.push(
                    `/evaluation/take-test?userId=${userId || ""}&kidId=${kidId || ""
                    }&code=${encodeURIComponent(testCode.trim())}`
                );
            } else {
                // galat / missing test → isi page par message
                setErrors({ testCode: "No such test exists for this code." });
                toast.error("No such test exists for this code.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Unable to verify test code. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex flex-col lg:overflow-hidden">
            <Header />

            <div className="flex-1 flex items-start lg:mt-20 justify-center px-4 overflow-y-auto lg:overflow-hidden relative">
                {/* Top Right Button */}
                <div className="absolute right-5 lg:flex items-center gap-2 pt-5 lg:pt-0">
                    <div className="flex-1 bg-gray-200 mr-4" />
                    <button
                        onClick={handleKid}
                        className="rounded-md bg-[#3690e5] border border-gray-300 px-3 sm:px-4 py-3 text-sm sm:text-base font-medium text-white hover:bg-[#5eb1ff]"
                    >
                         + Add / Edit Kid
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 place-items-center w-full max-w-9xl py-6 lg:py-0">
                    {/* Image for small screens */}
                    <div className="flex lg:hidden items-center justify-center mt-15 sm:mt-5">
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
                            Enter the Test Code
                        </h1>

                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-2 mb-10">
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
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-[100%] lg:w-[80%] py-4 bg-[#6ebdfc] hover:bg-sky-400 text-white text-[1.2rem] transition"
                            >
                                {loading ? "Checking..." : "Submit"}
                            </button>
                        </form>
                    </div>

                    {/* Right image */}
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
