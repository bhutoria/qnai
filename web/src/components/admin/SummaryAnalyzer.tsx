import { Summary } from "@/store";

const SummaryAnalyzer = ({ summary }: { summary: Summary[] }) => {
  return (
    <div className="h-[calc(100vh-270px)] flex flex-col gap-2 items-center w-full p-2 tracking-wide overflow-y-auto">
      {summary.map((s, i) => (
        <div className="w-full p-2 bg-slate-200 rounded-lg" key={i}>
          <span className="text-sm">{s.createdAt}</span>
          <div className="flex flex-col gap-1">
            {s.summary.map((ques, i) => (
              <div key={i}>{ques}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryAnalyzer;
