"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import ClientOnlyCKEditor from './HomeClientOnlyCKEditor';

export default function QuoteSection({ data, editing, onFieldChange, onImageChange }) {
  const fallbackQuote = {
    quote_text: '<p>The world of the child is not defined by the walls of the home, nor even of the classroom, but extends outward to encompass the larger society—the community, the culture, the economic system, and the political structure.</p>',
    quote_author: '- Urie Bronfenbrenner (1917–2005)',
    quote_author_info: 'Developmental Psychologist, Researcher, and Professor (Cornell University)'
  };

  const initialQuoteText = data?.quote_text || fallbackQuote.quote_text;
  const initialAuthor = data?.quote_author || fallbackQuote.quote_author;
  const initialAuthorInfo = data?.quote_author_info || fallbackQuote.quote_author_info;

  const [quoteText, setQuoteText] = useState(initialQuoteText);
  const [author, setAuthor] = useState(initialAuthor);
  const [authorInfo, setAuthorInfo] = useState(initialAuthorInfo);

  const [errors, setErrors] = useState({
    quote: false,
    author: false,
    info: false,
  });

  const MAX_LENGTHS = {
    quote: 230,
    author: 40,
    info: 80,
  };

  // Sync local state on data change
  useEffect(() => {
    setQuoteText(data?.quote_text || fallbackQuote.quote_text);
    setAuthor(data?.quote_author || fallbackQuote.quote_author);
    setAuthorInfo(data?.quote_author_info || fallbackQuote.quote_author_info);
    setErrors({ quote: false, author: false, info: false });
  }, [data]);

  // CKEditor typing block handler - FIXED: Use event.target.innerHTML instead of quoteText state
  const handleCKEditorKeyDown = (event) => {
    // Extract only text content length from editor's content
    const htmlContent = event.target?.innerHTML || '';
    const textContent = htmlContent.replace(/<[^>]*>/g, '');

    if (
      textContent.length >= MAX_LENGTHS.quote &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Control', 'Meta', 'Alt'].includes(event.key)
    ) {
      event.preventDefault();
      event.stopPropagation();
      setErrors(prev => ({ ...prev, quote: true }));
    } else {
      setErrors(prev => ({ ...prev, quote: false }));
    }
  };

  // FIXED: CKEditor change handler - Don't block formatting changes
  const handleQuoteChange = (value) => {
    const contentLength = value.replace(/<[^>]*>/g, '').length; // Count only text characters, ignore HTML tags
    if (contentLength <= MAX_LENGTHS.quote) {
      setQuoteText(value);
      onFieldChange('quote_text', value);
      setErrors(prev => ({ ...prev, quote: false }));
    }
  };

  // Native input handlers
  const handleInputKeyDown = (field, maxLen, e) => {
    const currVal = e.target.value;
    const hasSelection = e.target.selectionStart !== e.target.selectionEnd;

    if (
      currVal.length >= maxLen &&
      !hasSelection &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
    ) {
      e.preventDefault();
      setErrors(prev => ({ ...prev, [field]: true }));
    } else {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleAuthorChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTHS.author) {
      setAuthor(value);
      onFieldChange('quote_author', value);
    }
  };

  const handleAuthorInfoChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTHS.info) {
      setAuthorInfo(value);
      onFieldChange('quote_author_info', value);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <section className="flex flex-col lg:flex-row items-center justify-center bg-white w-[90vw] xl:w-[95vw] [@media(min-width:1024px)_and_(max-width:1279px)]:w-[95vw] [@media(min-width:1536px)_and_(max-width:1620px)]:w-[95vw] [@media(min-width:1621px)_and_(max-width:1715px)]:w-[90vw] [@media(min-width:1716px)_and_(max-width:1800px)]:w-[88vw] [@media(min-width:1801px)_and_(max-width:3000px)]:w-[80vw] gap-5 sm:gap-5 md:gap-5 lg:gap-10 xl:gap-20">
        {/* Left Side - Image */}
        <div className="flex justify-center lg:justify-start items-center relative group">
         {editing ?
           (<>
             <div className="max-w-content">
               <div className="relative w-80 md:w-100 lg:w-110 xl:w-155 2xl:w-175 h-96 rounded-lg border-2 border-gray-300 overflow-hidden">
                 <Image
                   src={data?.quote_image_url ||  `${process.env.NEXT_PUBLIC_PROD_URL}/hero.svg`}
                   alt="Quote image preview"
                   fill
                   className="object-contain"
                 />
               </div>
               <label className="block mt-3 text-sm font-semibold text-white text-center bg-blue-600 hover:bg-blue-700 p-3 rounded-lg cursor-pointer transition-all shadow-md w-full">
                 Change Image
                 <input
                   type="file"
                   accept="image/*"
                   onChange={(e) => onImageChange('quote_image_url', e)}
                   className="hidden" />
               </label>
             </div>
           </>) :
           (<Image
             src={data?.quote_image_url || `${process.env.NEXT_PUBLIC_PROD_URL}/hero.svg`}
             alt="Urie Bronfenbrenner teaching"
             width={450}
             height={400}
             className="object-cover w-80 md:w-100 lg:w-110 xl:w-155 2xl:w-175" />
           )}
        </div>

        {/* Right Side - Text */}
        <div className="w-full flex flex-col justify-center gap-8 sm:gap-10 md:gap-10 lg:gap-14 lg:pl-20 text-md sm:text-lg md:text-lg lg:text-xl xl:text-2xl">
         {editing ?
           (
             <>
               {/* Quote Text Field */}
               <div className="relative space-y-2">
                 <div
                   onKeyDown={handleCKEditorKeyDown}
                   className="w-full"
                 >
                   <ClientOnlyCKEditor
                     value={quoteText}
                     onChange={handleQuoteChange}
                     config={{
                       placeholder: "Edit quote text...",
                       toolbar: ['bold', 'italic', 'underline', '|', 'bulletedList', 'numberedList']
                     }}
                   />
                 </div>
                 {errors.quote && (
                   <div className="text-red-600 font-bold text-xs absolute -bottom-7 right-0 bg-red-100 px-2 py-1 rounded">
                     🚫 No more text allowed!
                   </div>
                 )}
                 <div className="text-xs text-gray-700">
                   Characters: {quoteText.replace(/<[^>]*>/g, '').length} / {MAX_LENGTHS.quote}
                 </div>
               </div>

               {/* Author Field */}
               <div className="relative space-y-2">
                 <input
                   type="text"
                   value={author}
                   onChange={handleAuthorChange}
                   onKeyDown={(e) => handleInputKeyDown("author", MAX_LENGTHS.author, e)}
                   placeholder="Author name"
                   className="text-lg font-semibold border p-2 rounded w-full" />
                 {errors.author && (
                   <div className="text-red-600 font-bold text-xs absolute -bottom-7 right-0 bg-red-100 px-2 py-1 rounded">
                     🚫 No more text allowed!
                   </div>
                 )}
                 <div className="text-xs text-gray-700">
                   Characters: {author.length} / {MAX_LENGTHS.author}
                 </div>
               </div>

               {/* Author Info Field */}
               <div className="relative space-y-2">
                 <input
                   type="text"
                   value={authorInfo}
                   onChange={handleAuthorInfoChange}
                   onKeyDown={(e) => handleInputKeyDown("info", MAX_LENGTHS.info, e)}
                   placeholder="Author info"
                   className="text-base text-black border p-2 rounded w-full" />
                 {errors.info && (
                   <div className="text-red-600 font-bold text-xs absolute -bottom-7 right-0 bg-red-100 px-2 py-1 rounded">
                     🚫 No more text allowed!
                   </div>
                 )}
                 <div className="text-xs text-gray-700">
                   Characters: {authorInfo.length} / {MAX_LENGTHS.info}
                 </div>
               </div>
             </>
           )
           :
           (
             <>
               <p className="text-gray-700 self-center lg:self-start md:w-[75%] lg:w-[90%] 2xl:w-[70%] w-full leading-tight mb-2 md:mb-4 text-center md:text-left">
                 <span dangerouslySetInnerHTML={{ __html: initialQuoteText }} />
               </p>
               <div className="text-center md:text-left md:self-end lg:mr-20 w-full md:w-[70%]">
                 <p className="text-gray-900 font-semibold">
                   <span dangerouslySetInnerHTML={{ __html: initialAuthor }} />
                 </p>
                 <p className="text-gray-600 sm:whitespace-nowrap lg:whitespace-normal 2xl:mr-10">
                   <span dangerouslySetInnerHTML={{ __html: initialAuthorInfo }} />
                 </p>
               </div>
             </>
           )
         }
        </div>
      </section>
    </div>
  );
}
