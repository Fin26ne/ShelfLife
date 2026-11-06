import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { BookPlus, BarChart3, Search } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="max-w-4xl w-full text-center space-y-6">
        <h1
          data-testid="home-title"
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50"
        >
          ShelfLife
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Your minimalist, elegant companion for tracking books, reading goals,
          and literary adventures.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button asChild size="lg">
            <Link href="/books">Open My Shelf</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Get Started</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-12">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 text-primary">
                <BookPlus className="h-5 w-5" />
              </div>
              <CardTitle>Add books</CardTitle>
              <CardDescription>
                Catalog your physical and digital library effortlessly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Record title, author, page counts, and initial reading status
                with strict validation.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 text-primary">
                <BarChart3 className="h-5 w-5" />
              </div>
              <CardTitle>Track your progress</CardTitle>
              <CardDescription>
                Follow your journey from To Read to Finished.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                One-click advance updates reading status and recalculates
                reading statistics in real-time.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 text-primary">
                <Search className="h-5 w-5" />
              </div>
              <CardTitle>Search your shelf</CardTitle>
              <CardDescription>
                Instantly find books by title or author.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Filter by status and search with real-time feedback and dynamic
                summaries.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
