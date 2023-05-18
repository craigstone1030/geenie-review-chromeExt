import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AnalysisByMonthProps {
  categories: string[];
  series: {
    name: string;
    data: number[];
  }[];
}
 
function formatDate(dateString: string) {
  const [month, year] = dateString.split(".");
  if (!month || !year) {
    throw new Error("Invalid date format");
  }
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleString("en-us", { month: "long", year: "2-digit" });
}

const BarChart = ({ data }: { data: number[]; className: string }) => {
  const [chartOptions] = useState({
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 10,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: 0,
      style: {
        fontSize: "12px",
      },
    },
    xaxis: {
      categories: ["Sentiment", "Neutral Sentiment", "Negative Sentiment"],
      labels: {
        show: false,
        style: {
          fontSize: "14px",
          colors: "#FFFFFF",
        },
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "14px",
        },
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
      },
      axisTicks: {
        show: true,
        borderType: "solid",
        color: "#FFFFFF",
        width: 6,
        offsetX: 0,
        offsetY: -1,
      },
      labels: {
        style: {
          colors: "#FFFFFF",
        },
      },
    },
    fill: {
      opacity: 1,
      type: "gradient",
      gradient: {
        type: "vertical",
        shadeIntensity: 1,
        gradientToColors: ["#047C09A6", "#FEB019A6", "#A71515A6"],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [15, 50, 77],
      },
    },
    legend: {
      show: true,
      labels: {
        useSeriesColors: false,
        colors: "#FFFFFF",
      },
    },
    tooltip: {
      enabled: true,
      style: {
        fontSize: "12px",
        fontFamily: "Helvetica, Arial, sans-serif",
      },
    },
  });

  const [series] = useState({
    data: [
      {
        name: "Positive",
        data: [data[0]],
        color: "#047C09",
      },
      {
        name: "Neutral",
        data: [data[1]],
        color: "#FF9900",
      },
      {
        name: "Negative",
        data: [data[2]],
        color: "#A71515",
      },
    ].map((item) => ({
      ...item,
      data: [item.data[0] !== undefined ? item.data[0] : null],
    })),
  });

  return (
    <Chart
      className="rounded-xl bg-[#1D1C27]"
      type="bar"
      options={chartOptions}
      series={series.data}
    />
  );
};
 
const PieChart = ({ data }: { data: number[]; className: string }) => {
  const [chartOptions] = useState({
    colors: ["#047C09A6", "#FEB019A6", "#A71515A6"],
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "13px",
        colors: ["#FFFFFF"],
      },
    },
    fill: {
      opacity: 1,
      type: "gradient",
      gradient: {
        type: "vertical",
        shadeIntensity: 1,
        gradientToColors: ["#047C09", "#FF9900", "#A71515"],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [11, 53, 87],
      },
    },
    legend: {
      show: true,
      labels: {
        colors: ["#FFFFFF"],
      },
    },
    labels: ["Positive ", "Neutral ", "Negative "],
  });

  const [series, setSeries] = useState({
    data: [75, 18, 7],
  });

  useEffect(() => {
    setSeries({
      data: data.map((item: number) =>
        item !== undefined ? item : null
      ) as unknown as number[],
    });
  }, [data]);

  return (
    <Chart
      className="rounded-xl bg-[#2B2939]"
      type="pie"
      options={chartOptions}
      series={series.data}
    />
  );
};

const AnalysisByMonth = (props: AnalysisByMonthProps) => {
  const data = {
    options: {
      xaxis: {
        categories: props.categories,
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
      },
      yaxis: {
        min: 0,
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
      },
      colors: ["#047C09", "#FF9900", "#A71515"],
      fill: {
        opacity: 1,
        type: "gradient",
        gradient: {
          type: "vertical",
          shadeIntensity: 1,
          gradientToColors: ["#047C09A6", "#FEB019A6", "#A71515A6"],
          inverseColors: false,
          opacityFrom: 3,
          opacityTo: 3,
          stops: [15, 50, 77],
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 5,
          columnWidth: "70%",
          distributed: false,
        },
      },

      dataLabels: {
        enabled: false,
        showZero: true,
      },
      legend: {
        show: true,
        labels: {
          colors: ["#FFFFFF"],
          useSeriesColors: false,
        },
      },
    },

    series: props.series,
  };
  return (
    <Chart
      className="rounded-xl bg-[#2B2939]"
      options={data.options}
      series={data.series}
      type="bar"
    />
  );
};


