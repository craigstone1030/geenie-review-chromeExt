import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Spinner } from "~/components";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  if (session?.user.role !== "ADMIN") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: {
      session,
    },
  };
};
const Question: NextPage = () => {
  const allQuestions = api.questions.getAllQuestions.useQuery();
  const [create, setCreate] = useState(false);
  return (
    <>
      <Head>
        <title>Reviewsify - Questions</title>
      </Head>
      <main className="mt-6 flex flex-col items-center justify-center gap-8">
        {allQuestions.isLoading ? (
          <Spinner />
        ) : (
          <>
            <button
              className="h-12  w-12 rounded-lg bg-[#2B2939] text-xl font-bold text-white"
              onClick={() => setCreate((prev) => !prev)}
            >
              {create ? "X" : "+"}
            </button>
            {create ? (
              <CreateQuestion onSuccess={() => setCreate(false)} />
            ) : null}
            {allQuestions.data?.map((question) => {
              return <SingleQuestion {...question} key={question.id} />;
            })}
          </>
        )}
      </main>
    </>
  );
};

export default Question;

const CreateQuestion: React.FC<{
  onSuccess?: () => void;
}> = ({ onSuccess }) => {
  const [question, setQuestion] = useState("");
  const [isMain, setIsMain] = useState(false);
  const [isChunks, setIsChunks] = useState(false);
  const [order, setOrder] = useState(0);
  const ctx = api.useContext();
  const createQuestion = api.questions.createQuestion.useMutation({
    onSuccess: () => {
      void ctx.questions.getAllQuestions.invalidate();
      void onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  return (
    <div className="my-2 flex flex-col items-center gap-1 rounded-lg border border-white bg-[#2B2939] p-2.5">
      <h1 className="text-xl font-bold text-white">Create question</h1>
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-bold text-white">Is Main question</h3>
        <input
          type="checkbox"
          checked={isMain}
          onChange={() => setIsMain(!isMain)}
        />
      </div>
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-bold text-white">Is Chunks</h3>
        <input
          type="checkbox"
          checked={isChunks}
          onChange={() => setIsChunks((prev) => !prev)}
        />
      </div>
      <textarea
        className="h-[10rem] w-[70vw] rounded-md border border-grayish p-2.5 font-Montserrat text-blackish placeholder:text-grayish focus:outline-none sm:w-[40rem]"
        value={question}
        onChange={(e) => setQuestion(e.currentTarget.value)}
      />
      <h1 className="text-xl font-bold text-white">Order</h1>
      <input
        type="number"
        value={order}
        className="h-[40px] w-[70vw] rounded-md border border-grayish p-2.5 font-Montserrat text-blackish placeholder:text-grayish focus:outline-none sm:w-[40rem]"
        onChange={(e) => setOrder(Number(e.currentTarget.value))}
      />
      <button
        onClick={() => {
          createQuestion.mutate({
            question,
            main: isMain,
            order,
            isChunks,
          });
        }}
        className={`shadowStuff flex h-[40px] w-[130px] items-center justify-center gap-2 rounded-lg bg-blue ${
          createQuestion.isLoading ? "text-sm" : "text-lg"
        } font-bold text-white`}
      >
        Create {createQuestion.isLoading ? <Spinner sm /> : null}
      </button>
    </div>
  );
};

const SingleQuestion: React.FC<{
  id: string;
  main: boolean;
  question: string;
  order: number;
  include: boolean;
  isChunks: boolean;
}> = ({
  id,
  main,
  question,
  order: prevOrder,
  include: prevInclude,
  isChunks: prevIsChunks,
}) => {
  const [newQuestion, setNewQuestion] = useState(question);
  const [isMain, setIsMain] = useState(main);
  const [include, setInclude] = useState(prevInclude);
  const [order, setOrder] = useState(prevOrder);
  const [isChunks, setIsChunks] = useState(prevIsChunks);
  const ctx = api.useContext();
  const updateQuestion = api.questions.updateQuestion.useMutation({
    onSuccess: () => {
      void ctx.questions.getAllQuestions.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  return (
    <div className="my-2 flex flex-col items-center gap-1 rounded-lg border border-white bg-[#2B2939] p-2.5">
      <h1 className="text-xl font-bold text-white">Update question {id}</h1>
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-bold text-white">Is Main question</h3>
        <input
          type="checkbox"
          checked={isMain}
          onChange={() => setIsMain((prev) => !prev)}
        />
      </div>
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-bold text-white">Is Chunks</h3>
        <input
          type="checkbox"
          checked={isChunks}
          onChange={() => setIsChunks((prev) => !prev)}
        />
      </div>
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-bold text-white">Should Be Included</h3>
        <input
          type="checkbox"
          checked={include}
          onChange={() => setInclude((prev) => !prev)}
        />
      </div>
      <textarea
        className="h-[10rem] w-[70vw] rounded-md border border-grayish p-2.5 font-Montserrat text-blackish placeholder:text-grayish focus:outline-none sm:w-[40rem]"
        value={newQuestion}
        onChange={(e) => setNewQuestion(e.currentTarget.value)}
      />
      <h1 className="text-xl font-bold text-white">Order</h1>
      <input
        type="number"
        value={order}
        className="h-[40px] w-[70vw] rounded-md border border-grayish p-2.5 font-Montserrat text-blackish placeholder:text-grayish focus:outline-none sm:w-[40rem]"
        onChange={(e) => setOrder(Number(e.currentTarget.value))}
      />
      <button
        onClick={() => {
          updateQuestion.mutate({
            question: newQuestion,
            main: isMain,
            id,
            order,
            include,
            isChunks,
          });
        }}
        className={`shadowStuff flex h-[40px] w-[130px] items-center justify-center gap-2 rounded-lg bg-blue ${
          updateQuestion.isLoading ? "text-sm" : "text-lg"
        } font-bold text-white`}
      >
        Update {updateQuestion.isLoading ? <Spinner sm /> : null}
      </button>
    </div>
  );
};
