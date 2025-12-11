import { Suspense } from "react";
import TestsPageStatic from "./testspagestatic"

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
         <TestsPageStatic/>
        </Suspense>
    );
}
