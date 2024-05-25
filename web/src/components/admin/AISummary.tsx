import SummaryAnalyzer from "./SummaryAnalyzer";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Button } from "../ui/button";
import { ActiveSocketState, Summary, SummaryState } from "@/store";

const AISummary = ({ id }: { id: string }) => {
  const socket = useRecoilValue(ActiveSocketState);

  const [summary, setSummary] = useRecoilState(SummaryState);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getSummary = async () => {
      const response = await fetch(`/api/admin/rooms/summary`, {
        method: "POST",
        body: JSON.stringify({ id }),
        cache: "no-cache",
      });
      if (!response.ok) {
        return;
      } else {
        const data = await response.json();
        if (!data || !data.data) return;

        setSummary(
          data.data.map((d: { summary: string; createdAt: Date }) => ({
            summary: textToArray(d.summary),
            createdAt: new Date(d.createdAt).toLocaleString(),
          }))
        );
      }
    };
    getSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (socket) {
      socket.on("summary", (data: any) => {
        setLoading(false);
        const summaryData = textToArray(data);
        setSummary((prev) => [
          {
            summary: summaryData,
            createdAt: new Date().toLocaleString(),
          },
          ...prev,
        ]);
      });
    }
    return () => {
      if (socket) {
        socket.off("summary");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const onClick = () => {
    if (socket) {
      setLoading(true);
      socket.emit("generateSummary");
    }
  };

  return (
    <div className="h-full border-2 rounded-sm flex flex-col items-center py-4 px-2 gap-4">
      <Button disabled={loading} variant={"outline"} onClick={onClick}>
        {loading ? "Generating Summary..." : "Generate Summary"}
      </Button>
      <SummaryAnalyzer summary={summary}></SummaryAnalyzer>
    </div>
  );
};

export default AISummary;

const textToArray = (text: string) => {
  try {
    const newText = text.replace(/\n/g, "");
    const match = newText.match(/\[(.*?)\]/);
    if (!match || !match[0]) return [];
    const textArray = JSON.parse(match[0]) as string[];
    return textArray;
  } catch (e) {
    console.log(e);
    return [];
  }
};
