/* eslint-disable @typescript-eslint/no-explicit-any */
import parse from "node-html-parser";
import { COOKIE } from "./constants";
import axios from "axios";
import fs from "fs/promises";
import { MIN_REVIEWS } from "~/utils/shared";

export type IReview = {
  rating: string | undefined;
  title_review: string | undefined;
  date: string | undefined;
  customer_review: string | undefined;
  verified: boolean;
  customer_name: string | undefined;
};

export type TProductInfo = {
  ratingCount: number;
  title: string | undefined;
  stars: number;
  reviewsCount: number;
  img?: string;
};

export async function getReviews(
  asin: string
): Promise<[IReview[], TProductInfo | undefined]> {
  const pagesNum = MIN_REVIEWS / 10;
  const now = Date.now();
  let prodInfo: TProductInfo | undefined;
  console.log(`getting ${pagesNum} pages ${now.toString()}`);
  const act = async (i: number) => {
    const p = i + 1;
    console.log(`getting page ${p}`);
    const re = await getReview(asin, p, prodInfo);
    prodInfo = re.productInfo;
    console.log(`got page ${p} with ${re.reviews.length} reviews`);
    return re.reviews;
  };
  const reqPerBatch = 4;
  const res = (
    await Promise.all(
      new Array(Math.ceil(pagesNum / reqPerBatch))
        .fill(null)
        .map(async (_, i) => {
          return await Promise.all(
            new Array(reqPerBatch).fill(null).map(async (_, j) => {
              return await act(i * reqPerBatch + j);
            })
          );
        })
    )
  ).flat(2);
  console.log(`got ${res.length} reviews in ${Date.now() - now}ms`);
  return [res, prodInfo];
}

// @fix: currently byFeature is an empty array
export async function getProductInfo(asin: string) {
  const res = await axios.get(`https://www.amazon.com/dp/${asin}`, {
    headers: {
      cookie: COOKIE,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
    },
  });
  const $ = parse(res.data ?? "");
  const title = $.querySelector("#productTitle")?.innerText.trim();
  const rating = parseInt(
    $.querySelector("#acrCustomerReviewText")
      ?.innerText.trim()
      .replace(/[^0-9]/g, "") ?? "0"
  );
  const outOf = $.querySelector(
    `span[data-hook="rating-out-of-text"]`
  )?.innerText.trim();
  const byFeature = $.querySelectorAll(
    `div[data-hook="cr-summarization-attribute"]`
  );
  console.log(!!byFeature, byFeature.length);
  const valueForMoney = byFeature[0]?.querySelector("span")?.innerText.trim();
  await fs.writeFile("test.html", res.data ?? "", "utf-8");
  return {
    title,
    rating,
    outOf,
    valueForMoney,
  };
}

export async function getReview(
  asin: string,
  page = 1,
  productInfo?: TProductInfo | undefined
): Promise<{
  reviews: IReview[];
  productInfo: TProductInfo | undefined;
}> {
  const url = `https://www.amazon.com/product-reviews/${asin}/ref=cm_cr_getr_d_paging_btm_next_3?ie=UTF8&reviewerType=all_reviews&sortBy=recent&pageNumber${page}&pageNumber=${page}`;
  try {
    const res = await axios.get(url, {
      headers: {
        cookie: COOKIE,
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
      },
    });
    const $ = parse(res.data ?? "");
    let newProdInfo = productInfo;
    if (!newProdInfo) {
      const tempRatingCount = $.querySelector(
        `div[data-hook="cr-filter-info-review-rating-count"]`
      )?.innerText.trim();
      const ratingCount = parseInt(
        tempRatingCount?.split(" ")[0]?.replace(/[^0-9]/g, "") ?? "0"
      );
      const reviewsCount = parseInt(
        tempRatingCount
          ?.split("total ratings, ")
          .pop()
          ?.replace(/[^0-9]/g, "") ?? "0"
      );
      const title = $.querySelector(
        `a[data-hook="product-link"]`
      )?.innerText.trim();
      const tempStars = $.querySelector(
        `span[data-hook="rating-out-of-text"]`
      )?.innerText.trim();
      const stars = tempStars
        ? parseFloat(tempStars.split(" ").shift() ?? "0")
        : 0;
      const img = $.querySelector(`img[data-hook="cr-product-image"]`)
        ?.getAttribute("src")
        ?.trim();
      newProdInfo = { ratingCount, title, stars, reviewsCount, img };
    }
    const reviews = $.querySelectorAll(".a-section.review.aok-relative");
    const reviewData = reviews.map((review) => {
      const rating = review.querySelector(".a-icon-alt")?.text;
      const title = review.querySelector(".review-title")?.text;
      const date = review.querySelector(".review-date")?.text;
      const customer_review = review.querySelector(".review-text")?.text;
      const verified = review.querySelector(".a-declarative") ? true : false;
      const name = review.querySelector(".a-profile-name")?.text;
      return {
        rating: rating?.trim(),
        title_review: title?.trim(),
        date: date?.trim(),
        customer_review: customer_review
          ?.trim()
          .startsWith("The media could not be loaded.")
          ? "No Media"
          : customer_review?.trim(),
        verified: verified,
        customer_name: name?.trim(),
      };
    });
    // console.log({
    //   len: reviewData.length,
    //   all: allReviews.length < MIN_REVIEWS,
    //   condition: allReviews.length < MIN_REVIEWS && reviewData.length > 0,
    // });

    return {
      reviews: reviewData,
      productInfo: newProdInfo,
    };
  } catch (e) {
    console.log("err", e);
    return {
      reviews: [],
      productInfo,
    };
  }
}
