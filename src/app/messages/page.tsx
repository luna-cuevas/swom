'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import dummyMessages from '../../data/dummyMessages.json';

type Props = {};

const Page = (props: Props) => {
  const [selectedConversation, setSelectedConversation] = useState(null);

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

        <div className="bg-[#F4ECE8]  overflow-hidden my-auto h-[80vh] w-full md:w-10/12 sm:rounded-r-2xl lg:rounded-r-[6rem] z-20 relative">
          <div className="">
            <h1 className="tracking-[0.3rem] uppercase text-3xl bg-[#E5DEDB] py-6 pl-12">
              Messages
            </h1>
          </div>
          <div className="flex h-[95%]">
            <div className="border-r-2 h-auto w-[35%] md:w-1/3 border-[#172544]">
              <h2 className="tracking-[0.3rem] flex py-4 border-b-2 border-inherit uppercase md:text-xl gap-2 md:gap-4 pl-[8%]">
                <div className="relative w-[3vmax] invisible h-[3vmax]">
                  <Image
                    src={
                      selectedConversation !== null
                        ? dummyMessages[selectedConversation - 1].convoPic
                        : ''
                    }
                    alt="hero"
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                </div>
                <span className="my-auto">Inbox</span>
              </h2>
              <ul className="">
                {dummyMessages.map((convo) => (
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
                            selectedConversation !== null
                              ? dummyMessages[selectedConversation - 1].convoPic
                              : ''
                          }
                          alt="hero"
                          width={28}
                          height={28}
                          className="rounded-full my-auto"
                        />
                      </div>
                      <span className="my-auto ">
                        {selectedConversation !== null &&
                          dummyMessages[selectedConversation - 1]
                            .convoMembers[1]}
                      </span>
                    </h3>

                    <div className=" overflow-y-auto h-[50vh] py-6 px-2   md:px-10 ">
                      <div className="">
                        <ul className="flex flex-col gap-6">
                          {dummyMessages[selectedConversation - 1].messages.map(
                            (message) => (
                              <li
                                key={message.messageID}
                                className={`flex gap-4 ${
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
                                  className={`my-auto py-2 md:text-lg px-10 rounded-3xl ${
                                    message.messageSender !== 'me'
                                      ? 'bg-[#E5DEDB]'
                                      : 'bg-gray-300'
                                  }`}>
                                  {message.messageContent}
                                </p>
                              </li>
                            )
                          )}
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
