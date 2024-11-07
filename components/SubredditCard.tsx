import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

interface SubredditCardProps {
  name: string;
  description?: string;
}

export function SubredditCard({ name, description }: SubredditCardProps) {
  return (
    <Link href={`/r/${name}`}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>r/{name}</CardTitle>
          </div>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
} 