/* eslint-disable @next/next/no-img-element */

import Stars from "./Stars";
import type { ProductBoxProps } from "./ProductPage";

export default function ProductBox(props: ProductBoxProps) {
  const globalRaiting = props.globalRaiting.toLocaleString();
  const ratingCount = props.ratingCount.toLocaleString();
  return (
    // <div className="mt-[40px]  mb-[60px] text-white">
    //   <div className="m-auto flex w-[95vw] border-b-2 pb-[2vh] ">
    //     <div className=" flex w-[65vw] ">
    //       <div className="h-[7vh] w-[9vw]">
    //         <img className="h-[7vw] w-[9vw]" src={props.img} alt="image" />
    //       </div>
    //       <div className="pt-3] ml-[1vw] w-[80vw] ">
    //         <h2 className="mb-2 text-[18px] font-bold line-clamp-2  ">
    //           {" "}
    //           {props.title}{" "}
    //         </h2>
    //         <p className="text-neutral-400"> ASIN {props.asin} </p>
    //         <p className="text-neutral-400">
    //           {" "}
    //           available on {props.firstavailable}{" "}
    //         </p>
    //         <a
    //           href={props.link}
    //           target="_blank"
    //           rel="noopener noreferrer"
    //           className="cursor-pointer text-neutral-400 underline"
    //         >
    //           view Product info
    //         </a>
    //       </div>

    //       <div className=" ml-[2vw] w-[1vw] border-l-4" />
    //     </div>

    //     <div className="m-auto block">
    //       <div className="">
    //         <div className="">
    //           <h2 className="  text-[17px] font-bold"> Customer Rating </h2>
    //           <div className="  pt-[12px] ">
    //             <Stars
    //               rating={props.customerRating}
    //               outOf={5}
    //               totalReviews={28}
    //               large={true}
    //             />
    //           </div>
    //           <p className="mt-[10px] text-center text-[12px] text-white">
    //             {" "}
    //             {ratingCount} rating{" "}
    //           </p>
    //           <p className="text-center text-[12px] text-white">
    //             {" "}
    //             {globalRaiting} reviews{" "}
    //           </p>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>

    <div className="flex justify-center">
      <div className="box relative mt-[10px] mb-[10px] w-[506px] gap-4 rounded-lg bg-[#2B2939] p-4 pb-[vh] text-white">
        <div className="flex">
          <div className="flex w-[298px] gap-1">
            <div className=" w-[164px] flex items-center">
              <img className="shadow-lg h-full w-full object-center"
                  src={props.img}
                  alt="image" />
              <div className="box absolute top-0 left-0 right-0 bottom-0 xs:h-[15.5vh] md:h-[19.8vh]"></div>
            </div>
            <div className="ml-[1px] w-[120px]">
              <h2 className="whitespace-pre-line font-bold  line-clamp-4">{props.title}<p className="text-[#1D1C27] xs:text-[1px] md:text-[8px]">.</p></h2>
              <p className="text-neutral-400 text-xs"> ASIN {props.asin} </p>
              <p className="text-neutral-400 text-[10px] text-xs"> available on {props.firstavailable} </p>
            </div>
            <div className="w-[1px] border-l-2"></div>
          </div>
          <div className="m-auto block">
            <div className="">
              <div className="">
                <h2 className="font-bold"> Customer Rating </h2>
                <div className=" pt-[12px] ">
                  <Stars
                    rating={props.customerRating}
                    outOf={5}
                    totalReviews={28}
                    large={true}
                  />
                </div>
                <p className="mt-[10px] text-center text-white"> {ratingCount} rating </p>
                <p className="text-center text-white"> {globalRaiting} reviews </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
