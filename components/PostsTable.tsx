import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RedditPost } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PostsTableProps {
  posts: RedditPost[];
}

type SortField = 'title' | 'score' | 'numComments' | 'createdAt';
type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  field: SortField;
  direction: SortDirection;
}

export function PostsTable({ posts }: PostsTableProps) {
  const [sort, setSort] = useState<SortState>({
    field: 'score',
    direction: 'desc'
  });

  const getSortedPosts = () => {
    if (!sort.direction) return posts;

    return [...posts].sort((a, b) => {
      const modifier = sort.direction === 'asc' ? 1 : -1;
      
      switch (sort.field) {
        case 'title':
          return modifier * a.title.localeCompare(b.title);
        case 'score':
          return modifier * (a.score - b.score);
        case 'numComments':
          return modifier * (a.numComments - b.numComments);
        case 'createdAt':
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return modifier * (dateA.getTime() - dateB.getTime());
        default:
          return 0;
      }
    });
  };

  const toggleSort = (field: SortField) => {
    setSort(current => ({
      field,
      direction: 
        current.field === field
          ? current.direction === 'asc'
            ? 'desc'
            : current.direction === 'desc'
              ? null
              : 'asc'
          : 'asc'
    }));
  };

  const getSortIcon = (field: SortField) => {
    if (sort.field !== field) return <ArrowUpDown className="w-4 h-4 ml-2" />;
    if (sort.direction === 'asc') return <ArrowUp className="w-4 h-4 ml-2" />;
    if (sort.direction === 'desc') return <ArrowDown className="w-4 h-4 ml-2" />;
    return <ArrowUpDown className="w-4 h-4 ml-2" />;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[400px]">
            <Button
              variant="ghost"
              onClick={() => toggleSort('title')}
              className="hover:bg-transparent p-0 font-medium text-muted-foreground"
            >
              Title
              {getSortIcon('title')}
            </Button>
          </TableHead>
          <TableHead className="text-right">
            <Button
              variant="ghost"
              onClick={() => toggleSort('score')}
              className="hover:bg-transparent p-0 font-medium text-muted-foreground ml-auto"
            >
              Score
              {getSortIcon('score')}
            </Button>
          </TableHead>
          <TableHead className="text-right">
            <Button
              variant="ghost"
              onClick={() => toggleSort('numComments')}
              className="hover:bg-transparent p-0 font-medium text-muted-foreground ml-auto"
            >
              Comments
              {getSortIcon('numComments')}
            </Button>
          </TableHead>
          <TableHead className="text-right">
            <Button
              variant="ghost"
              onClick={() => toggleSort('createdAt')}
              className="hover:bg-transparent p-0 font-medium text-muted-foreground ml-auto"
            >
              Posted
              {getSortIcon('createdAt')}
            </Button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {getSortedPosts().map((post) => (
          <TableRow key={post.id}>
            <TableCell className="font-medium">
              <a 
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {post.title}
              </a>
            </TableCell>
            <TableCell className="text-right">{post.score}</TableCell>
            <TableCell className="text-right">{post.numComments}</TableCell>
            <TableCell className="text-right">
              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 