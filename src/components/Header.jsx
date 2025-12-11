"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, MoreVertical, Globe, Menu, X, ChevronLeft } from "lucide-react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Measure header height on mount
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }

    const handleScroll = () => setIsSticky(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if we're on a nested route (3 or more segments)
  const pathSegments = pathname.split("/").filter(Boolean);
  const showBackButton = pathSegments.length >= 2;

  const links = [
    { name: "Home", href: "/" },
    { name: "Evaluation", href: "/evaluation" },
    { name: "Programs & resources", href: "/videoLearningPage" },
    { name: "Articles & Discussions", href: "/articles" },
  ];

  return (
    <>
      {/* Placeholder to prevent content jump */}
      {isSticky && <div style={{ height: `${headerHeight}px` }} />}
      
      <header
        ref={headerRef}
        className={`w-full shadow-lg z-50 top-0 transition-all duration-300 ${
          isSticky ? "fixed bg-white/95 backdrop-blur-xs" : "relative"
        }`}
      >
        {/* --- Top Black Bar --- */}
        <div className="bg-black text-white">
          <div className="flex items-center justify-between px-4 md:px-6 h-16 max-w-7xl mx-auto 2xl:max-w-none 2xl:mx-0 2xl:px-20">
            {/* Left: Logo + Name */}
            <div className="flex items-center gap-3">
              <Image
                src={`${process.env.NEXT_PUBLIC_PROD_URL}/logo.png`}
                alt="CAF Logo"
                width={50}
                height={50}
                className="object-contain rounded-sm"
              />
              <span className="font-bold text-sm sm:text-md leading-none hidden sm:inline">
                Cognitive Alliance Forumz (CAF)
              </span>
              <span className="font-medium text-[1.1rem] sm:hidden">CAF</span>
            </div>

            {/* Right: Greeting + Icons + Hamburger */}
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <span className="whitespace-nowrap hidden sm:inline mr-5">
                Hi Daniel Brin
              </span>
              <User className="w-5 h-5" />
              <MoreVertical className="w-5 h-5 hidden sm:flex" />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-expanded={mobileOpen}
                aria-label="Toggle navigation menu"
                className="md:hidden p-2 rounded hover:bg-white/10 active:scale-[.98] transition"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* --- Navigation Bar --- */}
        <div
          className={`bg-white transition-all duration-300 ${
            isSticky ? "" : ""
          }`}
        >
          <div className="flex items-center justify-between px-4 md:px-6 md:h-14 max-w-7xl mx-auto 2xl:max-w-none 2xl:mx-0 2xl:px-20">
            {/* Back Button - Only visible on nested routes */}
            {showBackButton && (
              <button
                onClick={() => router.back()}
                className="flex items-center py-2 gap-1 text-[#2E98DA] hover:text-[#1a7ab8] transition-colors duration-200 font-medium text-base mr-4"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            )}

            {/* Left-aligned Nav Links */}
            <nav className="hidden md:flex items-center gap-10 text-sm sm:text-lg md:text-sm lg:text-base xl:text-lg font-semibold text-gray-800 h-full justify-center w-full lg:ml-30 [@media(min-width:1180px)_and_(max-width:1278px)]:ml-35 [@media(min-width:1280px)_and_(max-width:1350px)]:ml-50 [@media(min-width:1351px)_and_(max-width:1490px)]:ml-35 [@media(min-width:1490px)_and_(max-width:1535px)]:ml-20  2xl:ml-22">
              {links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (pathname.startsWith(link.href) && link.href !== "/");

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative flex items-center h-full transition-colors duration-200 ${
                      isActive ? "text-[#2E98DA]" : "text-gray-800"
                    } hover:text-[#2E98DA] group`}
                  >
                    <span className="pb-1">{link.name}</span>
                    <span
                      className={`absolute left-0 bottom-0 h-[2px] bg-[#2E98DA] transition-all duration-300 ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Right-side options (desktop only) */}
            <div className="hidden md:flex items-center gap-6 text-sm md:text-[0.9rem] lg:text-base mb-1 text-[#2E98DA]">
              <Link
                href="/memberlogin"
                className="hover:text-[#2E98DA] transition-colors duration-200 whitespace-nowrap"
              >
                Member login
              </Link>
              <div className="flex items-center gap-1 cursor-pointer hover:text-[#2E98DA] transition-colors duration-200">
                <Globe className="w-4 h-4" />
                <span>English</span>
              </div>
            </div>
          </div>

          {/* --- Mobile Menu --- */}
          <div
            className={`md:hidden bg-white shadow-md transition-max-height duration-300 overflow-hidden ${
              mobileOpen ? "max-h-[400px]" : "max-h-0"
            }`}
          >
            <div className="pb-6 space-y-4">
              <nav className="flex flex-col gap-2">
                {links.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    (pathname.startsWith(link.href) && link.href !== "/");

                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-3 py-2 rounded font-medium ${
                        isActive ? "text-[#2E98DA]" : "text-gray-800"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex flex-col gap-3">
                <Link
                  href="/memberlogin"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded text-[#2E98DA] font-semibold hover:bg-gray-50"
                >
                  Member login
                </Link>
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50 text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  <Globe className="w-4 h-4" />
                  <span>English</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
