import type { SearchVersion } from "@prisma/client";
import Card from "./Card";

export interface CardData {
    number: string;
    header: string | undefined;
    text: string;
}

export interface CardListProps {
    data: CardData[];
    version: "versionOne";
}

export const titles: {
    [K in SearchVersion]: string[];
} = {
    versionOne: [
        "Overall Insights Summary:",
        "Top Negative Keywords and Phrases:",
        "Top Positive Keywords and Phrases:",
        "Buyer Motivation Analysis:",
        "Customer Expectation Analysis:",
        "Target Audience Suggestions:",
        "Feature Requests:",
        "Recommendation for Product Bundling:",
        "Guidelines for gallery design:",
    ],
};

const tooltipText = [
    "A brief overview of the most important findings and trends from customer reviews.",
    "Frequently mentioned negative aspects from customer reviews that indicate areas for improvement.",
    "Frequently mentioned positive aspects from customer reviews that highlight the product's strengths.",
    "An investigation of the primary factors that influence customers to purchase the product based on their reviews.",
    "An examination of the expectations customers have for the product and identification of areas where these expectations are not met.",
    "A comparison of sentiment analysis results across different demographic groups and target audiences to better understand customer perceptions.",
    "A list of frequently requested product features or improvements that customers have mentioned in their reviews.",
    "A set of recommended keywords for Amazon advertising campaigns based on the most relevant terms from customer reviews.",
    "Suggestions for product bundling strategies that take into account customer preferences and feedback from reviews.",
    "Recommendations for designing the first two product images with a focus on the most important information and features to emphasize based on customer feedback.",
];

const CardList: React.FC<CardListProps> = ({ data, version }) => {
    return (
        <div className="flex flex-wrap items-center justify-center gap-8">
            {data.map((CardInfo: CardData, index: number) => {
                return (
                    <Card
                        key={index}
                        number={CardInfo.number}
                        text={CardInfo.text}
                        title={titles[version][index]}
                        tooltip={tooltipText[index]}
                    />
                );
            })}
        </div>
    );
};

export default CardList;
