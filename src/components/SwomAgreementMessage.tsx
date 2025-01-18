"use client";
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useAtom } from 'jotai';
import { globalStateAtom } from '@/context/atoms';

interface SwomAgreementMessageProps {
  agreement: {
    _id: string;
    exchangeType: 'simultaneous' | 'non_simultaneous';
    initiatorDates?: {
      startDate: string;
      endDate: string;
    };
    partnerDates?: {
      startDate: string;
      endDate: string;
    };
    initiatorDetails?: {
      numberOfPeople: number;
      carExchange: boolean;
    };
    partnerDetails?: {
      numberOfPeople: number;
      carExchange: boolean;
    };
    startDate?: string; // For backwards compatibility
    endDate?: string; // For backwards compatibility
    status: 'pending' | 'accepted' | 'rejected';
    initiatorListing: {
      homeInfo: {
        title: string;
      };
    };
    partnerListing: {
      homeInfo: {
        title: string;
      };
    };
  };
  messageContent: {
    type: string;
    agreementId: string;
    fileUrl?: string;
  };
  isInitiator: boolean;
  onAccept: (agreementId: string) => void;
  onReject: (agreementId: string) => void;
}

const SwomAgreementMessage: React.FC<SwomAgreementMessageProps> = ({
  agreement,
  messageContent,
  isInitiator,
  onAccept,
  onReject
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [state] = useAtom(globalStateAtom);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const handleStatusUpdate = async (newStatus: 'accepted' | 'rejected') => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/swom/updateStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agreementId: agreement._id,
          status: newStatus,
          userId: state.user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update agreement status');
      }

      if (newStatus === 'accepted') {
        onAccept(agreement._id);
      } else {
        onReject(agreement._id);
      }
    } catch (error) {
      console.error('Error updating agreement status:', error);
      alert('Failed to update agreement status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle both old and new date formats
  const getDates = () => {
    if (agreement.initiatorDates?.startDate && agreement.initiatorDates?.endDate) {
      return {
        initiatorStart: agreement.initiatorDates.startDate,
        initiatorEnd: agreement.initiatorDates.endDate,
        partnerStart: agreement.partnerDates?.startDate,
        partnerEnd: agreement.partnerDates?.endDate
      };
    }
    // Fallback to old format
    return {
      initiatorStart: agreement.startDate,
      initiatorEnd: agreement.endDate
    };
  };

  const dates = getDates();

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 max-w-md">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          {isInitiator ? 'SWOM Request Sent' : 'New SWOM Request'}
        </h3>
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">Type:</span> {agreement.exchangeType === 'simultaneous' ? 'Simultaneous swap' : 'Non-simultaneous swap'}
        </p>
        {dates.initiatorStart && dates.initiatorEnd && (
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Your Dates:</span> {formatDate(dates.initiatorStart)} - {formatDate(dates.initiatorEnd)}
          </p>
        )}
        {agreement.exchangeType === 'non_simultaneous' && dates.partnerStart && dates.partnerEnd && (
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Partner's Dates:</span> {formatDate(dates.partnerStart)} - {formatDate(dates.partnerEnd)}
          </p>
        )}
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">Properties:</span>
          <br />
          {agreement.initiatorListing.homeInfo.title} ↔️ {agreement.partnerListing.homeInfo.title}
        </p>

        {/* Display number of people and car exchange info */}
        {agreement.initiatorDetails && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Your Group:</span> {agreement.initiatorDetails.numberOfPeople} {agreement.initiatorDetails.numberOfPeople === 1 ? 'person' : 'people'}
              {agreement.initiatorDetails.carExchange && ' • Car exchange available'}
            </p>
          </div>
        )}
        {agreement.partnerDetails && (
          <div className="mt-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Partner's Group:</span> {agreement.partnerDetails.numberOfPeople} {agreement.partnerDetails.numberOfPeople === 1 ? 'person' : 'people'}
              {agreement.partnerDetails.carExchange && ' • Car exchange available'}
            </p>
          </div>
        )}

        {messageContent?.fileUrl && (
          <div className="mt-3">
            <a
              href={messageContent.fileUrl}
              download
              className="text-[#E88527] hover:text-[#e88427ca] flex items-center gap-2 text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Download Agreement File
            </a>
          </div>
        )}
      </div>

      {!isInitiator && agreement.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => handleStatusUpdate('accepted')}
            disabled={isUpdating}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#E88527] rounded-md hover:bg-[#e88427ca] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Processing...' : 'Accept'}
          </button>
          <button
            onClick={() => handleStatusUpdate('rejected')}
            disabled={isUpdating}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Processing...' : 'Reject'}
          </button>
        </div>
      )}

      {agreement.status !== 'pending' && (
        <p className={`text-sm font-medium ${
          agreement.status === 'accepted' ? 'text-green-600' : 'text-red-600'
        }`}>
          Status: {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
        </p>
      )}
    </div>
  );
};

export default SwomAgreementMessage; 