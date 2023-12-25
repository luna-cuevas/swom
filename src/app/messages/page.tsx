'use client';
import React, { use, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
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
  const { state, setState } = useStateContext();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const fetchContactedUserInfo = async () => {
    const listings = await fetch('/api/getUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: contactedUserID }),
    });

    const data = await listings.json();

    return data;
  };

  const fetchAllConversations = async () => {
    if (state.user !== null) {
      const allConvosData = await fetch('/api/messages/fetchAllConvos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: state.user.id }),
      });

      const allConvosDataJson = await allConvosData.json();

      if (!allConvosDataJson) {
        console.error('Error fetching conversations:', allConvosDataJson);
      } else {
        console.log('allConvosDataJson', allConvosDataJson);
        setConversations(allConvosDataJson || []);
      }
    }
  };

  const fetchMessagesForSelectedConversation = async () => {
    if (selectedConversation !== null) {
      const messagesData = await fetch('/api/messages/fetchMessages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: selectedConversation }),
      });
      const messagesDataJson = await messagesData.json();

      if (!messagesDataJson) {
        console.error('Error fetching messages:', messagesDataJson);
      } else {
        setMessages(messagesDataJson[0].messagesObj || []);
        scrollToBottom();
      }
    }
  };

  const createNewConversation = async () => {
    if (state.user !== null && state.loggedInUser !== null) {
      const contactedUserInfo = await fetchContactedUserInfo();

      const convoData = await fetch('/api/messages/createConvo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          members: {
            '1': {
              name: state.loggedInUser.name,
              id: state.user.id,
              email: state.loggedInUser.email,
              profileImage: state.loggedInUser.profileImage,
            },
            '2': {
              name: contactedUserInfo.name,
              id: contactedUserInfo.id,
              email: contactedUserInfo?.email,
              profileImage: contactedUserInfo?.profileImage,
            },
          },
        }),
      });

      const convoDataJson = await convoData.json();

      if (!convoDataJson) {
        return console.error('Error creating new conversation:', convoDataJson);
      } else {
        setSelectedConversation(
          convoDataJson[0].conversation_id as unknown as number
        );

        fetchAllConversations();
      }
    }
  };

  const checkIfConversationExists = async () => {
    if (state.user !== null && contactedUserID !== null) {
      const checkConvoData = await fetch('/api/messages/checkConvoExists', {
        body: JSON.stringify({
          1: { id: state.user.id },
          2: { id: contactedUserID },
        }),
        method: 'POST',
      });

      const convoData = await checkConvoData.json();

      if (!convoData) {
        console.error('Error checking if conversation exists:', convoData);
      } else {
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

  const sendMessage = async () => {
    if (selectedConversation !== null && newMessage.trim() !== '') {
      // Perform the upsert with the updated messages
      const sendMessageData = await fetch('/api/messages/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: selectedConversation,
          selectedConversation: selectedConversation,
          sender_id: state.user.id,
          content: newMessage,
        }),
      });
      const sendMessageDataJson = await sendMessageData.json();

      if (!sendMessageDataJson) {
        console.error('Error sending message:', sendMessageDataJson);
      } else {
        setMessages([
          ...messages,
          sendMessageDataJson && sendMessageDataJson[0],
        ]);
        setNewMessage(''); // Clear the input field after sending the message
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (
      state.user !== null &&
      contactedUserID !== null &&
      state.loggedInUser !== null
    ) {
      checkIfConversationExists();
    }
  }, [state.user, contactedUserID, state.loggedInUser]);

  useEffect(() => {
    fetchAllConversations();
  }, []);

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
                    className={`cursor-pointer flex-col lg:flex-row break-all  my-auto flex pl-[8%] gap-2  md:gap-4 align-middle tracking-[0.3rem] py-4 border-b-2 border-[#172544] uppercase md:text-xl ${
                      selectedConversation === convo.conversation_id
                        ? 'bg-gray-300'
                        : ''
                    }`}
                    onClick={() =>
                      setSelectedConversation(convo.conversation_id)
                    }>
                    <div className="relative w-[30px] mx-auto  justify-center align-middle flex my-auto h-[30px]">
                      <Image
                        src={
                          convo.members[2].profileImage
                            ? convo.members[2].profileImage
                            : '/profile/profile-pic-placeholder.png'
                        } // Assuming convoPic is a property of the second member
                        alt="hero"
                        className="rounded-full flex mx-auto"
                        fill
                        objectFit="cover"
                      />
                    </div>
                    <span className="my-auto text-center md:text-left">
                      {convo.members[2].name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:w-full w-[65%]">
              <div className="h-[80%] ">
                {selectedConversation !== null && (
                  <>
                    <h3 className="flex gap-4 flex-wrap tracking-[0.3rem] pl-[8%] py-4 border-b-2 border-[#172544] uppercase md:text-xl">
                      <div className="relative w-[30px] my-auto flex h-[30px]">
                        <Image
                          src={
                            conversations?.find(
                              (convo) =>
                                convo.conversation_id === selectedConversation
                            )?.members[2]?.profileImage
                              ? conversations?.find(
                                  (convo) =>
                                    convo.conversation_id ===
                                    selectedConversation
                                )?.members[2]?.profileImage // Assuming convoPic is a property of the second member
                              : '/profile/profile-pic-placeholder.png'
                          }
                          alt="hero"
                          fill
                          objectFit="cover"
                          className="rounded-full my-auto"
                        />
                      </div>
                      <span className="my-auto font-serif break-all">
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
                              className={`flex opacity-0 transition-all duration-75 ease-in-out  gap-4 ${
                                message.sender_id == state.user.id
                                  ? 'ml-auto opacity-100' // Align to the right if it's my message
                                  : 'mr-auto opacity-100'
                              }`}>
                              <div className="relative w-[30px] h-[30px] my-auto flex">
                                <Image
                                  src={
                                    conversations?.find(
                                      (convo) =>
                                        convo.conversation_id ===
                                        selectedConversation
                                    )?.members[
                                      message.sender_id == state?.user.id
                                        ? 1
                                        : 2
                                    ]?.profileImage
                                      ? conversations?.find(
                                          (convo) =>
                                            convo.conversation_id ===
                                            selectedConversation
                                        )?.members[
                                          message.sender_id == state?.user.id
                                            ? 1
                                            : 2
                                        ]?.profileImage // Assuming convoPic is a property of the second member
                                      : '/profile/profile-pic-placeholder.png'
                                  }
                                  alt="hero"
                                  fill
                                  objectFit="cover"
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
                  type="button"
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
