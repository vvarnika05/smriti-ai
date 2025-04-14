"use client";
import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Wand2, BrainCircuit, FileQuestion, Route } from "lucide-react";
import axios from "axios";
import Mermaid from "@/components/mermaid/mermaid";
import ReactMarkdown from "react-markdown";
import prepareMermaidCode from "@/lib/prepareMermaidCode";
import Link from "next/link";

export default function ResourceChatPage({ params }: { params: any }) {
  const rawId = (use(params) as { id: string | string[] }).id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [isLoading, setIsLoading] = useState(true);
  const [resourceTopic, setResourceTopic] = useState("");

  const [messages, setMessages] = useState<
    { sender: "user" | "bot"; text: string; type: string }[]
  >([]);
  const [input, setInput] = useState("");

  type AIResponse =
    | { summary: string }
    | { mindmap: string }
    | { answer: string };

  const handleSend = async (
    customInput?: string,
    task: "summary" | "mindmap" | "roadmap" | "qa" = "qa"
  ) => {
    const userMessage = customInput ?? input.trim();
    if (!userMessage) return;

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMessage, type: "text" },
    ]);
    setInput("");

    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "🧠 Smriti AI is thinking...", type: "text" },
    ]);

    try {
      const payload: any = {
        resourceId: id,
        task,
      };

      if (task === "qa") {
        payload.question = userMessage;
      }

      const res = await axios.post<AIResponse>("/api/resource-ai", payload);

      let botText = "";

      if ("summary" in res.data) {
        botText = res.data.summary;
      } else if ("mindmap" in res.data) {
        botText = res.data.mindmap;
        console.log(JSON.stringify(botText));
      } else if ("answer" in res.data) {
        botText = res.data.answer;
      }

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { sender: "bot", text: botText, type: task },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          sender: "bot",
          text: "❌ Something went wrong while processing your request.",
          type: "text",
        },
      ]);
    }
  };

  const getSummary = () => handleSend("summarise this", "summary");
  const getMindMap = () => handleSend("Generate a mindmap", "mindmap");
  const getRoadMap = () => handleSend("Generate a Road Map", "roadmap");

  const resourceAPI = "/api/resource";

  useEffect(() => {
    async function Datafetcher() {
      const res = await axios.get<{ resource?: { title: string } }>(
        resourceAPI,
        {
          params: { id },
        }
      );
      console.log(res.data);
      if (res.data.resource) {
        setResourceTopic(res.data.resource.title);
        setIsLoading(false);
      } else {
        console.error("Resource not found");
      }
    }
    Datafetcher();
  }, []);

  return (
    <div className="h-screen bg-muted/50 text-foreground pt-24">
      <div className="flex flex-col h-full w-full">
        {/* Header */}
        <div className="pb-10 text-center">
          {isLoading ? (
            <div className="flex items-center justify-center text-white text-lg gap-2">
              <span>Loading...</span>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <h1 className="text-2xl font-bold text-white">{resourceTopic}</h1>
          )}
        </div>

        {/* Chat Area */}
        <div className="overflow-y-auto h-full">
          <div className="flex-1 px-2 sm:px-6 lg:px-8 space-y-4 max-w-7xl mx-auto pb-20">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex w-full ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`
                        ${
                          msg.sender === "user"
                            ? "bg-muted text-foreground max-w-xs"
                            : "text-foreground w-full"
                        }
                        p-4 rounded-xl shadow prose prose-invert
                        ${
                          msg.sender === "user"
                            ? "rounded-br-none"
                            : "rounded-bl-none"
                        }
                        leading-loose
                      `}
                >
                  {msg.sender === "bot" && msg.type === "mindmap" ? (
                    <Mermaid
                      id={crypto.randomUUID()}
                      chart={prepareMermaidCode({ code: msg.text })}
                    />
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Input & Actions */}
        <div className="flex justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl w-full border-t border-muted bg-card p-4 shadow-inner rounded-t-3xl">
            {/* Input Row */}
            <div className="flex gap-2 mb-4 items-end">
              <Textarea
                className="flex-1 resize-none max-h-40 overflow-auto rounded-2xl bg-zinc-800 text-white placeholder:text-zinc-400 focus:ring-1 focus:ring-primary border-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about this resource..."
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                size="icon"
                className="rounded-full bg-primary hover:scale-105 transition"
                onClick={() => handleSend(input)}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-full border-zinc-700 text-white hover:bg-zinc-800"
                onClick={() => {
                  getSummary();
                }}
              >
                <Wand2 className="mr-2 h-4 w-4" /> AI Summarize
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-full border-zinc-700 text-white hover:bg-zinc-800"
                onClick={() => getMindMap()}
              >
                <BrainCircuit className="mr-2 h-4 w-4" /> Mind Map
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-full border-zinc-700 text-white hover:bg-zinc-800"
                onClick={() => getRoadMap()}
              >
                <Route className="mr-2 h-4 w-4" /> Road Map
              </Button>
              <Link href={`/dashboard/quiz/${id}`} className="flex-1">
                <Button
                  variant="outline"
                  className="flex-1 w-full rounded-full border-zinc-700 text-white hover:bg-zinc-800"
                >
                  <FileQuestion className="mr-2 h-4 w-4" /> Attempt a Quiz
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
