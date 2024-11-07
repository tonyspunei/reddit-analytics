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

interface PostsTableProps {
  posts: RedditPost[];
}

export function PostsTable({ posts }: PostsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[400px]">Title</TableHead>
          <TableHead className="text-right">Score</TableHead>
          <TableHead className="text-right">Comments</TableHead>
          <TableHead className="text-right">Posted</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
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