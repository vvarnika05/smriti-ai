import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ResourceType } from "@/types";
import { Textarea } from "@/components/ui/textarea";

interface ResourceModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  resourceType: ResourceType;
  setResourceType: (type: ResourceType) => void;
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  pdfTitle: string;
  setPdfTitle: (title: string) => void;
  pdfFile: File | null;
  setPdfFile: (file: File | null) => void;
  // Notes/Article
  notesTitle?: string;
  setNotesTitle?: (title: string) => void;
  notesContent?: string;
  setNotesContent?: (text: string) => void;
  onAdd: () => Promise<void>;
  isLoading: boolean;
}

export default function ResourceModal({
  open,
  setOpen,
  resourceType,
  setResourceType,
  youtubeUrl,
  setYoutubeUrl,
  pdfTitle,
  setPdfTitle,
  pdfFile,
  setPdfFile,
  notesTitle,
  setNotesTitle,
  notesContent,
  setNotesContent,
  onAdd,
  isLoading,
}: ResourceModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-md p-6 w-full max-w-md shadow-lg relative">
        {/* Close Icon */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Add New Resource</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Label>
              <input
                type="radio"
                name="resource"
                checked={resourceType === "VIDEO"}
                onChange={() => setResourceType("VIDEO")}
              />
              <span className="ml-2">YouTube Video</span>
            </Label>
            <Label>
              <input
                type="radio"
                name="resource"
                checked={resourceType === "PDF"}
                onChange={() => setResourceType("PDF")}
              />
              <span className="ml-2">PDF File</span>
            </Label>
            <Label>
              <input
                type="radio"
                name="resource"
                checked={resourceType === "ARTICLE"}
                onChange={() => setResourceType("ARTICLE")}
              />
              <span className="ml-2">Notes</span>
            </Label>
          </div>

          {resourceType === "VIDEO" ? (
            <Input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="YouTube video URL"
              autoFocus
            />
          ) : resourceType === "PDF" ? (
            <>
              <Input
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
                placeholder="PDF title"
                autoFocus
              />
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setPdfFile(e.target.files[0]);
                  }
                }}
                className="mt-2"
              />
            </>
          ) : (
            <>
              <Input
                value={notesTitle || ""}
                onChange={(e) => setNotesTitle && setNotesTitle(e.target.value)}
                placeholder="Notes title"
                autoFocus
              />
              <Textarea
                value={notesContent || ""}
                onChange={(e) => setNotesContent && setNotesContent(e.target.value)}
                placeholder="Paste or write your notes here"
                rows={8}
                className="mt-2"
              />
            </>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={onAdd}
            disabled={
              isLoading ||
              (resourceType === "VIDEO"
                ? !youtubeUrl
                : resourceType === "PDF"
                ? !pdfTitle || !pdfFile
                : !notesTitle || !notesContent)
            }
          >
            {isLoading ? "Loading..." : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}
