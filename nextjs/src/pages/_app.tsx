import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { api } from "~/utils/api";
import "~/styles/Card.css";
import "~/styles/globals.css";
import { NavBar } from "~/components";
import { ModalProvider } from "~/utils/modalCtx";
// import { FloatingButton, Item } from "react-floating-button";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <ModalProvider>
      {/* <SessionProvider session={session}> */}
        <Toaster />
        <NavBar />
        <div className="w-full">
          <Component {...pageProps} />
        </div>
      {/* </SessionProvider> */}
    </ModalProvider>
  );
};

export default api.withTRPC(MyApp);
