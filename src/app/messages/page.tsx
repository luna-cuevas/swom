'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import dummyMessages from '../../data/dummyMessages.json';
import { supabaseClient } from '@/utils/supabaseClient';
import { useStateContext } from '@/context/StateContext';

type Props = {};

const Page = (props: Props) => {
  const queryParams = window && new URLSearchParams(window.location.search);
  const contactedUserID = queryParams && queryParams.get('user');

  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>(''); // New state to handle the input message
  const supabase = supabaseClient();
  const { state, setState } = useStateContext();

  console.log('selectedConversation', selectedConversation);

  useEffect(() => {
    // Fetch conversations
    // const fetchConversations = async () => {
    //   const { data, error } = await supabase
    //     .from('conversations')
    //     .select('*')
    //     .eq('id', [state.user?.id]);

    //   if (error) {
    //     console.error('Error fetching conversations:', error.message);
    //   } else {
    //     console.log('data', data);
    //     // setConversations(data || []);
    //   }
    // };

    // Fetch messages for the selected conversation
    // const fetchMessages = async () => {
    //   if (selectedConversation !== null) {
    //     const { data, error } = await supabase
    //       .from('messages')
    //       .select('*')
    //       .eq('conversation_id', selectedConversation)
    //       .order('timestamp', { ascending: true });

    //     if (error) {
    //       console.error('Error fetching messages:', error.message);
    //     } else {
    //       setMessages(data || []);
    //     }
    //   }
    // };

    // Subscribe to real-time updates for new messages
    // const messageSubscription = supabase
    //   .from(`messages:conversation_id=eq.${selectedConversation}`)
    //   .on('INSERT', (payload: any) => {
    //     // Handle the new message in real-time
    //     setMessages((prevMessages) => [...prevMessages, payload.new]);
    //   })
    //   .subscribe();

    // fetchConversations();
    // fetchMessages();

    // Cleanup subscriptions when the component unmounts
    return () => {
      // messageSubscription?.unsubscribe();
    };
  }, [selectedConversation]);

  const fetchContactedUserInfo = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('userInfo')
      .eq('user_id', contactedUserID);

    if (error) {
      console.error('Error fetching user:', error.message);
    } else {
      console.log('contactedUserData', data);
      return data[0].userInfo;
    }
  };

  fetchContactedUserInfo();

  const createNewConversation = async () => {
    if (state.user !== null && state.loggedInUser !== null) {
      const contactedUserInfo = await fetchContactedUserInfo();
      const { data: convoData, error } = await supabase
        .from('conversations')
        .upsert([
          {
            members: {
              '1': {
                name: state.loggedInUser.name,
                id: state.user.id as unknown as string,
                email: state.loggedInUser.email,
              },
              '2': {
                name: contactedUserInfo?.name,
                id: contactedUserID as unknown as string,
                email: contactedUserInfo?.email,
              },
            },
          },
        ])
        .select('*');

      if (error) {
        return console.error('Error creating new conversation:', error.message);
      } else {
        console.log('convoData', convoData);
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .insert([
            {
              conversation_id: convoData[0].conversation_id,
            },
          ]);
        console.log('messagesData', messagesData);
        if (messagesError) {
          console.error(
            'Error creating new conversation:',
            messagesError.message
          );
        }
      }
    }
  };

  const checkIfConversationExists = async () => {
    if (state.user !== null && contactedUserID !== null) {
      const { data: convoData, error } = await supabase
        .from('conversations')
        .select('*')
        .contains('members', {
          1: { id: state.user.id },
          2: { id: contactedUserID },
        });

      if (error) {
        console.error('Error checking if conversation exists:', error.message);
      } else {
        return convoData;
        // console.log('convo exists', data);
      }
    }
  };

  useEffect(() => {
    if (
      contactedUserID !== null &&
      selectedConversation === null &&
      state.user !== null &&
      state.loggedInUser !== null
    ) {
      checkIfConversationExists().then((data) => {
        // console.log('convo data', data);
        if (data && data.length === 0) {
          createNewConversation();
        } else {
          if (data) {
            setSelectedConversation(
              data[0].conversation_id as unknown as number
            );
          }
        }
      });
    }
  }, [state.user, state.loggedInUser, contactedUserID]);

  // Function to send a new message
  const sendMessage = async () => {
    if (selectedConversation !== null && newMessage.trim() !== '') {
      const { data, error } = await supabase.from('messages').upsert([
        {
          conversation_id: selectedConversation,
          sender_id: state.user?.id,
          content: newMessage,
          timestamp: new Date(),
        },
      ]);

      if (error) {
        console.error('Error sending message:', error.message);
      } else {
        // setMessages([...messages, data[0]]);
        setNewMessage(''); // Clear the input field after sending the message
      }
    }
  };

  return (
    <>
      <main className="relative flex w-screen min-h-screen">
        <div className=" absolute w-full h-full">
          <Image
            src="/messages/messages-bg.png"
            alt="messages"
            fill
            objectFit="cover"
          />
        </div>

        <div className="bg-[#F7F1EE]  overflow-hidden my-auto h-[80vh] w-full md:w-10/12 sm:rounded-r-2xl lg:rounded-r-[6rem] z-20 relative">
          <div className="">
            <h1 className="tracking-[0.3rem] uppercase text-3xl bg-[#E5DEDB] py-6 pl-12">
              Messages
            </h1>
          </div>
          <div className="flex h-[95%]">
            <div className="border-r-2 h-auto w-[35%] md:w-1/3 border-[#172544]">
              <h2 className="tracking-[0.3rem] flex py-4 border-b-2 border-inherit uppercase md:text-xl gap-2 md:gap-4 pl-[8%]">
                <div className="relative w-[3vmax] invisible h-[3vmax]">
                  {/* <Image
                    src={
                      selectedConversation !== null
                        ? dummyMessages[selectedConversation - 1].convoPic
                        : ''
                    }
                    alt="hero"
                    width={28}
                    height={28}
                    className="rounded-full"
                  /> */}
                </div>
                <span className="my-auto font-sans font-bold">Inbox</span>
              </h2>
              <ul className="">
                {/* {dummyMessages.map((convo) => (
                  <li
                    key={convo.convoID}
                    className={`cursor-pointer my-auto flex pl-[8%] gap-2  md:gap-4 align-middle tracking-[0.3rem] py-4 border-b-2 border-[#172544] uppercase md:text-xl ${
                      selectedConversation === convo.convoID
                        ? 'bg-gray-300'
                        : ''
                    }`}
                    onClick={() => setSelectedConversation(convo.convoID)}>
                    <div className="relative w-[3vmax] justify-center align-middle flex my-auto h-[3vmax]">
                      <Image
                        src={convo.convoPic}
                        alt="hero"
                        fill
                        objectFit="cover"
                        className="rounded-full flex mx-auto"
                      />
                    </div>
                    <span className="my-auto">{convo.convoMembers[1]}</span>
                  </li>
                ))} */}
              </ul>
            </div>

            <div className="md:w-full w-[65%]">
              <div className="h-[80%] ">
                {selectedConversation !== null && (
                  <>
                    <h3 className="flex gap-4 tracking-[0.3rem] pl-[8%] py-4 border-b-2 border-[#172544] uppercase md:text-xl">
                      <div className="relative w-[3vmax] my-auto flex h-[3vmax]">
                        {/* <Image
                          src={
                            selectedConversation !== null
                              ? dummyMessages[selectedConversation - 1].convoPic
                              : ''
                          }
                          alt="hero"
                          width={28}
                          height={28}
                          className="rounded-full my-auto"
                        /> */}
                      </div>
                      <span className="my-auto font-serif">
                        {/* {selectedConversation !== null &&
                          dummyMessages[selectedConversation - 1]
                            .convoMembers[1]} */}
                      </span>
                    </h3>

                    <div className=" overflow-y-auto h-[50vh] py-6 px-2   md:px-10 ">
                      <div className="">
                        <ul className="flex flex-col gap-6">
                          {/* {dummyMessages[selectedConversation - 1].messages.map(
                            (message) => (
                              <li
                                key={message.messageID}
                                className={`flex  gap-4 ${
                                  message.messageSender === 'me'
                                    ? 'recipient'
                                    : 'sender'
                                }`}>
                                <div className="relative flex">
                                  <Image
                                    src={
                                      dummyMessages[selectedConversation - 1]
                                        .convoPic
                                    }
                                    alt="hero"
                                    width={30}
                                    height={30}
                                    className="rounded-full my-auto"
                                  />
                                </div>
                                <p
                                  className={`my-auto py-2 font-sans md:text-lg px-10 rounded-3xl ${
                                    message.messageSender !== 'me'
                                      ? 'bg-[#E5DEDB]'
                                      : 'bg-gray-300'
                                  }`}>
                                  {message.messageContent}
                                </p>
                              </li>
                            )
                          )} */}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className=" w-full px-2 h-[10%] flex gap-6 md:pl-10">
                <input
                  className="w-[80%] h-full pl-2 placeholder:tracking-[0.3rem] focus-visible:outline-none bg-transparent border-t-2 border-[#E5DEDB]"
                  placeholder="Type your message here"
                  type="text"
                />
                <button className="bg-[#E88527] hover:bg-[#e88427ca] h-fit w-fit my-auto px-4 py-2 text-white rounded-xl ">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="flex z-20 bg-[#17212D] flex-wrap  md:flex-row py-5  tracking-widest justify-center text-xl gap-2 md:gap-5">
        <p className="!text-[#EBDECC]">LONDON</p>
        <p className="!text-[#EBDECC]">•</p>
        <p className="!text-[#EBDECC]">PARIS</p>
        <p className="!text-[#EBDECC]">•</p>
        <p className="!text-[#EBDECC]">NEW YORK</p>
        <p className="!text-[#EBDECC]">•</p>
        <p className="!text-[#EBDECC]">VIETNAM</p>
        <p className="!text-[#EBDECC]">•</p>
        <p className="!text-[#EBDECC]">COLOMBIA</p>
        <p className="!text-[#EBDECC]">•</p>
        <p className="!text-[#EBDECC]">SWITZERLAND</p>
      </div>
    </>
  );
};

export default Page;
