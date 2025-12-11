"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SuperAdminHeader from "@/components/SuperAdminHeader";
import StepForm from "@/components/StepForm";

// Static class options
const CLASS_OPTIONS = [
  { value: "", label: "All Classes" },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: `class-${i + 1}`,
    label: `Class ${i + 1}`,
  })),
];

async function fetchAllTests() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/tests`);
  return res.json();
}

async function fetchTestDetails(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/tests/${id}`);
  return res.json();
}

export default function AdminDashboard() {
  const router = useRouter();

  // STATES
  const [selectedClass, setSelectedClass] = useState("");
  const [testCode, setTestCode] = useState("");
  const [questionSets, setQuestionSets] = useState([]);
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [showValidationError, setShowValidationError] = useState(false);
  const [testCodeError, setTestCodeError] = useState("");

  const [authLoaded, setAuthLoaded] = useState(false);

  // The REAL flag that controls visibility
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const isFormValid = selectedClass !== "" && testCode.trim() !== "";

  // AUTH GUARD
  useEffect(() => {
    const hasCookie = document.cookie.includes("caf_admin_token=");
    const hasLocal = localStorage.getItem("caf_admin_token");

    if (!hasCookie && !hasLocal) {
      router.push(`${process.env.NEXT_PUBLIC_PROD_URL}/admin/dashboard`);
    } else {
      setAuthLoaded(true);
    }
  }, []);

  // Load submission flag
  useEffect(() => {
    const flag = localStorage.getItem("hasSubmitted");
    setHasSubmitted(flag === "true");
  }, []);

  // Restore selected class / test code
  useEffect(() => {
    const savedClass = localStorage.getItem("selectedClass");
    const savedTest = localStorage.getItem("testCode");

    if (savedClass) setSelectedClass(savedClass);
    if (savedTest) setTestCode(savedTest);
  }, []);

  // Fetch tests after auth
  useEffect(() => {
    if (!authLoaded) return;

    async function loadTests() {
      const data = await fetchAllTests();
      setQuestionSets(data.tests || []);
    }

    loadTests();
  }, [authLoaded]);

  // ADD NEW QUESTION SET — duplicate check
  const handleAddQuestionClick = async () => {
    if (!isFormValid) {
      setShowValidationError(true);
      return;
    }

    setTestCodeError("");

    const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/check-testcode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test_code: testCode }),
    });

    const data = await res.json();

    // if (data.exists) {
    //   setTestCodeError("❌ This Test Code already exists. Please choose a different one.");
    //   return;
    // }

    setShowValidationError(false);
    setEditingData(null);
    setShowNewQuestionForm(true);
  };

  // SUBMIT QUESTION SET
  const handleAddQuestionSet = async (dataFromStepForm) => {
    const form = new FormData();
    const classId = selectedClass.replace("class-", "");

    form.append("class_id", classId);
    form.append("test_code", testCode);
    form.append("video_link", dataFromStepForm.videoLink);
    form.append("total_questions", dataFromStepForm.questions.length);

    const mapped = dataFromStepForm.questions.map((q) => ({
      id: q.id,
      title: q.title,
      options: q.options,
      image_url: q.image_url ?? null,
      correctAnswer: q.correctAnswer,
    }));

    form.append("questions", JSON.stringify(mapped));

    let res;

    if (editingData) {
      form.append("test_id", editingData.id);
      form.append("class_test_id", editingData.class_test_id);

      res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/tests/update`, {
        method: "POST",
        body: form,
      });
    } else {
      res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/create-full-test`, {
        method: "POST",
        body: form,
      });
    }

    const data = await res.json();

    if (!data.success) {
      alert("Error: " + data.error);
      return;
    }

    alert(editingData ? "Updated Successfully!" : "Saved Successfully!");

    // IMPORTANT: Unlock question sets
    localStorage.setItem("hasSubmitted", "true");
    setHasSubmitted(true);

    // Refresh data
    const refreshed = await fetchAllTests();
    setQuestionSets(refreshed.tests);

    setShowNewQuestionForm(false);
    setEditingData(null);
  };

  // Filtered sets
  const displayedSets =
    selectedClass === ""
      ? questionSets
      : questionSets.filter(
        (set) => set.class_id == selectedClass.replace("class-", "")
      );

  if (!authLoaded) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      <div className="max-w-7xl mx-auto p-6">

        {/* FILTERS */}
        <div className="bg-white shadow-md px-6 py-4.5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Select Class */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Select Class *
              </label>

              <select
                value={selectedClass}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedClass(v);
                  localStorage.setItem("selectedClass", v);
                  setShowValidationError(false);
                }}
                className={`w-full px-4 py-3 border ${showValidationError && !selectedClass
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
                  }`}
              >
                {CLASS_OPTIONS.map((cls) => (
                  <option key={cls.value} value={cls.value}>
                    {cls.label}
                  </option>
                ))}
              </select>

              {showValidationError && !selectedClass && (
                <p className="text-red-500 text-sm mt-1">
                  Please select a class
                </p>
              )}
            </div>

            {/* Test Code */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Test Code *
              </label>

              <input
                type="text"
                value={testCode}
                onChange={(e) => {
                  const v = e.target.value;
                  setTestCode(v);
                  localStorage.setItem("testCode", v);
                  setShowValidationError(false);
                }}
                className={`w-full px-4 py-3 border ${showValidationError && !testCode.trim()
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
                  }`}
                placeholder="Enter test code"
              />
            </div>

          </div>

          {/* Duplicate Test Code Error */}
          {testCodeError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-3">
              {testCodeError}
            </div>
          )}
        </div>

        {/* ADD BUTTON */}
        {!showNewQuestionForm && (
          <div className="mb-6">
            <button
              onClick={handleAddQuestionClick}
              disabled={!isFormValid}
              className={`px-6 py-3 ${isFormValid
                ? "bg-[#3690e5] text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              + Add New Question Set
            </button>
          </div>
        )}

        {/* STEP FORM */}
        {showNewQuestionForm && (
          <StepForm
            onSubmit={handleAddQuestionSet}
            onCancel={() => {
              setShowNewQuestionForm(false);
              setEditingData(null);
            }}
            initialData={editingData}
            selectedClass={selectedClass}
            testCode={testCode}
          />
        )}

        {/* SHOW QUESTION SETS ONLY AFTER SUBMISSION */}
        {hasSubmitted &&
          displayedSets.length > 0 &&
          !showNewQuestionForm && (
            <div className="space-y-4 mb-6">
              <h2 className="text-xl font-bold mb-4">Created Question Sets</h2>
              <div className="bg-white shadow-md overflow-hidden">
                {displayedSets.map((set, index) => {
                  const classSets = displayedSets.filter(
                    (s) => s.class_id === set.class_id
                  );
                  const videoNum =
                    classSets.findIndex((s) => s.id === set.id) + 1;

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between px-6 py-4"
                    >
                      <div className="flex items-center gap-6 flex-1">
                        <div className="w-10 h-10 bg-[#3690e5] text-white flex items-center justify-center rounded-full font-bold">
                          {index + 1}
                        </div>

                        <div>
                          <h3 className="font-semibold">
                            Video {videoNum} Questions of Class {set.class_id}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {set.questions_count} Questions
                          </p>
                        </div>

                        <div className="hidden md:block">
                          <p className="text-xs text-gray-500">Video Link</p>
                          <p className="text-sm text-gray-700 truncate max-w-xs">
                            {set.video_link}
                          </p>
                        </div>
                      </div>

                      {/* Edit/Delete Buttons */}
                      <div className="flex gap-2">
                        <button
                          className="bg-[#3690e5] text-white px-4 py-2 rounded"
                          onClick={async () => {
                            const detail = await fetchTestDetails(set.id);

                            // SAVE EDIT MODE FOR REFRESH
                            localStorage.setItem("editingMode", JSON.stringify({
                              id: set.id
                            }));

                            setSelectedClass(`class-${set.class_id}`);
                            setTestCode(set.test_code);

                            localStorage.setItem("selectedClass", `class-${set.class_id}`);
                            localStorage.setItem("testCode", set.test_code);

                            setEditingData({
                              id: detail.test.id,
                              class_test_id: detail.test.class_test_id,
                              videoLink: detail.test.video_link,
                              questions: detail.questions.map((q) => ({
                                id: q.id,
                                title: q.title,
                                options: [
                                  q.question_choice1 || "",
                                  q.question_choice2 || "",
                                  q.question_choice3 || "",
                                  q.question_choice4 || "",
                                ],
                                correctAnswer: Number(q.correct_answer),
                                image: null,
                                image_url: q.image_url,
                                imagePreview: q.image_url,
                              })),
                            });

                            setShowNewQuestionForm(true);
                          }}

                        >
                          Edit
                        </button>

                        <button className="bg-red-500 text-white px-4 py-2 rounded">
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
