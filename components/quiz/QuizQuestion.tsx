type Props = {
    question: string;
    options: string[];
    selected: string | null;
    setSelected: (value: string) => void;
  };
  
  export default function QuizQuestion({
    question,
    options,
    selected,
    setSelected,
  }: Props) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">{question}</h2>
        <div className="space-y-3">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => setSelected(opt)}
              className={`p-3 rounded cursor-pointer border ${
                selected === opt
                  ? "bg-lime-400 text-black font-bold"
                  : "border-white/10 bg-zinc-800 hover:bg-zinc-700"
              }`}
            >
              {opt}
            </div>
          ))}
        </div>
      </div>
    );
  }
  