'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import ClientOnlyCKEditor from './HomeClientOnlyCKEditor';

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

const fallbackFAQs = [
  {
    q: 'What is the purpose of these assessments?',
    a: 'Our assessments are designed to evaluate the psychological, social, and environmental conduct of children to calculate their Holistic Development Index (HDI). The goal is to identify strengths and areas for improvement, helping children grow emotionally, socially, and environmentally aware.',
  },
  { q: 'Who can take these assessments?', a: 'Students enrolled in participating schools and programs.' },
  { q: 'How long does each assessment take?', a: 'Typically 20–45 minutes depending on the assessment type.' },
  { q: 'Are the assessments mandatory?', a: 'Participation depends on school policy and parental consent.' },
  { q: 'How will these assessments benefit my child?', a: 'They highlight growth areas and help teachers plan targeted support.' },
  { q: 'Will I receive feedback after the assessment?', a: 'Yes — schools usually share a summary report with parents.' },
  { q: "Can I monitor my child's progress over time?", a: 'Yes — repeated assessments track progress across periods.' },
  { q: 'Do I need to be present during the assessment?', a: 'Not usually; teachers administer them as required.' },
  { q: 'How can schools integrate these assessments into their curriculum?', a: 'Schools can use HDI scores to plan interventions and tailor learning.' },
  { q: 'Can teachers view the results of their students?', a: 'Yes — with proper permissions teachers can access student reports.' },
  { q: 'Are the assessments standardized?', a: 'They follow validated frameworks but may adapt locally.' },
  { q: 'How can schools use the HDI scores?', a: 'For planning, resource allocation, and tracking holistic growth.' },
  { q: 'Will the assessments feel like a test?', a: 'They are designed to be child-friendly and non-threatening.' },
  { q: "What happens if I don't perform well?", a: 'Results are used to support, not penalize — they inform help and interventions.' },
  { q: 'Will my answers be private?', a: 'Yes — data privacy policies govern access to individual responses.' },
  { q: 'Do I need any special equipment to take the assessment?', a: 'No — most assessments require just basic digital access.' },
  { q: 'Can I pause the assessment and resume later?', a: 'Many assessments support pausing and resuming; depends on admin settings.' },
  { q: 'What if I face technical issues during the assessment?', a: 'Contact the proctor or support team immediately for assistance.' },
];

