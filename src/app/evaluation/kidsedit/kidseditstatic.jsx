// app/evaluation/kidsdetails/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import toast from "react-hot-toast";

export default function Kidseditstatic() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const userId = searchParams.get("userId");

    const [kids, setKids] = useState([]);
    const [selectedKid, setSelectedKid] = useState(null);
    const [name, setName] = useState("");
    const [grade, setGrade] = useState("");
    const [accreditation, setAccreditation] = useState("");
    // const [testCode, setTestCode] = useState("");

    const [originalKid, setOriginalKid] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [errors, setErrors] = useState({});

    const [loading, setLoading] = useState(false);

    // API se kids list lao
    useEffect(() => {
        const fetchKids = async () => {
            if (!userId) return;
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_PROD_URL}/api/kids/kids-profiles?userId=${userId}`
                );
                const data = await res.json();
                console.log("kids data: ", data);
                if (data.success) {
                    setKids(data.kids || []);
                    // agar kam se kam ek kid hai to usko select karo
                    if (data.kids && data.kids.length > 0) {
                        handleSelectKid(data.kids[0]);
                    }
                } else {
                    toast.error(data.message || "Unable to load students."); // NEW
                }
            } catch (err) {
                console.error(err);
                toast.error("Something went wrong while loading students."); // NEW
            }
        };
        fetchKids();
    }, [userId]);

    const resetForm = () => {
        setSelectedKid(null);
        setOriginalKid(null)
        setName("");
        setGrade("");
        setAccreditation("");
        // setTestCode("");
    };

    const handleSelectKid = (kid) => {
        setSelectedKid(kid);
        setOriginalKid(kid);           // NEW
        setName(kid.full_name || "");
        setGrade(kid.grade || "");
        setAccreditation(kid.accreditation || "");
        // setTestCode(kid.test_code || "");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!userId) return;

        // basic validation (create + update dono ke liye)
        const newErrors = {};
        if (!name.trim()) newErrors.name = "Full name is required";
        if (!grade) newErrors.grade = "Class is required";
        if (!accreditation) newErrors.accreditation = "Accreditation is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill all required fields.");
            return;
        }
        setErrors({});

        // koi change nahi hua → kuch mat karo
        if (
            selectedKid &&
            originalKid &&
            name === (originalKid.full_name || "") &&
            grade === (originalKid.grade || "") &&
            accreditation === (originalKid.accreditation || "")
        ) {
            return;
        }

        if (selectedKid) {
            setPendingAction("update");
            setShowConfirmModal(true);
        } else {
            setPendingAction("create");
            setShowConfirmModal(true);
        }
    };


    const performSave = async () => {
        if (!userId) return;

        setLoading(true);
        try {
            let res;

            if (selectedKid) {
                res = await fetch(
                    `${process.env.NEXT_PUBLIC_PROD_URL}/api/kids/save-details/${selectedKid.id}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId,
                            name,
                            grade,
                            accreditation,
                            // testCode,
                        }),
                    }
                );
            } else {
                res = await fetch(
                    `${process.env.NEXT_PUBLIC_PROD_URL}/api/kids/save-details`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId,
                            name,
                            grade,
                            accreditation,
                            // testCode,
                        }),
                    }
                );
            }

            const data = await res.json();
            if (data.success) {
                if (selectedKid) {
                    // UPDATE case: local array me bhi update
                    setKids((prev) =>
                        prev.map((k) =>
                            k.id === selectedKid.id
                                ? { ...k, full_name: name, grade, accreditation }
                                : k
                        )
                    );
                    setOriginalKid((prev) =>
                        prev ? { ...prev, full_name: name, grade, accreditation } : prev
                    );
                    toast.success(`${name || "Kid"}’s details updated successfully.`);
                } else {
                    // CREATE case: naya kid list me push karo
                    const newKid = {
                        id: data.insertId || Date.now(), // insertId backend se
                        full_name: name,
                        grade,
                        accreditation,
                        user_id: userId,
                    };

                    setKids((prev) => [...prev, newKid]);
                    setSelectedKid(newKid);
                    setOriginalKid(newKid);
                    toast.success("New Kid added");
                }
            } else {
                console.error(data.message || "Failed");
                toast.error(data.message || "Unable to save details. Please try again.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Unexpected error. Please try again in a moment.");
        } finally {
            setLoading(false);
            setShowConfirmModal(false);
            setPendingAction(null);
        }
    };


    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* TOP: kids cards row */}
            <div className="px-16 pt-12 pb-10 border-b border-gray-200 bg-[#f7f7f7]">
                <div className="flex items-center gap-6">
                    {/* cards container */}
                    <div className="flex flex-wrap gap-6">
                        {kids.map((kid) => (
                            <button
                                key={kid.id}
                                type="button"
                                onClick={() => handleSelectKid(kid)}
                                className={`w-72 h-40 border ${selectedKid && selectedKid.id === kid.id
                                    ? "border-sky-400"
                                    : "border-gray-300"
                                    } bg-white shadow-sm flex items-center justify-center text-lg font-semibold text-gray-800 hover:shadow-lg`}
                            >
                                {kid.full_name}
                            </button>
                        ))}

                        {/* Create other student card */}
                        <button
                            type="button"
                            onClick={resetForm}
                            className="w-72 h-40 flex flex-col items-center justify-center gap-3 cursor-pointer "
                        >
                            <div className="flex items-center justify-center h-25 w-25 rounded-full bg-[#eaeaea]  hover:shadow-lg">
                                <span className="text-7xl leading-none text-[#d1d3d4]">+</span>
                            </div>
                            <span className="text-sky-500 text-base ">Create other student</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* BOTTOM: form + illustration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 place-items-center w-full max-w-9xl py-6 lg:py-0">
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

                {/* left form */}
                <div className="flex flex-col justify-center lg:self-start px-8 md:px-20 w-full sm:w-150 ml-5 mt-5 md:mt-10 lg:mt-0 lg:ml-0 xl:ml-10">
                    <h1 className="text-lg md:text-xl font-semibold mb-10 lg:mb-14 text-black xl:-translate-x-22 2xl:-translate-x-40 pt-10">
                        Enter your details
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Full name */}
                        {/* Full name */}
                        <div className="flex flex-col gap-2 mb-10">
                            <label className="block text-[1.05rem] font-medium text-black">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-[100%] lg:w-[80%] p-3 py-4 bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                            />
                            {errors.name && (
                                <span className="text-sm text-red-500 mt-1">{errors.name}</span>
                            )}
                        </div>


                        {/* Row: Class + Accreditation */}
                        <div className="flex flex-col md:flex-row gap-8 mb-10">
                            {/* Class (Grade) */}
                            <div>
                                <label className="block text-[1.05rem] font-medium text-black">
                                    Class (Grade)
                                </label>
                                <select
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    className="w-[100%] md:w-[200px] p-3 py-4 bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                                >
                                    <option value="">Select</option>
                                    <option value="1st">1st</option>
                                    <option value="2nd">2nd</option>
                                    <option value="3rd">3rd</option>
                                    <option value="4th">4th</option>
                                    <option value="5th">5th</option>
                                    <option value="6th">6th</option>
                                    <option value="7th">7th</option>
                                    <option value="8th">8th</option>
                                    <option value="9th">9th</option>
                                    <option value="10th">10th</option>
                                    <option value="11th">11th</option>
                                    <option value="12th">12th</option>
                                </select>
                                {errors.grade && (
                                    <span className="text-sm text-red-500 mt-1 block">{errors.grade}</span>
                                )}
                            </div>


                            {/* Accreditation */}
                            <div>
                                <label className="block text-[1.05rem] font-medium text-black">
                                    Accreditation
                                </label>
                                <select
                                    value={accreditation}
                                    onChange={(e) => setAccreditation(e.target.value)}
                                    className="w-[100%] md:w-[200px] px-5 py-4 bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                                >
                                    <option value="">Select</option>
                                    <option value="ICSE">ICSE</option>
                                    <option value="CBSE">CBSE</option>
                                    <option value="IB">IB</option>
                                    <option value="State Board">State Board</option>
                                </select>
                                {errors.accreditation && (
                                    <span className="text-sm text-red-500 mt-1 block">
                                        {errors.accreditation}
                                    </span>
                                )}
                            </div>

                        </div>

                        {/* Test code */}
                        {/* <div className="flex flex-col gap-2 mb-10">
                            <label className="block text-[1.05rem] font-medium text-black">
                                Test Code
                            </label>
                            <input
                                type="text"
                                value={testCode}
                                onChange={(e) => setTestCode(e.target.value)}
                                className="w-[100%] lg:w-[80%] p-3 py-4 bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                            />
                        </div> */}

                        {/* NEXT button */}
                        <div className="pt-4 flex flex-col gap-5">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-[100%] lg:w-[80%] py-4 bg-[#6ebdfc] hover:bg-sky-400 text-white text-[1.2rem] transition"
                            >
                                {loading
                                    ? selectedKid
                                        ? "Updating..."
                                        : "Creating..."
                                    : selectedKid
                                        ? "Update"
                                        : "Create"}
                            </button>
                            <button
                                type="button"
                                disabled={!selectedKid}
                                onClick={() => {
                                    if (!selectedKid) return;
                                    router.push(
                                        `/evaluation/testcode?userId=${userId}&kidId=${selectedKid.id}`
                                    );
                                }}
                                className="w-[100%] lg:w-[80%] py-4 border border-[#2096f7] hover:bg-sky-400 text-[#2096f7] hover:text-white text-[1.2rem] transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                Give Test
                            </button>
                        </div>
                    </form>
                </div>

                {/* right illustration */}
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

            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-md shadow-lg px-6 py-5 max-w-sm w-full">
                        <h2 className="text-lg font-semibold mb-2">Confirm changes</h2>
                        <p className="text-sm text-gray-700 mb-4">
                            Are you sure you want to update this student&apos;s details?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setPendingAction(null);
                                }}
                                className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={performSave}
                                disabled={loading}
                                className="px-4 py-2 text-sm rounded bg-[#2E98DA] text-white hover:bg-[#1a7ab8]"
                            >
                                {loading ? "Saving..." : "Yes, update"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
