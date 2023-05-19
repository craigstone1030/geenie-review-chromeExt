import Spinner from "../Spinner";
import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
  } from "react";
  import axios from "axios";
import { boolean } from "zod";

interface ProductImproveItemProps {
    asin: string;
    title: string;
    question: string;
    answer: string;
  }
  
  const ProductImproveItem = ({
    asin,
    title,
    question,
    answer,
  }: ProductImproveItemProps) => {
    
    const [answerShown, setAnswerShown] = useState<boolean>(true);

    // useEffect(() => {
    //     try {
    //         if( asin === '' || asin === null ) {
    //             setAnswer("");
    //             return;
    //         }

    //         axios.post('/https://extern-api.com/login', {
    //             question: question,
    //             asin: asin
    //         })
    //         .then(res => {
    //           console.log('res', res.data);
    //           setAnswer(res.data)
    //         })
    //         .catch(err => {
    //           console.log('error in request', err);
    //         });
    //     } catch (error) {
    //       console.error(error);
    //     }
    //   }, [asin]);  

    // useEffect(() => {
    //   window.parent.postMessage({from:'nextjs', type:'getInitialAnswer', question: question}, "*")
    // }, [question]);

    return (
        <div className="box mt-[1vw] rounded-lg bg-[#2B2939] p-4">
          <div className="m-auto flex">
            <div className="w-full">
              <div className="mb-[6px] flex text-left justify-between" onClick={() => { setAnswerShown(!answerShown) }}>
                <h2 className="text-[15px] text-white">
                {title}
                </h2>
                { answer == '' ? (<Spinner sm/>) : null }
              </div>
              { answer && answerShown ?
                (
                    <p className="text-[13px] text-white whitespace-pre-line">
                        {/* {answer.replace(/\n/g, '<br>')} */}
                        { answer }
                    </p>
                ) : null
              }
            </div>
          </div>
        </div>
    );
  };
  
  export default ProductImproveItem;