import { createTRPCRouter } from "../../trpc";
import updateQuestion from "./updateQuestion";
import getAllQuestions from "./getAllQuestions";
import createQuestion from "./createQuestion";

export default createTRPCRouter({
  updateQuestion,
  getAllQuestions,
  createQuestion,
});
