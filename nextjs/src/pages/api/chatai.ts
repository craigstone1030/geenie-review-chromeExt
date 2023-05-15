// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// const { Configuration, OpenAIApi, ChatCompletionRequestMessageRoleEnum } = require("openai");
import axios from 'axios';
import openai from 'openai';
import { type NextApiRequest, type NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // if method not post send this
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed!!" });
    return;
  }
  // if method post then do it
  if (req.method === "POST") {
    // req body with name is chat
    const chat = req.body.chat;
    const asin = req.body.asin;
    // if there is a chat
    if (chat) {
      const formData = new FormData();
      formData.append("prompt", chat)
      formData.append("asin", asin)

      // This is the url for chat.
      const response = await axios.post('http://ec2-52-201-118-164.compute-1.amazonaws.com:8001/api/chat', formData);
      // const response = await axios.post('http://127.0.0.1:8001/api/chat', formData);
      // console.log(response.data); 

      // if get data from openai send json
      if (response.data.response) {
        res.json(response.data.response);
        // if can't get data from openai send error
      } else {
        res.status(500).send("Oops, Something went wrong!!");
      }
      // if no chat send error not found
    } else {
      res.status(404).send("Please, write your chat!!");
    }
  }
}