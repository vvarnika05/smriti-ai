"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import * as React from "react"
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
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, GraduationCap } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Clock, PauseCircle } from "lucide-react"
import { backendURI } from "@/app/backendURL"
import axios from "axios"
import Link from "next/link"

export type Topic = {
  id: string
  title: string
  status: "learning" | "completed" | "paused"
  progress: number // percentage
}




// [
//   {
//     id: "t1",
//     title: "React Basics",
//     status: "learning",
//     progress: 45,
//   },
//   {
//     id: "t2",
//     title: "TypeScript Essentials",
//     status: "completed",
//     progress: 100,
//   },
//   {
//     id: "t3",
//     title: "State Management",
//     status: "paused",
//     progress: 20,
//   },
//   {
//     id: "t4",
//     title: "Next.js Fundamentals",
//     status: "learning",
//     progress: 60,
//   },
// ]

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
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Topic["status"]
      const statusMap: Record<Topic["status"], { label: string; icon: React.ReactNode; color: string }> = {
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
      }

      const { label, icon, color } = statusMap[status]

      return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${color}`}>
          {icon}
          {label}
        </span>
      )
    },
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const value = row.getValue("progress") as number
      return (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">{value}%</span>
          <Progress value={value} className="h-2" />
        </div>
      )
    },
  },
]


export function TopicsTable(): React.JSX.Element {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [data,setData]: [data:Topic[]|[], SetData:any] = React.useState([])
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
  })
  React.useEffect(()=>{
    async function Datafetcher() {
      try {
        const res=await axios.get(`${backendURI}/api/folders`,{
        headers:{
          backendtoken:localStorage.getItem('backendtoken')
        }
      })
      const transformed = (res.data as any).folders.map(({ _id, ...rest }:{_id:any}) => ({
        id: _id,
        progress:Math.round(Math.random()*100),
        status:Math.round(Math.random()*100)%3==0?"learning":(Math.round(Math.random()*100)%2==0?"completed":"paused"),
        ...rest,
      }));
      setData(transformed)
      } catch (error) {
        console.log("Error occurred",error) // toast error here
      }
      
    }
  
    Datafetcher()
  },[])
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
                      <Link href={`/dashboard/topic/${row.original.id}`}>{flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}</Link>
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
    </div>
  )
}