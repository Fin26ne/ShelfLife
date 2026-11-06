"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBookContext } from "@/context/BookContext";
import { BookStatus } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Trash2, ChevronRight, PlusCircle, Filter } from "lucide-react";

function FilterSearchControls() {
  const {
    filterStatus,
    searchQuery,
    setFilterStatus,
    setSearchQuery,
    clearFilters,
  } = useBookContext();

  return (
    <Card className="p-4 mb-8 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:flex-1 relative">
          <Input
            type="text"
            data-testid="search-input"
            placeholder="Search books by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground hidden sm:inline-block" />
            <select
              data-testid="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex h-9 w-full sm:w-44 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">All</option>
              <option value="To Read">To Read</option>
              <option value="Reading">Reading</option>
              <option value="Finished">Finished</option>
            </select>
          </div>

          <Button
            type="button"
            data-testid="btn-clear-filters"
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="w-full sm:w-auto"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </Card>
  );
}

function AddBookForm() {
  const { addBook } = useBookContext();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");
  const [status, setStatus] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookSuccess, setBookSuccess] = useState("");
  const [errorBook, setErrorBook] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateTitle = (val: string) => {
    const trimmed = val.trim();
    if (trimmed.length === 0) {
      return "Title is required";
    }
    if (val.length > 80 || trimmed.length > 80) {
      return "Title must be at most 80 characters";
    }
    return "";
  };

  const validateAuthor = (val: string) => {
    const trimmed = val.trim();
    if (trimmed.length === 0) {
      return "Author is required";
    }
    if (val.length > 60 || trimmed.length > 60) {
      return "Author must be at most 60 characters";
    }
    return "";
  };

  const validatePages = (val: string) => {
    const trimmed = String(val).trim();
    if (trimmed === "") {
      return "Pages is required";
    }
    if (!/^\d+$/.test(trimmed)) {
      return "Pages must be a whole number between 1 and 5000";
    }
    const n = Number(trimmed);
    if (!Number.isInteger(n) || n < 1 || n > 5000) {
      return "Pages must be a whole number between 1 and 5000";
    }
    return "";
  };

  const validateStatus = (val: string) => {
    if (!val || val.trim() === "") {
      return "Please choose a status";
    }
    if (!["To Read", "Reading", "Finished"].includes(val)) {
      return "Please choose a status";
    }
    return "";
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setBookSuccess("");
    setErrorBook("");
    if (hasSubmitted) {
      setErrors((prev) => ({
        ...prev,
        title: validateTitle(val),
      }));
    }
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAuthor(val);
    setBookSuccess("");
    setErrorBook("");
    if (hasSubmitted) {
      setErrors((prev) => ({
        ...prev,
        author: validateAuthor(val),
      }));
    }
  };

  const handlePagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPages(val);
    setBookSuccess("");
    setErrorBook("");
    if (hasSubmitted) {
      setErrors((prev) => ({
        ...prev,
        pages: validatePages(val),
      }));
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStatus(val);
    setBookSuccess("");
    setErrorBook("");
    if (hasSubmitted) {
      setErrors((prev) => ({
        ...prev,
        status: validateStatus(val),
      }));
    }
  };

  const handleAddBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBookSuccess("");
    setErrorBook("");
    setHasSubmitted(true);

    const titleErr = validateTitle(title);
    const authorErr = validateAuthor(author);
    const pagesErr = validatePages(pages);
    const statusErr = validateStatus(status);

    setErrors({
      title: titleErr,
      author: authorErr,
      pages: pagesErr,
      status: statusErr,
    });

    if (titleErr || authorErr || pagesErr || statusErr) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await addBook({
        title: title.trim(),
        author: author.trim(),
        pages: Number(pages.trim()),
        status: status as BookStatus,
      });

      if (error) {
        setErrorBook(error);
        return;
      }

      if (data) {
        setTitle("");
        setAuthor("");
        setPages("");
        setStatus("");
        setHasSubmitted(false);
        setErrors({});
        setBookSuccess("Book added");
      }
    } catch (err: any) {
      setErrorBook(err.message || "Failed to add book");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-primary" />
          Add a Book
        </CardTitle>
        <CardDescription>
          Add a new title to your reading collection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          data-testid="book-form"
          onSubmit={handleAddBook}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              data-testid="input-title"
              placeholder="e.g. The Great Gatsby"
              value={title}
              onChange={handleTitleChange}
            />
            {errors.title && (
              <p
                data-testid="error-title"
                className="text-xs text-destructive"
              >
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              type="text"
              data-testid="input-author"
              placeholder="e.g. F. Scott Fitzgerald"
              value={author}
              onChange={handleAuthorChange}
            />
            {errors.author && (
              <p
                data-testid="error-author"
                className="text-xs text-destructive"
              >
                {errors.author}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pages">Pages</Label>
            <Input
              id="pages"
              type="text"
              data-testid="input-pages"
              placeholder="e.g. 180"
              value={pages}
              onChange={handlePagesChange}
            />
            {errors.pages && (
              <p
                data-testid="error-pages"
                className="text-xs text-destructive"
              >
                {errors.pages}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              data-testid="select-status"
              value={status}
              onChange={handleStatusChange}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Choose status</option>
              <option value="To Read">To Read</option>
              <option value="Reading">Reading</option>
              <option value="Finished">Finished</option>
            </select>
            {errors.status && (
              <p
                data-testid="error-status"
                className="text-xs text-destructive"
              >
                {errors.status}
              </p>
            )}
          </div>

          {errorBook && (
            <p
              data-testid="error-book"
              className="text-xs text-destructive"
            >
              {errorBook}
            </p>
          )}

          {bookSuccess && (
            <p
              data-testid="book-success"
              className="text-xs text-green-600 font-medium"
            >
              {bookSuccess}
            </p>
          )}

          <Button
            type="submit"
            data-testid="btn-add-book"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Book"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ShelfSummary() {
  const { filteredBooks } = useBookContext();

  const totalPages = useMemo(() => {
    return filteredBooks.reduce((sum, b) => sum + (Number(b.pages) || 0), 0);
  }, [filteredBooks]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<BookStatus, number> = {
      "To Read": 0,
      Reading: 0,
      Finished: 0,
    };

    for (const b of filteredBooks) {
      if (counts[b.status] !== undefined) {
        counts[b.status]++;
      }
    }

    const tieBreakerOrder: Record<BookStatus, number> = {
      "To Read": 1,
      Reading: 2,
      Finished: 3,
    };

    const statuses: BookStatus[] = ["To Read", "Reading", "Finished"];

    return statuses
      .filter((s) => counts[s] > 0)
      .sort((a, b) => {
        if (counts[b] !== counts[a]) {
          return counts[b] - counts[a];
        }
        return tieBreakerOrder[a] - tieBreakerOrder[b];
      })
      .map((s) => ({
        name: s,
        count: counts[s],
      }));
  }, [filteredBooks]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Shelf Summary</CardTitle>
        <CardDescription>
          Overview of books currently shown
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <span className="text-sm font-medium text-muted-foreground">
            Book Count
          </span>
          <span
            data-testid="book-count"
            className="text-lg font-bold text-foreground"
          >
            {filteredBooks.length}
          </span>
        </div>

        <div className="flex items-center justify-between border-b pb-3">
          <span className="text-sm font-medium text-muted-foreground">
            Total Pages
          </span>
          <span
            data-testid="total-pages"
            className="text-lg font-bold text-foreground"
          >
            {totalPages}
          </span>
        </div>

        <div className="space-y-2 pt-1">
          <span className="text-sm font-medium text-muted-foreground block">
            Status Breakdown
          </span>
          <div
            data-testid="status-breakdown"
            className="space-y-2 rounded-lg bg-muted/40 p-3"
          >
            {statusBreakdown.map((item) => (
              <div
                key={item.name}
                data-testid="breakdown-row"
                className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-none"
              >
                <span
                  data-testid="breakdown-name"
                  className="font-medium"
                >
                  {item.name}
                </span>
                <span
                  data-testid="breakdown-count"
                  className="font-semibold px-2 py-0.5 rounded bg-background border text-xs"
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BookList() {
  const { filteredBooks, advanceStatus, deleteBook } = useBookContext();

  if (filteredBooks.length === 0) {
    return (
      <div
        data-testid="books-empty"
        className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-card text-muted-foreground text-center"
      >
        No books found
      </div>
    );
  }

  return (
    <div data-testid="book-list" className="space-y-4">
      {filteredBooks.map((book) => (
        <Card
          key={book.id}
          data-testid="book-item"
          className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
        >
          <div className="space-y-1.5 flex-1 min-w-0">
            <h3
              data-testid="book-title"
              className="text-lg font-bold tracking-tight text-foreground truncate"
            >
              {book.title}
            </h3>
            <p
              data-testid="book-author"
              className="text-sm text-muted-foreground truncate"
            >
              {book.author}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span
                data-testid="book-pages"
                className="text-xs font-medium text-muted-foreground"
              >
                {book.pages} pages
              </span>
              <span
                data-testid="book-status"
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  book.status === "Finished"
                    ? "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300"
                    : book.status === "Reading"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                }`}
              >
                {book.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 sm:pt-0 shrink-0">
            {book.status !== "Finished" && (
              <Button
                type="button"
                data-testid="btn-advance-status"
                size="sm"
                variant="outline"
                onClick={() => advanceStatus(book.id, book.status)}
                className="flex items-center gap-1 text-xs"
              >
                <span>
                  {book.status === "To Read"
                    ? "Start Reading"
                    : "Mark as Finished"}
                </span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}

            <Button
              type="button"
              data-testid="btn-delete-book"
              size="sm"
              variant="destructive"
              onClick={() => deleteBook(book.id)}
              className="flex items-center gap-1 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function BooksPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useBookContext();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || !user) {
    return null;
  }

  return (
    <div
      data-testid="books-page"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <FilterSearchControls />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <AddBookForm />
          <ShelfSummary />
        </div>

        <div className="lg:col-span-7 xl:col-span-8">
          <BookList />
        </div>
      </div>
    </div>
  );
}
