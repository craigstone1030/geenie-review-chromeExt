import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import type { Review } from "./ReviewsTextAnalysis";

export interface ReviewsChartProps {
  reviews: Review[];
}

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const NegativeReviewsChart: React.FC<ReviewsChartProps> = ({ reviews }) => {
  const series = useMemo(() => {
    const categories = reviews.map((item) => item.text);
    return {
      list: reviews.map((item) => item.value),
      options: {
        plotOptions: {
          bar: {
            horizontal: true,
            borderRadius: 10,
          },
        },
        xaxis: {
          categories: categories,
          labels: {
            formatter: (val: string) => `${val}%`,
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val: number) => `${val}%`,
        },
        colors: ["#A71515"], // set all bars to the same color
        fill: {
          type: "gradient",
          gradient: {
            shade: "dark",
            gradientToColors: ["#A71515A6"],
            shadeIntensity: 1,
            type: "horizontal",
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100, 100, 100],
          },
        },
      },
    };
  }, [reviews]);

  return (
    <Chart
      width={800}
      type="bar"
      options={series.options}
      series={series.list}
    />
  );
};

export default NegativeReviewsChart;
