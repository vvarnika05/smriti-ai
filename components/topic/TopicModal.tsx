import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopicModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  topicName: string;
  setTopicName: (name: string) => void;
  editMode: boolean;
  onSave: () => Promise<void>;
  onCancel: () => void;
}

export default function TopicModal({
  open,
  setOpen,
  topicName,
  setTopicName,
  editMode,
  onSave,
  onCancel,
}: TopicModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } catch (error) {
      console.error("Error saving topic:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 ${
        editMode ? "bg-black/50" : "bg-black"
      } flex items-center justify-center z-50`}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-md p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          {editMode ? "Edit Topic Name" : "Enter Topic Name"}
        </h2>
        <Input
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          placeholder="e.g. Linear Algebra"
          autoFocus
          disabled={isSaving}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!topicName.trim() || isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
