const SECTION_HEADINGS = [
  "alamat",
  "fasilitas",
  "harga tiket",
  "jam operasional",
  "telepon",
  "instagram",
  "sumber",
  "article tags",
  "article categories",
];

const SECTION_HEADING_SET = new Set(SECTION_HEADINGS);

export function normalizeText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

export function truncateText(value: string | null | undefined, length = 150) {
  const text = normalizeText(value);
  if (text.length <= length) return text;
  return `${text.slice(0, length).trim()}...`;
}

export function paragraphs(value: string | null | undefined, max = 7) {
  return (value ?? "")
    .split(/\n+/)
    .flatMap((line) => {
      const trimmedLine = line.trim();
      return trimmedLine ? [trimmedLine] : [];
    })
    .filter((line) => !/^article (tags|categories)/i.test(line))
    .slice(0, max);
}

export function extractSection(value: string | null | undefined, heading: string) {
  const lines = (value ?? "")
    .split(/\n+/)
    .flatMap((line) => {
      const trimmedLine = line.trim();
      return trimmedLine ? [trimmedLine] : [];
    });

  const start = lines.findIndex((line) => line.toLowerCase() === heading.toLowerCase());
  if (start === -1) return null;

  const block: string[] = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const lower = lines[i].toLowerCase();
    if (SECTION_HEADING_SET.has(lower)) break;
    if (/^article (tags|categories)/i.test(lines[i])) break;
    block.push(lines[i]);
  }

  return block.length ? block.join("\n") : null;
}

export function extractInlineArticleTags(value: string | null | undefined) {
  const match = (value ?? "").match(/^Article Tags:\s*(.+)$/im);
  if (!match) return [];

  return match[1]
    .split(/[·,]/)
    .flatMap((tag) => {
      const trimmedTag = tag.trim();
      return trimmedTag ? [trimmedTag] : [];
    });
}

export function categoryClassName(category: string | null | undefined) {
  const normalized = (category ?? "").toLowerCase();
  if (normalized.includes("alam")) return "pill";
  if (normalized.includes("kuliner")) return "pill";
  if (normalized.includes("rekreasi")) return "pill";
  return "pill";
}
