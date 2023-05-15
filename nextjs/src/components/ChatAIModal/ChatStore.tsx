import axios from "axios";
import { toast } from "react-hot-toast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// initial chat store
export const ChatStore = create(
  persist(
    (set, get) => ({
      // default array chats
      chats: [],
      // latest chat
      chat: {},
      // default loading false
      loading: false,
      // store chat to api
      addChat: async (inputChat: any, asin: string) => {
        try {
          // set new latest chat
          set(() => ({ chat: { chat: inputChat, date: new Date() } }));
          // set loading true
          set(() => ({ loading: true }));
          // post data input to api
          const { data } = await axios.post("/api/chatai", {
            chat: inputChat,
            asin: asin
          });
          // data chat object
          const dataChat = {
            // input chat
            chat: inputChat,
            // answer from api
            answer: data,
            // current date
            date: new Date(),
          };
          // set default latest chat
          set(() => ({ chat: {} }));
          // set new data chat from api to new array
          set((state: any) => ({
            chats: [...state.chats, dataChat],
            loading: false,
          }));
        } catch (err:any) {
          // toast error
          toast.error(
            err.response && err.response.data.message
              ? err.response.data.message
              : err.message
          );
          // console.log(err);
          set(() => ({ chat: {} }));
          set(() => ({ loading: false }));
        }
      },
      // remove one chat
      removeOneChat: (item:any) => {
        // toast success
        // toast.success(`Success delete ${item.chat}`);
        // remove one chat by index
        set((state:any) => ({
          chats: state.chats.filter((x:any) => x !== item),
        }));
      },
      // remove all chats
      removeAllChat: () => {
        // toast success
        toast.success(`Success delete all chats`);
        set({ chats: [] });
      },
    }),
    // set local storage
    {
      name: "next-openai-chats",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
