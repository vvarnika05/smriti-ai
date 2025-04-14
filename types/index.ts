export type ResourceType = "VIDEO" | "PDF";

export interface ResourceItem {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
}
