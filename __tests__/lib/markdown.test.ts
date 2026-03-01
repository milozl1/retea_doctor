import { describe, it, expect } from "vitest";
import { stripMarkdown } from "@/lib/markdown";

// Note: renderMarkdown uses DOMPurify which needs jsdom/DOM.
// We test stripMarkdown (pure string function) and can test renderMarkdown
// separately with a DOM environment if needed.

describe("stripMarkdown", () => {
  it("removes heading markers", () => {
    expect(stripMarkdown("# Hello")).toBe("Hello");
    expect(stripMarkdown("## Subtitle")).toBe("Subtitle");
    expect(stripMarkdown("### Deep")).toBe("Deep");
  });

  it("removes bold markers", () => {
    expect(stripMarkdown("This is **bold** text")).toBe("This is bold text");
  });

  it("removes italic markers", () => {
    expect(stripMarkdown("This is *italic* text")).toBe("This is italic text");
  });

  it("extracts link text", () => {
    expect(stripMarkdown("[Click here](https://example.com)")).toBe("Click here");
  });

  it("extracts image alt text", () => {
    // stripMarkdown removes the link notation [text](url) but leaves the ! prefix
    const result = stripMarkdown("![Alt text](image.png)");
    expect(result).toContain("Alt text");
  });

  it("removes blockquote markers", () => {
    expect(stripMarkdown("> Quoted text")).toBe("Quoted text");
  });

  it("removes list markers", () => {
    expect(stripMarkdown("- Item one")).toBe("Item one");
    expect(stripMarkdown("* Item two")).toBe("Item two");
    expect(stripMarkdown("+ Item three")).toBe("Item three");
  });

  it("collapses multiple newlines", () => {
    expect(stripMarkdown("Line one\n\n\nLine two")).toBe("Line one Line two");
  });

  it("handles empty string", () => {
    expect(stripMarkdown("")).toBe("");
  });

  it("handles plain text without markdown", () => {
    expect(stripMarkdown("Just plain text")).toBe("Just plain text");
  });

  it("removes inline code", () => {
    const result = stripMarkdown("Use `const x = 1` here");
    expect(result).not.toContain("`");
  });

  it("handles complex mixed markdown", () => {
    const input = "# Title\n\n**Bold** and *italic* with [link](url)\n\n> Quote\n\n- List item";
    const result = stripMarkdown(input);
    expect(result).not.toContain("#");
    expect(result).not.toContain("**");
    expect(result).not.toContain("*");
    expect(result).not.toContain("[");
    expect(result).not.toContain(">");
    expect(result).not.toContain("- ");
  });
});
