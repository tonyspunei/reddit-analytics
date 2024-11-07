import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RedditPost } from "@/lib/utils";
import { AnalyzedPost, PostCategory } from "@/lib/postAnalyzer";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PostsTableProps {
  posts: (RedditPost | AnalyzedPost)[];
}

type SortField = 'title' | 'score' | 'numComments' | 'createdAt';
type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  field: SortField;
  direction: SortDirection;
}

const ITEMS_PER_PAGE = 15;

// Helper function to check if a post is analyzed
function isAnalyzedPost(post: RedditPost | AnalyzedPost): post is AnalyzedPost {
  return 'categories' in post;
}

// Helper function to get category display info
const CATEGORY_DISPLAY = {
  solutionRequests: { label: 'Solution', className: 'bg-blue-500' },
  painAndAnger: { label: 'Pain & Anger', className: 'bg-red-500' },
  adviceRequests: { label: 'Advice', className: 'bg-green-500' },
  moneyTalk: { label: 'Money', className: 'bg-yellow-500' },
} as const;

export function PostsTable({ posts }: PostsTableProps) {
  const [sort, setSort] = useState<SortState>({
    field: 'score',
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);

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
    setCurrentPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sort.field !== field) return <ArrowUpDown className="w-4 h-4 ml-2" />;
    if (sort.direction === 'asc') return <ArrowUp className="w-4 h-4 ml-2" />;
    if (sort.direction === 'desc') return <ArrowDown className="w-4 h-4 ml-2" />;
    return <ArrowUpDown className="w-4 h-4 ml-2" />;
  };

  // Check if we're dealing with analyzed posts
  const hasCategories = posts.length > 0 && isAnalyzedPost(posts[0]);

  // Pagination logic
  const sortedPosts = getSortedPosts();
  const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPosts = sortedPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
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
            {hasCategories && (
              <TableHead className="w-[200px] text-right">Categories</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedPosts.map((post) => (
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
              {hasCategories && (
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end flex-wrap">
                    {isAnalyzedPost(post) && Object.entries(post.categories)
                      .filter(([_, value]) => value)
                      .map(([category]) => (
                        <Badge 
                          key={category}
                          variant="secondary"
                          className={CATEGORY_DISPLAY[category as keyof PostCategory].className}
                        >
                          {CATEGORY_DISPLAY[category as keyof PostCategory].label}
                        </Badge>
                      ))}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedPosts.length)} of {sortedPosts.length} posts
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center justify-center text-sm space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-8"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 