"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Header from "../../../components/Header";
import toast from "react-hot-toast";

export default function OTPLoginStatic() {
    const router = useRouter();
    const params = useSearchParams();
    const userId = params.get("userId"); // 👈 GET ID FROM URL

    const [name, setName] = useState("");
    const [occupation, setOccupation] = useState("");
    const [experience, setExperience] = useState("");
    const [city, setCity] = useState("");
    const [pincode, setPincode] = useState("");
    const [website, setWebsite] = useState("");
    const [agreeToMembership, setAgreeToMembership] = useState(false);
    const [agreeToService, setAgreeToService] = useState(false);
    const [errors, setErrors] = useState({});

    // PREVENT SCROLL (your existing logic)
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

    // VALIDATION
    const validateForm = () => {
        const formErrors = {};
        if (!name.trim()) formErrors.name = "Name is required.";
        if (!occupation.trim()) formErrors.occupation = "Occupation is required.";
        if (!experience) formErrors.experience = "Experience is required.";
        if (!city.trim()) formErrors.city = "City is required.";
        if (!pincode.trim()) formErrors.pincode = "Pin code is required.";
        if (!website.trim()) formErrors.website = "Website Link is required.";
        if (!agreeToMembership) formErrors.agree1 = "Please agree to membership.";
        if (!agreeToService) formErrors.agree2 = "Please agree to counselling service.";

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    // SUBMIT FORM → SAVE PROFILE API
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (!userId) {
            toast.error("Missing user ID");
            return;
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/psychologist/save-details`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                name,
                occupation,
                experience,                 // FIXED
                city,
                pincode,
                website,                    // FIXED
                is_member: agreeToMembership,
                provide_counselling: agreeToService, // FIXED
            })
        });

        const data = await res.json();
        if (data.success) {
            toast.success("Details submitted successfully!");
            setTimeout(() => {
                router.push("/memberlogin/psychologistspolicy");
            }, 1000);
        } else {
            toast.error(data.message || "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen flex flex-col xl:overflow-hidden">
            <Header />
            <div className="flex-1 flex items-center justify-center px-4 overflow-y-auto lg:overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 place-items-center w-full max-w-9xl py-6 lg:py-0">

                    {/* Small screen image */}
                    <div className="flex lg:hidden items-center justify-center mt-5">
                        <Image
                            src="/principallogin.png"
                            alt="Illustration"
                            width={360}
                            height={300}
                            className="max-h-[300px] sm:max-h-[320px] md:max-h-[350px] w-90 object-contain"
                            priority
                        />
                    </div>

                    {/* LEFT SECTION (UI unchanged) */}
                    <div className="flex flex-col justify-center px-8 md:px-20 w-full sm:w-150 ml-5 mt-5 md:mt-10 lg:mt-0 lg:ml-0 xl:ml-10">
                        <h1 className="text-lg md:text-xl font-semibold mb-10 lg:mb-7 text-black lg:whitespace-nowrap">
                            If you are using it for the first time, Enter the below details
                        </h1>

                        <form onSubmit={handleSubmit}>
                            {/* Name */}
                            <div className="flex flex-col gap-2 mb-10">
                                <label className="text-[1.05rem] font-medium text-black">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`w-[100%] lg:w-[80%] border ${errors.name ? "border-red-500" : "border-gray-300"} 
                                    p-3 py-4 bg-gray-100`}
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            {/* Occupation + Experience */}
                            <div className="flex flex-col md:flex-row gap-8 mb-10 xl:w-[550px]">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[1.05rem] font-medium text-black">Occupation</label>
                                    <input
                                        type="text"
                                        value={occupation}
                                        onChange={(e) => setOccupation(e.target.value)}
                                        className={`w-[100%] md:w-[275px] xl:w-[350px] border ${errors.occupation ? "border-red-500" : "border-gray-300"} 
                                        p-3 py-4 bg-gray-100`}
                                    />
                                    {errors.occupation && <p className="text-xs text-red-500">{errors.occupation}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[1.05rem] font-medium text-black">Experience (years)</label>
                                    <input
                                        type="number"
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value)}
                                        className={`w-[100%] md:w-[150px] border ${errors.experience ? "border-red-500" : "border-gray-300"}
                                        p-3 py-4 bg-gray-100`}
                                    />
                                    {errors.experience && <p className="text-xs text-red-500">{errors.experience}</p>}
                                </div>
                            </div>

                            {/* City + Pincode */}
                            <div className="flex flex-col md:flex-row gap-8 mb-10 lg:w-[350px]">
                                <div className="flex-1">
                                    <label className="text-[1.05rem] font-medium text-black">City</label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className={`w-[100%] md:w-[275px] lg:w-[220px] border ${errors.city ? "border-red-500" : "border-gray-300"} 
                                        p-3 py-4 bg-gray-100`}
                                    />
                                    {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                                </div>

                                <div>
                                    <label className="text-[1.05rem] font-medium text-black">Pin code</label>
                                    <input
                                        type="number"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value)}
                                        className={`w-[100%] md:w-[150px] border ${errors.pincode ? "border-red-500" : "border-gray-300"}
                                        px-5 py-4 bg-gray-100`}
                                    />
                                    {errors.pincode && <p className="text-xs text-red-500">{errors.pincode}</p>}
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="flex flex-col gap-2 mb-4">
                                <div className="flex gap-5 items-start">
                                    <input
                                        type="checkbox"
                                        checked={agreeToMembership}
                                        onChange={(e) => setAgreeToMembership(e.target.checked)}
                                        className="w-6 h-6 mt-1"
                                    />
                                    <label className="text-lg">I will be a member of CAF.</label>
                                </div>
                                {errors.agree1 && <p className="text-xs text-red-500 ml-11">{errors.agree1}</p>}
                            </div>

                            <div className="flex flex-col gap-2 mb-7">
                                <div className="flex gap-5 items-start">
                                    <input
                                        type="checkbox"
                                        checked={agreeToService}
                                        onChange={(e) => setAgreeToService(e.target.checked)}
                                        className="w-6 h-6 mt-1"
                                    />
                                    <label className="text-lg">I will also provide counselling service</label>
                                </div>
                                {errors.agree2 && <p className="text-xs text-red-500 ml-11">{errors.agree2}</p>}
                            </div>

                            {/* Website */}
                            <div className="flex flex-col gap-2 mb-10">
                                <label className="text-[1.05rem] font-medium text-black">Website link for counselling</label>
                                <input
                                    type="text"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className={`w-[100%] lg:w-[120%] border ${errors.website ? "border-red-500" : "border-gray-300"}
                                    p-3 py-4 bg-gray-100`}
                                />
                                {errors.website && <p className="text-xs text-red-500">{errors.website}</p>}
                            </div>

                            {/* Submit */}
                            <button type="submit"
                                className="w-[100%] lg:w-[80%] py-4 bg-[#6ebdfc] hover:bg-sky-400 text-white text-[1.2rem] transition">
                                Submit
                            </button>
                        </form>
                    </div>

                    {/* Right image */}
                    <div className="hidden lg:flex items-center justify-center">
                        <Image
                            src="/principallogin.png"
                            alt="Illustration"
                            width={540}
                            height={420}
                            className="max-h-[420px] 2xl:max-h-[500px] object-contain"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
