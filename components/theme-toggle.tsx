"use client";

import * as React from "react";
import { useTheme } from "@/lib/theme-context";
import { MoonIcon, SunIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
        {resolvedTheme === "dark" ? (
          <MoonIcon className="h-4 w-4" />
        ) : (
          <SunIcon className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}