export interface FoundBadge {
  line: number;
  raw: string;
  image: string | null;
  link: string | null;
  workflow: string | null;
  wellFormed: boolean;
}
export function maskFencedCodeBlocks(text: string): string;
export function findWorkflowBadges(text: string): FoundBadge[];
