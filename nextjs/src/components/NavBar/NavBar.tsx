/* eslint-disable @next/next/no-img-element */
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useActualModal, useModal } from "~/utils/modalCtx";
import SupportModal from "./SupportModal";


const NavBar: React.FC = () => {

  return (
    <nav className="shadowStuff fixed z-[9998] flex h-[50px] w-full items-center bg-[#2B2939] justify-between p-1">
      <button
        className="transition-transform hover:scale-[1.01] ml-1"
      >
        <div className="flex items-center align-middle">
          <img
            src="/geenie_logo.png"
            alt="logo"
            className="w-[200px]"
          />
        </div>
      </button>
      <div className="mx-3 flex items-center gap-1">
          <button
            className="text-sm text-[#FFAF12] rounded border border-[#FFAF12] p-1"
          >
            Upgrade
          </button>
          <button
            className="text-sm text-white rounded border border-white p-1 flex gap-1"
          >
          <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.2075 5.98053H9.75001V1.3972C9.75001 0.89303 9.33751 0.48053 8.83334 0.48053H5.16668C4.66251 0.48053 4.25001 0.89303 4.25001 1.3972V5.98053H2.79251C1.97668 5.98053 1.56418 6.97053 2.14168 7.54803L6.34918 11.7555C6.70668 12.113 7.28418 12.113 7.64168 11.7555L11.8492 7.54803C12.4267 6.97053 12.0233 5.98053 11.2075 5.98053ZM0.583344 15.1472C0.583344 15.6514 0.995843 16.0639 1.50001 16.0639H12.5C13.0042 16.0639 13.4167 15.6514 13.4167 15.1472C13.4167 14.643 13.0042 14.2305 12.5 14.2305H1.50001C0.995843 14.2305 0.583344 14.643 0.583344 15.1472Z" fill="white"/>
          </svg>
            Reviews
          </button>          
      </div>
    </nav>
  );
};

export default NavBar;