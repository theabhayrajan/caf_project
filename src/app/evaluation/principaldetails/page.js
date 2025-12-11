import { Suspense } from "react";
import PrincipalDetails from "./PrincipalDetails";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrincipalDetails />
    </Suspense>
  );
}
