import { Button } from "@/components/ui/button";
import { SwomProposal } from "../types";
import { format } from "date-fns";
import { getSupabaseClient } from "@/utils/supabaseClient";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface ProposalMessageProps {
  proposal: SwomProposal;
  messageId: string;
  isOwnMessage: boolean;
  conversationId: string;
}

export function ProposalMessage({ proposal, messageId, isOwnMessage, conversationId }: ProposalMessageProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const handleProposalResponse = async (accept: boolean) => {
    setIsUpdating(true);
    try {
      const supabase = getSupabaseClient();
      
      // Update the proposal status
      const { error: proposalError } = await supabase
        .from('reservations')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('message_id', messageId);

      if (proposalError) throw proposalError;

      // Invalidate queries to refresh the messages
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });

      // Send a notification message about the response
      const response = await fetch("/api/members/messages/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          content: `SWOM proposal has been ${accept ? 'accepted' : 'rejected'}`,
          type: "proposal_response",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send response message");
      }
    } catch (error) {
      console.error("Error updating proposal:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
      <h3 className="text-lg font-semibold text-[#E88527] mb-4">SWOM Proposal</h3>
      
      <div className="space-y-4">
        <div>
          <p className="font-medium">Exchange Type:</p>
          <p className="text-gray-600">
            {proposal.exchange_type === 'simultaneous' 
              ? 'Simultaneous (Same time exchange)' 
              : 'Non-simultaneous (Different time exchange)'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Your Stay:</p>
            <p className="text-gray-600">
              {format(new Date(proposal.initiator_dates.startDate!), 'MMM dd, yyyy')} - 
              {format(new Date(proposal.initiator_dates.endDate!), 'MMM dd, yyyy')}
            </p>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Number of People: {proposal.initiator_details.numberOfPeople}</p>
              <p className="text-sm text-gray-500">Car Exchange: {proposal.initiator_details.carExchange ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {proposal.exchange_type === 'non_simultaneous' && proposal.partner_dates && (
            <div>
              <p className="font-medium">Partner's Stay:</p>
              <p className="text-gray-600">
                {format(new Date(proposal.partner_dates.startDate!), 'MMM dd, yyyy')} - 
                {format(new Date(proposal.partner_dates.endDate!), 'MMM dd, yyyy')}
              </p>
              <div className="mt-2">
                <p className="text-sm text-gray-500">Number of People: {proposal.partner_details.numberOfPeople}</p>
                <p className="text-sm text-gray-500">Car Exchange: {proposal.partner_details.carExchange ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}
        </div>

        {!isOwnMessage && proposal.status === 'pending' && (
          <div className="flex gap-4 mt-6">
            <Button
              onClick={() => handleProposalResponse(true)}
              disabled={isUpdating}
              className="bg-[#E88527] hover:bg-[#e88427ca]">
              Accept Proposal
            </Button>
            <Button
              onClick={() => handleProposalResponse(false)}
              disabled={isUpdating}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50">
              Decline Proposal
            </Button>
          </div>
        )}

        {proposal.status !== 'pending' && (
          <div className={`mt-4 text-sm font-medium ${
            proposal.status === 'accepted' ? 'text-green-600' : 'text-red-600'
          }`}>
            Proposal {proposal.status}
          </div>
        )}
      </div>
    </div>
  );
} 