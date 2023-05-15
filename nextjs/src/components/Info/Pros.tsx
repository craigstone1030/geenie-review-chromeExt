import Image from "next/image";

const Pros: React.FC = () => {
  return (
    <div className="mt-32 flex flex-col items-center gap-8">
      <h1 className="text-3xl font-bold text-white">
        Find out what the pros think
      </h1>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {ProList.map((pro, idx) => {
          return (
            <div
              key={idx}
              className="geenieShadow m-4 flex h-[280px] w-[20vw] flex-col gap-4 rounded-[13px] py-2 px-5"
            >
              <Image width={150} height={150} src="/stars.png" alt="Stars" />
              <p className="text-sm text-white line-clamp-[8]">{pro.text}</p>
              <span className="mt-auto mb-3 text-lg font-semibold text-white">
                {pro.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pros;

const ProList = [
  {
    text: "Finding new products to sell on Amazon is like looking for a needle in a haystack - it can seem almost impossible, but you know it’s there if you look hard enough. Your genius tool allowed me to get all the data I wanted in one click and decide whether or not to sell this product",
    name: "Limor Ovadya",
  },
  {
    text: "I recently started using Geenie.ai for my Amazon PL and it has been a game changer. The tool easily finds profitable products for me to sell, saving me a lot of time and effort in product research, products that would be difficult for me to find otherwise",
    name: "Ethan Johnson",
  },
  {
    text: "My sales as an Amazon seller have increased significantly due to Geenie's ability to identify profitable products that are unique with a high ROI",
    name: "Matthew Garcia",
  },
  {
    text: "As an Amazon seller, Geenie.ai has helped me explore new niches by identifying profitable products for me to launch, saving me time and effort in product research that would not be possible otherwise",
    name: "Ryan Taylor",
  },
];
