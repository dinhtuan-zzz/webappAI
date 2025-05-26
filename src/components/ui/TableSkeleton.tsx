import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ columns = 5, rows = 10 }: { columns?: number; rows?: number }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="p-3">
              <Skeleton className="h-6 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
} 