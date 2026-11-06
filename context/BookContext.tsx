"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabase, Book, BookStatus } from "@/lib/supabase";

export interface NewBookInput {
  title: string;
  author: string;
  pages: number;
  status: BookStatus;
}

interface BookContextType {
  user: User | null;
  isAuthLoading: boolean;
  books: Book[];
  filteredBooks: Book[];
  isBooksLoading: boolean;
  filterStatus: string;
  searchQuery: string;
  setFilterStatus: (status: string) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  addBook: (
    bookInput: Book | NewBookInput
  ) => Promise<{ data?: Book; error?: string }>;
  advanceStatus: (id: string, currentStatus?: BookStatus) => Promise<void>;
  advanceBookStatus: (id: string, currentStatus?: BookStatus) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  fetchBooks: () => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [isBooksLoading, setIsBooksLoading] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchedUserIdRef = useRef<string | null>(null);

  const fetchBooks = async () => {
    setIsBooksLoading(true);
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBooks(data as Book[]);
      }
    } catch (err) {
      console.error("Failed to fetch books", err);
    } finally {
      setIsBooksLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAuthLoading(false);

      if (currentUser && fetchedUserIdRef.current !== currentUser.id) {
        fetchedUserIdRef.current = currentUser.id;
        fetchBooks();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;

      if (!currentUser) {
        fetchedUserIdRef.current = null;
        setUser(null);
        setBooks([]);
        setFilterStatus("");
        setSearchQuery("");
        setIsAuthLoading(false);
        return;
      }

      if (
        fetchedUserIdRef.current &&
        fetchedUserIdRef.current !== currentUser.id
      ) {
        setBooks([]);
        setFilterStatus("");
        setSearchQuery("");
      }

      setUser(currentUser);
      setIsAuthLoading(false);

      if (fetchedUserIdRef.current !== currentUser.id) {
        fetchedUserIdRef.current = currentUser.id;
        fetchBooks();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const clearFilters = () => {
    setFilterStatus("");
    setSearchQuery("");
  };

  const addBook = async (
    bookInput: Book | NewBookInput
  ): Promise<{ data?: Book; error?: string }> => {
    if ("id" in bookInput && bookInput.id) {
      const existingBook = bookInput as Book;
      setBooks((prev) => [existingBook, ...prev]);
      return { data: existingBook };
    }

    if (!user) {
      return { error: "User is not authenticated" };
    }

    try {
      const { data, error } = await supabase
        .from("books")
        .insert({
          title: bookInput.title.trim(),
          author: bookInput.author.trim(),
          pages: Number(bookInput.pages),
          status: bookInput.status,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      if (data) {
        const createdBook = data as Book;
        setBooks((prev) => [createdBook, ...prev]);
        return { data: createdBook };
      }

      return { error: "Failed to add book" };
    } catch (err: any) {
      return { error: err?.message || "Failed to add book" };
    }
  };

  const advanceStatus = async (id: string, currentStatus?: BookStatus) => {
    const targetBook = books.find((b) => b.id === id);
    const statusToAdvance = currentStatus ?? targetBook?.status;

    let nextStatus: BookStatus;
    if (statusToAdvance === "To Read") {
      nextStatus = "Reading";
    } else if (statusToAdvance === "Reading") {
      nextStatus = "Finished";
    } else {
      return;
    }

    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: nextStatus } : b))
    );

    const { error } = await supabase
      .from("books")
      .update({ status: nextStatus })
      .eq("id", id);

    if (error) {
      console.error("Failed to advance book status", error);
    }
  };

  const deleteBook = async (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));

    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete book", error);
    }
  };

  const signOut = async () => {
    setBooks([]);
    setFilterStatus("");
    setSearchQuery("");
    setUser(null);
    fetchedUserIdRef.current = null;
    await supabase.auth.signOut();
  };

  const filteredBooks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return books.filter((book) => {
      const matchesStatus = !filterStatus || book.status === filterStatus;
      const matchesSearch =
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [books, filterStatus, searchQuery]);

  return (
    <BookContext.Provider
      value={{
        user,
        isAuthLoading,
        books,
        filteredBooks,
        isBooksLoading,
        filterStatus,
        searchQuery,
        setFilterStatus,
        setSearchQuery,
        clearFilters,
        addBook,
        advanceStatus,
        advanceBookStatus: advanceStatus,
        deleteBook,
        fetchBooks,
        signOut,
        logout: signOut,
      }}
    >
      {children}
    </BookContext.Provider>
  );
}

export function useBookContext() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useBookContext must be used within a BookProvider");
  }
  return context;
}
