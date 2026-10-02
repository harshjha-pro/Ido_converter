import review from './review.json';

/** AGENTS.md rule 5: true only once a named CA has signed off this tool in review.json. */
export function caReviewed(slug: string): boolean {
  const entry = (review.tools as Record<string, { reviewedBy: string }>)[slug];
  return !!entry && entry.reviewedBy.trim() !== '';
}
