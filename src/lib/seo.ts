import { site } from "@/config/site";

type Opts = { type?: string; crumb?: string; jsonLd?: object[] };

export function pageHead(
  path: string,
  title: string,
  description: string,
  opts: Opts | string = {},
) {
  const o: Opts = typeof opts === "string" ? { type: opts } : opts;
  const url = `${site.url}${path === "/" ? "" : path}`;
  const ld = [...(o.jsonLd ?? [])];
  if (path !== "/") {
    const parts = path.split("/").filter(Boolean);
    ld.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        ...parts.map((_, i) => ({
          "@type": "ListItem",
          position: i + 2,
          name:
            i === parts.length - 1
              ? (o.crumb ?? title)
              : (parts[i] ?? "").replace(/^\w/, (c) => c.toUpperCase()),
          item: `${site.url}/${parts.slice(0, i + 1).join("/")}`,
        })),
      ],
    });
  }
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: o.type ?? "website" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: site.name },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: ld.map((d) => ({ type: "application/ld+json", children: JSON.stringify(d) })),
  };
}
