import { FileText } from "lucide-react";
import { ResourceItem } from "@/types";
import ResourceCard from "./ResourceCard";

interface ResourceGridProps {
  isLoading: boolean;
  media: ResourceItem[];
  onResourceClick: (item: ResourceItem) => void;
  onDeleteClick: (item: ResourceItem) => void;
}

export default function ResourceGrid({
  isLoading,
  media,
  onResourceClick,
  onDeleteClick,
}: ResourceGridProps) {
  if (isLoading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-muted-foreground text-lg gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading Resources...</span>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-muted-foreground">
        <FileText className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-lg">No resources yet</p>
        <p className="text-sm mt-2">Click "Add Resource" to get started</p>
      </div>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {media.map((item) => (
        <ResourceCard
          key={item.id}
          item={item}
          onClick={() => onResourceClick(item)}
          onDeleteClick={() => onDeleteClick(item)}
        />
      ))}
    </div>
  );
}
