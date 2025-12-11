"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function StepForm({
  onSubmit,
  onCancel,
  initialData,
  selectedClass,
  testCode,
}) {
  const router = useRouter();
  const [videoLink, setVideoLink] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [classes, setClasses] = useState([]);
  const stepRefs = useRef([]);
  const scrollContainerRef = useRef(null);


  useEffect(() => {
    async function fetchClasses() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/classes`);
      const data = await res.json();
      setClasses(data);
    }
    fetchClasses();
  }, []);


  useEffect(() => {
    if (!initialData) return;

    setVideoLink(initialData.videoLink || "");
    setQuestionCount(initialData.questions.length.toString());

    setQuestions(
      initialData.questions.map((q) => ({
        id: q.id,
        title: q.title || "",
        options: q.options,
        correctAnswer: Number(q.correctAnswer),
        image: null,
        imagePreview: q.image_url,
        image_url: q.image_url,
      }))
    );

    setIsEditMode(true);
    setCurrentStep(1);
  }, [initialData]);


  // Handle question count
  const handleQuestionCountChange = (newCount) => {
    const count = parseInt(newCount);

    if (count > 0 && count <= 100) {
      const currentCount = questions.length;

      if (count > currentCount) {
        const newQuestions = Array.from({ length: count - currentCount }, () => ({
          id: crypto.randomUUID(),
          title: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          image: null,
          imagePreview: null,
          image_url: "", 
        }));
        setQuestions([...questions, ...newQuestions]);
      } else if (count < currentCount) {
        setQuestions(questions.slice(0, count));
        if (currentStep > count) {
          setCurrentStep(count > 0 ? count : 1);
        }
      }
    } else if (!newCount || count === 0) {
      setQuestions([]);
      setCurrentStep(1);
    }
  };

  useEffect(() => {
    if (questionCount && !isNaN(parseInt(questionCount))) {
      handleQuestionCountChange(questionCount);
    }
  }, [questionCount]);

  const handleQuestionCountInput = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setQuestionCount(value);
    }
  };

  const handleQuestionChange = (field, value) => {
    if (questions.length === 0) return;

    const updated = [...questions];
    updated[currentStep - 1] = {
      ...updated[currentStep - 1],
      [field]: value,
    };
    setQuestions(updated);

    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const handleOptionChange = (optionIndex, value) => {
    if (questions.length === 0) return;

    const updated = [...questions];
    updated[currentStep - 1].options[optionIndex] = value;
    setQuestions(updated);

    if (validationErrors[`option-${optionIndex}`]) {
      const newErrors = { ...validationErrors };
      delete newErrors[`option-${optionIndex}`];
      setValidationErrors(newErrors);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const updated = [...questions];
        updated[currentStep - 1] = {
          ...updated[currentStep - 1],
          image: file,
          imagePreview: event.target.result,
        };
        setQuestions(updated);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    const updated = [...questions];
    updated[currentStep - 1] = {
      ...updated[currentStep - 1],
      image: null,
      imagePreview: null,
    };
    setQuestions(updated);
  };

  const validateCurrentQuestion = () => {
    if (questions.length === 0) return false;

    const current = questions[currentStep - 1];
    const errors = {};

    if (!current.title.trim()) {
      errors.title = "Question title is required";
    }

    current.options.forEach((option, index) => {
      if (!option.trim()) {
        errors[`option-${index}`] = `Option ${String.fromCharCode(
          65 + index
        )} is required`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentQuestion()) {
      if (currentStep < questions.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    setValidationErrors({});
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!videoLink || !questionCount || questions.length === 0) return;
    if (!validateCurrentQuestion()) return;

    const updatedQuestions = [...questions];

    // STEP 1: Upload images first
    for (let i = 0; i < updatedQuestions.length; i++) {
      const q = updatedQuestions[i];

      if (q.image instanceof File) {
        const uploadForm = new FormData();
        uploadForm.append("file", q.image);

        const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/upload`, {
          method: "POST",
          body: uploadForm,
        });

        const data = await res.json();
        q.image_url = data.url; // Save uploaded URL
      }

      delete q.image; // Remove file object
      delete q.imagePreview;
    }

    // STEP 2: Send modified questions to parent
    onSubmit({
      videoLink,
      questions: updatedQuestions,
    });
  };



  // Calculate steps
  const getVisibleSteps = () => {
    const totalSteps = questions.length;
    const maxVisible = 7;

    if (totalSteps <= maxVisible) {
      return Array.from({ length: totalSteps }, (_, i) => i + 1);
    }

    let start = Math.max(1, currentStep - Math.floor(maxVisible / 2));
    let end = Math.min(totalSteps, start + maxVisible - 1);

    if (end === totalSteps) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const steps = [];

    if (start > 1) {
      steps.push(1);
      if (start > 2) steps.push("...");
    }

    for (let i = start; i <= end; i++) steps.push(i);

    if (end < totalSteps) {
      if (end < totalSteps - 1) steps.push("...");
      steps.push(totalSteps);
    }

    return steps;
  };

  const currentQuestion = questions[currentStep - 1] ?? {
    title: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    image: null,
    imagePreview: null,
  };
  const totalSteps = questions.length;
  const visibleSteps = getVisibleSteps();

  return (
    <div className="space-y-6">
      {/* Always Visible: Video Link & Question Count Form */}
      <div className="bg-white shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Video & Question Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm xl:text-base font-semibold text-gray-700 mb-2">
              Video Link <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[#6ebdfc] focus:border-transparent outline-none"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label className="block text-sm xl:text-base font-semibold text-gray-700 mb-2">
              Number of Questions <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={questionCount}
              onChange={handleQuestionCountInput}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[#6ebdfc] focus:border-transparent outline-none text-lg"
              placeholder="Enter number (max 100)"
              maxLength="3"
            />
            {questionCount && parseInt(questionCount) > 0 && parseInt(questionCount) <= 100 && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {questionCount} question{parseInt(questionCount) > 1 ? 's' : ''} {questions.length > 0 ? 'ready' : 'will be created'}
              </p>
            )}
            {questionCount && parseInt(questionCount) > 100 && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Maximum 100 questions allowed
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Step Form Card */}
      {questions.length > 0 ? (
        <div className="bg-white shadow-lg overflow-hidden">
          {/* Header - Steps Centered */}
          <div className="bg-[#6ebdfc] p-2.5 lg:py-3.5">
            {/* Progress Steps - Centered */}
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto pb-4 pt-2 px-2 -mx-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="flex items-center justify-center gap-2 min-w-min">
                {visibleSteps.map((step, index) => {
                  if (step === '...') {
                    return (
                      <div key={`ellipsis-${index}`} className="text-white font-bold px-2 flex-shrink-0">
                        ...
                      </div>
                    );
                  }

                  return (
                    <div key={step} className="flex items-center flex-shrink-0">
                      <button
                        ref={(el) => (stepRefs.current[step - 1] = el)}
                        onClick={() => {
                          setValidationErrors({});
                          setCurrentStep(step);
                        }}
                        className={`min-w-[44px] h-11 rounded-full flex items-center justify-center font-semibold transition-all px-3 ${step < currentStep ? 'bg-emerald-500 text-white shadow-md' :
                          step === currentStep ? 'bg-white text-[#3690e5] ring-4 ring-white/30 scale-110 shadow-lg' :
                            'bg-[#eaeaea] text-[#3690e5] hover:bg-white'
                          }`}
                      >
                        {step}
                      </button>
                      {index < visibleSteps.length - 1 && visibleSteps[index + 1] !== '...' && (
                        <div className={`w-8 h-1 ${step < currentStep ? 'bg-emerald-500' : 'bg-emerald-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Validation Error Banner */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="bg-red-50 border-b-2 border-red-200 px-6 py-3">
              <p className="text-red-700 text-sm font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Please fill all required fields before proceeding
              </p>
            </div>
          )}

          {/* Form Content */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side - Question Form */}
              <div className="space-y-6 order-2 lg:order-1">
                <div>
                  <label className="block text-sm xl:text-base font-semibold text-gray-700 mb-2">
                    Question Title <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={currentQuestion.title}
                    onChange={(e) => handleQuestionChange('title', e.target.value)}
                    className={`w-full px-4 py-3 border focus:ring-2 focus:ring-[#6ebdfc] focus:border-transparent outline-none resize-none transition-colors ${validationErrors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    rows="3"
                    placeholder="What would you do if your friend dropped their lunch?"
                  />
                  {validationErrors.title && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validationErrors.title}
                    </p>
                  )}
                </div>

                {/* Options - Radio on RIGHT, Labels on LEFT */}
                <div>
                  <label className="block text-sm xl:text-base font-semibold text-gray-700 mb-3">
                    Options (Multiple Choice) <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3">
                        {/* Left Side - Option Label */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              className={`flex-1 px-4 py-3 border focus:ring-2 focus:ring-[#6ebdfc] focus:border-transparent outline-none transition-colors ${validationErrors[`option-${index}`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                              placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            />
                          </div>
                          {validationErrors[`option-${index}`] && (
                            <p className="text-red-500 text-xs mt-1 ml-6">{validationErrors[`option-${index}`]}</p>
                          )}
                        </div>

                        {/* Right Side - Radio Button */}
                        <div className="flex items-center justify-center w-12">
                          <input
                            type="radio"
                            name={`correct-answer-${currentQuestion.id}`}
                            checked={Number(currentQuestion.correctAnswer) === index}
                            onChange={() => handleQuestionChange("correctAnswer", index)}
                            className="w-6 h-6 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Select the radio button on the right for the correct answer
                    </span>
                  </p>
                </div>

                {/* 🔥 Image Upload for Small Devices (lg se niche) - Below Options */}
                <div className="lg:hidden">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Question Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#d9eefd] file:text-[#3690e5] file:font-semibold hover:file:bg-[#d2e7f5] cursor-pointer"
                  />
                </div>
              </div>

              {/* Right Side - Image Upload & Preview */}
              <div className="space-y-4 order-1 lg:order-2">
                {/* 🔥 Image Upload for Large Devices (lg+) - Above Image Preview */}
                <div className="hidden lg:block">
                  <label className="block text-sm xl:text-base font-semibold text-gray-700 mb-2">
                    Question Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[#6ebdfc] focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#d9eefd] file:text-[#3690e5] file:font-semibold hover:file:bg-[#d2e7f5] cursor-pointer"
                  />
                </div>

                {/* Image Preview Box */}
                <div className="relative w-full overflow-hidden border-2 border-dashed border-[#6ebdfc] bg-gray-50" style={{ aspectRatio: '4 / 3' }}>
                  {currentQuestion.imagePreview ? (
                    <>
                      <img
                       src={currentQuestion.imagePreview ?? currentQuestion.image_url}
                        alt="Question preview"
                        className="absolute inset-0 w-full h-full object-contain"
                      />

                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-3 right-3 z-10 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                        type="button"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                      <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500 text-sm font-semibold">No image selected</p>
                      <p className="text-gray-400 text-xs mt-1">Upload an image to preview (4:3 ratio)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 lg:mt-8 pt-6 border-t border-gray-200 w-full">
              <button
                onClick={currentStep === 1 ? onCancel : handleBack}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition-colors flex items-center justify-center gap-2 text-base rounded"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>

              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  className="flex-1 bg-[#3690e5] text-white py-2 sm:py-3 font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-base rounded"
                >
                  Next
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-[#3690e5] text-white py-2 sm:py-3 font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-base rounded"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {isEditMode ? 'Update & Save Questions Set' : 'Save Questions Set'}
                </button>
              )}
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-white shadow-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 font-semibold">Enter number of questions above to start creating</p>
          </div>
        </div>
      )}
    </div>
  );
}
