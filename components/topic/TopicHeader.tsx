import { Pencil } from "lucide-react";

interface TopicHeaderProps {
  topicName: string;
  onClick: () => void;
}

export default function TopicHeader({ topicName, onClick }: TopicHeaderProps) {
  return (
    <h2
      className="text-2xl font-bold flex items-center gap-2 cursor-pointer group transition"
      onClick={onClick}
    >
      {topicName && (
        <Pencil className="h-5 w-5 text-muted-foreground group-hover:text-primary transition" />
      )}
      <p>{topicName}</p>
    </h2>
  );
}
