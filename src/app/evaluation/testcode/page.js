import { Suspense } from "react";
import TestCodeStatic from "./TestCodeStatic"

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
         <TestCodeStatic/>
        </Suspense>
    );
}
