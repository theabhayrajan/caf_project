"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getArticles, saveArticles } from "@/utils/articles-storage";
import ClientOnlyCKEditor from "@/components/ArticleClientOnlyCKEditor";
import Header from "@/components/Header";

export default function WriteArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [content, setContent] = useState("");

  const handleImageChange = e => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = evt => setImagePreview(evt.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    const all = getArticles();
    all.unshift({
      id: Date.now(),
      title,
      author: author || "Anonymous",
      image: imagePreview || "/default.jpg",
      content
    });
    saveArticles(all);
    router.push("/articles");
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 flex px-3 sm:px-6 lg:px-0 py-10 justify-center">
        <div className="w-full max-w-5xl bg-white rounded-xl shadow p-5 sm:p-7 lg:p-10 flex flex-col gap-10">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* LEFT: Image */}
            <div className="flex flex-col items-center w-full lg:w-1/3">
              <label className="font-semibold text-gray-700 mb-3 text-center text-base sm:text-lg">
                Cover Image
              </label>
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Cover"
                  className="w-full max-w-[280px] h-[300px] sm:h-[340px] object-cover rounded-xl shadow mb-4"
                />
              ) : (
                <div className="w-full max-w-[280px] h-[300px] sm:h-[340px] flex items-center justify-center border-2 border-dashed rounded-xl text-gray-400 text-sm sm:text-base mb-4">
                  No Image Selected
                </div>
              )}
              <label htmlFor="fileUpload" className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium shadow hover:bg-blue-700 active:bg-blue-800 transition">
                Choose Image
              </label>
              <input
                id="fileUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            {/* RIGHT: Article Form */}
            <form className="flex-1 flex flex-col" onSubmit={handleSubmit}>
              <input
                type="text"
                className="w-full p-3 mb-3 text-xl sm:text-2xl font-bold border-b border-gray-300 outline-none"
                placeholder="Article Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
              <input
                type="text"
                className="w-full p-2 text-sm border-b border-gray-300 outline-none mb-4"
                placeholder="Author (optional)"
                value={author}
                onChange={e => setAuthor(e.target.value)}
              />
              <div className="min-h-[300px]">
                <ClientOnlyCKEditor
                  value={content}
                  onChange={(_, editor) => setContent(editor.getData())}
                  config={{ placeholder: "Write article content here..." }}
                />
              </div>
              <button
                type="submit"
                className="mt-6 bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 active:bg-blue-800 transition w-full sm:w-auto"
              >
                Publish Article
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
