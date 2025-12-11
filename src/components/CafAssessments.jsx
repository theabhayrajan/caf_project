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
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

export default function CafAssessments({ data, editing, onFieldChange, onJsonChange }) {
  const initialData = useMemo(() => {
    const fallbackAssessments = [
      {
        id: 1,
        title: "Enhancing Self-Awareness and Emotional Intelligence",
        desc: "Our assessments are thoughtfully designed to support the holistic development of school children by focusing on their psychological, social, and environmental conduct. These evaluations provide valuable insights into a child's emotional well-being, interpersonal skills, and awareness of their surroundings, empowering them to grow into well-rounded individuals. Here's how our assessments can make a meaningful impact:",
      },
      {
        id: 2,
        title: "Improving Social Skills and Empathy",
        desc: "Through scenario-based questions and interactive activities, we assess a child's ability to empathize, cooperate, and resolve conflicts. These insights equip children with the tools to navigate social situations effectively, fostering kindness, teamwork, and leadership.",
      },
      {
        id: 3,
        title: "Promoting Environmental Responsibility",
        desc: "Our environmental conduct assessments educate children about sustainability and global citizenship. By evaluating their habits and attitudes toward the environment, we inspire eco-friendly practices and a sense of responsibility toward the planet.",
      },
      {
        id: 4,
        title: "Identifying Strengths and Areas for Growth",
        desc: "The assessments provide a clear picture of each child's strengths and areas that need improvement. This personalized feedback helps parents, teachers, and students create targeted strategies to address specific needs, ensuring balanced growth.",
      },
      {
        id: 5,
        title: "Tracking Progress Over Time",
        desc: "With regular assessments, schools and families can monitor a child's development journey through the Holistic Development Index (HDI). This progress tracking ensures timely interventions and celebrates milestones, motivating children to continue improving.",
      },
      {
        id: 6,
        title: "Supporting Personalized Learning",
        desc: "Based on assessment results, children receive tailored recommendations, such as mindfulness exercises, educational resources, or social skill-building activities. This individualized approach enhances learning outcomes and nurtures lifelong skills.",
      },
      {
        id: 7,
        title: "Empowering Parents and Educators",
        desc: "Our assessments provide actionable insights to parents and teachers, helping them understand a child's unique needs. Equipped with this knowledge, they can offer better guidance, create supportive environments, and foster meaningful communication.",
      },
      {
        id: 8,
        title: "Building a Foundation for Future Success",
        desc: "By addressing psychological, social, and environmental aspects early on, our assessments lay the groundwork for academic success and emotional resilience, preparing students for lifelong achievement.",
      },
    ];

    const fallbackColors = [
      "bg-[#ededf6] text-black border-3 border-[#4a4c99]",
      "bg-[#f2edf6] text-black border-3 border-[#744999]",
      "bg-[#f6edf3] text-black border-3 border-[#9d497e]",
      "bg-[#fdf6ec] text-black border-3 border-[#e9a642]",
      "bg-[#f1faf4] text-black border-3 border-[#6bc88d]",
      "bg-[#ebfbf9] text-black border-3 border-[#30d3c1]",
      "bg-[#ebf4fc] text-black border-3 border-[#3690e5]",
      "bg-[#ededf6] text-black border-3 border-[#4a4c99]",
    ];

    const fallbackLineColors = [
      "bg-[#2880d3]",
      "bg-[#a98dbe]",
      "bg-[#cea3be]",
      "bg-[#eebc6d]",
      "bg-[#a3dcb8]",
      "bg-[#80e3d8]",
      "bg-[#4d9ee8]",
      "bg-[#a4a5cb]",
    ];

    const fallbackIntro = "Our assessments are thoughtfully designed to support the holistic development of school children by focusing on their psychological, social, and environmental conduct. These evaluations provide valuable insights into a child's emotional well-being, interpersonal skills, and awareness of their surroundings, empowering them to grow into well-rounded individuals. Here's how our assessments can make a meaningful impact:";

    if (!data) {
      return { 
        assessments: fallbackAssessments,
        colors: fallbackColors,
        lineColors: fallbackLineColors,
        mainHeading: "How the CAF's assessments would help the students",
        introParagraph: fallbackIntro
      };
    }
    
    try {
      const assessments = data.assessments_data ? JSON.parse(data.assessments_data) : fallbackAssessments;
      const colors = data.assessments_colors ? JSON.parse(data.assessments_colors) : fallbackColors;
      const lineColors = data.assessments_line_colors ? JSON.parse(data.assessments_line_colors) : fallbackLineColors;
      
      const cleanAssessments = assessments.map(assessment => ({
        ...assessment,
        title: stripHtmlTags(assessment.title || ''),
        desc: assessment.desc || ''
      }));
      
      const introPara = data.assessments_main_paragraph || fallbackIntro;
      
      return {
        assessments: Array.isArray(cleanAssessments) ? cleanAssessments : fallbackAssessments,
        colors: Array.isArray(colors) ? colors : fallbackColors,
        lineColors: Array.isArray(lineColors) ? lineColors : fallbackLineColors,
        mainHeading: stripHtmlTags(data.assessments_main_heading || "How the CAF's assessments would help the students"),
        introParagraph: introPara
      };
    } catch {
      return { 
        assessments: fallbackAssessments,
        colors: fallbackColors,
        lineColors: fallbackLineColors,
        mainHeading: "How the CAF's assessments would help the students",
        introParagraph: fallbackIntro
      };
    }
  }, [data]);

  const [localData, setLocalData] = useState(initialData);

  useEffect(() => {
    setLocalData(initialData);
  }, [editing, initialData]);

  const debouncedJsonChange = useCallback(debounce(onJsonChange, 500), [onJsonChange]);
  const debouncedFieldChange = useCallback(debounce(onFieldChange, 500), [onFieldChange]);

  // Errors state for all text fields
  const [errors, setErrors] = useState({
    mainHeading: false,
    introParagraph: false,
    assessments: initialData.assessments.map(() => ({ title: false, desc: false })),
  });

  // Maximum lengths for all text fields
  const MAX_LENGTHS = {
    mainHeading: 55,
    introParagraph: 450,
    title: 55,
    desc: 430,
  };

  // Handler for main heading change with limit enforcement
  const handleMainHeadingChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_LENGTHS.mainHeading) {
      setLocalData(prev => ({ ...prev, mainHeading: val }));
      debouncedFieldChange("assessments_main_heading", val);
      setErrors(prev => ({ ...prev, mainHeading: false }));
    }
  };

  const handleMainHeadingKeyDown = (e) => {
    const currVal = e.target.value;
    const hasSelection = e.target.selectionStart !== e.target.selectionEnd;
    if (
      currVal.length >= MAX_LENGTHS.mainHeading &&
      !hasSelection &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
    ) {
      e.preventDefault();
      setErrors(prev => ({ ...prev, mainHeading: true }));
    } else {
      setErrors(prev => ({ ...prev, mainHeading: false }));
    }
  };

  // Handler for intro paragraph change with limit enforcement
  const handleIntroParagraphChange = (val) => {
    const textOnly = stripHtmlTags(val);
    if (textOnly.length <= MAX_LENGTHS.introParagraph) {
      setLocalData(prev => ({ ...prev, introParagraph: val }));
      debouncedFieldChange("assessments_main_paragraph", val);
      setErrors(prev => ({ ...prev, introParagraph: false }));
    }
  };

  // Handlers for individual assessment item fields
  const handleAssessmentChange = (index, field, value) => {
    // For description, count text length ignoring html tags
    const lengthCheck = field === 'desc' ? stripHtmlTags(value).length : value.length;
    if (lengthCheck <= MAX_LENGTHS[field]) {
      const updatedAssessments = localData.assessments.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      setLocalData(prev => ({ ...prev, assessments: updatedAssessments }));
      debouncedJsonChange("assessments_data", updatedAssessments);
      setErrors(prev => {
        const newErrors = { ...prev };
        newErrors.assessments[index][field] = false;
        return newErrors;
      });
    }
  };

  // Keydown handler to block typing beyond limits for inputs
  const handleInputKeyDown = (index, field, maxLen, e) => {
    const currVal = e.target.value;
    const hasSelection = e.target.selectionStart !== e.target.selectionEnd;
    if (
      currVal.length >= maxLen &&
      !hasSelection &&
      !['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)
    ) {
      e.preventDefault();
      setErrors(prev => {
        const newErrors = { ...prev };
        newErrors.assessments[index][field] = true;
        return newErrors;
      });
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        newErrors.assessments[index][field] = false;
        return newErrors;
      });
    }
  };

  // CKEditor keydown handler for description field
  const handleCKEditorKeyDown = (index, e) => {
    const htmlContent = e.target?.innerHTML || "";
    const textContent = stripHtmlTags(htmlContent);
    if (
      textContent.length >= MAX_LENGTHS.desc &&
      !['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Control','Meta','Alt'].includes(e.key)
    ) {
      e.preventDefault();
      setErrors(prev => {
        const newErrors = { ...prev };
        newErrors.assessments[index].desc = true;
        return newErrors;
      });
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        newErrors.assessments[index].desc = false;
        return newErrors;
      });
    }
  };

  if (!editing) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:mx-2 xl:mx-auto py-10">
        <h2 className="text-[1.4rem] sm:text-[1.6rem] md:text-[1.7rem] lg:text-[1.75rem] xl:text-[1.8rem] font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-9 text-center lg:text-left">
          {localData.mainHeading}
        </h2>

        <div
          className="text-gray-700 text-[1.1rem] px-4 sm:text-[1.25rem] lg:text-[1.25rem] xl:text-[1.35rem] leading-relaxed mb-10 text-center lg:text-left lg:ml-5"
          dangerouslySetInnerHTML={{ __html: localData.introParagraph || '' }}
        />

        <div className="flex flex-col space-y-6 lg:ml-15">
          {localData.assessments.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-row sm:items-start gap-4 sm:gap-6 bg-white rounded-lg sm:p-5"
            >
              <div
                className={`flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 lg:h-12 lg:w-12 sm:text-lg lg:text-xl rounded-md font-semibold ${localData.colors[index]} mb-3 sm:mb-0 flex-shrink-0 mx-auto sm:mx-0`}
              >
                {item.id}
              </div>

              <div className="text-left flex-1">
                <h3 className="text-gray-900 font-semibold text-[1.15rem] sm:text-[1.4rem] md:text-[1.4rem] lg:text-[1.45rem]">
                  {item.title}
                </h3>
                <div className={`h-0.5 [@media(min-width:425px)_and_(max-width:429px)]:w-90 sm:w-130 md:w-130 lg:w-155 mb-3 mt-1 mx-auto sm:mx-0 ${localData.lineColors[index]}`}></div>
                <div
                  className="text-gray-600 text-[1.05rem] sm:text-[1.2rem] md:text-[1.2rem] lg:text-[1.25rem] xl:text-[1.35rem] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item.desc || '' }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Edit mode UI
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:mx-2 xl:mx-auto py-10 space-y-8">
      <div className="text-center mb-12 relative max-w-4xl mx-auto">
        <input
          type="text"
          value={localData.mainHeading}
          onChange={handleMainHeadingChange}
          onKeyDown={handleMainHeadingKeyDown}
          className="text-[1.4rem] sm:text-[1.6rem] md:text-[1.7rem] lg:text-[1.75rem] xl:text-[1.8rem] font-bold text-gray-900 border-b-2 pb-2 focus:outline-none bg-transparent w-full text-center"
          placeholder="Edit main heading..."
        />
        {errors.mainHeading && (
          <div className="text-red-600 font-bold text-xs absolute -bottom-7 right-0 bg-red-100 px-2 py-1 rounded">
            🚫 No more text allowed!
          </div>
        )}
        <div className="text-xs text-gray-700 mt-1 text-right">
          Characters: {localData.mainHeading.length} / {MAX_LENGTHS.mainHeading}
        </div>
      </div>

      <div className="px-4 sm:px-6 mb-10 max-w-4xl mx-auto">
        <ClientOnlyCKEditor
          value={localData.introParagraph || ""}
          onChange={handleIntroParagraphChange}
          config={{
            placeholder: "Edit intro paragraph...",
            toolbar: ['bold', 'italic', 'bulletedList', 'numberedList']
          }}
        />
        {errors.introParagraph && (
          <div className="text-red-600 font-bold text-xs mt-1 bg-red-100 px-2 py-1 rounded text-right max-w-4xl mx-auto">
            🚫 No more text allowed!
          </div>
        )}
        <div className="text-xs text-gray-700 mt-1 text-right max-w-4xl mx-auto">
          Characters: {stripHtmlTags(localData.introParagraph).length} / {MAX_LENGTHS.introParagraph}
        </div>
      </div>

      <div className="flex flex-col space-y-6 lg:ml-15">
        {localData.assessments.map((item, index) => (
          <div key={item.id} className="flex flex-row sm:items-start gap-4 sm:gap-6 bg-gray-50 p-5 rounded-lg border-2 border-dashed border-gray-300">
            <div
              className={`flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 lg:h-12 lg:w-12 sm:text-lg lg:text-xl rounded-md font-semibold ${localData.colors[index]} mb-3 sm:mb-0 flex-shrink-0 mx-auto sm:mx-0`}
            >
              {item.id}
            </div>

            <div className="text-left flex-1 space-y-4">
              {/* Title input with limit */}
              <div className="relative space-y-1">
                <input
                  type="text"
                  value={stripHtmlTags(item.title || "")}
                  onChange={(e) => handleAssessmentChange(index, "title", e.target.value)}
                  onKeyDown={(e) => handleInputKeyDown(index, "title", MAX_LENGTHS.title, e)}
                  className="text-gray-900 font-semibold text-[1.15rem] sm:text-[1.4rem] md:text-[1.4rem] lg:text-[1.45rem] border-b pb-1 focus:outline-none bg-transparent w-full"
                  placeholder="Edit title..."
                />
                {errors.assessments[index]?.title && (
                  <div className="text-red-600 font-bold text-xs absolute -bottom-6 right-0 bg-red-100 px-2 py-1 rounded">
                    🚫 No more text allowed!
                  </div>
                )}
                <div className="text-xs text-gray-700 text-right">
                  Characters: {stripHtmlTags(item.title || "").length} / {MAX_LENGTHS.title}
                </div>
              </div>

              {/* Description CKEditor with limits */}
              <div className="relative">
                <ClientOnlyCKEditor
                  value={item.desc || ""}
                  onChange={(val) => handleAssessmentChange(index, "desc", val)}
                  onKeyDown={(e) => handleCKEditorKeyDown(index, e)}
                  config={{
                    placeholder: "Edit description...",
                    toolbar: ['bold', 'italic', 'bulletedList', 'numberedList']
                  }}
                />
                {errors.assessments[index]?.desc && (
                  <div className="text-red-600 font-bold text-xs absolute -bottom-6 right-0 bg-red-100 px-2 py-1 rounded">
                    🚫 No more text allowed!
                  </div>
                )}
                <div className="text-xs text-gray-700 text-right mt-1">
                  Characters: {stripHtmlTags(item.desc || "").length} / {MAX_LENGTHS.desc}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
