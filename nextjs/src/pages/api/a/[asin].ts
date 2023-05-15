/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextApiRequest, type NextApiResponse } from "next";
import type { IReview } from "~/server/api/routers/info/reviews";
import { getFileId, getGoogleDrive } from "~/server/google";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { asin, prevFileId } = req.query;
  if ((!asin || typeof asin !== "string") && !prevFileId) {
    return res.status(400).json({ error: "asin is required" });
  }
  if (prevFileId && typeof prevFileId !== "string") {
    return res.status(400).json({ error: "fileId must be a string" });
  }
  const drive = getGoogleDrive();
  const fileId = prevFileId ?? (await getFileId(drive, asin as any));
  const file = await drive.files.get({
    fileId,
    alt: "media",
  });
  if (file?.data) {
    // cache for 30 days
    res.setHeader("Cache-Control", "s-maxage=2592000, stale-while-revalidate");
    return res.json(formatContent(file.data as any));
  }
  return res.status(404).json({ error: "not found" });
}

export const formatContent = (
  reviews: Array<Omit<IReview, "customer_review"> & { body: string }>
) => {
  try {
    const formattedReviews = reviews.map((review: any) => {
      const newContent = {
        ...review,
        customer_review: review.customer_review ?? review.body,
        title_review: review.title_review ?? review.title,
        customer_name: review.customer_name ?? review.name,
      };
      if (newContent.body) {
        delete (newContent as Partial<typeof newContent>).body;
      }
      if (newContent.title) {
        delete (newContent as Partial<typeof newContent>).title;
      }
      if (newContent.name) {
        delete (newContent as Partial<typeof newContent>).name;
      }
      return newContent;
    });
    return formattedReviews;
  } catch {
    return reviews;
  }
};
