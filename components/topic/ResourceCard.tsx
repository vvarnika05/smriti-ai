import Image from "next/image";
import { FileText, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ResourceItem } from "@/types";
import { getYouTubeThumbnail } from "@/utils/youtube";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ResourceCardProps {
  item: ResourceItem;
  onClick: () => void;
  onDeleteClick: () => void;
}

export default function ResourceCard({
  item,
  onClick,
  onDeleteClick,
}: ResourceCardProps) {
  return (
    <Card
      className="relative group cursor-pointer hover:ring-2 hover:ring-primary transition flex flex-col py-0 gap-0"
      onClick={onClick}
    >
      {/* Delete Button on Hover */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick();
              }}
              className="absolute cursor-pointer top-2 right-2 opacity-0 group-hover:opacity-100 bg-[#171717] text-white hover:text-red-600 p-2 rounded-full transition z-10"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {item.type === "VIDEO" ? (
        <Image
          src={getYouTubeThumbnail(item.url)}
          alt={item.title}
          width={320}
          height={180}
          className="rounded-t-md w-full object-cover h-36"
        />
      ) : (
        <div className="flex items-center justify-center h-36 bg-muted rounded-t-md">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
      )}

      <CardContent className="p-4 min-h-[40px] flex items-center">
        <p className="text-sm font-medium truncate w-full">{item.title}</p>
      </CardContent>
    </Card>
  );
}
