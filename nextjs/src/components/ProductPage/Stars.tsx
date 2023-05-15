interface IStarsProps {
  rating: number;
  outOf: number;
  totalReviews?: number | null;
  large?: boolean;
  small?: boolean;
  px?: boolean;
}

const Stars = ({
  rating,
  outOf,
  large = false,
  small = false,
  px = false,
}: IStarsProps) => {
  const filledStars = Math.floor(rating);
  const decimalStars = rating - filledStars;
  const emptyStars = Math.floor(outOf - rating);

  const filledStarElements = Array.from({ length: filledStars }).map(
    (_, index) => (
      <Star
        key={`filled-star-${index}`}
        styles={large ? "h-5 w-5" : "h-3 w-3"}
      />
    )
  );

  const decimalStarElement = decimalStars > 0 && (
    <ClippedStar styles={large ? "h-5 w-5" : "h-3 w-3"} rating={decimalStars} />
  );

  const emptyStarElements = Array.from({ length: emptyStars }).map(
    (_, index) => (
      <Star
        key={`empty-star-${index}`}
        fill="fill-white"
        styles={`${large ? "h-5 w-5" : "h-3 w-3"}`}
      />
    )
  );

  const starElements = [
    ...filledStarElements,
    decimalStarElement,
    ...emptyStarElements,
  ];

  return (
    <div
      className={`flex items-center gap-2 ${large ? "flex-col" : "flex-row"} ${
        small || px ? "px-4" : ""
      }`}
    >
      <div className="flex items-center gap-2">{starElements}</div>
      <span
        className={`font-Nunito ${
          large ? "text-lg" : "text-sm"
        } font-semibold text-white`}
      >
        {rating.toFixed(1)} {large ? "out of" : "/"} {outOf}
      </span>
    </div>
  );
};

export default Stars;

const Star = ({
  styles,
  fill = undefined,
  noBorder = false,
}: {
  styles: string;
  fill?: string;
  noBorder?: boolean;
}) => (
  <svg
    className={styles}
    viewBox="0 0 14 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 0L8.5716 4.83688H13.6574L9.5429 7.82624L11.1145 12.6631L7 9.67376L2.8855 12.6631L4.4571 7.82624L0.342604 4.83688H5.4284L7 0Z"
      className={fill ?? "fill-[#FFC701]"}
      stroke={noBorder ? undefined : "#FF9900"}
    />
  </svg>
);

const ClippedStar = ({
  styles,
  rating,
}: {
  styles: string;
  rating: number;
}) => {
  const st = rating >= 5 ? 5 : rating;
  return (
    <svg
      className={styles}
      viewBox="0 0 14 13"
      fill="none"
      stroke="#FF9900"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 0L8.5716 4.83688H13.6574L9.5429 7.82624L11.1145 12.6631L7 9.67376L2.8855 12.6631L4.4571 7.82624L0.342604 4.83688H5.4284L7 0Z"
        className="fill-white"
      />
      <path
        style={{
          clipPath: `inset(0 ${100 - st * 100}% 0 0)`,
        }}
        d="M7 0L8.5716 4.83688H13.6574L9.5429 7.82624L11.1145 12.6631L7 9.67376L2.8855 12.6631L4.4571 7.82624L0.342604 4.83688H5.4284L7 0Z"
        className="fill-[#FFC701]"
      />
    </svg>
  );
};
