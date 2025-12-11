"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import ClientOnlyCKEditor from "./HomeClientOnlyCKEditor";

function debounce(fn, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

const stripHtmlTags = (html) => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

export default function SchoolProgramCard({ data, editing, onFieldChange }) {
  const fallbackHeadline = "CAFs Programs At schools";
  const fallbackParagraph = `Children go through key stages—from early bonding and trust-building in infancy,
  to developing independence and self-control in toddlerhood, and forming friendships
  and understanding social rules in early childhood. As they grow, school-age kids
  build self-esteem, empathy, and teamwork, while adolescents explore identity,
  values, and emotional regulation, shaping their social and psychological maturity.
  Children go through key stages—from early bonding and trust-building in infancy,
  to developing independence and self-control in toddlerhood, and forming friendships
  and understanding social rules in early childhood. As they grow, school-age kids
  build self-esteem, empathy, and teamwork, while adolescents explore identity,
  values, and emotional regulation.`;

  const initialData = useMemo(() => {
    return {
      headline: data?.program_card_title || fallbackHeadline,
      paragraph: data?.program_card_paragraph || fallbackParagraph,
      leftImage: data?.program_card_image_url || `${process.env.NEXT_PUBLIC_PROD_URL}/cafAssessment.svg`,
      smallImage: data?.program_card_image_url || `${process.env.NEXT_PUBLIC_PROD_URL}/programs.png`,
    };
  }, [data]);

  const [localData, setLocalData] = useState(initialData);

  // Errors state for text fields
  const [errors, setErrors] = useState({
    headline: false,
    paragraph: false,
  });

  const MAX_LENGTHS = {
    headline: 40,
    paragraph: 800,
  };

  useEffect(() => {
    setLocalData(initialData);
    setErrors({
      headline: false,
      paragraph: false,
    });
  }, [editing, initialData]);

  const debouncedFieldChange = useCallback(debounce(onFieldChange, 500), [onFieldChange]);

  const handleImageUpload = useCallback(async (fieldName, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log(`🖼️ Uploading ${fieldName} image...`);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/homeupload`, { 
        method: "POST", 
        body: formData 
      });
      const result = await res.json();

      if (result.url) {
        console.log(`✅ ${fieldName} uploaded:`, result.url);
        
        setLocalData(prev => ({
          ...prev,
          [fieldName === "program_left_image" ? "leftImage" : "smallImage"]: result.url
        }));
        
        debouncedFieldChange(fieldName, result.url);
      }
    } catch (error) {
      console.error("❌ Image upload failed:", error);
      alert("Image upload failed");
    }
  }, [debouncedFieldChange]);

  // Headline change with limit
  const handleHeadlineChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTHS.headline) {
      setLocalData(prev => ({ ...prev, headline: value }));
      debouncedFieldChange("program_card_title", value);
      setErrors(prev => ({ ...prev, headline: false }));
    }
  };

  // Headline keydown handler
  const handleHeadlineKeyDown = (e) => {
    const currVal = e.target.value;
    const hasSelection = e.target.selectionStart !== e.target.selectionEnd;

    if (
      currVal.length >= MAX_LENGTHS.headline &&
      !hasSelection &&
      !['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)
    ) {
      e.preventDefault();
      setErrors(prev => ({ ...prev, headline: true }));
    } else {
      setErrors(prev => ({ ...prev, headline: false }));
    }
  };

  // Paragraph change with limit
  const handleParagraphChange = (value) => {
    const textLen = stripHtmlTags(value).length;
    if (textLen <= MAX_LENGTHS.paragraph) {
      setLocalData(prev => ({ ...prev, paragraph: value }));
      debouncedFieldChange("program_card_paragraph", value);
      setErrors(prev => ({ ...prev, paragraph: false }));
    }
  };

  // CKEditor keydown handler for paragraph
  const handleCKEditorKeyDown = (e) => {
    const htmlContent = e.target?.innerHTML || "";
    const textContent = stripHtmlTags(htmlContent);

    if (
      textContent.length >= MAX_LENGTHS.paragraph &&
      !(
        e.ctrlKey || e.metaKey || e.altKey ||
        ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
      )
    ) {
      e.preventDefault();
      setErrors(prev => ({ ...prev, paragraph: true }));
    } else {
      setErrors(prev => ({ ...prev, paragraph: false }));
    }
  };

  if (!editing) {
    return (
      <div className="flex flex-col md:flex-row justify-center items-center rounded-lg overflow-hidden max-w-8xl 2xl:max-w-[85%] mx-auto my-10 bg-white">
        <div className="hidden lg:flex justify-center ml-10 self-center">
          <img
            src={localData.leftImage}
            alt="Students in classroom"
            className="w-full lg:w-240 lg:h-140 xl:w-230 xl:h-120 [@media(min-width:1536px)_and_(max-width:1700px)]:h-135 [@media(min-width:1536px)_and_(max-width:1700px)]:w-250 [@media(min-width:1701px)_and_(max-width:2900px)]:h-110 object-contain"
          />
        </div>

        <div className="w-full md:w-200 p-6 md:p-10 flex flex-col justify-center text-center lg:text-left lg:gap-4">
          <h2 className="text-[1.5rem] sm:text-3xl lg:text-[1.8rem] xl:text-[1.9rem] font-bold inline-block py-1 mb-4 lg:mb-10 text-gray-900">
            {stripHtmlTags(localData.headline)}
          </h2>

          <div className="block lg:hidden mb-4">
            <img
              src={localData.smallImage}
              alt="Students in classroom"
              className="w-full h-80 sm:h-90 object-contain rounded-md"
            />
          </div>

          <div
            className="text-gray-700 text-[1.05rem] text-left sm:text-[1.1rem] md:text-[1.2rem] lg:text-[1.15rem] xl:text-[1.2rem] leading-relaxed 2xl:mr-10"
            dangerouslySetInnerHTML={{ __html: localData.paragraph || "" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row justify-center items-center rounded-lg overflow-hidden max-w-8xl 2xl:max-w-[85%] mx-auto my-10 bg-white p-6">
      <div className="hidden lg:flex flex-col justify-center ml-10 self-center space-y-3 w-64">
        <img
          src={localData.leftImage}
          alt="Left image preview"
          className="w-full lg:w-240 lg:h-140 xl:w-230 xl:h-120 object-contain grayscale rounded border-2 border-gray-300"
        />
        <label className="block text-sm font-semibold text-white text-center bg-blue-600 hover:bg-blue-700 p-3 rounded-lg cursor-pointer transition-all shadow-md">
          Change Left Image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload("program_card_image_url", e)}
            className="hidden"
          />
        </label>
      </div>

      <div className="w-full md:w-200 p-6 md:p-10 flex flex-col justify-center text-center lg:text-left lg:gap-4">
        {/* Headline input with limit */}
        <div className="relative mb-4 lg:mb-10">
          <input
            type="text"
            value={localData.headline}
            onChange={handleHeadlineChange}
            onKeyDown={handleHeadlineKeyDown}
            className="text-[1.5rem] sm:text-3xl lg:text-[1.8rem] xl:text-[1.9rem] font-bold inline-block py-1 text-gray-900 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 w-full text-center lg:text-left"
            placeholder="Edit headline..."
          />
          {errors.headline && (
            <div className="text-red-600 font-bold text-xs absolute -bottom-7 right-0 bg-red-100 px-2 py-1 rounded">
              🚫 No more text allowed!
            </div>
          )}
          <div className="text-xs text-gray-700 mt-1 text-right">
            Characters: {localData.headline.length} / {MAX_LENGTHS.headline}
          </div>
        </div>

        <div className="block lg:hidden mb-6 space-y-2">
          <img
            src={localData.smallImage}
            alt="Small image preview"
            className="w-full h-80 sm:h-90 object-contain rounded-md border-2 border-gray-300"
          />
          <label className="block text-sm font-semibold text-white text-center bg-blue-600 hover:bg-blue-700 p-3 rounded-lg cursor-pointer transition-all shadow-md w-full">
            Change Mobile Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload("program_card_image_url", e)}
              className="hidden"
            />
          </label>
        </div>

        {/* Paragraph CKEditor with limit */}
        <div className="relative">
          <div onKeyDown={handleCKEditorKeyDown}>
            <ClientOnlyCKEditor
              value={localData.paragraph || ""}
              onChange={handleParagraphChange}
              config={{
                placeholder: "Edit paragraph content...",
                toolbar: ["bold", "italic", "bulletedList", "numberedList"],
              }}
            />
          </div>
          {errors.paragraph && (
            <div className="text-red-600 font-bold text-xs absolute -bottom-7 right-0 bg-red-100 px-2 py-1 rounded">
              🚫 No more text allowed!
            </div>
          )}
          <div className="text-xs text-gray-700 mt-1 text-right">
            Characters: {stripHtmlTags(localData.paragraph || "").length} / {MAX_LENGTHS.paragraph}
          </div>
        </div>
      </div>
    </div>
  );
}
