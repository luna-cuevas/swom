"use client";
import { globalStateAtom } from "@/context/atoms";
import { useAtom } from "jotai";
import { useSubscription } from "./hooks/useSubscription";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { MembershipInfo } from "./components/MembershipInfo";
import { MembershipBenefits } from "./components/MembershipBenefits";
import { MembershipActions } from "./components/MembershipActions";
import { ContactSection } from "./components/ContactSection";
import { HeroSection } from "./components/HeroSection";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MembershipPage() {
  const [state] = useAtom(globalStateAtom);
  const {
    subscriptionInfo,
    isCancelled,
    isLoading,
    cancelMembership,
    updateMembership,
  } = useSubscription(state.user?.email);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <ToastContainer position="bottom-right" />
      <main className="min-h-screen bg-[#17212D]">
        {/* Hero Section */}
        <HeroSection />

        {/* Main Content */}
        <div className="relative container mx-auto px-4 -mt-20 pb-20">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Membership Information */}
            {subscriptionInfo && (
              <MembershipInfo
                membershipType={subscriptionInfo.membershipType || ""}
                nextPayment={subscriptionInfo.nextPayment || ""}
                isCancelled={!!subscriptionInfo.cancel_at}
                cancelDate={subscriptionInfo.cancel_at}
              />
            )}

            {/* Benefits Section */}
            <MembershipBenefits />

            {/* Action Buttons */}
            <MembershipActions
              isCancelled={!!subscriptionInfo?.cancel_at}
              onCancel={cancelMembership}
              onUpdate={updateMembership}
            />

            {/* Contact Section */}
            <ContactSection />
          </div>
        </div>
      </main>
    </>
  );
}
