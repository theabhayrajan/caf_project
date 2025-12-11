"use client";
import Image from "next/image";
import { useState, useEffect, useCallback, useMemo } from "react";
import ClientOnlyCKEditor from "./HomeClientOnlyCKEditor";

function debounce(fn, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

export default function FooterSection({ data, editing, onFieldChange, onImageChange }) {
  const initialData = useMemo(() => {
    return {
      quote: data?.footer_quote || "In order to develop—intellectually, emotionally, socially—a child requires participation in progressively more complex activities, typically with one or more adults who have an irrational emotional attachment to the child.",
      authorName: data?.footer_author || "-Urie Bronfenbrenner (1917–2005)",
      authorInfo: data?.footer_author_info || "Developmental Psychologist, Researcher, and Professor<br/>(Cornell University)",
      image: data?.footer_image_url || `${process.env.NEXT_PUBLIC_PROD_URL}/footer.svg`,
      copyright: data?.footer_copyright || "@2025 CognitiveAllianceForumz",
      aboutText: data?.footer_about_text || "About",
      aboutLink: data?.footer_about_link || "#",
      contactText: data?.footer_contact_text || "Contact Us",
      contactLink: data?.footer_contact_link || "#",
    };
  }, [data]);

  const [localData, setLocalData] = useState(initialData);

  useEffect(() => {
    setLocalData(initialData);
  }, [editing, initialData]);

  // ✅ SINGLE DEBOUNCED HANDLER PER FIELD - NO CONFLICT!
  const debouncedQuoteChange = useCallback(debounce((value) => onFieldChange("footer_quote", value), 500), [onFieldChange]);
  const debouncedAuthorChange = useCallback(debounce((value) => onFieldChange("footer_author", value), 500), [onFieldChange]);
  const debouncedAuthorInfoChange = useCallback(debounce((value) => onFieldChange("footer_author_info", value), 500), [onFieldChange]);
  const debouncedCopyrightChange = useCallback(debounce((value) => onFieldChange("footer_copyright", value), 500), [onFieldChange]);
  const debouncedAboutTextChange = useCallback(debounce((value) => onFieldChange("footer_about_text", value), 500), [onFieldChange]);
  const debouncedAboutLinkChange = useCallback(debounce((value) => onFieldChange("footer_about_link", value), 500), [onFieldChange]);
  const debouncedContactTextChange = useCallback(debounce((value) => onFieldChange("footer_contact_text", value), 500), [onFieldChange]);
  const debouncedContactLinkChange = useCallback(debounce((value) => onFieldChange("footer_contact_link", value), 500), [onFieldChange]);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/homeupload`, { method: "POST", body: formData });
      const result = await res.json();

      if (result.url) {
        setLocalData((prev) => ({ ...prev, image: result.url }));
        onFieldChange("footer_image_url", result.url);
      }
    } catch {
      alert("Image upload failed");
    }
  }, [onFieldChange]);

  if (!editing) {
    return (
      <footer className="bg-[#1E1E1E] text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center md:items-start gap-10 pb-10">
          <div className="flex-shrink-0 p-[10px]">
            <Image
              src={localData.image}
              alt="Footer image"
              width={260}
              height={180}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="flex flex-col w-full gap-10">
            <p 
              className="text-[#C1C1C1] leading-relaxed mb-4 text-sm lg:text-2xl"
              dangerouslySetInnerHTML={{ __html: localData.quote }}
            />

            <div className="flex flex-col md:items-end items-center">
              <div className="text-left">
                <h3 className="text-white font-semibold text-[24px]" dangerouslySetInnerHTML={{ __html: localData.authorName }} />
                <p className="text-[#C1C1C1] text-sm lg:text-xl" dangerouslySetInnerHTML={{ __html: localData.authorInfo }} />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-[0.4px] bg-[#C1C1C1] opacity-5"></div>

        <div className="max-w-5xl mx-auto px-6 mt-10 lg:mt-12 flex flex-col items-center justify-between text-sm lg:text-xl text-[#8F8F8F] space-y-15">
          <div className="flex space-x-8">
            <a href={localData.aboutLink} className="hover:text-white transition">
              {localData.aboutText}
            </a>
            <a href={localData.contactLink} className="hover:text-white transition">
              {localData.contactText}
            </a>
          </div>
          <p className="text-[#8F8F8F]" dangerouslySetInnerHTML={{ __html: localData.copyright }} />
        </div>
      </footer>
    );
  }

  // Edit mode
  return (
    <footer className="bg-[#1E1E1E] text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start gap-10 pb-10">
        <div className="flex-shrink-0 p-[10px]">
          <div className="relative w-[260px] h-[180px] rounded border-2 border-gray-500 overflow-hidden">
            <Image
              src={localData.image}
              alt="Footer image preview"
              fill
              className="object-contain"
            />
          </div>
          <label className="block mt-2 text-sm font-semibold text-white text-center bg-blue-600 hover:bg-blue-700 p-2 rounded cursor-pointer transition-all shadow-md w-full">
            Change Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex flex-col w-full gap-6 text-black">
          <ClientOnlyCKEditor
            value={localData.quote}
            onChange={(val) => {
              setLocalData(prev => ({ ...prev, quote: val }));
              debouncedQuoteChange(val);
            }}
            config={{
              placeholder: "Edit quote...",
              toolbar: ["bold", "italic", "bulletedList"],
            }}
          />

          {/* ✅ PERFECT SMOOTH INPUT */}
          <input
            type="text"
            value={localData.authorName}
            onChange={(e) => {
              setLocalData(prev => ({ ...prev, authorName: e.target.value }));
              debouncedAuthorChange(e.target.value);
            }}
            className="text-white font-semibold text-[24px] border-b-2 border-gray-400 focus:outline-none focus:border-blue-400 bg-transparent p-2 w-full text-left"
            placeholder="Author name (e.g. -Urie Bronfenbrenner)"
          />

          <ClientOnlyCKEditor
            value={localData.authorInfo}
            onChange={(val) => {
              setLocalData(prev => ({ ...prev, authorInfo: val }));
              debouncedAuthorInfoChange(val);
            }}
            config={{
              placeholder: "Edit author info...",
              toolbar: ["bold", "italic"],
            }}
          />
        </div>
      </div>

      <div className="w-full h-[0.4px] bg-[#C1C1C1] opacity-5"></div>

      <div className="max-w-5xl mx-auto px-6 mt-10 lg:mt-12 flex flex-col items-center gap-6">
        {/* About Link */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-gray-800 p-4 rounded-lg border-2 border-gray-600 w-full max-w-md">
          <div className="flex flex-col min-w-[100px]">
            <label className="text-white text-xs mb-1">About Text</label>
            <input
              type="text"
              value={localData.aboutText}
              onChange={(e) => {
                setLocalData(prev => ({ ...prev, aboutText: e.target.value }));
                debouncedAboutTextChange(e.target.value);
              }}
              className="bg-gray-700 text-white p-2 rounded border border-gray-500 focus:outline-none focus:border-blue-400 w-full text-sm"
              placeholder="About"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-white text-xs mb-1">URL</label>
            <input
              type="url"
              value={localData.aboutLink}
              onChange={(e) => {
                setLocalData(prev => ({ ...prev, aboutLink: e.target.value }));
                debouncedAboutLinkChange(e.target.value);
              }}
              className="bg-gray-700 text-white p-2 rounded border border-gray-500 focus:outline-none focus:border-blue-400 w-48 text-sm"
              placeholder="https://about.com"
            />
          </div>
        </div>

        {/* Contact Link */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-gray-800 p-4 rounded-lg border-2 border-gray-600 w-full max-w-md">
          <div className="flex flex-col min-w-[100px]">
            <label className="text-white text-xs mb-1">Contact Text</label>
            <input
              type="text"
              value={localData.contactText}
              onChange={(e) => {
                setLocalData(prev => ({ ...prev, contactText: e.target.value }));
                debouncedContactTextChange(e.target.value);
              }}
              className="bg-gray-700 text-white p-2 rounded border border-gray-500 focus:outline-none focus:border-blue-400 w-full text-sm"
              placeholder="Contact Us"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-white text-xs mb-1">URL</label>
            <input
              type="url"
              value={localData.contactLink}
              onChange={(e) => {
                setLocalData(prev => ({ ...prev, contactLink: e.target.value }));
                debouncedContactLinkChange(e.target.value);
              }}
              className="bg-gray-700 text-white p-2 rounded border border-gray-500 focus:outline-none focus:border-blue-400 w-48 text-sm"
              placeholder="https://contact.com"
            />
          </div>
        </div>

        {/* Copyright */}
        <input
          type="text"
          value={localData.copyright}
          onChange={(e) => {
            setLocalData(prev => ({ ...prev, copyright: e.target.value }));
            debouncedCopyrightChange(e.target.value);
          }}
          className="text-[#8F8F8F] border-b-2 border-gray-400 focus:outline-none focus:border-blue-400 bg-transparent text-center p-2 w-full max-w-md text-sm"
          placeholder="Copyright text"
        />
      </div>
    </footer>
  );
}
