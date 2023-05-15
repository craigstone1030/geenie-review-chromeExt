export interface Review {
  text: string;
  value: number;
}

export interface PositiveNegetiveReviews {
  positive: Review[];
  negative: Review[];
  natural: Review[];
}

export function extractReviews(input: string) {
  const reviewsRegex =
    /(Positive|Negative|Natural):\s*\n((?:.*\(\d+%?\)\n?)*)/g;
  const percentRegex = /(\d+)%?/;
  const reviews: PositiveNegetiveReviews = {
    positive: [],
    negative: [],
    natural: [],
  };
  let match;

  while ((match = reviewsRegex.exec(input))) {
    const [, type, data] = match;
    const lines = data?.trim().split("\n");
    const list = lines?.map((line) => {
      const [text, percent] = line.split("(");
      if (typeof percent === "string") {
        // Save the data in the store
        const value = parseInt(percentRegex.exec(percent)?.[1] ?? "0");
        return { text: text?.trim() ?? "", value };
      } else {
        return { text: text?.trim() ?? "", value: -999 };
      }
    });

    switch (type) {
      case "Positive":
        reviews.positive = list ?? [];
        break;
      case "Negative":
        reviews.negative = list ?? [];
        break;
      case "Natural":
        reviews.natural = list ?? [];
        break;
    }
  }

  return reviews;
}
