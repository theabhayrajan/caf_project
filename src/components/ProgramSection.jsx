"use client";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import ClientOnlyCKEditor from "./HomeClientOnlyCKEditor";

function debounce(fn, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

export default function ProgramsSection({ data, editing, onFieldChange, onJsonChange }) {
  const fallbackPrograms = [
    {
      title: "Assessments",
      description: "Free Assessments on Social, Psychological and environmental conduct.",
      image: `${process.env.NEXT_PUBLIC_PROD_URL}/assessment3.svg`,
    },
    {
      title: "Trainings",
      description: "Free Trainings for kids to improve their social and environmental conduct.",
      image: `${process.env.NEXT_PUBLIC_PROD_URL}/assessment1.svg`,
    },
    {
      title: "Kids Artifacts",
      description: "Free Artifacts such as animated videos, Worksheets and PPTs designed for different grades.",
      image: `${process.env.NEXT_PUBLIC_PROD_URL}/assessment2.svg`,
    },
  ];

  const initialPrograms = (() => {
    if (!data?.programs_data) return fallbackPrograms;
    try {
      const parsed = typeof data.programs_data === "string" ? JSON.parse(data.programs_data) : data.programs_data;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return fallbackPrograms;
    } catch {
      return fallbackPrograms;
    }
  })();

  const initialTitle = data?.programs_main_title || "Programs by Cognitive Alliance Forumz (CAF)";

  const [localPrograms, setLocalPrograms] = useState(initialPrograms);
  const [localTitle, setLocalTitle] = useState(initialTitle);

  // Errors state to track field limits for each program and main title
  const [errors, setErrors] = useState(() => ({
    mainTitle: false,
    programs: initialPrograms.map(() => ({
      title: false,
      description: false,
    })),
  }));

  const MAX_LENGTHS = {
    mainTitle: 50,
    title: 20,
    description: 95,
  };

  useEffect(() => {
    if (editing) {
      setLocalPrograms(initialPrograms);
      setLocalTitle(initialTitle);
      setErrors({
        mainTitle: false,
        programs: initialPrograms.map(() => ({ title: false, description: false })),
      });
    }
  }, [editing, data?.programs_data, data?.programs_main_title]);

  const debouncedJsonChange = useCallback(debounce(onJsonChange, 500), [onJsonChange]);
  const debouncedFieldChange = useCallback(debounce(onFieldChange, 500), [onFieldChange]);

  // Title change with limit and warning
  const handleTitleChange = (index, value) => {
    if (value.length <= MAX_LENGTHS.title) {
      setLocalPrograms((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], title: value };
        debouncedJsonChange("programs_data", updated);
        return updated;
      });
      setErrors((prev) => {
        const newErrors = { ...prev };
        newErrors.programs[index].title = false;
        return newErrors;
      });
    }
  };

  // Description change with limit and warning
  const handleDescriptionChange = (index, value) => {
    const textLen = value.replace(/<[^>]*>/g, '').length;
    if (textLen <= MAX_LENGTHS.description) {
      setLocalPrograms((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], description: value };
        debouncedJsonChange("programs_data", updated);
        return updated;
      });
      setErrors((prev) => {
        const newErrors = { ...prev };
        newErrors.programs[index].description = false;
        return newErrors;
      });
    }
  };

  const handleImageChange = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/homeupload`, { method: "POST", body: formData });
      const result = await res.json();

      if (result.url) {
        setLocalPrograms((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], image: result.url };
          debouncedJsonChange("programs_data", updated);
          return updated;
        });
      }
    } catch {
      alert("Image upload failed");
    }
  };

  // Main title input change with limit
  const onTitleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTHS.mainTitle) {
      setLocalTitle(value);
      debouncedFieldChange("programs_main_title", value);
      setErrors(prev => ({ ...prev, mainTitle: false }));
    }
  };

  // Keydown handler for main title
  const handleMainTitleKeyDown = (e) => {
    const currVal = e.target.value;
    const hasSelection = e.target.selectionStart !== e.target.selectionEnd;

    if (
      currVal.length >= MAX_LENGTHS.mainTitle &&
      !hasSelection &&
      !['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)
    ) {
      e.preventDefault();
      setErrors(prev => ({ ...prev, mainTitle: true }));
    } else {
      setErrors(prev => ({ ...prev, mainTitle: false }));
    }
  };

  // Add keydown handler for native input to block typing beyond limit 
  const handleInputKeyDown = (index, field, maxLen, e) => {
    const currVal = e.target.value;
    const hasSelection = e.target.selectionStart !== e.target.selectionEnd;

    if (
      currVal.length >= maxLen &&
      !hasSelection &&
      !['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)
    ) {
      e.preventDefault();
      setErrors((prev) => {
        const newErrors = { ...prev };
        newErrors.programs[index][field] = true;
        return newErrors;
      });
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        newErrors.programs[index][field] = false;
        return newErrors;
      });
    }
  };

  // CKEditor keydown handler to block typing beyond limit
  const handleCKEditorKeyDown = (index, event) => {
    const htmlContent = event.target?.innerHTML || "";
    const textContent = htmlContent.replace(/<[^>]*>/g, '');

    if (
      textContent.length >= MAX_LENGTHS.description &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Control', 'Meta', 'Alt'].includes(event.key)
    ) {
      event.preventDefault();
      setErrors((prev) => {
        const newErrors = { ...prev };
        newErrors.programs[index].description = true;
        return newErrors;
      });
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        newErrors.programs[index].description = false;
        return newErrors;
      });
    }
  };

  if (!editing) {
    return (
      <section className="bg-gray-50 py-16 px-6 md:px-7 w-full">
        <h2 className="text-center text-2xl md:text-3xl text-gray-900 mb-12 font-bold">{localTitle}</h2>
        <div className="flex flex-wrap justify-center gap-10 lg:gap-5">
          {initialPrograms.map((program, i) => (
            <div
              key={i}
              className="bg-white shadow-sm hover:shadow-md transition-all p-10 px-14 flex flex-col items-center text-center w-full lg:w-[31.9%] max-w-[485px] gap-6 h-130 md:h-150 lg:h-160 rounded-md"
            >
              <h3 className="text-[#3291E9] font-semibold text-xl md:text-2xl mb-3">{program.title}</h3>
              <p
                className="text-[#8F8F8F] text-xl sm:text-[1.4rem] md:text-[1.5rem] mb-6 lg:text-xl xl:text-2xl leading-relaxed"
                dangerouslySetInnerHTML={{ __html: program.description || "" }}
              />
              <div className="w-[220px] h-[380px] flex justify-center items-center">
                <div className="w-full h-full relative overflow-hidden rounded-lg">
                  <Image 
                    src={program.image || `${process.env.NEXT_PUBLIC_PROD_URL}/placeholder.svg`} 
                    alt={program.title} 
                    fill 
                    className="object-contain" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Edit mode UI
  return (
    <section className="bg-gray-50 py-16 px-6 md:px-7 w-full">
      {/* Main title with limit - ONLY in edit mode */}
      <div className="text-center mb-12 relative">
        <input
          type="text"
          value={localTitle}
          onChange={onTitleInputChange}
          onKeyDown={handleMainTitleKeyDown}
          className="text-2xl md:text-3xl text-gray-900 font-bold border-b-2 pb-2 focus:outline-none bg-transparent w-full max-w-2xl mx-auto text-center"
          placeholder="Edit section title..."
        />
        {errors.mainTitle && (
          <div className="text-red-600 font-bold text-xs absolute -bottom-7 right-0 bg-red-100 px-2 py-1 rounded">
            🚫 No more text allowed!
          </div>
        )}
        <div className="text-xs text-gray-700 mt-1">
          Characters: {localTitle.length} / {MAX_LENGTHS.mainTitle}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-10 lg:gap-5">
        {localPrograms.map((program, i) => (
          <div
            key={i}
            className="bg-white shadow-sm p-10 px-14 flex flex-col items-center text-center w-full lg:w-[31.9%] max-w-[485px] gap-6 h-150 md:h-150 lg:h-160 rounded-md border-2 border-gray-200"
          >
            {/* Title input with limit */}
            <div className="relative space-y-2 w-full">
              <input
                type="text"
                value={program.title}
                onChange={(e) => handleTitleChange(i, e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(i, "title", MAX_LENGTHS.title, e)}
                className="text-[#3291E9] font-semibold text-xl md:text-2xl mb-3 border-b border-gray-300 focus:outline-none text-center bg-transparent w-full"
                placeholder="Program title"
              />
              {errors.programs[i]?.title && (
                <div className="text-red-600 font-bold text-xs absolute -bottom-7 right-0 bg-red-100 px-2 py-1 rounded">
                  🚫 No more text allowed!
                </div>
              )}
              <div className="text-xs text-gray-700 text-right">
                Characters: {program.title.length} / {MAX_LENGTHS.title}
              </div>
            </div>

            {/* Description - CKEditor ONLY in edit mode */}
            <div className="relative mb-6 w-full min-h-[120px] space-y-2">
              <div onKeyDown={(e) => handleCKEditorKeyDown(i, e)}>
                <ClientOnlyCKEditor
                  value={program.description}
                  onChange={(val) => handleDescriptionChange(i, val)}
                  config={{
                    placeholder: "Edit description...",
                    toolbar: ['bold', 'italic', 'bulletedList', 'numberedList']
                  }}
                />
              </div>
              {errors.programs[i]?.description && (
                <div className="text-red-600 font-bold text-xs absolute -bottom-7 right-0 bg-red-100 px-2 py-1 rounded">
                  🚫 No more text allowed!
                </div>
              )}
              <div className="text-xs text-gray-700 text-right">
                Characters: {program.description.replace(/<[^>]*>/g, '').length} / {MAX_LENGTHS.description}
              </div>
            </div>

            {/* Image upload - ONLY in edit mode */}
            <div className="w-[220px] h-[380px] relative group">
              <div className="w-full h-full relative overflow-hidden rounded-lg">
                <Image 
                  src={program.image || `${process.env.NEXT_PUBLIC_PROD_URL}/placeholder.svg`} 
                  alt="Program image" 
                  fill 
                  className="object-contain" 
                />
              </div>
              <label className="block text-sm font-semibold text-white text-center bg-blue-600 hover:bg-blue-700 p-3 rounded-lg cursor-pointer transition-all shadow-md w-full -translate-y-5">
                Change Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(i, e)}
                  className="absolute inset-0 opacity-0 cursor-pointer rounded-lg"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
