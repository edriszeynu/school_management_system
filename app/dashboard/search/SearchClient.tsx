// app/(dashboard)/search/SearchClient.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, X, Loader2, Users, GraduationCap, BookOpen, User } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { globalSearch, type SearchResult } from "@/app/actions/search";

// Icon mapping
const typeIcons = {
  student: Users,
  teacher: GraduationCap,
  class: BookOpen,
  user: User,
};

const typeLabels = {
  student: "Student",
  teacher: "Teacher",
  class: "Class",
  user: "User",
};

const typeColors = {
  student: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  teacher: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  class: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  user: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "student" | "teacher" | "class" | "user">("all");
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!query || query.length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await globalSearch(query);
        setResults(data);
      } catch {
        setError("Failed to perform search. Please try again.");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);
    return () => {
      clearTimeout(timeout);
    };
  }, [query]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
  };

  // Filter results by type
  const filteredResults =
    activeTab === "all" ? results : results.filter((r) => r.type === activeTab);

  const resultCount = filteredResults.length;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Global Search</CardTitle>
          <CardDescription>
            Search for students, teachers, classes, and users across the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Type at least 2 characters to search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-10 h-12 text-base"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {isLoading && (
            <div className="flex justify-center mt-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded mt-2">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {query.length >= 2 && !isLoading && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Results</CardTitle>
              <span className="text-sm text-muted-foreground">
                {resultCount} found
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {resultCount === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No results found for &quot;{query}&quot;.
              </div>
            ) : (
              <>
                <Tabs
                  defaultValue="all"
                  value={activeTab}
                  onValueChange={(v) =>
                    setActiveTab(v as typeof activeTab)
                  }
                  className="mb-4"
                >
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="student">Students</TabsTrigger>
                    <TabsTrigger value="teacher">Teachers</TabsTrigger>
                    <TabsTrigger value="class">Classes</TabsTrigger>
                    <TabsTrigger value="user">Users</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults.map((result, index) => {
                        const Icon = typeIcons[result.type];
                        return (
                          <TableRow key={`${result.type}-${result.id}`}>
                            <TableCell className="text-muted-foreground text-sm">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                {result.name}
                              </div>
                              {result.email && (
                                <div className="text-xs text-muted-foreground">
                                  {result.email}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={typeColors[result.type]}>
                                {typeLabels[result.type]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {result.additionalInfo || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <a href={result.link}>View</a>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}