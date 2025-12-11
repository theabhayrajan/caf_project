'use client';

import { useState, useEffect, useRef } from 'react';
import SchoolProgramCard from "../../../components/Programs";
import CafAssessments from "../../../components/CafAssessments";
import ProgramsSection from "../../../components/ProgramSection";
import QuoteSection from "../../../components/QuotaSection";
import FAQSection from "../../../components/FAQSection";
import FooterSection from "../../../components/FooterSection";
import ChildDevelopmentSection from "../../../components/ChildDevelopementSection";
import Header from '@/components/SuperAdminHeader';
import { useRouter } from 'next/navigation';

export default function EditHomepagePage() {
    const [data, setData] = useState(null);
    const [editing, setEditing] = useState(true); // ✅ Default true - edit mode ON
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchHomepageData();
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
        formData.append('oldImageUrl', data?.[field] || "");

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
                setEditing(false); // ✅ SAVE PAR EDIT MODE CLOSE
            } else {
                alert('❌ Save failed. Please try again.');
            }
        } catch (error) {
            alert('❌ Save failed. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const cancelEdit = () => {
        setEditing(false); // ✅ Cancel par bhi edit mode close
    };

    if (loading || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading homepage...</div>
            </div>
        );
    }

    return (
        <>
            <Header />

            <div className="min-h-screen bg-white w-full">
                {/* ✅ Buttons - Edit mode mein */}
                {editing ? (
                    <div className="fixed z-40 right-1 xl:right-4 top-25 md:top-30 flex gap-2 bg-white/95 backdrop-blur-md p-3 shadow-xl border border-gray-200">
                        <button
                            onClick={cancelEdit}
                            className="px-5 py-2 bg-gray-700 text-white font-semibold hover:bg-gray-800 transition text-sm"
                        >
                            Preview
                        </button>
                        <button
                            onClick={saveAllChanges}
                            disabled={saving}
                            className="px-5 py-2 bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                        >
                            {saving ? 'Saving...' : 'Save All'}
                        </button>
                    </div>
                ) : (
                    /* ✅ Normal view mein sirf Edit button */
                    <div className="fixed z-40 right-1 xl:right-4 top-25 md:top-30 flex gap-2 bg-white/95 backdrop-blur-md p-3 shadow-xl border border-gray-200">
                        <button
                            onClick={() => setEditing(true)}
                            className="px-5 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-sm shadow-lg"
                        >
                            Edit Mode
                        </button>
                        <button
                            onClick={saveAllChanges}
                            disabled={saving}
                            className="px-5 py-2 bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                        >
                            {saving ? 'Saving...' : 'Save All'}
                        </button>
                    </div>
                )}

                {/* All Sections */}
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
        </>
    );
}
