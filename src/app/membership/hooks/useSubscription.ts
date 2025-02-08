import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface SubscriptionInfo {
  id: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at?: number;
  membershipType?: string;
  nextPayment?: string;
}

export const useSubscription = (userEmail: string | undefined) => {
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [isCancelled, setIsCancelled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const getSubscriptionInfo = async () => {
    if (!userEmail) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/members/subscription/getSubscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();
      if (data) {
        const membershipType = data.current_period_end - data.current_period_start;
        data.membershipType =
          membershipType > 31536000 && membershipType <= 31622400
            ? "One year membership"
            : membershipType > 31622400
              ? "Two year membership"
              : "One year membership";

        const nextPayment = new Date(data.current_period_end * 1000);
        data.nextPayment = nextPayment.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        setSubscriptionInfo(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to fetch subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelMembership = async () => {
    if (!subscriptionInfo?.id) return;

    try {
      const response = await fetch("/api/members/subscription/cancelSubscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subscriptionInfo.id }),
      });

      const data = await response.json();
      if (data) {
        setIsCancelled(true);
        const cancelDate = new Date(data.cancel_at * 1000).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        toast.success(`Cancelled Membership ends ${cancelDate}`);
        getSubscriptionInfo(); // Refresh subscription info
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error("Something went wrong, contact us for more information");
    }
  };

  const updateMembership = async () => {
    if (!userEmail) return;

    try {
      const response = await fetch("/api/members/subscription/updateMembership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();
      if (data) {
        router.push(data);
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error("Something went wrong, contact us for more information");
    }
  };

  useEffect(() => {
    if (userEmail) {
      getSubscriptionInfo();
    }
  }, [userEmail, isCancelled]);

  return {
    subscriptionInfo,
    isCancelled,
    isLoading,
    cancelMembership,
    updateMembership,
  };
}; 