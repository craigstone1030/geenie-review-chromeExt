import React from "react";
// import Tooltip from "./tooltip";

const Card: React.FC<{
  number: string;
  text: string;
  title?: string;
  tooltip?: string;
}> = ({ text, title }) => {
  return (
    <div className="flex w-[100%] rounded-xl bg-[#2B2939] p-4">
      <div className="font-poppins whitespace-pre-line mr-5 break-word mb-2 h-auto w-[180px] flex-shrink-0 text-lg font-bold">
        {title}
        {/* </Tooltip> */}
      </div>
      <div className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track bg-rgba(121, 121, 121, 0.25) scrollbar-color-dark h-auto flex-grow overflow-auto rounded-md border px-[20px] py-[10px]">
        <p className="font-poppins whitespace-pre-line text-base font-light ">
          {text}
        </p>
      </div>
    </div>
  );
};

export default Card;
