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

            <div className="h-220 md:h-170 md:pb-30 lg:pb-10 xl:h-150 bg-[#f7f7f7] flex items-center justify-center px-4">
                <div className="flex flex-col md:flex-row gap-6 md:gap-10 max-w-120 md:max-w-215 justify-center h-68">
                    {/* Card 1: For Kids / Parents */}
                    <Link
                        href="/evaluation/kidslogin"
                        className="group flex flex-col md:flex-row items-center bg-white h-95 md:h-90 lg:h-70 2xl:h-68 rounded-xl shadow-lg hover:shadow-lg transition-all duration-300 p-6 pb-18 cursor-pointer"
                    >
                        <Image
                            src={`${process.env.NEXT_PUBLIC_PROD_URL}/Evaluation2.png`}
                            alt="For Kids / Parents"
                            width={128}
                            height={160}
                            className="w-32 h-40 lg:h-36 2xl:h-40 object-contain mb-4 md:mb-0 md:mt-7 md:mr-4 grayscale"
                            style={{ width: '128px', height: '160px' }}
                            priority
                        />
                        <div className="flex flex-col gap-5 text-center md:text-left lg:gap-10 ml-2 mt-3">
                            <h2 className="text-[#2E98DA] text-[1.3rem] font-semibold">
                                For Kids / Parents
                            </h2>
                            <p className="text-gray-600 text-[1.05rem] leading-relaxed pr-3">
                                Think, grow, and see how your actions can make a difference —
                                at school, at home, and everywhere.
                            </p>
                        </div>
                    </Link>

                    {/* Card 2: For School Principals / Management */}
                    <Link
                        href="/evaluation/principallogin"
                        className="group flex flex-col md:flex-row items-center bg-white h-100 md:h-90 lg:h-70 2xl:h-68 rounded-xl shadow-lg hover:shadow-lg transition-all duration-300 p-6 pb-18 cursor-pointer"
                    >
                        <Image
                            src={`${process.env.NEXT_PUBLIC_PROD_URL}/Evaluation1.png`}
                            alt="For School Principals / Management"
                            width={128}
                            height={160}
                            className="w-32 h-40 md:h-60 lg:h-40 xl:h-40 object-contain mb-4 md:mb-0 md:mt-7 md:mr-4 grayscale"
                            style={{ width: '128px', height: '160px' }}
                            priority
                        />
                        <div className="flex flex-col text-center md:text-left gap-4.5 ml-2 lg:mt-4">
                            <h2 className="text-[#2E98DA] text-[1.3rem] font-semibold">
                                For School Principals, Management
                            </h2>
                            <p className="text-gray-600 text-[1.05rem] leading-relaxed pr-3">
                                Empower your school with data-driven, value-based evaluations
                                that nurture future-ready learners.
                            </p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Footer Section */}
            <FooterSection />
        </>
    );
}
