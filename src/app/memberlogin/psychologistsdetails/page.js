import { Suspense } from "react";
import OTPLoginStatic from "./OTPLoginStatic";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPLoginStatic />
    </Suspense>
  );
}
