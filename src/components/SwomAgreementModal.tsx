"use client";
import React, { useState, useCallback, useEffect } from 'react';
import Datepicker from "react-tailwindcss-datepicker";
import { useDropzone } from 'react-dropzone';
import { sanityClient } from '../../sanity/lib/client';
import { useAtom } from 'jotai';
import { globalStateAtom } from '@/context/atoms';
import { supabaseClient } from '@/utils/supabaseClient';

interface SwomAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerListingId: string;
  myListingId: string;
  partnerName: string;
  conversationId: string;
  partnerId: string;
}

interface Listing {
  user_id: string;
  homeInfo: {
    title: string;
    [key: string]: any;
  };
}

const SwomAgreementModal: React.FC<SwomAgreementModalProps> = ({
  isOpen,
  onClose,
  partnerListingId,
  myListingId,
  partnerName,
  conversationId,
  partnerId
}) => {
  const [exchangeType, setExchangeType] = useState<'simultaneous' | 'non_simultaneous'>('simultaneous');
  const [initiatorDates, setInitiatorDates] = useState({
    startDate: null,
    endDate: null
  });
  const [partnerDates, setPartnerDates] = useState({
    startDate: null,
    endDate: null
  });
  const [initiatorDetails, setInitiatorDetails] = useState({
    numberOfPeople: 1,
    carExchange: false
  });
  const [partnerDetails, setPartnerDetails] = useState({
    numberOfPeople: 1,
    carExchange: false
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state] = useAtom(globalStateAtom);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [partnerListings, setPartnerListings] = useState<Listing[]>([]);
  const [selectedMyListing, setSelectedMyListing] = useState<string>('');
  const [selectedPartnerListing, setSelectedPartnerListing] = useState<string>('');

  useEffect(() => {
    const fetchListings = async () => {
      const supabase = supabaseClient();

      console.log('Fetching listings with user ID:', state.user.id);
      console.log('Fetching partner listings with ID:', partnerId);

      // Fetch my listings
      const { data: myData, error: myError } = await supabase
        .from('listings')
        .select('user_id, homeInfo')
        .eq('user_id', state.user.id);

      if (myError) {
        console.error('Error fetching my listings:', myError);
      } else {
        console.log('My listings data:', myData);
        setMyListings(myData || []);
        if (myData?.length > 0) {
          console.log('Setting default my listing:', myData[0]);
          setSelectedMyListing(myData[0].user_id);
        }
      }

      // Fetch partner listings
      const { data: partnerData, error: partnerError } = await supabase
        .from('listings')
        .select('user_id, homeInfo')
        .eq('user_id', partnerId);

      if (partnerError) {
        console.error('Error fetching partner listings:', partnerError);
      } else {
        console.log('Partner listings data:', partnerData);
        setPartnerListings(partnerData || []);
        if (partnerData?.length > 0) {
          console.log('Setting default partner listing:', partnerData[0]);
          setSelectedPartnerListing(partnerData[0].user_id);
        }
      }
    };

    if (isOpen) {
      console.log('Modal opened, fetching listings...');
      fetchListings();
    }
  }, [isOpen, state.user.id, partnerId]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!initiatorDates.startDate || !initiatorDates.endDate) || 
        (exchangeType === 'non_simultaneous' && (!partnerDates.startDate || !partnerDates.endDate))) {
      alert('Please select all required dates');
      return;
    }

    if (!selectedMyListing || !selectedPartnerListing) {
      alert('Please select both listings for the swap');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload agreement file to Sanity if provided
      let agreementFileAsset = null;
      if (files.length > 0) {
        const fileData = new FormData();
        fileData.append('file', files[0]);
        const uploadResponse = await fetch('/api/uploadFile', {
          method: 'POST',
          body: fileData
        });
        const uploadResult = await uploadResponse.json();
        agreementFileAsset = {
          _type: 'file',
          asset: {
            _type: 'reference',
            _ref: uploadResult.fileId
          }
        };
      }

      console.log('Creating Swom agreement in Sanity...');
      // Create agreement in Sanity
      const agreement = await sanityClient.create({
        _type: 'swomAgreement',
        exchangeType,
        initiatorDates: {
          startDate: initiatorDates.startDate,
          endDate: initiatorDates.endDate
        },
        initiatorDetails: {
          numberOfPeople: initiatorDetails.numberOfPeople,
          carExchange: initiatorDetails.carExchange
        },
        partnerDetails: {
          numberOfPeople: partnerDetails.numberOfPeople,
          carExchange: partnerDetails.carExchange
        },
        ...(exchangeType === 'non_simultaneous' && {
          partnerDates: {
            startDate: partnerDates.startDate,
            endDate: partnerDates.endDate
          }
        }),
        status: 'pending',
        initiatorListing: {
          _type: 'reference',
          _ref: selectedMyListing
        },
        partnerListing: {
          _type: 'reference',
          _ref: selectedPartnerListing
        },
        agreementFile: agreementFileAsset,
        conversationId
      });
      console.log('Sanity agreement created:', agreement);

      // Prepare message content with file URL if available
      const messageContent = {
        type: 'swom_agreement',
        agreementId: agreement._id,
        ...(agreementFileAsset && {
          fileUrl: `https://cdn.sanity.io/files/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${agreementFileAsset.asset._ref.replace('file-', '').replace('-pdf', '.pdf')}`
        })
      };

      // Send message to the conversation
      console.log('Sending message to Supabase...', {
        conversation_id: conversationId,
        sender_id: state.user.id,
        content: messageContent,
        contacted_user: partnerId
      });

      const messageResponse = await fetch('/api/messages/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          selectedConversation: conversationId,
          sender_id: state.user.id,
          content: JSON.stringify(messageContent),
          contacted_user: partnerId
        }),
      });

      if (!messageResponse.ok) {
        const errorData = await messageResponse.text();
        console.error('Failed to send message:', {
          status: messageResponse.status,
          statusText: messageResponse.statusText,
          error: errorData
        });
        throw new Error(`Failed to send message: ${messageResponse.status} ${messageResponse.statusText}`);
      }

      const messageResult = await messageResponse.json();
      console.log('Message sent successfully:', messageResult);

      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('Failed to create Swom agreement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Ready to SWOM with {partnerName}?
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exchange Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="simultaneous"
                  checked={exchangeType === 'simultaneous'}
                  onChange={(e) => setExchangeType(e.target.value as 'simultaneous' | 'non_simultaneous')}
                  className="mr-2"
                />
                Simultaneous (We swap homes at the same time)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="non_simultaneous"
                  checked={exchangeType === 'non_simultaneous'}
                  onChange={(e) => setExchangeType(e.target.value as 'simultaneous' | 'non_simultaneous')}
                  className="mr-2"
                />
                Non-simultaneous (We swap homes at different times)
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Your Details
              </label>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of People
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={initiatorDetails.numberOfPeople}
                    onChange={(e) => setInitiatorDetails(prev => ({
                      ...prev,
                      numberOfPeople: parseInt(e.target.value)
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E88527]"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="initiatorCarExchange"
                    checked={initiatorDetails.carExchange}
                    onChange={(e) => setInitiatorDetails(prev => ({
                      ...prev,
                      carExchange: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  <label htmlFor="initiatorCarExchange" className="text-sm font-medium text-gray-700">
                    Car Exchange Available
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Partner Details
              </label>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of People
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={partnerDetails.numberOfPeople}
                    onChange={(e) => setPartnerDetails(prev => ({
                      ...prev,
                      numberOfPeople: parseInt(e.target.value)
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E88527]"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="partnerCarExchange"
                    checked={partnerDetails.carExchange}
                    onChange={(e) => setPartnerDetails(prev => ({
                      ...prev,
                      carExchange: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  <label htmlFor="partnerCarExchange" className="text-sm font-medium text-gray-700">
                    Car Exchange Available
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Listing
            </label>
            <select
              value={selectedMyListing}
              onChange={(e) => setSelectedMyListing(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E88527]"
            >
              {myListings.map((listing) => (
                <option key={listing.user_id} value={listing.user_id}>
                  {listing.homeInfo.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {partnerName}'s Listing
            </label>
            <select
              value={selectedPartnerListing}
              onChange={(e) => setSelectedPartnerListing(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E88527]"
            >
              {partnerListings.map((listing) => (
                <option key={listing.user_id} value={listing.user_id}>
                  {listing.homeInfo.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Your Dates
            </label>
            <Datepicker
              value={initiatorDates}
              onChange={(newValue: any) => setInitiatorDates(newValue)}
              showShortcuts={true}
              primaryColor="orange"
            />
          </div>

          {exchangeType === 'non_simultaneous' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Partner's Dates
              </label>
              <Datepicker
                value={partnerDates}
                onChange={(newValue: any) => setPartnerDates(newValue)}
                showShortcuts={true}
                primaryColor="orange"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload SWOM Agreement (Optional)
            </label>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-[#E88527] bg-orange-50' : 'border-gray-300 hover:border-[#E88527]'}`}
            >
              <input {...getInputProps()} />
              {files.length > 0 ? (
                <p className="text-sm text-gray-600">Selected file: {files[0].name}</p>
              ) : (
                <p className="text-sm text-gray-600">
                  {isDragActive
                    ? "Drop the file here"
                    : "Drag and drop your agreement file here, or click to select"}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#E88527] rounded-md hover:bg-[#e88427ca] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send SWOM Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SwomAgreementModal; 