import { createTRPCRouter } from "../../trpc";
import createPayment from "./createPayment";
import getAll from "./getAll";
import getPaymentInfo from "./getPaymentInfo";

export default createTRPCRouter({ getAll, createPayment, getPaymentInfo });
