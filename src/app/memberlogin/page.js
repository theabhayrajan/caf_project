"use client";
import Link from "next/link";
import Image from "next/image";
import FooterSection from "../../components/FooterSection";
import Header from "../../components/Header";

export default function Home() {
    return (
        <>
            {/* Header Section */}
            <Header />

            <div className="min-h-screen md:min-h-[50vh] lg:min-h-[40vh] bg-[#f7f7f7] flex flex-col items-center justify-start xl:justify-center px-4 md:px-10 lg:px-4 py-12 gap-12">

                {/* Intro Text */}
                <div className="w-full sm:w-[80vw] md:w-full lg:w-[90vw] xl:w-[80vw] 2xl:w-[55vw]">
                    <h1 className="text-base md:text-[1.1rem] xl:text-[1.2rem] 2xl:text-[1.25rem] leading-relaxed text-gray-800">
                        <strong>Your knowledge and expertise can help the kids to build a better tomorrow.</strong> 
                        We are inviting your participation to become a member of 
                        <strong> Cognitive Alliance Forumz (CAF) (संज्ञा-संयोग परिषद्).</strong>
                        Principals, child educationists, and psychologists are given 
                        <strong> free lifetime membership</strong> where you can write articles,
                        conduct assessments, and guide kids. You will also receive notifications on
                        ongoing programs that help your school children.
                    </h1>
                </div>

                {/* Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full sm:w-[80vw] md:min-h-[35vh] md:min-w-full lg:min-w-[90vw] lg:min-h-[40vh] xl:min-w-[70vw] 2xl:px-50 2xl:min-h-[32vh]">

                    {/* Card 1 */}
                    <Link
                        href="/memberlogin/psychologistslogin"
                        className="group flex flex-col md:flex-row items-center bg-white shadow-md p-6 cursor-pointer"
                    >
                        <Image
                            src="/psychologists.png"
                            alt="For Children Psychologists"
                            width={128}
                            height={128}
                            className="w-28 h-32 md:w-32 md:h-36 2xl:h-40 object-contain mb-4 md:mb-0 md:mr-4 grayscale group-hover:grayscale-0 transition"
                            priority
                        />

                        <div className="flex flex-col gap-7 text-center md:text-left">
                            <h2 className="text-[#2E98DA] text-lg md:text-[1.3rem] 2xl:text-[1.4rem] font-semibold">
                                For Children Psychologists, Educationists
                            </h2>
                            <p className="text-gray-600 text-base md:text-[1.1rem] 2xl:text-[1.2rem] leading-relaxed">
                                Contribute your knowledge and guidance for the growth of kids.
                            </p>
                        </div>
                    </Link>

                    {/* Card 2 */}
                    <Link
                        href="/evaluation/principallogin"
                        className="group flex flex-col md:flex-row items-center bg-white shadow-md p-6 cursor-pointer"
                    >
                        <Image
                            src="/Evaluation1.png"
                            alt="For School Principals"
                            width={128}
                            height={128}
                            className="w-28 h-32 md:w-32 md:h-36 2xl:h-40 object-contain mb-4 md:mb-0 md:mr-4 grayscale group-hover:grayscale-0 transition"
                            priority
                        />

                        <div className="flex flex-col gap-7 text-center md:text-left">
                            <h2 className="text-[#2E98DA] text-lg md:text-[1.3rem] 2xl:text-[1.4rem] font-semibold">
                                For School Principals, Management
                            </h2>
                            <p className="text-gray-600 text-base md:text-[1.1rem]  2xl:text-[1.2rem] leading-relaxed">
                                Empower your school with data-driven, value-based evaluations that 
                                nurture future-ready learners.
                            </p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <FooterSection />
        </>
    );
}
