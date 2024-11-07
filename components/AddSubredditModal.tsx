import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

interface AddSubredditModalProps {
  onAddSubreddit: (subreddit: { name: string; description?: string }) => void;
}

export function AddSubredditModal({ onAddSubreddit }: AddSubredditModalProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const subredditMatch = url.match(/reddit\.com\/r\/([^/]+)/);
      if (!subredditMatch) {
        throw new Error("Invalid Reddit URL. Please enter a valid subreddit URL.");
      }

      const subredditName = subredditMatch[1];
      onAddSubreddit({ name: subredditName });
      setUrl("");
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid URL");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Subreddit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subreddit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Reddit URL</Label>
            <Input
              id="url"
              placeholder="https://reddit.com/r/subredditname"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <Button type="submit" className="w-full">
            Add Subreddit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 