import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="mb-6 flex items-center justify-center">
      <div className="relative w-full sm:max-w-md">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search resources..."
          className="pl-10 pr-4 py-2 rounded-xl border border-muted-foreground/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background"
        />
        <Search className="absolute left-3 top-2 text-muted-foreground h-5 w-5" />
      </div>
    </div>
  );
}
