'use client'; 
import React from 'react'
import Header from '@/components/Header'
import Link from 'next/link'
import { useRouter } from 'next/navigation' 

export default function Page() {
    const router = useRouter();

    const handleNavigation = () => {
        router.push('/articles'); 
    };

    return (
        <>
        <Header />
        <div className='w-full min-h-[87vh] flex flex-col mx-auto pt-10 gap-10 bg-[#f4f4f4] px-10 xl:px-15 2xl:px-22 overflow-y-hidden'>
            <div className='flex flex-col gap-5'>
                <h1 className='font-semibold text-[1.3rem] md:text-[1.4rem] 2xl:text-[1.5rem]'>
                    How can you help being a member?
                </h1>
                <p className='text-[1.1rem] lg:text-[1.2rem] 2xl:text-[1.3rem]'>
 
                </p>
            </div>
            
            <div className='flex flex-col gap-1 xl:w-[80%]'>
                <h1 className='font-semibold text-xl 2xl:text-[1.3rem]'>
                    About the CAF
                </h1>

                <p className='text-[1.1rem] lg:text-[1.2rem] 2xl:text-[1.3rem]'>
                    At Cognitive Alliance Forumz (CAF), we believe that education is not just about academic achievement—but about nurturing the whole child. In alignment with the principles of the National Education Policy (NEP 2020) and guidelines from NCERT, our Self-Assessment Test is designed to evaluate and understand key dimensions of a student's growth beyond textbooks... 
                    <Link href="/about" className='text-[#394ce4] cursor-pointer font-semibold hover:underline'>
                        more
                    </Link>
                </p>

                {/* Navigation Button */}
                <div className='mt-6'>
                    <button 
                        onClick={handleNavigation}
                        className='bg-[#394ce4] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#2d3ab8] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105'
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
        </>
    )
}
