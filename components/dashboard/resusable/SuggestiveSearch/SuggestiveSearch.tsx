"use client";

import { useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type Question = {
  id: number | null;
  questionText: string;
};

interface Props {
  categoryId: number;
  value: string;
  onChange: (val: string) => void;
  onSelect: (q: Question) => void;
  fetchFn: (categoryId: number, search: string) => Promise<Question[]>;
  isNext: boolean;
}

export default function SuggestiveSearch({
  categoryId,
  value,
  onChange,
  onSelect,
  fetchFn,
  isNext,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const [allFetched, setAllFetched] = useState<Question[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputWidth, setInputWidth] = useState(0);

  useEffect(() => {
    fetchFn(categoryId, "")
      .then((res) => {
        if (Array.isArray(res)) {
          setAllFetched(res);
        } else {
          console.warn("fetchFn did not return an array", res);
          setAllFetched([]);
        }
      })
      .catch((err) => {
        console.error("Error in fetchFn:", err);
        setAllFetched([]);
      });
  }, [categoryId, fetchFn]);

  useEffect(() => {
    if (inputRef.current) {
      setInputWidth(inputRef.current.offsetWidth);
    }
  }, []);

  const filtered =
    Array.isArray(allFetched) && search
      ? allFetched.filter((q) =>
          q.questionText.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  const handleSelect = (selected: Question) => {
    onSelect(selected);
    setSearch(selected.questionText);
    setOpen(false);
  };

  const shouldShowCreate =
    search.length > 1 &&
    !filtered.some(
      (r) => r.questionText.toLowerCase() === search.toLowerCase()
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => {
            const val = e.target.value;
            setSearch(val);
            onChange(val);
          }}
          onClick={() => setOpen(true)}
          placeholder="Search or enter new question"
          className="w-full rounded-md border px-3 py-2 text-sm text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
        />
      </PopoverTrigger>

      <PopoverContent
        style={{ width: inputWidth }}
        className="p-0 max-h-60 overflow-y-auto border text-left rounded-md shadow-md bg-white z-50"
        sideOffset={4}
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type to search..."
            value={search}
            onValueChange={(val) => {
              setSearch(val);
              onChange(val);
            }}
            className="text-left"
          />
          <CommandList>
            {filtered.map((item) => (
              <CommandItem
                key={item.id || item.questionText}
                value={item.questionText}
                onSelect={() => handleSelect(item)}
                className={`px-3 py-2 flex justify-between items-center ${
                  !isNext && item.id !== null
                    ? "cursor-not-allowed opacity-70"
                    : ""
                }`}
              >
                <span>{item.questionText}</span>
                {!isNext && item.id !== null && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-md">
                    Existing
                  </span>
                )}
              </CommandItem>
            ))}

            {shouldShowCreate && (
              <>
                <div className="px-3 py-1 text-xs text-muted-foreground border-t bg-muted">
                  No exact match
                </div>
                <CommandItem
                  onSelect={() =>
                    handleSelect({ id: null, questionText: search })
                  }
                  className="px-3 py-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Create new: “{search}”
                </CommandItem>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
