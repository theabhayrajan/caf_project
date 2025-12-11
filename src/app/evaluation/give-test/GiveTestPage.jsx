// app/evaluation/give-test/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import toast from "react-hot-toast";

export default function GiveTestPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const testCode = searchParams.get("code");
  const kidId = searchParams.get("kidId");
  const userId = searchParams.get("userId");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // { class_test_id, test_code, videos: [{id, video_link, questions:[...] }], total_questions }
  const [testData, setTestData] = useState(null);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // -1 = video playing
  const [selectedOption, setSelectedOption] = useState(null); // 1..4

  // pending / correct / wrong
  const [answersGrid, setAnswersGrid] = useState([]);

  // sab videos ke total questions
  const totalQuestions = useMemo(
    () => testData?.total_questions || 0,
    [testData]
  );

  // flat index (0-based) for right grid
  const globalQuestionIndex = useMemo(() => {
    if (!testData || currentQuestionIndex < 0) return -1;
    let idx = 0;
    for (let v = 0; v < currentVideoIndex; v++) {
      idx += testData.videos[v].questions.length;
    }
    return idx + currentQuestionIndex;
  }, [testData, currentVideoIndex, currentQuestionIndex]);

  // current video + question
  const currentVideo =
    testData && testData.videos[currentVideoIndex]
      ? testData.videos[currentVideoIndex]
      : null;

  const currentQuestion =
    currentVideo &&
    currentQuestionIndex >= 0 &&
    currentQuestionIndex < currentVideo.questions.length
      ? currentVideo.questions[currentQuestionIndex]
      : null;

  // on mount: full test fetch
  useEffect(() => {
    const loadTest = async () => {
      if (!testCode || !kidId) {
        toast.error("Missing test code or kid ID.");
        router.push("/evaluation");
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_URL}/api/kids/full-test?testCode=${encodeURIComponent(
            testCode
          )}`
        );
        const data = await res.json();

        if (!data.success) {
          toast.error(data.error || "Unable to load test.");
          router.push("/evaluation");
          return;
        }

        setTestData(data);
        // grid ko pending se fill karo
        const total =
          data.total_questions ||
          data.videos.reduce(
            (sum, v) => sum + (v.questions?.length || 0),
            0
          );
        setAnswersGrid(Array.from({ length: total }, () => "pending"));
        setCurrentVideoIndex(0);
        setCurrentQuestionIndex(-1); // first video play
      } catch (err) {
        console.error(err);
        toast.error("Unable to load test.");
        router.push("/evaluation");
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [testCode, kidId, router]);

  // video end → first question of that video
  const handleVideoEnded = () => {
    if (!currentVideo || currentVideo.questions.length === 0) {
      // agar is video me question hi nahi, directly next video
      goToNextVideo();
      return;
    }
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
  };

  const goToNextVideo = () => {
    if (!testData) return;
    const nextVideoIndex = currentVideoIndex + 1;
    if (nextVideoIndex >= testData.videos.length) {
      // all videos done → finish
      toast.success("All questions completed.");
      // yahan direct result/summary page par redirect kar sakte ho
      router.push(
        `/evaluation/result?kidId=${kidId || ""}&userId=${userId || ""}&code=${encodeURIComponent(
          testCode || ""
        )}`
      );
      return;
    }
    setCurrentVideoIndex(nextVideoIndex);
    setCurrentQuestionIndex(-1); // next video play
    setSelectedOption(null);
  };

  // per‑question answer save
  const saveAnswer = async (payload) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_URL}/api/kids/save-answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!data.success) {
        console.error("Save answer error:", data.error);
      }
    } catch (err) {
      console.error("Save answer error:", err);
    }
  };

  const handleNext = async () => {
    if (!currentQuestion || selectedOption == null) {
      toast.error("Please select an option.");
      return;
    }

    if (!testData) return;

    setSubmitting(true);

    const isCorrect = selectedOption === currentQuestion.correct_answer;

    // result table payload
        const payload = {
      kid_id: Number(kidId),
      test_code: testCode,
      class_test_id: testData.class_test_id,
      questions_id: currentVideo.id,        // questions table id
      question_list_id: currentQuestion.id, // question_list table id
      question_title: currentQuestion.title,
      selected_option: selectedOption,      // 1..4
      is_correct: isCorrect,
    };

    // fire‑and‑forget save
    saveAnswer(payload);

    // grid color update
    if (globalQuestionIndex >= 0) {
      setAnswersGrid((prev) => {
        const copy = [...prev];
        copy[globalQuestionIndex] = isCorrect ? "correct" : "wrong";
        return copy;
      });
    }

    // NEXT question/video navigation
    const isLastQuestionInVideo =
      currentQuestionIndex === currentVideo.questions.length - 1;

    if (isLastQuestionInVideo) {
      // move to next video (video khatam)
      goToNextVideo();
    } else {
      // same video ka next question
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
    }

    setSubmitting(false);
  };

  const handleFinish = () => {
    toast.success("Test finished.");
    router.push(
      `/evaluation/result?kidId=${kidId || ""}&userId=${userId || ""}&code=${encodeURIComponent(
        testCode || ""
      )}`
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-[#f6f7fb]">
          <p className="text-gray-700 text-sm">Loading test...</p>
        </div>
      </>
    );
  }

  if (!testData) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-[#f6f7fb]">
          <p className="text-gray-700 text-sm">
            Test not available. Please try again.
          </p>
        </div>
      </>
    );
  }

  // check: all questions attempted? (for Finish button)
  const allAnswered =
    answersGrid.length > 0 &&
    answersGrid.every((st) => st === "correct" || st === "wrong");

  return (
    <>
      <Header />

      <div className="min-h-screen bg-[#f6f7fb] flex">
        {/* LEFT: question + image + buttons (figma style approx) */}
        <div className="flex-1 px-10 py-8">
          {/* question text */}
          <div className="bg-white rounded-lg px-10 py-8 shadow-sm mb-6">
            {currentQuestionIndex < 0 ? (
              // VIDEO PHASE
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  Please watch the video carefully before answering questions.
                </h2>
                {currentVideo?.video_link ? (
                  <div className="w-full max-w-xl aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={currentVideo.video_link}
                      controls
                      autoPlay
                      className="w-full h-full"
                      onEnded={handleVideoEnded}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Video not available for this test.
                  </p>
                )}
              </div>
            ) : (
              // QUESTION PHASE
              <>
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <p className="text-base font-medium mb-4">
                      {currentQuestion?.title}
                    </p>

                    <div className="space-y-3 text-sm">
                      {currentQuestion?.options?.map((opt, idx) => {
                        const val = idx + 1;
                        const checked = selectedOption === val;
                        return (
                          <label
                            key={val}
                            className={`flex items-center gap-3 cursor-pointer px-4 py-2 rounded-full border ${
                              checked
                                ? "border-green-500 bg-green-50"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            <input
                              type="radio"
                              className="h-4 w-4"
                              checked={checked}
                              onChange={() => setSelectedOption(val)}
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* question image */}
                  {currentQuestion?.image_url && (
                    <div className="relative w-64 h-48">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_PROD_URL}${currentQuestion.image_url}`}
                        alt="Question"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* bottom buttons (Back disabled, Next / Finish) */}
          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              disabled
              className="flex items-center gap-2 rounded-full px-6 py-2 bg-gray-300 text-gray-600 cursor-not-allowed"
            >
              ← Back
            </button>

            {currentQuestionIndex >= 0 && (
              <button
                type="button"
                onClick={allAnswered ? handleFinish : handleNext}
                disabled={submitting}
                className="flex items-center gap-2 rounded-full px-8 py-2 bg-black text-white text-sm hover:bg-gray-900"
              >
                {allAnswered ? "Finish" : "Next →"}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: question grid + timer (approx Figma) */}
        <div className="w-80 bg-white border-l border-gray-200 px-6 py-6 flex flex-col">
          <h3 className="text-sm font-semibold mb-4">Question Numbers :</h3>

          <div className="grid grid-cols-6 gap-2 mb-6">
            {answersGrid.map((status, idx) => {
              const isCurrent = idx === globalQuestionIndex;
              let bg = "bg-gray-100";
              if (status === "correct") bg = "bg-green-300";
              else if (status === "wrong") bg = "bg-red-300";

              return (
                <div
                  key={idx}
                  className={`h-8 w-8 flex items-center justify-center text-xs rounded-sm border ${
                    isCurrent ? "border-black" : "border-transparent"
                  } ${bg}`}
                >
                  {idx}
                </div>
              );
            })}
          </div>

          {/* progress bar */}
          <div className="mt-auto mb-4">
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400"
                style={{
                  width:
                    totalQuestions > 0
                      ? `${(answersGrid.filter(
                          (s) => s === "correct" || s === "wrong"
                        ).length /
                          totalQuestions) *
                          100}%`
                      : "0%",
                }}
              />
            </div>
          </div>

          {/* timer placeholder */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-[#ffe1e1] text-xs text-[#e25b5b]">
              <span>⏱</span>
              <span>00:00:00 sec</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
