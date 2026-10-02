// Next.js page searchParams -> "a=1&b=2&b=3" (array values repeat the key)
export const toQueryString = (
  params: Record<string, string | string[] | undefined>,
  exclude: string[] = [],
) =>
  Object.entries(params)
    .filter(([key, value]) => value !== undefined && !exclude.includes(key))
    .flatMap(([key, value]) =>
      (Array.isArray(value) ? value : [value as string]).map(
        (item) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`,
      ),
    )
    .join("&");
