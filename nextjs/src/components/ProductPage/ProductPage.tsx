/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import ProductBox from "./ProductBox";
import ChartsPage from "./Charts";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import CardList from "./Cards/CardList";
import { useRouter } from "next/router";
import { titles } from "./Cards/CardList";
import * as XLSX from "xlsx";
import type { SearchVersion } from "@prisma/client";
import Spinner from "../Spinner";
import ProductImproveItem from "./ProductImproveItem";


const IconSend = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="h-5 w-5"
    >
      <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" />
    </svg>
  );
};

const IconLoadingSend = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="animate-spin h-5 w-5"
    >
      <path d="M304 48c0-26.5-21.5-48-48-48s-48 21.5-48 48s21.5 48 48 48s48-21.5 48-48zm0 416c0-26.5-21.5-48-48-48s-48 21.5-48 48s21.5 48 48 48s48-21.5 48-48zM48 304c26.5 0 48-21.5 48-48s-21.5-48-48-48s-48 21.5-48 48s21.5 48 48 48zm464-48c0-26.5-21.5-48-48-48s-48 21.5-48 48s21.5 48 48 48s48-21.5 48-48zM142.9 437c18.7-18.7 18.7-49.1 0-67.9s-49.1-18.7-67.9 0s-18.7 49.1 0 67.9s49.1 18.7 67.9 0zm0-294.2c18.7-18.7 18.7-49.1 0-67.9S93.7 56.2 75 75s-18.7 49.1 0 67.9s49.1 18.7 67.9 0zM369.1 437c18.7 18.7 49.1 18.7 67.9 0s18.7-49.1 0-67.9s-49.1-18.7-67.9 0s-18.7 49.1 0 67.9z" />
    </svg>
  );
};


export interface ProductBoxProps {
  title: string;
  asin: string;
  link: string;
  img: string;
  category: string;
  firstavailable: string;
  globalRaiting: number;
  bsrMainCat: {
    rating: number;
    mainCata: string;
  };
  bsrSubCat: {
    rating: number;
    subCata: string;
  };
  customerRating: number;
  ratingCount: number;
  featureRating: {
    accuracy: number;
    easyToUse: number;
    valueForMoney: number;
  };
  ReviewsSummary: string | undefined;
  version: SearchVersion;
}
interface GraphData {
  positive: number;
  negative: number;
  neutral: number;
}

function parseServerData(serverData: string, version: SearchVersion) {
  let counter = 0;
  const data = serverData.split("#"); // split the input string into individual text blocks
  const results = [];

  for (let i = 1; i < data.length; i++) {
    const item = data[i];
    if(item){
    const headerIndex = item.indexOf("\n");
    const header = titles[version][counter++];
    const number = item.substring(0, headerIndex).trim();
    const text = item.substring(headerIndex + 1).replace("$t", "").replace(/\*/g, "\n•").trim();

    results.push({
      number: number,
      header: header,
      text: text,
    });
  }
}

  return results;
}