export default function FAQAccordion({ data, editing, onFieldChange, onJsonChange }) {
  const initialFAQs = useMemo(() => {
    if (!data?.faqs_data) return fallbackFAQs;
    try {
      const parsed = typeof data.faqs_data === 'string' ? JSON.parse(data.faqs_data) : data.faqs_data;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return fallbackFAQs;
    } catch {
      return fallbackFAQs;
    }
  }, [data]);

  const initialTitle = data?.faqs_heading || '';

  const [localFAQs, setLocalFAQs] = useState(initialFAQs);
  const [localTitle, setLocalTitle] = useState(initialTitle);
  const [openIndex, setOpenIndex] = useState(0);
  
  // Errors state for all text fields
  const [errors, setErrors] = useState({
    title: false,
    faqs: initialFAQs.map(() => ({ q: false, a: false })),
  });

  const MAX_LENGTHS = {
    title: 50,
    question: 70,
    answer: 320,
  };

  useEffect(() => {
    if (editing) {
      setLocalFAQs(initialFAQs);
      setLocalTitle(initialTitle);
      setErrors({
        title: false,
        faqs: initialFAQs.map(() => ({ q: false, a: false })),
      });
    }
  }, [editing, initialFAQs, initialTitle]);

  const debouncedJsonChange = useCallback(debounce(onJsonChange, 500), [onJsonChange]);
  const debouncedFieldChange = useCallback(debounce(onFieldChange, 500), [onFieldChange]);

  const toggle = (i) => {
    setOpenIndex((prev) => (prev === i ? -1 : i));
  };

  // Title handlers with limit
  const handleTitleChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTHS.title) {
      setLocalTitle(value);
      debouncedFieldChange('faqs_heading', value);
      setErrors((prev) => ({ ...prev, title: false }));
    }
  };

  const handleTitleKeyDown = (e) => {
    const currVal = e.target.value;
    const hasSelection = e.target.selectionStart !== e.target.selectionEnd;
    if (
      currVal.length >= MAX_LENGTHS.title &&
      !hasSelection &&
      !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
    ) {
      e.preventDefault();
      setErrors((prev) => ({ ...prev, title: true }));
    } else {
      setErrors((prev) => ({ ...prev, title: false }));
    }
  };

  // FAQ Question handlers with limit
  const handleFAQQuestionChange = (index, value) => {
    if (value.length <= MAX_LENGTHS.question) {
      setLocalFAQs((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], q: value };
        debouncedJsonChange('faqs_data', updated);
        return updated;
      });
      setErrors((prev) => {
        const newErrors = { ...prev };
        newErrors.faqs[index].q = false;
        return newErrors;
      });
    }
  };

  const handleFAQQuestionKeyDown = (index, e) => {
    const currVal = e.target.value;
    const hasSelection = e.target.selectionStart !== e.target.selectionEnd;
    if (
      currVal.length >= MAX_LENGTHS.question &&
      !hasSelection &&
      !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
    ) {
      e.preventDefault();
      setErrors((prev) => {
        const newErrors = { ...prev };
        newErrors.faqs[index].q = true;
        return newErrors;
      });
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        newErrors.faqs[index].q = false;
        return newErrors;
      });
    }
  };

  // FAQ Answer handlers with REAL-TIME limit blocking
  const handleFAQAnswerChange = (index, value) => {
    const textLen = stripHtmlTags(value).length;
    const isOverLimit = textLen > MAX_LENGTHS.answer;
    
    // BLOCK typing if over limit - DON'T update state
    if (!isOverLimit) {
      setLocalFAQs((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], a: value };
        debouncedJsonChange('faqs_data', updated);
        return updated;
      });
      setErrors((prev) => {
        const newErrors = { ...prev };
        newErrors.faqs[index].a = false;
        return newErrors;
      });
    } else {
      // Show error immediately when over limit
      setErrors((prev) => {
        const newErrors = { ...prev };
        newErrors.faqs[index].a = true;
        return newErrors;
      });
    }
  };

  if (!editing) {
    return (
      <section className="w-full min-h-screen bg-white text-black py-10 xl:mx-3 2xl:mx-auto">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-[1.8rem] lg:text-4xl font-semibold mb-12 text-gray-900 text-center xl:text-left">
            {localTitle}
          </h2>

          <div className="divide-y divide-gray-200 xl:ml-60 ml-3">
            {localFAQs.map((item, i) => {
              const isOpen = i === openIndex;
              return (
                <div key={i} className="py-4 flex items-start gap-4">
                  <button
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    className={`flex-none w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isOpen ? 'bg-gray-800' : 'bg-black'
                    }`}
                    aria-label={`${isOpen ? 'Collapse' : 'Expand'} question ${i + 1}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      {isOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h12" />
                      ) : (
                        <g>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h12" />
                        </g>
                      )}
                    </svg>
                  </button>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold sm:text-xl text-gray-800">{item.q}</h3>

                    <div
                      className={`mt-3 text-xl sm:text-xl text-gray-600 leading-relaxed overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
                        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                      aria-hidden={!isOpen}
                    >
                      <p dangerouslySetInnerHTML={{ __html: item.a }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Edit mode
  return (
    <section className="w-full min-h-screen bg-white text-black py-10 xl:mx-3 2xl:mx-auto">
      <div className="max-w-7xl mx-auto px-4">
        {/* Editable Title with limit */}
        <div className="space-y-1 mb-12">
          <input
            type="text"
            value={localTitle}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            className="w-full text-2xl md:text-[1.8rem] lg:text-4xl font-semibold text-gray-900 text-center xl:text-left border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
            placeholder="Edit FAQ title..."
          />
          {errors.title && (
            <div className="text-red-600 font-bold text-xs bg-red-100 px-3 py-1 rounded inline-block">
              🚫 No more text allowed! (Max {MAX_LENGTHS.title} chars)
            </div>
          )}
          <div className="text-xs text-gray-700 text-right">
            {localTitle.length} / {MAX_LENGTHS.title}
          </div>
        </div>

        {/* Editable FAQ Items */}
        <div className="divide-y divide-gray-200 xl:ml-60 ml-3 space-y-6">
          {localFAQs.map((item, i) => (
            <div key={i} className="py-4 flex items-start gap-4 bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
              {/* Toggle Button - Disabled in edit mode */}
              <div className="flex-none w-9 h-9 rounded-full bg-gray-400 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{i + 1}</span>
              </div>

              <div className="flex-1 space-y-3">
                {/* Question Input with limit */}
                <div className="space-y-1">
                  <input
                    type="text"
                    value={item.q}
                    onChange={(e) => handleFAQQuestionChange(i, e.target.value)}
                    onKeyDown={(e) => handleFAQQuestionKeyDown(i, e)}
                    className="w-full text-xl font-bold text-gray-800 border-b border-gray-300 focus:outline-none bg-transparent p-2"
                    placeholder={`Question ${i + 1}`}
                  />
                  {errors.faqs[i]?.q && (
                    <div className="text-red-600 font-bold text-xs bg-red-100 px-3 py-1 rounded inline-block">
                      🚫 No more text allowed! (Max {MAX_LENGTHS.question} chars)
                    </div>
                  )}
                  <div className="text-xs text-gray-700 text-right">
                    {item.q.length} / {MAX_LENGTHS.question}
                  </div>
                </div>

                {/* Answer CKEditor with limit */}
                <div className="space-y-2">
                  <ClientOnlyCKEditor
                    value={item.a || ''}
                    onChange={(val) => handleFAQAnswerChange(i, val)}
                    config={{
                      placeholder: `Edit answer ${i + 1}...`,
                      toolbar: ['bold', 'italic', 'bulletedList', 'numberedList'],
                    }}
                  />
                  {errors.faqs[i]?.a && (
                    <div className="text-red-600 font-bold text-xs bg-red-100 px-3 py-1 rounded inline-block">
                      🚫 No more text allowed! (Max {MAX_LENGTHS.answer} chars)
                    </div>
                  )}
                  <div className="text-xs text-gray-700 text-right">
                    {stripHtmlTags(item.a || "").length} / {MAX_LENGTHS.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
