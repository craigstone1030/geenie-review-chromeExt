import React, { useRef, useState } from "react";

const Tooltip = (props: {
  delay?: number;
  children?: React.ReactNode;
  direction: "top" | "bottom" | "left" | "right";
  content: React.ReactNode;
}) => {
  const timeout = useRef<string | number | NodeJS.Timeout | undefined>(
    undefined
  );
  const [active, setActive] = useState(false);
  return (
    <div
      className="Tooltip-Wrapper flex items-center text-mlg font-bold"
      onMouseEnter={() => {
        timeout.current = setTimeout(() => {
          setActive(true);
        }, props.delay || 400);
      }}
      onMouseLeave={() => {
        if (timeout.current) {
          clearInterval(timeout.current);
        }
        setActive(false);
      }}
    >
      {props.children && (
        <>
          <span>
            {props.children}
            <span className="ml-1 rounded-full border border-gray-600 px-2 py-1 text-[7px] text-gray-600">
              ?
            </span>
          </span>
        </>
      )}
      {active && (
        <div className={`Tooltip-Tip ${props.direction || "bottom"}`}>
          {props.content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
