'use client';
import React, { use, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import dummyMessages from '../../data/dummyMessages.json';
import { supabaseClient } from '@/utils/supabaseClient';
import { useStateContext } from '@/context/StateContext';
import { useSearchParams } from 'next/navigation';

type Props = {};

const Page = (props: Props) => {
  const queryParams = useSearchParams();
  const contactedUserID = queryParams.get('user');

  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>(''); // New state to handle the input message
  const supabase = supabaseClient();
  const { state, setState } = useStateContext();
  const [contactedUserInfo, setContactedUserInfo] = useState<any>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const fetchAllConversations = async () => {
    if (state.user !== null) {
      const { data: position1Data, error } = await supabase
        .from('conversations')
        .select('*')
        .contains('members', {
          1: { id: state.user.id },
        });

      const { data: position2Data, error: error2 } = await supabase
        .from('conversations')
        .select('*')
        .contains('members', {
          2: { id: state.user.id },
        });

      if (error) {
        console.error('Error fetching conversations:', error.message);
      } else {
        console.log('all convos with me', [
          ...(position1Data || []),
          ...(position2Data || []),
        ]);
        setConversations([...(position1Data || []), ...(position2Data || [])]);
      }
    }
  };

  const fetchMessagesForSelectedConversation = async () => {
    if (selectedConversation !== null) {
      console.log('fetching messages for convo', selectedConversation);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation);

      if (error) {
        console.error('Error fetching messages:', error.message);
      } else {
        console.log('messages for convo', data[0].messagesObj);
        setMessages(data[0].messagesObj || []);
        scrollToBottom();
      }
    }
  };

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
                profilePic: state.loggedInUser.profilePic,
              },
              '2': {
                name: contactedUserInfo?.name,
                id: contactedUserID as unknown as string,
                email: contactedUserInfo?.email,
                profilePic: contactedUserInfo?.profilePic,
              },
            },
          },
        ])
        .select('*');

      if (error) {
        return console.error('Error creating new conversation:', error.message);
      } else {
        console.log('convoData', convoData);
        setSelectedConversation(
          convoData[0].conversation_id as unknown as number
        );
        // setConversations([...conversations, convoData[0]]);
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .insert([
            {
              conversation_id: convoData[0].conversation_id,
            },
          ]);
        console.log('messagesData', messagesData);
        // setConversations([convoData[0], ...conversations]);
        fetchAllConversations();
        if (messagesError) {
          console.error(
            'Error creating new conversation:',
            messagesError.message
          );
        }
      }
    }
  };
  console.log('conversations', conversations);

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
        console.log('convo exists', convoData);

        if (convoData && convoData.length === 0) {
          createNewConversation();
        } else {
          if (convoData) {
            setSelectedConversation(
              convoData[0].conversation_id as unknown as number
            );
          }
        }
      }
    }
  };

  useEffect(() => {
    if (
      state.user !== null &&
      contactedUserID !== null &&
      state.loggedInUser !== null
    ) {
      checkIfConversationExists();
    }
  }, [state.user, contactedUserID, state.loggedInUser]);

  // useEffect(() => {
  //   if (state.user !== null && contactedUserID !== null) {
  //     console.log('checking if convo exists');
  //     checkIfConversationExists();
  //   }
  // }, []);

  // Function to send a new message
  const sendMessage = async () => {
    if (selectedConversation !== null && newMessage.trim() !== '') {
      // Fetch the existing messages for the selected conversation
      const { data: existingData, error: existingError } = await supabase
        .from('messages')
        .select('messagesObj')
        .eq('conversation_id', selectedConversation);

      if (existingError) {
        console.error(
          'Error fetching existing messages:',
          existingError.message
        );
        return;
      }

      // Check if messagesObj is defined and is an array
      const existingMessagesObj =
        existingData[0] && Array.isArray(existingData[0].messagesObj)
          ? existingData[0].messagesObj
          : [];

      // Append the new message to the existing messages
      const updatedMessages = [
        ...existingMessagesObj,
        {
          sender_id: state.user?.id,
          content: newMessage,
          timestamp: new Date(),
        },
      ];

      // Perform the upsert with the updated messages
      const { data, error } = await supabase
        .from('messages')
        .upsert([
          {
            conversation_id: selectedConversation,
            messagesObj: updatedMessages,
          },
        ])
        .eq('conversation_id', selectedConversation);

      if (error) {
        console.error('Error sending message:', error.message);
      } else {
        console.log('Message sent', data);
        setMessages([...messages, data && data[0]]);
        setNewMessage(''); // Clear the input field after sending the message
      }
    }
  };

  useEffect(() => {
    fetchContactedUserInfo().then((data) => {
      setContactedUserInfo(data);
      console.log('contactedUserData', data);
    });
  }, [contactedUserID]);

  useEffect(() => {
    fetchAllConversations();
  }, [state.user]);

  useEffect(() => {
    fetchMessagesForSelectedConversation();
  }, [selectedConversation, newMessage]);

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
                      contactedUserInfo &&
                      contactedUserInfo.profilePic != undefined
                        ? contactedUserInfo.profilePic
                        : '/profile/profile-pic-placeholder.png'
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
                {conversations.map((convo) => (
                  <li
                    key={convo.conversation_id} // Assuming conversation_id is the unique identifier
                    className={`cursor-pointer my-auto flex pl-[8%] gap-2  md:gap-4 align-middle tracking-[0.3rem] py-4 border-b-2 border-[#172544] uppercase md:text-xl ${
                      selectedConversation === convo.conversation_id
                        ? 'bg-gray-300'
                        : ''
                    }`}
                    onClick={() =>
                      setSelectedConversation(convo.conversation_id)
                    }>
                    <div className="relative w-[3vmax] justify-center align-middle flex my-auto h-[3vmax]">
                      <img
                        src={
                          convo.members[2].convoPic != undefined
                            ? convo.members[2].convoPic
                            : '/profile/profile-pic-placeholder.png'
                        } // Assuming convoPic is a property of the second member
                        alt="hero"
                        className="rounded-full flex mx-auto"
                      />
                    </div>
                    <span className="my-auto">{convo.members[2].name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:w-full w-[65%]">
              <div className="h-[80%] ">
                {selectedConversation !== null && (
                  <>
                    <h3 className="flex gap-4 tracking-[0.3rem] pl-[8%] py-4 border-b-2 border-[#172544] uppercase md:text-xl">
                      <div className="relative w-[3vmax] my-auto flex h-[3vmax]">
                        <Image
                          src={
                            conversations?.find(
                              (convo) =>
                                convo.conversation_id === selectedConversation
                            )?.members[2]?.profilePic != undefined
                              ? conversations?.find(
                                  (convo) =>
                                    convo.conversation_id ===
                                    selectedConversation
                                )?.members[2]?.profilePic // Assuming convoPic is a property of the second member
                              : '/profile/profile-pic-placeholder.png'
                          }
                          alt="hero"
                          width={28}
                          height={28}
                          className="rounded-full my-auto"
                        />
                      </div>
                      <span className="my-auto font-serif">
                        {
                          conversations?.find(
                            (convo) =>
                              convo.conversation_id === selectedConversation
                          )?.members[2]?.name
                        }
                      </span>
                    </h3>

                    <div
                      ref={messagesContainerRef}
                      className=" overflow-y-auto h-[50vh] py-6 px-2 md:px-10">
                      <div className="">
                        <ul className="flex flex-col gap-6">
                          {messages.map((message, index) => (
                            <li
                              key={index}
                              className={`flex  gap-4 ${
                                message?.sender_id === state.user?.id
                                  ? 'ml-auto' // Align to the right if it's my message
                                  : 'mr-auto'
                              }`}>
                              <div className="relative flex">
                                <Image
                                  src={
                                    conversations?.find(
                                      (convo) =>
                                        convo.conversation_id ===
                                        selectedConversation
                                    )?.members[2]?.profilePic != undefined
                                      ? conversations?.find(
                                          (convo) =>
                                            convo.conversation_id ===
                                            selectedConversation
                                        )?.members[2]?.profilePic // Assuming convoPic is a property of the second member
                                      : '/profile/profile-pic-placeholder.png'
                                  }
                                  alt="hero"
                                  width={30}
                                  height={30}
                                  className="rounded-full my-auto"
                                />
                              </div>
                              <p
                                className={`my-auto py-2 font-sans md:text-lg px-10 rounded-3xl ${
                                  message?.sender_id === state.user?.id
                                    ? 'bg-[#dbd7d6]'
                                    : 'bg-[#E5DEDB]'
                                }`}>
                                {message?.content}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className=" w-full px-2 h-[10%] flex gap-6 md:pl-10">
                <input
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-[80%] h-full pl-2 placeholder:tracking-[0.3rem] focus-visible:outline-none bg-transparent border-t-2 border-[#E5DEDB]"
                  placeholder="Type your message here"
                  type="text"
                  value={newMessage}
                />
                <button
                  onClick={() => sendMessage()}
                  className="bg-[#E88527] hover:bg-[#e88427ca] h-fit w-fit my-auto px-4 py-2 text-white rounded-xl ">
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
