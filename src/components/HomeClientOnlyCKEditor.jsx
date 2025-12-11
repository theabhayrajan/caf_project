"use client";
import { useEffect, useState, useRef } from "react";

export default function ClientOnlyCKEditor({ value, onChange, config = {}, ...rest }) {
    const [editorLoaded, setEditorLoaded] = useState(false);
    const [CKEditorComponent, setCKEditorComponent] = useState(null);
    const [ClassicEditorConstructor, setClassicEditorConstructor] = useState(null);
    const editorRef = useRef();

    useEffect(() => {
        let unmounted = false;
        Promise.all([
            import("@ckeditor/ckeditor5-react"),
            import("@ckeditor/ckeditor5-build-classic"),
        ]).then(([{ CKEditor }, ClassicEditor]) => {
            if (!unmounted) {
                setCKEditorComponent(() => CKEditor);
                setClassicEditorConstructor(() => ClassicEditor.default);
                setEditorLoaded(true);
            }
        });
        return () => {
            unmounted = true;
        };
    }, []);

    // Update editor content when value changes (for homepage editing)
    // Prevent updating content while user is typing
    const previousValueRef = useRef('');

    useEffect(() => {
        if (!editorLoaded || !editorRef.current) return;

        // Update content ONLY if the value changed externally, not from typing
        if (value !== previousValueRef.current) {
            editorRef.current.setData(value || '');
            previousValueRef.current = value;
        }
    }, [value, editorLoaded]);


    if (!editorLoaded) return <div className="p-4 text-gray-500 text-sm">Loading editor…</div>;

    const CKEditor = CKEditorComponent;
    const ClassicEditor = ClassicEditorConstructor;

    const defaultConfig = {
        toolbar: [
            'heading', '|',
            'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|',
            'outdent', 'indent', '|',
            'blockQuote', 'insertTable', 'mediaEmbed', '|',
            'undo', 'redo'
        ],
    };

    // Merge default config with passed config (user config takes precedence)
    const finalConfig = { ...defaultConfig, ...config };

    return (
        <CKEditor
            editor={ClassicEditor}
            data={value || ''}
            config={finalConfig}
            onReady={(editor) => {
                editorRef.current = editor;
            }}
            onChange={(event, editor) => {
                const data = editor.getData();
                previousValueRef.current = data; // prevent reset loops
                onChange?.(data);
            }}

            {...rest}
        />
    );
}
