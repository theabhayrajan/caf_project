'use client';
import { useState, useEffect, useRef } from 'react';
import ClientOnlyCKEditor from '@/components/ArticleClientOnlyCKEditor';
import SchoolProgramCard from "../components/Programs";
import CafAssessments from "../components/CafAssessments";
import ProgramsSection from "../components/ProgramSection";
import QuoteSection from "../components/QuotaSection";
import FAQSection from "../components/FAQSection";
import FooterSection from "../components/FooterSection";
import Header from "../components/Header";
import ChildDevelopmentSection from "../components/ChildDevelopementSection";

export default function HomePage() {
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0); // Track header height
  const headerRef = useRef(null);

  useEffect(() => {
    fetchHomepageData();
    
    // Measure header height dynamically
    const measureHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    // Initial measurement
    measureHeaderHeight();
    
    // Listen for resize (header might change height)
    window.addEventListener('resize', measureHeaderHeight);
    return () => window.removeEventListener('resize', measureHeaderHeight);
  }, []);

  const fetchHomepageData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/homepage`);
      const result = await res.json();
      setData(result.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleJsonFieldChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: JSON.stringify(value) }));
  };

  const handleImageUpload = async (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/homeupload`, {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();

      if (result.url) {
        handleFieldChange(field, result.url);
      }
    } catch (error) {
      alert('Image upload failed');
    }
  };

  const saveAllChanges = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_URL}/api/homepage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert('✅ All changes saved successfully!');
        setEditing(false);
      } else {
        alert('❌ Save failed. Please try again.');
      }
    } catch (error) {
      alert('❌ Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading homepage...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Header */}
      <div ref={headerRef}>
        <Header />
      </div>

      {/* Header Height Spacer - Prevents layout jump when sticky */}
      {headerHeight > 0 && (
        <div style={{ height: `${headerHeight}px` }} />
      )}

      {/* Edit Controls - Positioned BELOW Header */}
      {/* <div 
        className="fixed z-50 flex gap-2 bg-white/95 backdrop-blur-md p-3 rounded-lg shadow-xl border border-gray-200"
        style={{
          top: headerHeight + 16, // 16px margin from header bottom
          right: 300,
          
        }}
      >
        <button
          onClick={() => setEditing(!editing)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
        >
          {editing ? 'Cancel Edit' : '✏️ Edit Homepage'}
        </button>
        {editing && (
          <button
            onClick={saveAllChanges}
            disabled={saving}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg text-sm"
          >
            {saving ? '💾 Saving...' : '💾 Save All'}
          </button>
        )}
      </div> */}

      {/* All Components */}
      <QuoteSection
        data={data}
        editing={editing}
        onFieldChange={handleFieldChange}
        onImageChange={handleImageUpload}
      />

      <ProgramsSection
        data={data}
        editing={editing}
        onFieldChange={handleFieldChange}
        onJsonChange={handleJsonFieldChange}
        onImageChange={handleImageUpload}
      />

      <CafAssessments
        data={data}
        editing={editing}
        onFieldChange={handleFieldChange}
        onJsonChange={handleJsonFieldChange}
      />

      <SchoolProgramCard
        data={data}
        editing={editing}
        onFieldChange={handleFieldChange}
        onImageChange={handleImageUpload}
      />

      <ChildDevelopmentSection
        data={data}
        editing={editing}
        onFieldChange={handleFieldChange}
        onJsonChange={handleJsonFieldChange}
      />

      <FAQSection
        data={data}
        editing={editing}
        onFieldChange={handleFieldChange}
        onJsonChange={handleJsonFieldChange}
      />

      <FooterSection
        data={data}
        editing={editing}
        onFieldChange={handleFieldChange}
        onImageChange={handleImageUpload}
      />
    </div>
  );
}
