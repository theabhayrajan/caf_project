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

const stripHtmlTags = (html) => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

const fallbackStages = [
  {
    title: "Cognitive Development",
    description:
      "Children's thinking and learning abilities develop progressively with age, becoming more complex over time. Supportive environments and playful learning experiences are key to nurturing this growth.",
  },
  {
    title: "Social and Emotional Development",
    description:
      "Children's thinking and learning abilities develop progressively with age, becoming more complex over time. Supportive environments and playful learning experiences are key to nurturing this growth.",
  },
  {
    title: "Speech and Language Development",
    description:
      "Children's thinking and learning abilities develop progressively with age, becoming more complex over time. Supportive environments and playful learning experiences are key to nurturing this growth.",
  },
  {
    title: "Fine Motor Skill Development",
    description:
      "Children's thinking and learning abilities develop progressively with age, becoming more complex over time. Supportive environments and playful learning experiences are key to nurturing this growth.",
  },
  {
    title: "Gross Motor Skill Development",
    description:
      "Children's thinking and learning abilities develop progressively with age, becoming more complex over time. Supportive environments and playful learning experiences are key to nurturing this growth.",
  },
];

export default function ChildDevelopmentSection({
  data,
  editing,
  onFieldChange,
  onJsonChange,
}) {
  const initialState = useMemo(() => {
    const mainTitle =
      data?.child_dev_main_title ||
      "The Journey of Child Development: Navigating Key Stages from Infancy to Adolescence";
    const introParagraph =
      data?.child_dev_intro_paragraph ||
      "Children go through key stages—from early bonding and trust-building in infancy, to developing independence and self-control in toddlerhood, and forming friendships and understanding social rules in early childhood. As they grow, school-age kids build self-esteem, empathy, and teamwork, while adolescents explore identity, values, and emotional regulation, shaping their social and psychological maturity.";

    let stages = fallbackStages;
    if (data?.child_dev_stages) {
      try {
        const parsed =
          typeof data.child_dev_stages === "string"
            ? JSON.parse(data.child_dev_stages)
            : data.child_dev_stages;
        if (Array.isArray(parsed) && parsed.length > 0) {
          stages = parsed;
        }
      } catch {
        stages = fallbackStages;
      }
    }

    const mainImage = data?.child_dev_main_image || `${process.env.NEXT_PUBLIC_PROD_URL}/journey.svg`;

    return {
      mainTitle,
      introParagraph,
      stages,
      mainImage,
    };
  }, [data]);

  const [localData, setLocalData] = useState(initialState);
  const [errors, setErrors] = useState({
    mainTitle: false,
    introParagraph: false,
    stages: initialState.stages.map(() => ({ title: false, description: false })),
  });

  const MAX_LENGTHS = {
    mainTitle: 90,
    introParagraph: 420,
    title: 40,
    description: 220,
  };

  useEffect(() => {
    setLocalData(initialState);
    setErrors({
      mainTitle: false,
      introParagraph: false,
      stages: initialState.stages.map(() => ({ title: false, description: false })),
    });
  }, [editing, initialState]);

  const debouncedFieldChange = useCallback(debounce(onFieldChange, 500), [onFieldChange]);
  const debouncedJsonChange = useCallback(debounce(onJsonChange, 500), [onJsonChange]);

  // Main title handlers
  const handleTitleChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_LENGTHS.mainTitle) {
      setLocalData((prev) => ({ ...prev, mainTitle: val }));
      debouncedFieldChange("child_dev_main_title", val);
      setErrors((prev) => ({ ...prev, mainTitle: false }));
    }
  };

  const handleMainTitleKeyDown = (e) => {
    const currVal = e.target.value;
    const hasSelection = e.target.selectionStart !== e.target.selectionEnd;
    if (
      currVal.length >= MAX_LENGTHS.mainTitle &&
      !hasSelection &&
      !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
    ) {
      e.preventDefault();
      setErrors((prev) => ({ ...prev, mainTitle: true }));
    } else {
      setErrors((prev) => ({ ...prev, mainTitle: false }));
    }
  };

  // Intro paragraph - REAL-TIME character limit check
  const handleIntroChange = (value) => {
    const textOnly = stripHtmlTags(value);
    const isOverLimit = textOnly.length > MAX_LENGTHS.introParagraph;
    
    if (!isOverLimit) {
      setLocalData((prev) => ({ ...prev, introParagraph: value }));
      debouncedFieldChange("child_dev_intro_paragraph", value);
    }
    
    // Show error if over limit
    setErrors((prev) => ({ 
      ...prev, 
      introParagraph: isOverLimit 
    }));
  };

  // Stage title handlers
  const handleStageTitleChange = (index, value) => {
    if (value.length <= MAX_LENGTHS.title) {
      setLocalData((prev) => {
        const updated = [...prev.stages];
        updated[index] = { ...updated[index], title: value };
        debouncedJsonChange("child_dev_stages", updated);
        return { ...prev, stages: updated };
      });
      setErrors((prev) => {
        const newErrors = { ...prev };
        newErrors.stages[index].title = false;
        return newErrors;
      });
    }
  };

  const handleStageTitleKeyDown = (index, e) => {
    const currVal = e.target.value;
    const hasSelection = e.target.selectionStart !== e.target.selectionEnd;
    if (
      currVal.length >= MAX_LENGTHS.title &&
      !hasSelection &&
      !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
    ) {
      e.preventDefault();
      setErrors((prev) => {
        const newErrors = { ...prev };
        newErrors.stages[index].title = true;
        return newErrors;
      });
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        newErrors.stages[index].title = false;
        return newErrors;
      });
    }
  };

  // Stage description - REAL-TIME character limit check
  const handleStageDescChange = (index, value) => {
    const textLen = stripHtmlTags(value).length;
    const isOverLimit = textLen > MAX_LENGTHS.description;
    
    if (!isOverLimit) {
      setLocalData((prev) => {
        const updated = [...prev.stages];
        updated[index] = { ...updated[index], description: value };
        debouncedJsonChange("child_dev_stages", updated);
        return { ...prev, stages: updated };
      });
    }
    
    // Show error if over limit
    setErrors((prev) => {
      const newErrors = { ...prev };
      newErrors.stages[index].description = isOverLimit;
      return newErrors;
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/homeupload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (result.url) {
        setLocalData((prev) => ({ ...prev, mainImage: result.url }));
        debouncedFieldChange("child_dev_main_image", result.url);
      }
    } catch {
      alert("Image upload failed");
    }
  };

  if (!editing) {
    return (
      <div className="container px-10 py-5 mx-auto max-w-8xl lg:max-w-[100vw] xl:max-w-[95vw] [@media(min-width:1536px)_and_(max-width:1550px)]:max-w-[95vw] [@media(min-width:1551px)_and_(max-width:1900px)]:max-w-[85vw] [@media(min-width:1700px)_and_(max-width:2900px)]:max-w-[75vw]">
        <div className="text-left mb-10">
          <h1 className="text-[1.5rem] md:text-[1.7rem] lg:text-3xl font-bold text-gray-800 mb-10 2xl:whitespace-nowrap">
            {localData.mainTitle}
          </h1>
          <p
            className="text-lg md:text-[1.2rem] text-gray-600 leading-relaxed mt-4 text-left 2xl:pr-18"
            dangerouslySetInnerHTML={{ __html: localData.introParagraph || "" }}
          />
        </div>

        <div className="lg:grid lg:grid-cols-[auto_1fr] lg:gap-8 2xl:w-[70vw] mx-auto">
          <div className="hidden lg:flex lg:items-center lg:justify-center">
            <Image
              src={localData.mainImage || `${process.env.NEXT_PUBLIC_PROD_URL}/journey.svg`}
              alt="Child Development"
              width={300}
              height={600}
              className="w-auto h-auto max-w-[370px] -translate-y-10 xl:max-w-[400px]"
            />
          </div>

          <div className="flex flex-col justify-between py-4 lg:py-8">
            {localData.stages.map((stage, index) => (
              <div key={index} className="flex items-center mb-8 lg:mb-0">
                <div className="flex-1">
                  <h2 className="text-2xl md:text-[1.5rem] font-semibold text-gray-800 mb-2">
                    {index + 1}. {stage.title}
                  </h2>
                  <p
                    className="text-gray-600 text-[1.1rem] sm:text-[1.15rem] md:text-[1.2rem] leading-relaxed mb-5"
                    dangerouslySetInnerHTML={{ __html: stage.description || "" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-10 py-5 mx-auto max-w-8xl lg:max-w-[100vw] xl:max-w-[95vw] [@media(min-width:1536px)_and_(max-width:1550px)]:max-w-[95vw] [@media(min-width:1551px)_and_(max-width:1900px)]:max-w-[85vw] [@media(min-width:1700px)_and_(max-width:2900px)]:max-w-[75vw]">
      {/* Top Section */}
      <div className="text-left mb-10 space-y-6">
        <div className="space-y-1">
          <input
            type="text"
            value={localData.mainTitle}
            onChange={handleTitleChange}
            onKeyDown={handleMainTitleKeyDown}
            className="w-full text-[1.5rem] md:text-[1.7rem] lg:text-3xl font-bold text-gray-800 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
            placeholder="Edit main heading..."
          />
          {errors.mainTitle && (
            <div className="text-red-600 font-bold text-xs bg-red-100 px-3 py-1 rounded inline-block">
              🚫 No more text allowed! (Max {MAX_LENGTHS.mainTitle} chars)
            </div>
          )}
          <div className="text-xs text-gray-700 text-right">
            {localData.mainTitle.length} / {MAX_LENGTHS.mainTitle}
          </div>
        </div>

        <div className="space-y-2">
          <ClientOnlyCKEditor
            value={localData.introParagraph || ""}
            onChange={handleIntroChange}
            config={{
              placeholder: "Edit intro paragraph...",
              toolbar: ["bold", "italic", "bulletedList", "numberedList"],
            }}
          />
          {errors.introParagraph && (
            <div className="text-red-600 font-bold text-xs bg-red-100 px-3 py-1 rounded inline-block">
              🚫 No more text allowed! (Max {MAX_LENGTHS.introParagraph} chars)
            </div>
          )}
          <div className="text-xs text-gray-700 text-right">
            {stripHtmlTags(localData.introParagraph || "").length} / {MAX_LENGTHS.introParagraph}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="lg:grid lg:grid-cols-[auto_1fr] lg:gap-8 2xl:w-[70vw] mx-auto">
        <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center space-y-3">
          <Image
            src={localData.mainImage || "/caf/journey.svg"}
            alt="Child Development"
            width={300}
            height={600}
            className="w-auto h-auto max-w-[370px] -translate-y-10 xl:max-w-[400px] rounded-md"
          />
        </div>

        <div className="flex flex-col justify-between py-4 lg:py-8 space-y-8">
          {localData.stages.map((stage, index) => (
            <div key={index} className="space-y-3">
              <div className="space-y-1">
                <input
                  type="text"
                  value={stage.title}
                  onChange={(e) => handleStageTitleChange(index, e.target.value)}
                  onKeyDown={(e) => handleStageTitleKeyDown(index, e)}
                  className="w-full text-2xl md:text-[1.5rem] font-semibold text-gray-800 border-b border-gray-300 focus:outline-none bg-transparent"
                  placeholder={`Stage ${index + 1} title`}
                />
                {errors.stages[index]?.title && (
                  <div className="text-red-600 font-bold text-xs bg-red-100 px-3 py-1 rounded inline-block">
                    🚫 No more text allowed! (Max {MAX_LENGTHS.title} chars)
                  </div>
                )}
                <div className="text-xs text-gray-700 text-right">
                  {stage.title.length} / {MAX_LENGTHS.title}
                </div>
              </div>

              <div className="space-y-2">
                <ClientOnlyCKEditor
                  value={stage.description || ""}
                  onChange={(val) => handleStageDescChange(index, val)}
                  config={{
                    placeholder: "Edit description...",
                    toolbar: ["bold", "italic", "bulletedList", "numberedList"],
                  }}
                />
                {errors.stages[index]?.description && (
                  <div className="text-red-600 font-bold text-xs bg-red-100 px-3 py-1 rounded inline-block">
                    🚫 No more text allowed! (Max {MAX_LENGTHS.description} chars)
                  </div>
                )}
                <div className="text-xs text-gray-700 text-right">
                  {stripHtmlTags(stage.description || "").length} / {MAX_LENGTHS.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
