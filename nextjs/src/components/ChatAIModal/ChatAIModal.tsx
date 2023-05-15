/* eslint-disable @next/next/no-img-element */
import { signIn } from "next-auth/react";
import Image from "next/image";
import { ChatStore } from "./ChatStore";
import { useEffect, useState } from "react";
import { Fragment, useRef } from "react";
import dayjs from "dayjs";
// var relativeTime:any = require("dayjs/plugin/relativeTime");
// dayjs.extend(relativeTime);
import {
  IconHand,
  IconLoadingHourglass,
  IconLoadingSend,
  IconProfile,
  IconRobot,
  IconSend,
  IconTrash,
} from "./Icon";
// import ClientSide from "./ClientSide";
import AnimateChats from "./AnimateChats";
import { Toaster } from "react-hot-toast";

const ChatAIModal: React.FC<{
  asin: string
  setChatAIModal: React.Dispatch<React.SetStateAction<boolean>>;
  isSimple?: boolean;
}> = ({ asin, setChatAIModal, isSimple }) => {

  const [closing, setClosing] = useState(false);

  // store chats
  const { chats, chat, addChat, loading, removeAllChat, removeOneChat } = ChatStore((state:any) => state);

  // state text
  const [text, setText] = useState("");

  // handler form submit
  const handlerSubmitChat = (event:any) => {
    event.preventDefault();
    // if text greater than 0 and less than 300 character do it
    if (text.length > 0 && text.length <= 500) {
      // store text to addChat store
      addChat(text, asin);
      // set text to default
      setText("");
    }
  };

  // format date
  const formatDate = (date: any) => {
    // return dayjs().to(dayjs(date));
    return "";
  };

  // ref
  const chatRef = useRef<null | HTMLDivElement>(null);
  const loadingRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    // if there is a new chat scroll to them
    if (chats && chatRef?.current) {
      chatRef?.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, chatRef]);

  useEffect(() => {
    // if there is a loading scroll to them
    if (loading && loadingRef?.current) {
      loadingRef?.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading, loadingRef]);

  // state modal remove all
  const [modalRemoveAll, setModalRemoveAll] = useState(false);

  // state modal remove one
  const [modalRemoveOne, setModalRemoveOne] = useState();
  
  useEffect(() => {
    if (closing) {
      const timer = setTimeout(() => {
        setClosing(false);
        setChatAIModal(false);
      }, 250);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  return (
    <>
      <button
        className="fixed top-0 left-0 z-[9998] h-full w-full cursor-default bg-black bg-opacity-50"
        onClick={() => setClosing(true)}
      />
      <div
        className={`rounded-xl bg-[#FFFFFF] ${
          closing ? "animate-slide-out" : "animate-slide-in"
        } fixed top-2/4 left-2/4 z-[9999] flex h-[700px] w-[807px] max-w-4xl	 -translate-y-2/4 -translate-x-2/4 items-center justify-between p-3`}
      >
        <button
          onClick={() => setClosing(true)}
          className="absolute right-3 top-3"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18"
              stroke="#0F1111"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 6L18 18"
              stroke="#0F1111"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* <div className=""> */}
          <div className="flex flex-col flex-grow w-full h-full bg-white shadow-xl rounded-lg overflow-hidden">
            {/* header */}
            <div className="bg-white border-b shadow p-2 w-full z-20">
              <div className="relative flex justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <span className="absolute text-green-500 translate-x-3 translate-y-2 bottom-0 right-0">
                      <svg width="20" height="20">
                        <circle cx="5" cy="5" r="5" fill="currentColor"></circle>
                      </svg>
                    </span>

                    <IconRobot />
                  </div>

                  <div className="flex flex-col leading-tight">
                    <div className="mt-1 flex items-center">
                      <span className="text-gray-700 mr-3">Can I help you?</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {loading ? "Typing..." : "Online"}
                    </span>
                  </div>
                </div>

                {chats.length > 1 && (
                  <div className="flex items-center px-1">
                    <button type="button" onClick={() => removeAllChat()}>
                      <IconTrash />
                    </button>

                    {/* <Dialog
                      as="div"
                      className="relative z-40"
                      open={modalRemoveAll}
                      onClose={() => setModalRemoveAll(false)}>
                      <div className="fixed inset-0 bg-black bg-opacity-25" />
                      <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title
                              as="h3"
                              className="font-medium leading-6 text-gray-900">
                              Are you sure ?
                            </Dialog.Title>
                            <Dialog.Description className="mt-1">
                              Are you sure delete all chat ?
                            </Dialog.Description>
                            <div className="mt-4 flex justify-end space-x-4">
                              <button
                                type="button"
                                className="inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
                                onClick={() => setModalRemoveAll(false)}>
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="inline-flex justify-center rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200"
                                onClick={() => {
                                  setModalRemoveAll(false), removeAllChat();
                                }}>
                                Yes, delete all chats
                              </button>
                            </div>
                          </Dialog.Panel>
                        </div>
                      </div>
                    </Dialog> */}
                  </div>
                )}
              </div>
            </div>

            {/* chats */}
            <div className="flex flex-col flex-grow h-0 p-4 overflow-auto py-20 md:py-10">
              <>
                {chats?.length === 0 && (
                  <div
                    className="flex items-center justify-center h-full w-full"
                    ref={chatRef}>
                    <div className="text-center text-gray-600">
                      <p>No message here...</p>
                      <p>Send a message or tap the greeting icon below</p>
                      <div className="cursor-pointer">
                        <button
                          type="button"
                          className="my-10"
                          onClick={() => addChat("Hello, how are you?")}>
                          <IconHand loading={loading} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <AnimateChats>
                  {chats?.length > 0 &&
                    chats?.map((item:any, index:any) => (
                      <Fragment key={index}>
                        <div className="flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end">
                          <div className="relative">
                            <div className="after:content-['▸'] after:absolute after:top-0 after:right-0 after:translate-x-4 after:text-3xl after:text-green-200 bg-green-200 p-3 rounded-l-lg rounded-br-lg">
                              <p className="text-sm leading-relaxed">
                                {item.chat}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 leading-none">
                              {formatDate(item.date)}
                            </span>
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={() => removeOneChat(item)}>
                              <IconProfile />
                            </button>
                          </div>

                          {/* <Dialog
                            as="div"
                            className="relative z-40"
                            open={modalRemoveOne === index}
                            onClose={() => setModalRemoveOne()}>
                            <div className="fixed inset-0 bg-black bg-opacity-25" />
                            <div className="fixed inset-0 overflow-y-auto">
                              <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                  <Dialog.Title
                                    as="h3"
                                    className="font-medium leading-6 text-gray-900">
                                    Are you sure ?
                                  </Dialog.Title>
                                  <Dialog.Description className="mt-1">
                                    Are you sure delete chat {item.chat} ?
                                  </Dialog.Description>
                                  <div className="mt-4 flex justify-end space-x-4">
                                    <button
                                      type="button"
                                      className="inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
                                      onClick={() => setModalRemoveOne()}>
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      className="inline-flex justify-center rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200"
                                      onClick={() => {
                                        setModalRemoveOne(), removeOneChat(item);
                                      }}>
                                      Yes, delete
                                    </button>
                                  </div>
                                </Dialog.Panel>
                              </div>
                            </div>
                          </Dialog> */}
                        </div>
                        <div className="flex w-full mt-2 space-x-3 max-w-xs">
                          <div>
                            <IconRobot />
                          </div>
                          <div className="relative">
                            <div className="before:content-['◂'] before:absolute before:top-0 before:left-0 before:-translate-x-4 before:text-3xl before:text-gray-200 bg-gray-200 p-3 rounded-r-lg rounded-bl-lg">
                              <p className="text-sm leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 leading-none">
                              {formatDate(item.date)}
                            </span>
                          </div>
                        </div>
                      </Fragment>
                    ))}
                </AnimateChats>
                {chats?.length > 0 && chat?.chat && (
                  <div className="flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end">
                    <div className="relative">
                    <div className="after:content-['▸'] after:absolute after:top-0 after:right-0 after:translate-x-4 after:text-3xl after:text-green-200 bg-green-200 p-3 rounded-l-lg rounded-br-lg">
                        <p className="text-sm leading-relaxed">{chat.chat}</p>
                      </div>
                      <span className="text-xs text-gray-500 leading-none">
                        {formatDate(chat.date)}
                      </span>
                    </div>

                    <div>
                      <button type="button">
                        <IconProfile />
                      </button>
                    </div>
                  </div>
                )}
                {loading && (
                  <div
                    className="text-center flex justify-center py-4"
                    ref={loadingRef}>
                    <IconLoadingHourglass />
                  </div>
                )}
              </>
            </div>

            {/* input chat */}
            <div className="bg-gray-200 shadow border-t p-2 w-full">
              <div className="relative">
                <form onSubmit={handlerSubmitChat}>
                  <input
                    className="flex items-center h-10 w-full rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 input-chat"
                    type="text"
                    placeholder="Type your message…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-8 top-2 change-color fill-gray-300">
                    {loading ? <IconLoadingSend /> : <IconSend />}
                  </button>
                </form>
              </div>
            </div>
          </div> 
        {/* </div>        */}
      </div>
    </>
  );
};

export default ChatAIModal;
