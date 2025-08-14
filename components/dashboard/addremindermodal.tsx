// C:/components/dashboard/addremindermodal.tsx

"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { StudyTime } from "@/types";

// Using 'Omit' to exclude the 'id' when creating, as it will be generated.
type StudyTimeInput = Omit<StudyTime, 'id'>;

interface AddReminderModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (reminder: StudyTime) => void;
  initialData?: StudyTime | null; // Optional data for editing
}

export function AddReminderModal({ isOpen, setIsOpen, onSave, initialData }: AddReminderModalProps) {
  const [time, setTime] = React.useState("19:00");
  const [frequency, setFrequency] = React.useState("daily");
  const [method, setMethod] = React.useState("in-app");

  const isEditMode = !!initialData;

  // When the modal opens in edit mode, populate the form with existing data.
  React.useEffect(() => {
    if (initialData && isOpen) {
      setTime(initialData.time);
      setFrequency(initialData.frequency);
      setMethod(initialData.method);
    }
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    const reminderData: StudyTimeInput = {
      time,
      frequency: frequency as StudyTime['frequency'],
      method: method as StudyTime['method'],
      isEnabled: initialData?.isEnabled ?? true, // Default to enabled on create
    };

    // Add a new ID if not in edit mode
    const finalReminder: StudyTime = {
        ...reminderData,
        id: initialData?.id || crypto.randomUUID(),
    };

    onSave(finalReminder);
    toast.success(isEditMode ? "Reminder updated!" : "Reminder added!");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Reminder' : 'Set Study Time'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for your study reminder.' : 'Add a new study reminder to your schedule.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">Time</Label>
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekdays">Weekdays</SelectItem>
                <SelectItem value="weekends">Weekends</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="method" className="text-right">Notify Via</Label>
            <RadioGroup value={method} onValueChange={setMethod} className="col-span-3 flex items-center space-x-4">
              <div className="flex items-center space-x-2"><RadioGroupItem value="in-app" id="r1" /><Label htmlFor="r1">In-App</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="email" id="r2" /><Label htmlFor="r2">Email</Label></div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}