//Todo: fetch data from backend and set the state
export function productTemplateData() {
  const props: ProductBoxProps = {
    title: "",
    asin: "",
    link: "",
    img: "",
    category: "",
    firstavailable: "May 20, 2019",
    bsrMainCat: {
      rating: 0,
      mainCata: "",
    },
    globalRaiting: 0,
    bsrSubCat: {
      rating: 0,
      subCata: "",
    },
    customerRating: 0,
    featureRating: {
      accuracy: 3.5,
      easyToUse: 3.0,
      valueForMoney: 3.0,
    },
    ratingCount: 0,
    ReviewsSummary: " ",
    version: "versionOne",
  };
  return props;
}
const ProductPage: React.FC<{
  asin: string;
  setAsin?: React.Dispatch<React.SetStateAction<string>>;
  ProductData: {
    title: string;
    starts: number;
    reviewsCount: number;
    ratingCount: number;
    img: string;
    version: SearchVersion;
  };
  ServerData: string;
  GraphData: string;
  ImproveData: [];
  PromptData: string;

  reSearch?: (newAsin: string) => void;
}> = ({ asin, ServerData, GraphData, ProductData, reSearch, ImproveData, PromptData }) => {
  const [props, setProps] = useState<ProductBoxProps>(productTemplateData());
  const [newAsin, setNewAsin] = useState<string>("");
  const [promptResponse, setPromptResponse] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const pageRef = useRef(null);
  const router = useRouter();
  useEffect(() => {
    try {
      const data = productTemplateData();
      data.ReviewsSummary = "text";
      data.asin = asin;
      data.title = ProductData.title;
      data.customerRating = ProductData.starts;
      data.globalRaiting = ProductData.reviewsCount;
      data.ratingCount = ProductData.ratingCount;
      data.version = ProductData.version;
      // data.img = `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&MarketPlace=US&ASIN=${asin}&ServiceVersion=20070822&ID=AsinImage&WS=1&Format=AC_SL500`;
      data.img = ProductData.img;
      data.link = `https://www.amazon.com/dp/${asin}`;
      setProps(data);

      setPromptResponse(PromptData)
    } catch (error) {
      console.error(error);
    }
  }, [ProductData, asin, PromptData]);

  const { dataArray, dateArray, totalReviews, totalReviewsPercentages } =
    useMemo(() => {
      const dataArray = parseServerData(ServerData, props.version);
      console.log("dataArray", ServerData);
      const jsonObject = JSON.parse(GraphData);
      const graphDataJson = JSON.parse(jsonObject[0]);
      const dateArray = graphDataJson.filter((obj: { date: any }) => obj.date);
      const totalReviews: GraphData = graphDataJson.find(
        (obj: { info: string }) => obj.info === "total"
      );
      const totalReviewsPercentages: GraphData = graphDataJson.find(
        (obj: { info: string }) => obj.info === "total_percentages"
      );

      return {
        dataArray,
        dateArray,
        totalReviews,
        totalReviewsPercentages,
      };
    }, [GraphData, ServerData, props.version]);

    const handleDownloadPDF = () => {
      const input = document.getElementById("pdf-content");
      if (!input) return;
    
      const pdf = new jsPDF("p", "mm", "a4",true);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      let pdfHeight = pdf.internal.pageSize.getHeight();
      const pageNumber = 1;
    
      const printContent = (content: HTMLElement) => {
        html2canvas(content, { scale: 1 })
        .then((canvas: any) => {
            const imgData = canvas.toDataURL("image/png");
            // const contentHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.rect(0, 0, pdfWidth, pdfHeight, "F");
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight,'FAST');
            
            const productImg = new Image();
            productImg.src = ProductData.img;
            productImg.onload = () => {
              pdf.addImage(
                productImg,
                "JPG",
                7, // Set the X position to 10mm from the left edge
                3, // Set the Y position to 10mm from the top edge
                10, 
                11 
              );
            };

            const logo = new Image();
            logo.onload = () => {
              pdf.addImage(
                logo,
                "JPG",
                ((pdfWidth - 15) / 2)+20, // Set the X position from the left edge
                11, // Set the Y position from the top edge
                19, // Set the width 
                11 // Set the height
              );
              //add rect on top of the logo
              pdf.link(((pdfWidth - 15) / 2)+20,13,9,11,{url:'https://geenie-rating.vercel.app'});
              pdf.setFontSize(10);
              pdf.setTextColor(255, 255, 255);
              //change font type
              pdf.setFont("poppins");
              pdf.text("The report made by", ((pdfWidth - 15) / 2)+10, 13);

              if (pageNumber < pdf.getNumberOfPages()) {
                pdf.addPage();
                pdfHeight = pdf.internal.pageSize.getHeight();
                pdf.rect(0, 0, pdfWidth, pdfHeight, "F");
                printContent(content);
              } else {
                pdf.save(
                  `Geenie.ai - ${asin} - ${new Date().toLocaleDateString()}.pdf`
                );
              }
            };
            logo.src = "/geenie.png";
          })
          .catch((error: any) => console.error(error));
      };
    
      printContent(input);
    };

  const handleDownloadxls = useCallback(() => {
    /* create a worksheet */
    const ws = XLSX.utils.json_to_sheet([
      {
        ASIN: props.asin,
        Link: props.link,
        Image: props.img,
        Title: props.title,
        "Customer Rating": props.customerRating,
        "Global Rating": props.globalRaiting,
        "Rating Count": props.ratingCount,
        "Topics sentiment analysis": `${totalReviews.positive} positive, ${totalReviews.negative} negative, ${totalReviews.neutral} neutral`,
        "Distribution of sentiments": `${totalReviewsPercentages.positive}% positive, \n ${totalReviewsPercentages.negative}% negative, \n ${totalReviewsPercentages.neutral}% neutral \n`,
        "Sentiment by months": dateArray
          .map(
            (d: {
              date: string;
              positive: string;
              negative: string;
              neutral: string;
            }) => `${d.date} - ${d.positive}%, ${d.negative}%, ${d.neutral}% `
          )
          .join("\n"),
        ...dataArray.reduce((obj: any, d: any) => {
          obj[d.header] = d.text;
          return obj;
        }, {}),
      },
    ]);
    ws["!cols"] = [
      { width: 20 },
      { width: 40 },
      { width: 40 },
      { width: 40 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 40 },
      { width: 40 },
      { width: 40 },
      { width: 40 },
      { width: 40 },
      { width: 40 },
      { width: 40 },
      { width: 40 },
      { width: 40 },
      { width: 40 },
      { width: 40 },
      { width: 40 },
      { width: 40 },
      { width: 40 },
    ];


    /* create a workbook and add the worksheet */
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${props.asin} - Analysis`);

    /* save to file */
    XLSX.writeFile(
      wb,
      `Geenie.ai - ${props.asin} - ${new Date().toLocaleDateString()}.xlsx`,
      { bookSST: true }
    );
  }, [
    dataArray,
    dateArray,
    props.asin,
    props.customerRating,
    props.globalRaiting,
    props.img,
    props.link,
    props.ratingCount,
    props.title,
    totalReviews.negative,
    totalReviews.neutral,
    totalReviews.positive,
    totalReviewsPercentages.negative,
    totalReviewsPercentages.neutral,
    totalReviewsPercentages.positive,
  ]);

  const handleSubmitPrompt = () => {
    if(prompt == '' && promptResponse == "Waiting") return;

    window.parent.postMessage({from:'nextjs', type:'prompt', prompt: prompt}, "*");
    setPromptResponse("Waiting")
  }
  // console.log("::: ", ImproveData);
  // alert(JSON.stringify({ImproveData}));

    return (
      <div className="w-full bg-[#1D1C27] mt-[50px] ml-[16px] mr-[16px]">        
        <div ref={pageRef} id="pdf-content" className="bg-[#1D1C27] ml-[16px] mr-[16px]">
        {props ? <ProductBox {...props} /> : "Loading..."}
        <div className="flex justify-between mt-1">
          <div className="text-[20px] text-white mb-[5px]">
          Product Improvements
          </div>
          {/* { ImproveData.length == 0 ? (<Spinner sm/>) : null } */}
        </div>
        <div>
          {
            ImproveData.length > 0 ? (ImproveData.map((data) => { return <><ProductImproveItem asin={asin} title={(data as any).title} question={(data as any).question} answer={(data as any).answer}/></> })) :
            // (
            //   <>
            //   <ProductImproveItem asin={asin} answer="" title="🌟Top Negative Keywords and Phrases" question=""/>
            //   <ProductImproveItem asin={asin} answer="" title="🌟Top Positive Keywords and Phrases" question=""/>
            //   <ProductImproveItem asin={asin} answer="" title="🌟Product Features Requests" question=""/>
            //   <ProductImproveItem asin={asin} answer="" title="🌟New Variation Recommendations" question=""/>
            //   <ProductImproveItem asin={asin} answer="" title="🌟Bundle opportunities" question=""/>
            //   </>
            // )
            null
          }
        </div>
        <div/>
        <div className="flex justify-between mt-1">
          <div className="text-[20px] text-white mb-[5px]">
          Ask your own questions
          </div>
        </div>
        {/* { ImproveData.length > 0 ? ( */}
          <div className="m-auto flex">
            <div className="w-full">
              <div className="box mt-1 rounded-lg bg-[#2B2939] ">
                <div className="flex justify-between text-left px-4 py-2 gap-1">
                  <input
                    type="text"
                    placeholder="What would like you know?"
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyUp={(e) => {if (e.code === "Enter") { e.preventDefault(); handleSubmitPrompt(); }}}
                    className="w-full p-1 bg-inherit border-inherit text-[15px] text-white focus:border-0"
                  />
                  {/* <Spinner sm /> */}
                  <button className="fill-gray-300" onClick={() => { handleSubmitPrompt() }}>
                      {promptResponse == "Waiting" ? <IconLoadingSend /> : null }
                  </button>
                </div>
                { (promptResponse != "Waiting" && promptResponse != "" ) ?
                (
                    <p className="text-[13px] text-white px-4 pb-2">
                        {/* {answer.replace(/\n/g, '<br>')} */}
                        { promptResponse }
                    </p>
                ) : null
                }                
              </div>
              
            </div>
          </div>
        {/* ) : null } */}  
        <div className="flex justify-center justify-between mt-4" >
          <div className="text-[24px] font-bold text-white">
            Analysis of customer reviews
          </div>
          {/* <a target="_blank" href="https://twitter.com/" rel="noopener noreferrer"></a> */}
          <a target="_blank" rel="noreferrer" href={`https://reviews.geenie.ai/?asin=${props.asin}`} className="text-[#FFAF12] underline text-center">See full link</a>
        </div>              
        <div className="flex justify-left mt-1">
          <div className="text-[20px] text-white mb-[5px]">
          Sentiment analysis
          </div>
        </div>
      <ChartsPage
        dateArray={dateArray}
        totalReviewsPercentages={totalReviewsPercentages as any}
        totalReviews={totalReviews as any}
      />
      {/* <div className="flex text-white">
        <h2
          className="float-left ml-12 pt-8 text-[21px] font-semibold text-white"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {" "}
          AI-enhanced analysis of the reviews
        </h2>
      </div>
      <div
        className='"grid gap-4" relative mb-10 ml-12 flex w-11/12 grid-cols-2 rounded-lg border border-gray-400 p-4 text-white shadow-sm'
        style={{ left: "10px", top: "55px" }}
      >
        {dataArray.length === 0 ? (
          <p>
            Reviewsify is at capacity right now. I apologize, but our server is
            currently at capacity and unable to process your request at this
            time. Please try again later or contact our support team for further
            assistance. Thank you for your patience and understanding.
          </p>
        ) : (
          <CardList data={dataArray} version={props.version} />
          )}
      </div> */}
      <div id="last-div">
        <p>.</p>
      </div>
      </div>
    </div>
    );
  // } catch (error) {
  //   console.error(error);
  //   return (
  //     <div className="flex items-center justify-center">
  //       <h2>Fail to get data from server</h2>
  //     </div>
  //   );
  // }
};

export default ProductPage;
