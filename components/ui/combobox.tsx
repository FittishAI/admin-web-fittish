"use client";

import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useGetQuestions } from "@/hooks/useGetQuestions";
import { useState } from "react";
import { Label } from "@/components/ui/label";

export function SuggestiveQuestionSearch({
  categoryId,
  onSelect,
}: {
  categoryId: number;
  onSelect: (q: any) => void;
}) {
  const { data } = useGetQuestions(categoryId);
  const [inputValue, setInputValue] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSelect = (q: any) => {
    setInputValue(q.questionText);
    setFocused(false);
    onSelect(q);
  };

  const handleCreateNew = () => {
    // Create a new question object without the id
    const newQuestion = {
      questionText: inputValue,
    };
    onSelect(newQuestion);
    setInputValue(""); // Clear input field
    setFocused(false); // Close the list
  };

  const filteredData = data?.filter((q) =>
    q.questionText.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-1">
      <Label className="text-sm text-muted-foreground">Existing</Label>
      <Command className="w-full border rounded-md shadow-sm">
        <CommandInput
          placeholder="Search existing questions..."
          value={inputValue}
          onValueChange={(val) => {
            setInputValue(val);
            setFocused(true);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)} // Allow selection
        />
        {focused && (
          <CommandList>
            {filteredData?.map((q) => (
              <CommandItem
                key={q.id}
                value={q.questionText}
                onSelect={() => handleSelect(q)}
                className="flex items-center justify-between"
              >
                <span>{q.questionText}</span>
                <Badge variant="danger">Exists</Badge>
              </CommandItem>
            ))}
            {filteredData?.length === 0 && (
              <CommandItem
                onSelect={handleCreateNew}
                className="flex items-center justify-between"
              >
                <span>Create new option: {inputValue}</span>
                <Badge variant="danger">Create</Badge>
              </CommandItem>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  );
}
