export type SupabaseRelation<T> = T | T[] | null | undefined;

export function firstRelation<T>(relation: SupabaseRelation<T>): T | null {
  if (Array.isArray(relation)) return relation[0] ?? null;
  return relation ?? null;
}
