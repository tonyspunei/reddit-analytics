import { AnalyzedPost, PostCategory } from "@/lib/postAnalyzer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PostsTable } from "./PostsTable";

interface ThemeAnalysisProps {
  posts: AnalyzedPost[];
}

interface CategoryInfo {
  title: string;
  description: string;
  key: keyof PostCategory;
}

const CATEGORIES: CategoryInfo[] = [
  {
    title: "Solution Requests",
    description: "Posts seeking solutions for problems",
    key: "solutionRequests",
  },
  {
    title: "Pain & Anger",
    description: "Posts expressing pains or anger",
    key: "painAndAnger",
  },
  {
    title: "Advice Requests",
    description: "Posts seeking advice",
    key: "adviceRequests",
  },
  {
    title: "Money Talk",
    description: "Posts discussing spending money",
    key: "moneyTalk",
  },
];

export function ThemeAnalysis({ posts }: ThemeAnalysisProps) {
  const getPostsByCategory = (category: keyof PostCategory) => {
    return posts.filter((post) => post.categories[category]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {CATEGORIES.map((category) => {
        const categoryPosts = getPostsByCategory(category.key);
        return (
          <Sheet key={category.key}>
            <SheetTrigger asChild>
              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader>
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{categoryPosts.length}</p>
                  <p className="text-sm text-muted-foreground">posts in this category</p>
                </CardContent>
              </Card>
            </SheetTrigger>
            <SheetContent side="right" className="w-[90vw]">
              <SheetHeader>
                <SheetTitle>{category.title} Posts</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <PostsTable posts={categoryPosts} />
              </div>
            </SheetContent>
          </Sheet>
        );
      })}
    </div>
  );
} 