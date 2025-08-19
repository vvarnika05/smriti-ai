"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle, AlertTriangle, Edit2 } from "lucide-react";
import { Note } from "@/types/note"; // Import the Note type

export function SimpleNoteEditor({ topicId }: { topicId: string }) {
  const [note, setNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<"loading" | "error" | "idle">("loading");

  useEffect(() => {
    const fetchNote = async () => {
      try {
        // FIX: Tell axios what type of data to expect
        const response = await axios.get<Note | null>(`/api/notes/${topicId}`);
        if (response.data?.content) {
          setNote(response.data.content);
        }
      } catch (error) {
        console.error("Failed to fetch note:", error);
        setStatus("error");
      } finally {
        setStatus("idle");
      }
    };
    fetchNote();
  }, [topicId]);

  const handleSave = async () => {
    try {
      await axios.patch(`/api/notes/${topicId}`, { content: note });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save note:", error);
      setStatus("error");
    }
  };

  if (status === "loading") {
    return <div className="flex justify-center items-center h-40"><LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (status === "error") {
    return (
      <div className="flex flex-col justify-center items-center h-40 text-destructive bg-destructive/10 rounded-md">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p>Failed to load or save note. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-md min-h-[200px] prose dark:prose-invert">
      {isEditing ? (
        <div className="flex flex-col gap-4">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full min-h-[150px]"
            placeholder="Write your notes here..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="absolute top-0 right-0">
            <Edit2 className="h-4 w-4" />
          </Button>
          {note ? (
            <p className="whitespace-pre-wrap">{note}</p>
          ) : (
            <p className="text-muted-foreground">No notes yet. Click the edit icon to start writing.</p>
          )}
        </div>
      )}
    </div>
  );
}