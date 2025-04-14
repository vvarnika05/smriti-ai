"use client";

// React and third-party libraries
import * as React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

// Icons
import {
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  Clock,
  GraduationCap,
  PauseCircle,
  Trash2,
} from "lucide-react";

// TanStack Table
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

// UI components
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Topic = {
  id: string;
  title: string;
  status: "learning" | "completed" | "paused";
  progress: number;
};

export const columns: ColumnDef<Topic>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Topic
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link
        href={`/dashboard/topic/${row.original.id}`}
        className="hover:underline"
      >
        {row.getValue("title")}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Topic["status"];
      const statusMap: Record<
        Topic["status"],
        { label: string; icon: React.ReactNode; color: string }
      > = {
        learning: {
          label: "Learning",
          icon: <Clock className="w-4 h-4" />,
          color: "bg-blue-100 text-blue-800",
        },
        completed: {
          label: "Completed",
          icon: <CheckCircle2 className="w-4 h-4" />,
          color: "bg-green-100 text-green-800",
        },
        paused: {
          label: "Paused",
          icon: <PauseCircle className="w-4 h-4" />,
          color: "bg-yellow-100 text-yellow-800",
        },
      };

      const { label, icon, color } = statusMap[status];

      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${color}`}
        >
          {icon}
          {label}
        </span>
      );
    },
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const value = row.getValue("progress") as number;
      return (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">
            {value}%
          </span>
          <Progress value={value} className="h-2" />
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: () => <div className="text-center w-full">Actions</div>,
    cell: ({ row }) => {
      const topicId = row.original.id;
      const [open, setOpen] = React.useState(false);
      const router = useRouter(); // for refreshing data if needed

      const handleDelete = async () => {
        try {
          const res = await fetch("/api/topic", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: topicId }),
          });

          if (!res.ok) {
            throw new Error("Delete failed");
          }

          toast.success("Topic deleted");
          router.refresh(); // Optional: refresh data after deletion
        } catch (err) {
          toast.error("Failed to delete topic");
          console.error(err);
        } finally {
          setOpen(false);
        }
      };

      return (
        <div className="flex justify-center">
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <button
                className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                onClick={() => setOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Topic</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this topic? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

export function TopicsTable(): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(false);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<
    Record<string, boolean>
  >({});
  const [data, setData]: [data: Topic[] | [], SetData: any] = React.useState(
    []
  );
  const table = useReactTable<Topic>({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  React.useEffect(() => {
    async function fetchTopics() {
      try {
        setIsLoading(true); // Start spinner
        const topicAPI = "/api/topic";
        const res = await axios.get(topicAPI);

        const transformed = (res.data as any).topics.map(
          ({ id, ...rest }: { id: string }) => {
            const progress = Math.round(Math.random() * 100);
            const status = progress === 100 ? "completed" : "learning";

            return {
              id,
              progress,
              status,
              ...rest,
            };
          }
        );

        setData(transformed);
      } catch (error) {
        console.error("Error occurred", error);
        toast.error("Failed to load topics");
      } finally {
        setIsLoading(false); // Stop spinner
      }
    }

    fetchTopics();
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Topics</h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value: boolean) =>
                    column.toggleVisibility(!!value)
                  }
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center text-white text-lg gap-4">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <span>Loading Topics...</span>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
