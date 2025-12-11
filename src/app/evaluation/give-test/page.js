import { Suspense } from "react";
import GiveTestPage from "./GiveTestPage";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
         <GiveTestPage/>
        </Suspense>
    );
}
