export type ResourceType = "VIDEO" | "PDF";

export interface ResourceItem {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
}
export type StudyTime = {
  id: string; // A unique ID, e.g., from nanoid()
  time: string; // e.g., "19:00"
  frequency: 'daily' | 'weekdays' | 'weekends';
  method: 'in-app' | 'email' | 'whatsapp';
  isEnabled: boolean;
};