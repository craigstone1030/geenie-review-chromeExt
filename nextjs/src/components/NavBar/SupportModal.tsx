import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import Spinner from "../Spinner";

const SupportModal: React.FC<{
  setSupportModal: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setSupportModal }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [closing, setClosing] = useState(false);
  const sendSupport = api.email.support.useMutation({
    onError(error) {
      toast.error(error.message);
    },
    onSuccess() {
      toast.success("Message sent successfully!");
      setClosing(true);
    },
  });
  useEffect(() => {
    if (closing) {
      setTimeout(() => {
        setSupportModal(false);
      }, 250);
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
        className={`fixed top-2/4 left-2/4 z-[9999] flex -translate-x-2/4 -translate-y-2/4 items-center justify-center ${
          closing ? "animate-slide-out" : "animate-slide-in"
        }`}
      >
        <div className="w-[500px] rounded-lg bg-[#2B2939] p-5">
          <h1 className="text-center text-2xl font-semibold text-white">
            Support
          </h1>
          <div className="mt-5">
            <label htmlFor="email" className="text-sm font-semibold text-white">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mt-5">
            <label
              htmlFor="message"
              className="text-sm font-semibold text-white"
            >
              Message
            </label>
            <textarea
              name="message"
              id="message"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setClosing(true)}
              className="rounded-lg bg-gray-300 px-4 py-2 text-blackish"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                sendSupport.mutate({
                  email,
                  message,
                })
              }
              className="flex items-center justify-center gap-2 rounded-lg bg-[#FFAF12] px-4 py-2 text-white"
            >
              Send {sendSupport.isLoading ? <Spinner sm /> : null}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportModal;