type IStats = {
  negative: number;
  positive: number;
  date: string;
  neutral: number;
};
const ChartsPage = ({
  dateArray,
  totalReviewsPercentages,
  totalReviews,
}: {
  dateArray: IStats[];
  totalReviewsPercentages: IStats;
  totalReviews: IStats;
}) => {
  const updatedCategories = dateArray
    .map((obj) => formatDate(obj.date))
    .reverse();

    const analysisByMonthProps: AnalysisByMonthProps = useMemo(
      () => ({
        categories: updatedCategories,
        series: [
          {
            name: "Positive",
            data: dateArray.map((obj) => obj.positive).reverse(),
          },
          {
            name: "Neutral",
            data: dateArray.map((obj) => obj.neutral).reverse(),
          },
          {
            name: "Negative",
            data: dateArray.map((obj) => obj.negative).reverse(),
          },
        ],
      }),
      [updatedCategories, dateArray]
    );
  
  return (
    <div className="box mt-[1vw] rounded-lg bg-[#2B2939] p-4 blur-md">
      {/* <div className="mt-6 mb-10 ml-14 flex"></div> */} 
      <div className="m-auto flex-col">
        <div className="w-full">
          <div className="mb-[6px] flex text-left">
            <h2 className="text-[15px] text-white ">
              General sentiment
            </h2>
          </div>
          <BarChart
            className="h-[200px] w-[473px] rounded-xl bg-[#1D1C27]"
            data={[
              totalReviews.positive,
              totalReviews.neutral,
              totalReviews.negative,
            ]}
          />
          <div className="mt-[6px] flex justify-end">
            <h2 className="text-[15px] text-white underline">
              See more analyses
            </h2>
          </div>

        </div>
        <span className="h-[4vw]" />
        <div className="w-full ">
          <div className=" mb-[6px] flex text-left">
            <h2 className="text-[15px] text-white ">
              {" "}
              Distribution of sentiments
            </h2>
            {/* <button className="ml-6 items-end rounded-[8px] bg-amber-400 px-3 py-1 text-[15px]  font-medium text-white">
              {" "}
              Free{" "}
            </button> */}
          </div>
          <PieChart
            className="h-[200px] w-[473px] rounded-xl"
            data={[
              totalReviewsPercentages.positive,
              totalReviewsPercentages.neutral,
              totalReviewsPercentages.negative,
            ]}
          />
        </div>
        {/* </div> */}
        <span className="h-[4vw]" />
        <div className="w-full">
          <div className=" mb-[6px] flex text-left">
            <h2 className="text-[15px] font-semibold text-white ">
              {" "}
              Sentiment by months
            </h2>
            {/* <button className="ml-6 items-end rounded-[8px] bg-amber-400 px-3 py-1 text-[15px]  font-medium text-white">
              {" "}
              Free{" "}
            </button> */}
          </div>
          <AnalysisByMonth {...analysisByMonthProps} />
        </div>
      </div>

      {/* <div className='flex items-center justify-center mt-6 md:mb-10'>
            <h2 className='font-semibold text-[21px] md:mr-40 items-start'> Negative reviews analysis </h2>
            <div className='md:mr-40 md:ml-40' />
            <button className='bg-amber-400 px-3 py-1 font-medium text-white rounded-[8px] text-[18px] md:ml-40 items-end'> Free </button>
        </div>
        <div className='flex items-center justify-center'>
          <NegativeReviewsChart reviews={series.negative}/>
        </div>
        <div className='flex items-center justify-center md:mt-6 md:mb-10'>
            <h2 className='font-semibold text-[21px] md:mr-40 items-start'> Positive reviews analysis </h2>
            <div className='md:mr-40 md:ml-40' />
            <button className='bg-amber-400 px-3 py-1 font-medium text-white rounded-[8px] text-[18px] md:ml-40 items-end'> Free </button>
        </div>
        <div className='flex items-center justify-center mr-12'>
          <PositiveReviewsChart reviews={series.positive}/>
        </div> */}
      {/* <div className='flex items-center justify-center md:mt-6 md:mb-10'>
            <h2 className='font-semibold text-[21px] md:mr-40 items-start'> Reviews analysis by months </h2>
            <div className='md:mr-40 md:ml-40' />
            <button className='bg-amber-400 px-3 py-1 font-medium text-white rounded-[8px] text-[18px] md:ml-40 items-end'> Free </button>
        </div>
        <div className='flex items-center justify-center'>
        <AnalysisByMonth {...analysisByMonthProps} />;
        </div> */}
    </div>
  );
};


export default ChartsPage;
