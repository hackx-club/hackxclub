import { site } from "@/config/site";

export type SeoOpts = {
  type?: string;
  crumb?: string;
  jsonLd?: object[];
  keywords?: string;
  image?: string;
  robots?: string;
};

export function pageHead(
  path: string,
  title: string,
  description: string,
  opts: SeoOpts | string = {},
) {
  const o: SeoOpts = typeof opts === "string" ? { type: opts } : opts;
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

  const shareImage = o.image?.startsWith("https://") ? o.image : undefined;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      ...(o.keywords ? [{ name: "keywords", content: o.keywords }] : []),
      {
        name: "robots",
        content:
          o.robots ??
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: o.type ?? "website" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: site.name },
      { property: "og:locale", content: "en_IN" },
      ...(shareImage ? [{ property: "og:image", content: shareImage }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      ...(shareImage ? [{ name: "twitter:image", content: shareImage }] : []),
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: ld.map((d) => ({ type: "application/ld+json", children: JSON.stringify(d) })),
  };
}
