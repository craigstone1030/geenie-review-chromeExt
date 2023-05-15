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

  reSearch?: (newAsin: string) => void;
}> = ({ asin, ServerData, GraphData, ProductData, reSearch, ImproveData }) => {
  const [props, setProps] = useState<ProductBoxProps>(productTemplateData());
  const [newAsin, setNewAsin] = useState<string>("");
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
    } catch (error) {
      console.error(error);
    }
  }, [ProductData, asin]);

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

  // console.log("::: ", ImproveData);
  // alert(JSON.stringify({ImproveData}));

    return (
      <div className="w-full bg-[#1D1C27] mt-[50px] ml-[16px] mr-[16px]">
        <div ref={pageRef} id="pdf-content" className="bg-[#1D1C27] ml-[16px] mr-[16px]">
        {props ? <ProductBox {...props} /> : "Loading..."}
        <div className="flex justify-center justify-between mt-4">
          <div className="text-[24px] font-bold text-white">
            Analysis of customer reviews
          </div>
          <a className="text-[#FFAF12] underline text-center">See full link</a>
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
        <div className="flex justify-between mt-1">
          <div className="text-[20px] text-white mb-[5px]">
          Product Improvements
          </div>
          { ImproveData.length == 0 ? (<Spinner sm/>) : null }
        </div>
        {ImproveData.map((data) => { return <><ProductImproveItem asin={asin} title={(data as any).title} question={(data as any).question} answer={(data as any).answer}/></> })}
        <div/>
        {/* <ProductImproveItem asin={asin} title="🌟Top Negative Keywords and Phrases:" question="Please provide a 5-7 bullet-point list of the most frequently mentioned negative keywords and phrases in the customer reviews, indicating areas for improvement. Include relevant quotations or snippets from the reviews to illustrate each point. Additionally, include an estimated hit rate in percentage (no more than 60%) for each topic, representing how often it appears in the reviews."/>
        <ProductImproveItem asin={asin} title="🌟Top Negative Keywords and Phrases:" question="Please provide a 5-7 bullet-point list of the most frequently mentioned negative keywords and phrases in the customer reviews, indicating areas for improvement. Include relevant quotations or snippets from the reviews to illustrate each point. Additionally, include an estimated hit rate in percentage (no more than 60%) for each topic, representing how often it appears in the reviews."/>
        <ProductImproveItem asin={asin} title="🌟Top Negative Keywords and Phrases:" question="Please provide a 5-7 bullet-point list of the most frequently mentioned negative keywords and phrases in the customer reviews, indicating areas for improvement. Include relevant quotations or snippets from the reviews to illustrate each point. Additionally, include an estimated hit rate in percentage (no more than 60%) for each topic, representing how often it appears in the reviews."/>
        <ProductImproveItem asin={asin} title="🌟Top Negative Keywords and Phrases:" question="Please provide a 5-7 bullet-point list of the most frequently mentioned negative keywords and phrases in the customer reviews, indicating areas for improvement. Include relevant quotations or snippets from the reviews to illustrate each point. Additionally, include an estimated hit rate in percentage (no more than 60%) for each topic, representing how often it appears in the reviews."/>
        <ProductImproveItem asin={asin} title="🌟Top Negative Keywords and Phrases:" question="Please provide a 5-7 bullet-point list of the most frequently mentioned negative keywords and phrases in the customer reviews, indicating areas for improvement. Include relevant quotations or snippets from the reviews to illustrate each point. Additionally, include an estimated hit rate in percentage (no more than 60%) for each topic, representing how often it appears in the reviews."/>
        <ProductImproveItem asin={asin} title="🌟Top Negative Keywords and Phrases:" question="Please provide a 5-7 bullet-point list of the most frequently mentioned negative keywords and phrases in the customer reviews, indicating areas for improvement. Include relevant quotations or snippets from the reviews to illustrate each point. Additionally, include an estimated hit rate in percentage (no more than 60%) for each topic, representing how often it appears in the reviews."/> */}

        <div className="flex justify-between mt-1">
          <div className="text-[20px] text-white mb-[5px]">
          Ask your own questions
          </div>
          { ImproveData.length == 0 ? (<Spinner sm/>) : null }
        </div>
        { ImproveData.length > 0 ? (
          <div className="box mt-[1vw] rounded-lg bg-[#2B2939] p-4" onClick={()=> { window.parent.postMessage({from:'nextjs', type:'openChatAIView'}, "*")}}>
          <div className="m-auto flex">
            <div className="w-full">
              <div className="mb-[6px] flex text-left">
                <h2 className="text-[15px] text-white ">
                What Would you like to know ?
                </h2>
              </div>
            </div>
          </div>
        </div>
        ) : null }
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
