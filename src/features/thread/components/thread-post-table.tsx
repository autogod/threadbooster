"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { ThreadPostWithExactRawData } from "@/features/thread/types/types";

export type ThreadPostTableProps = {
  posts: ThreadPostWithExactRawData[];
};

export const columns: ColumnDef<ThreadPostWithExactRawData>[] = [
  // 체크박스 열 (좌측)
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="전체 선택"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="행 선택"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
  {
    accessorKey: "content",
    header: "초안",
    cell: ({ row }) => {
      const post = row.original;
      let displayContent = post.abstract || "초안 없음";
      // raw_data가 있으면 reposted_post 또는 is_quote_post 여부로 내용 변경
      if (post.raw_data) {
        if (post.raw_data.reposted_post) {
          displayContent = "리포스트";
        } else if (post.raw_data.is_quote_post) {
          displayContent = "인용";
        }
      }
      // 외부 링크: raw_data에 permalink가 있으면 해당 링크로 연결
      const link = post.raw_data?.permalink;
      const contentNode = link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          {displayContent}
        </a>
      ) : (
        displayContent
      );
      return (
        <div className="truncate" style={{ maxWidth: "200px" }}>
          {contentNode}
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "content",
    header: "내용",
    cell: ({ row }) => {
      const post = row.original;
      let displayContent = post.content || "내용 없음";
      // raw_data가 있으면 reposted_post 또는 is_quote_post 여부로 내용 변경
      if (post.raw_data) {
        if (post.raw_data.reposted_post) {
          displayContent = "리포스트";
        } else if (post.raw_data.is_quote_post) {
          displayContent = "인용";
        }
      }
      // 외부 링크: raw_data에 permalink가 있으면 해당 링크로 연결
      const link = post.raw_data?.permalink;
      const contentNode = link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          {displayContent}
        </a>
      ) : (
        displayContent
      );
      return (
        <div className="truncate" style={{ maxWidth: "200px" }}>
          {contentNode}
        </div>
      );
    },
    size: 200,
  },
  {
    id: "post_type",
    header: "게시글 타입",
    // accessorFn를 통해 게시글 타입을 산출합니다.
    accessorFn: (row) => {
      if (row.raw_data) {
        if (row.raw_data.reposted_post) {
          return "REPOST";
        } else if (row.raw_data.is_quote_post) {
          return "QUOTE";
        }
      }
      return "TEXT_POST";
    },
    cell: ({ getValue }) => {
      const type = getValue() as "TEXT_POST" | "REPOST" | "QUOTE";
      let label = "";
      let colorClass = "";
      if (type === "TEXT_POST") {
        label = "포스트";
        colorClass = "bg-green-100 text-green-800";
      } else if (type === "REPOST") {
        label = "리포스트";
        colorClass = "bg-blue-100 text-blue-800";
      } else if (type === "QUOTE") {
        label = "인용";
        colorClass = "bg-purple-100 text-purple-800";
      }
      return (
        <Badge className={`px-2 py-1 rounded ${colorClass}`}>{label}</Badge>
      );
    },
    size: 120,
  },
  {
    accessorKey: "thread_created_at",
    header: "작성일",
    cell: ({ row }) => {
      const date = new Date(row.getValue("thread_created_at"));
      return (
        <div className="truncate" style={{ maxWidth: "120px" }}>
          {date.toLocaleDateString()}
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "status",
    header: "상태",
    cell: ({ row }) => (
      <div className="truncate" style={{ maxWidth: "100px" }}>
        {row.getValue("status") || "-"}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "likes",
    header: "좋아요",
    cell: ({ row }) => (
      <div className="text-right truncate" style={{ maxWidth: "80px" }}>
        {row.getValue("likes") || 0}
      </div>
    ),
    size: 80,
  },
  {
    accessorKey: "memo",
    header: "메모",
    cell: ({ row }) => (
      <div className="truncate" style={{ maxWidth: "150px" }}>
        {row.getValue("memo") || "없음"}
      </div>
    ),
    size: 150,
  },
  {
    accessorKey: "parent_post_id",
    header: "부모 게시글 ID",
    cell: ({ row }) => (
      <div className="truncate" style={{ maxWidth: "150px" }}>
        {row.getValue("parent_post_id") || "없음"}
      </div>
    ),
    size: 150,
  },
];

export function ThreadPostTable({ posts }: ThreadPostTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: posts,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      {/* 필터링 컨트롤 */}
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="내용 필터링..."
          value={(table.getColumn("content")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("content")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
        <select
          className="border rounded p-2"
          value={
            (table.getColumn("post_type")?.getFilterValue() as string) ?? ""
          }
          onChange={(e) =>
            table
              .getColumn("post_type")
              ?.setFilterValue(e.target.value || undefined)
          }
        >
          <option value="">전체</option>
          <option value="TEXT_POST">포스트</option>
          <option value="REPOST">리포스트</option>
          <option value="QUOTE">인용</option>
        </select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      maxWidth: header.getSize()
                        ? `${header.getSize()}px`
                        : undefined,
                    }}
                  >
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
                    <TableCell
                      key={cell.id}
                      style={{
                        maxWidth: cell.column.getSize()
                          ? `${cell.column.getSize()}px`
                          : undefined,
                      }}
                    >
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
                  결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} /{" "}
          {table.getFilteredRowModel().rows.length} 개의 행 선택됨
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            이전
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
