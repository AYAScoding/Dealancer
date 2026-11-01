import api from "./api";

export async function getCollection(path, signal) {
  const items = [];
  let next = path;
  const visited = new Set();
  while (next && !visited.has(next)) {
    visited.add(next);
    const { data } = await api.get(next, { signal });
    items.push(...(Array.isArray(data) ? data : data.results || []));
    next = Array.isArray(data) ? null : data.next;
  }
  return items;
}
export function apiError(
  error,
  fallback = "Something went wrong. Please try again.",
) {
  const data = error.response?.data;
  if (!data || typeof data !== "object") return fallback;
  return (
    Object.values(data)
      .flat()
      .filter((value) => typeof value === "string")
      .join(" ") || fallback
  );
}
export const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
