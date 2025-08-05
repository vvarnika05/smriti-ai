import { Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function LevelCard() {
  const stats = {
    value: "Intermediate",
    trend: "12% growth",
    progress: 65,
  };
  return (
    <Card className="rounded-xl shadow-sm hover:shadow-md transition-all">
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <Award className="text-primary h-5 w-5" />
          </div>
          <div className="space-y-1 w-full">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Mastery Level</p>
              <span className="text-xs font-medium text-[#adff2f] bg-[#adff2f]/10 px-3 py-1 rounded-full flex items-center gap-1 border border-[#adff2f]/20">
                {stats.trend}
              </span>
            </div>
            <p className="text-xl font-bold">{stats.value}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          <p className="text-right text-xs text-muted-foreground mt-1">
            {stats.progress}% achieved
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
