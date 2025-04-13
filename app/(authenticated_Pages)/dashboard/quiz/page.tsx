import QuizContainer from "@/components/quiz/QuizContainer";

type Props = {
  params: { id: string };
};

export default function QuizPage({ params }: Props) {
  const { id } = params;

  return (
    <div className="min-h-screen mt-14 bg-black text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 mt-10 text-center text-lime-400">
          Quiz for Resource: {id}
        </h1>
        <QuizContainer />
      </div>
    </div>
  );
}
