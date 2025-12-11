"use client";
import { useEffect, useState } from "react";

export default function ClientOnlyCKEditor({ value, onChange, ...rest }) {
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [CKEditorComponent, setCKEditorComponent] = useState(null);
  const [ClassicEditorConstructor, setClassicEditorConstructor] = useState(null);

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

  if (!editorLoaded) return <div>Loading editor…</div>;
  const CKEditor = CKEditorComponent;
  const ClassicEditor = ClassicEditorConstructor;

  return (
    <CKEditor
      editor={ClassicEditor}
      data={value}
      onChange={onChange}
      {...rest}
    />
  );
}
