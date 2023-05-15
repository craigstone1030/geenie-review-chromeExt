/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createContext, useContext, useState } from "react";
import { EmailModal } from "~/components";

const ModalContext = createContext<{
  setDisplayModal: React.Dispatch<React.SetStateAction<boolean | "simple">>;
  setShouldActuallyDisplay: React.Dispatch<React.SetStateAction<boolean>>;
}>(null!);

export const ModalProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [displayModal, setDisplayModal] = useState<boolean | "simple">(false);
  const [shouldActuallyDisplay, setShouldActuallyDisplay] = useState(false);
  return (
    <ModalContext.Provider
      value={{ setDisplayModal, setShouldActuallyDisplay }}
    >
      {displayModal && shouldActuallyDisplay ? (
        <EmailModal
          setEmailModal={setDisplayModal}
          isSimple={displayModal === "simple"}
        />
      ) : null}
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within a ModalProvider");
  return ctx.setDisplayModal;
};

export const useActualModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within a ModalProvider");
  return ctx.setShouldActuallyDisplay;
};
