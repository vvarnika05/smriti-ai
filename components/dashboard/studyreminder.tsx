// C:/components/dashboard/studyreminder.tsx

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddReminderModal } from "./addremindermodal";
import type { StudyTime } from "@/types";
import { BellRing, Edit, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function StudyReminder() {
  const [studyTimes, setStudyTimes] = React.useState<StudyTime[]>([
    { id: '1', time: '19:00', frequency: 'weekdays', method: 'in-app', isEnabled: true },
    { id: '2', time: '10:30', frequency: 'weekends', method: 'email', isEnabled: false },
  ]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingReminder, setEditingReminder] = React.useState<StudyTime | null>(null);

  const handleAddNew = () => {
    setEditingReminder(null);
    setIsModalOpen(true);
  };

  const handleEdit = (reminder: StudyTime) => {
    setEditingReminder(reminder);
    setIsModalOpen(true);
  };

  const handleSave = (reminder: StudyTime) => {
    setStudyTimes(prev => {
        const exists = prev.some(r => r.id === reminder.id);
        if (exists) {
            // Update existing reminder
            return prev.map(r => r.id === reminder.id ? reminder : r);
        } else {
            // Add new reminder
            return [...prev, reminder];
        }
    });
  };

  const handleDelete = (id: string) => {
    setStudyTimes(prev => prev.filter(r => r.id !== id));
  };

  const handleToggle = (id: string, isEnabled: boolean) => {
    setStudyTimes(prev => prev.map(r => r.id === id ? { ...r, isEnabled } : r));
  };

  return (
    <>
      <AddReminderModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onSave={handleSave}
        initialData={editingReminder}
      />

      <Card className="rounded-xl shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Study Reminders</CardTitle>
            <CardDescription>Manage your study schedule and notifications.</CardDescription>
          </div>
          <Button onClick={handleAddNew}>+ Add New</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {studyTimes.length > 0 ? (
              studyTimes.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-background rounded-lg p-3">
                        <BellRing className={`h-6 w-6 ${reminder.isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{new Date(`1970-01-01T${reminder.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</p>
                      <p className="text-sm text-muted-foreground capitalize">{reminder.frequency} &bull; {reminder.method}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                        checked={reminder.isEnabled}
                        // --- THIS IS THE CORRECTED LINE ---
                        onCheckedChange={(checked: boolean) => handleToggle(reminder.id, checked)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(reminder)}>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="hover:bg-red-500/10">
                             <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
                                <AlertDialogDescription>Are you sure you want to delete this reminder? This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(reminder.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                <p>You have no study reminders.</p>
                <p className="text-sm">Click "+ Add New" to create one.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}