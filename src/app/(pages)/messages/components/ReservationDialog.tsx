"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CalendarDays } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Datepicker from "react-tailwindcss-datepicker";
import { getSupabaseClient } from "@/utils/supabaseClient";
import { useMessages } from "../hooks/useMessages";

interface ReservationDialogProps {
  dateRange: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  onConfirm: () => void;
  listingId: string;
  userId: string;
  partnerId: string;
  partnerName: string;
  conversationId: string;
}

interface Listing {
  user_id: string;
  homeInfo: {
    title: string;
    [key: string]: any;
  };
}

export function ReservationDialog({
  dateRange,
  onDateChange,
  onConfirm,
  listingId,
  userId,
  partnerId,
  partnerName,
  conversationId,
}: ReservationDialogProps) {
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
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [partnerListings, setPartnerListings] = useState<Listing[]>([]);
  const [selectedMyListing, setSelectedMyListing] = useState<string>('');
  const [selectedPartnerListing, setSelectedPartnerListing] = useState<string>('');

  const { sendMessage } = useMessages({
    conversationId,
    userId,
    listingInfo: null,
    contactingHostEmail: null,
    userEmail: undefined,
  });

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

    setIsSubmitting(true);
    try {
      const supabase = getSupabaseClient();

      // First get the conversation emails
      console.log('Fetching conversation:', conversationId);
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations_new')
        .select('user_email, host_email')
        .eq('id', conversationId)
        .single();

      if (conversationError) {
        console.error('Error fetching conversation:', conversationError);
        throw conversationError;
      }

      console.log('Found conversation:', conversation);

      // Then get the user IDs from appUsers
      const { data: users, error: usersError } = await supabase
        .from('appUsers')
        .select('id, email')
        .in('email', [conversation.user_email, conversation.host_email]);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      console.log('Found users:', users);

      // Determine initiator and partner IDs
      const initiator_id = users.find(u => u.email === conversation.user_email)?.id;
      const partner_id = users.find(u => u.email === conversation.host_email)?.id;

      console.log('Identified users:', { initiator_id, partner_id });

      if (!initiator_id || !partner_id) {
        throw new Error('Could not identify both users');
      }

      const proposalData = {
        exchange_type: exchangeType,
        initiator_dates: initiatorDates,
        partner_dates: partnerDates,
        initiator_details: initiatorDetails,
        partner_details: partnerDetails,
        initiator_id,
        partner_id,
        listing_id: listingId,
        status: 'pending'
      };

      console.log('Creating reservation with data:', proposalData);

      // Create the reservation
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert([proposalData])
        .select()
        .single();

      if (reservationError) {
        console.error('Supabase reservation error:', reservationError);
        throw reservationError;
      }

      console.log('Successfully created reservation:', reservation);

      console.log('Sending proposal with type:', 'PROPOSAL');
      
      // Send the proposal message using the useMessages hook
      await sendMessage(
        JSON.stringify({
          ...proposalData,
          reservation_id: reservation.id,
          type: 'PROPOSAL'
        }), 
        undefined,  // no attachments
        'PROPOSAL'  // explicitly pass type for the message record
      );

      onConfirm();
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert('Failed to create proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex-1 md:flex-none bg-[#E88527] hover:bg-[#e88427ca]">
          <CalendarDays className="h-4 w-4 mr-2" />
          Reserve
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ready to SWOM with {partnerName}?</DialogTitle>
          <DialogDescription>
            Set up your home exchange details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Exchange Type</Label>
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
            {/* Your Details */}
            <div>
              <Label className="text-gray-500">Your Details</Label>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Number of People</Label>
                  <input
                    type="number"
                    min="1"
                    value={initiatorDetails.numberOfPeople}
                    onChange={(e) => setInitiatorDetails(prev => ({
                      ...prev,
                      numberOfPeople: parseInt(e.target.value)
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
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
                  <Label htmlFor="initiatorCarExchange">Car Exchange Available</Label>
                </div>
              </div>
            </div>

            {/* Partner Details */}
            <div>
              <Label className="text-gray-500">Partner Details</Label>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Number of People</Label>
                  <input
                    type="number"
                    min="1"
                    value={partnerDetails.numberOfPeople}
                    onChange={(e) => setPartnerDetails(prev => ({
                      ...prev,
                      numberOfPeople: parseInt(e.target.value)
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
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
                  <Label htmlFor="partnerCarExchange">Car Exchange Available</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <Label>Select Your Dates</Label>
            <Datepicker
              value={initiatorDates}
              onChange={(newValue: any) => setInitiatorDates(newValue)}
              showShortcuts={true}
              primaryColor="orange"
            />
          </div>

          {exchangeType === 'non_simultaneous' && (
            <div>
              <Label>Select Partner's Dates</Label>
              <Datepicker
                value={partnerDates}
                onChange={(newValue: any) => setPartnerDates(newValue)}
                showShortcuts={true}
                primaryColor="orange"
              />
            </div>
          )}

          {/* Agreement Upload */}
          <div>
            <Label>Upload SWOM Agreement (Optional)</Label>
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
                  {isDragActive ? "Drop the file here" : "Drag and drop your agreement file here, or click to select"}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, DOC, DOCX</p>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <DialogTrigger asChild>
              <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
            </DialogTrigger>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#E88527] hover:bg-[#e88427ca]"
            >
              {isSubmitting ? 'Sending...' : 'Send SWOM Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 