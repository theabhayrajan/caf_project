import { Suspense } from "react";
import Kidseditstatic from "./kidseditstatic";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
         <Kidseditstatic/>
        </Suspense>
    );
}
