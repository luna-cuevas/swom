import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  columns: number;
}

export function TableSkeleton({ columns }: TableSkeletonProps) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {Array(columns)
              .fill(0)
              .map((_, i) => (
                <TableHead
                  key={i}
                  className="text-center border-r h-11 font-medium last:border-r-0">
                  <Skeleton className="h-4 w-20 mx-auto" />
                </TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(5)
            .fill(0)
            .map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array(columns)
                  .fill(0)
                  .map((_, colIndex) => (
                    <TableCell key={colIndex} className="text-center">
                      <Skeleton className="h-4 w-20 mx-auto" />
                    </TableCell>
                  ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
