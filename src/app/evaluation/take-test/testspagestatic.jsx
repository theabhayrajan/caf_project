"use client";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const mockTests = [
    {
        id: "hdi-kids",
        title: "HDI Assessments for kids",
        subtitle: "Empowering Growth Through Holistic Evaluations",
        priceLabel: "Free",
    },
    // ... rest of your mock data
];

export default function TestsPageStatic() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const kidTestCode = searchParams.get("code");  // ✅ ye testCode hai
    const kidId = searchParams.get("kidId");
    const userId = searchParams.get("userId");

    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTests = async () => {
            if (!kidTestCode) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_PROD_URL}/api/kids/class-tests?testCode=${encodeURIComponent(
                        kidTestCode
                    )}`
                );
                const data = await res.json();

                if (data.success && data.tests && data.tests.length > 0) {
                    setTests(data.tests);
                } else {
                    toast.error("No such test exists for this code.");
                    router.push(`/evaluation/kidsedit?userId=${userId || ""}`);
                }
            } catch (err) {
                console.error(err);
                toast.error("Unable to load tests. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, [kidTestCode, router, userId]);

    const cardsToRender = tests.length > 0 ? mockTests.slice(0, tests.length) : [];

    // ✅ FIXED: testCode = kidTestCode + proper URL format
    const handleTakeTest = (testId) => {
        router.push(
            `/evaluation/give-test?userId=${userId || ""}&kidId=${kidId || ""}&code=${encodeURIComponent(kidTestCode || "")}`
        );
    };

    const handleKid = (e) => {
        e.preventDefault();
        router.push(`/evaluation/kidsedit?userId=${userId}`);
    };
    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-[#f6f7fb] flex items-center justify-center">
                    <p className="text-sm text-gray-700">Loading tests...</p>
                </div>
            </>
        );
    }
    return (
        <>
            <Header />

            <div className="min-h-screen bg-[#f6f7fb]">
                {/* top strip with button */}
                <div className="flex flex-col items-center justify-between gap-5 px-10 py-4">
                    <div className="flex justify-end self-end mt-5">
                        <button className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 cursor-pointer">
                            <span className="inline-flex h-7 w-7 items-center mr-2 justify-center overflow-hidden">
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_PROD_URL}/result.png`}
                                    alt="User avatar"
                                    width={36}
                                    height={36}
                                    className="object-cover"
                                />
                            </span>
                            <span className="font-bold text-[1rem]">My previous Result</span>
                        </button>
                    </div>
                    <div className="bg-[#8f8f8f] h-0.5 w-full" />
                </div>

                {/* line + Add new kid */}
                <div className="px-10 pt-3 pb-2 flex items-center justify-between">
                    <div className="flex-1 bg-gray-200 mr-4" />
                    <button
                        onClick={handleKid}
                        className="rounded-md bg-[#3690e5] border border-gray-300 px-4 py-3 text-base font-medium text-white hover:bg-[#5eb1ff]"
                    >
                        + Add / Edit Kid
                    </button>
                </div>

                {/* content area */}
                <main className="px-10 py-10">
                    <div className="max-w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 2x:gap-0">
                        {cardsToRender.map((test) => (
                            <article
                                key={test.id}
                                className=" bg-white border border-gray-200 px-10 py-8 rounded-lg w-full max-w-[420px] mx-auto"
                            >
                                {/* title + pill */}
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {test.title}
                                        </h2>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {test.subtitle}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-[#3690e5] px-4 py-1 text-[0.8rem] text-white">
                                        {test.priceLabel}
                                    </span>
                                </div>

                                {/* image */}
                                <div className="mb-6 flex justify-start">
                                    <div className="relative w-[220px] h-[160px] rounded-lg overflow-hidden">
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_PROD_URL}/image 64.png`}
                                            alt="HDI kids illustration"
                                            fill
                                            className="object-contain"
                                            sizes="220px"
                                        />
                                    </div>
                                </div>

                                {/* text */}
                                <div className="mb-6 text-xs leading-relaxed text-gray-800">
                                    <p className="font-semibold mb-1 text-[0.9rem]">
                                        ✨ Why Take This Test?
                                    </p>
                                    <p className="mb-1 text-[0.9rem] xl:px-2">
                                        Taking this test helps:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-0.5 text-[0.9rem] xl:px-4">
                                        <li>You understand yourself better</li>
                                        <li>
                                            Parents and educators support your learning style and
                                            emotions
                                        </li>
                                        <li>
                                            Build your Holistic Development Index (HDI) — a measure of
                                            your social and emotional growth
                                        </li>
                                    </ul>
                                </div>

                                {/* button */}
                                <button
                                     onClick={() => handleTakeTest(test.id)} 
                                    className="w-full h-11 rounded-sm bg-black text-sm font-medium text-white hover:bg-gray-900"
                                >
                                    Take Test
                                </button>
                            </article>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}
