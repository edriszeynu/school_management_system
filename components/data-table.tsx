// components/data-table.tsx
"use client";

import * as React from "react";
import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type SortingState,
  type TableFeatures,
  flexRender,
  columnFilteringFeature,
  columnVisibilityFeature,
  createCoreRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export type Student = {
  id: string;
  name: string;
  email: string;
  className: string;
  rollNumber: string;
  status: "active" | "inactive";
  enrolledAt: string;
};

interface DataTableProps {
  data: any[];
  detailsBasePath?: string;
  detailsLabel?: string;
}

const dataTableFeatures = tableFeatures<TableFeatures>({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
});

export function DataTable({ data, detailsBasePath, detailsLabel = "View Profile" }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  const columns: any[] = [
    {
      id: "select",
      header: ({ table }: any) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: any) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
    },
    {
      accessorKey: "name",
      header: ({ column }: any) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: any) => <div className="font-medium">{String(row.getValue("name"))}</div>,
      enableColumnFilter: true,
      filterFn: "includesString",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: any) => <div>{String(row.getValue("email"))}</div>,
      enableColumnFilter: false,
    },
    {
      accessorKey: "className",
      header: "Class",
      cell: ({ row }: any) => <div>{String(row.getValue("className"))}</div>,
      enableColumnFilter: false,
    },
    {
      accessorKey: "rollNumber",
      header: "Roll No.",
      cell: ({ row }: any) => <div>{String(row.getValue("rollNumber") || "-")}</div>,
      enableColumnFilter: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge variant={row.getValue("status") === "active" ? "default" : "secondary"}>
          {String(row.getValue("status"))}
        </Badge>
      ),
      enableColumnFilter: false,
    },
    {
      accessorKey: "enrolledAt",
      header: "Enrolled",
      cell: ({ row }: any) => <div>{new Date(String(row.getValue("enrolledAt"))).toLocaleDateString()}</div>,
      enableColumnFilter: false,
    },
    {
      id: "actions",
      enableHiding: false,
      enableColumnFilter: false,
      cell: ({ row }: any) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={<Link href={`/dashboard/students/${row.original.id}`}>View Profile</Link>}
              />
              <DropdownMenuItem
                render={<Link href={`/dashboard/students/${row.original.id}/edit`}>Edit Student</Link>}
              />
              <DropdownMenuItem
                render={<Link href={`/dashboard/students/${row.original.id}?tab=grades`}>View Grades</Link>}
              />
              <DropdownMenuItem
                render={<Link href={`/dashboard/students/${row.original.id}?tab=attendance`}>View Attendance</Link>}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useTable({
    data,
    columns,
    features: dataTableFeatures,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: createCoreRowModel(),
    getPaginationRowModel: createPaginatedRowModel(),
    getSortedRowModel: createSortedRowModel(),
    getFilteredRowModel: createFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination, // ✅ control pagination manually
    state: { sorting, columnFilters, columnVisibility, rowSelection, pagination },
    enableColumnFilters: true,
  } as any);

  const nameFilter = String(columnFilters.find((f) => f.id === "name")?.value ?? "");
  const selectedCount = Object.keys(rowSelection).length;
  const filteredRows = table.getSortedRowModel().rows;
  const totalFilteredRows = filteredRows.length;
  const pageCount = Math.max(1, Math.ceil(totalFilteredRows / pagination.pageSize));
  const canPrev = pagination.pageIndex > 0;
  const canNext = pagination.pageIndex < pageCount - 1;
  const visibleRows = filteredRows.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize
  );

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by name..."
          value={nameFilter}
          onChange={(event) => {
            setColumnFilters((prev) => {
              const existing = prev.findIndex((f) => f.id === "name");
              if (existing !== -1) {
                const newFilters = [...prev];
                newFilters[existing] = { ...newFilters[existing], value: event.target.value };
                return newFilters;
              }
              return [...prev, { id: "name", value: event.target.value }];
            });
          }}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.columnDef.enableHiding !== false)
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
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
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {visibleRows.length ? (
              visibleRows.map((row) => {
                const visibleCells = row.getAllCells().filter((cell) => cell.column.getIsVisible());
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : ""}
                  >
                    {visibleCells.map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {selectedCount} of {totalFilteredRows} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
            disabled={!canPrev}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
            disabled={!canNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}