import { FLARUM_API_TOKEN } from "astro:env/server";

const FORUM_BASE = 'https://forum.vatsim-scandinavia.org';
const API_URL = `${FORUM_BASE}/api/discussions`;

export interface ForumDiscussion {
  id: string;
  title: string;
  slug: string;
  url: string;
  createdAt: Date;
  excerpt: string;
  author: {
    name: string;
    avatarUrl: string | null;
  };
  tags: { name: string; color: string }[];
  /** First <img> from the first post, if any */
  bannerImage: { url: string; alt: string } | null;
}

interface JsonApiResource {
  type: string;
  id: string;
  attributes: Record<string, unknown>;
  relationships?: Record<string, { data: { type: string; id: string } | { type: string; id: string }[] }>;
}

interface JsonApiResponse {
  data: JsonApiResource[];
  included?: JsonApiResource[];
}

const DEFAULT_BANNER_ALT = '{NOTAM}';

function resolveForumAssetUrl(src: string): string {
  const s = src.trim();
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('//')) return `https:${s}`;
  return `${FORUM_BASE}${s.startsWith('/') ? '' : '/'}${s}`;
}

/** First image in post HTML for card banners; alt defaults when missing or empty */
function firstImageFromPostHtml(html: string): { url: string; alt: string } | null {
  const imgTagRegex = /<img\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = imgTagRegex.exec(html)) !== null) {
    const tag = m[0];
    const srcMatch = tag.match(/\bsrc\s*=\s*(["'])([^"']*)\1/i);
    if (!srcMatch?.[2]?.trim()) continue;
    const url = resolveForumAssetUrl(srcMatch[2]);
    const altMatch = tag.match(/\balt\s*=\s*(["'])([^"']*)\1/i);
    const rawAlt = altMatch?.[2]?.trim() ?? '';
    const alt = rawAlt !== '' ? rawAlt : DEFAULT_BANNER_ALT;
    return { url, alt };
  }
  return null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveIncluded(type: string, id: string, included: JsonApiResource[]): JsonApiResource | undefined {
  return included.find((r) => r.type === type && r.id === id);
}

function buildHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const token = FLARUM_API_TOKEN;
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  return headers;
}

export async function fetchAnnouncements(limit = 20): Promise<ForumDiscussion[]> {
  try {
    const res = await fetch(
      `${API_URL}?filter[tag]=announcements&include=tags,firstPost,user&sort=-createdAt&page[limit]=${limit}`,
      { headers: buildHeaders() },
    );

    if (!res.ok) {
      console.error(`Flarum API returned ${res.status}`);
      return [];
    }

    const json: JsonApiResponse = await res.json();
    const included = json.included ?? [];

    return json.data.map((discussion) => {
      const attrs = discussion.attributes;

      const firstPostRel = discussion.relationships?.firstPost?.data as { type: string; id: string } | undefined;
      const firstPost = firstPostRel ? resolveIncluded('posts', firstPostRel.id, included) : undefined;
      const contentHtml = (firstPost?.attributes?.contentHtml as string) ?? '';
      const plainText = stripHtml(contentHtml);
      const excerpt = plainText.length > 160 ? plainText.slice(0, 157) + '...' : plainText;

      const userRel = discussion.relationships?.user?.data as { type: string; id: string } | undefined;
      const user = userRel ? resolveIncluded('users', userRel.id, included) : undefined;

      const tagRels = (discussion.relationships?.tags?.data ?? []) as { type: string; id: string }[];
      const tags = tagRels
        .map((t) => resolveIncluded('tags', t.id, included))
        .filter(Boolean)
        .map((t) => ({
          name: (t!.attributes.name as string) ?? '',
          color: (t!.attributes.color as string) ?? '#2D3660',
        }));

      return {
        id: discussion.id,
        title: attrs.title as string,
        slug: attrs.slug as string,
        url: `${FORUM_BASE}/d/${attrs.slug}`,
        createdAt: new Date(attrs.createdAt as string),
        excerpt,
        author: {
          name: (user?.attributes?.displayName as string) ?? 'Unknown',
          avatarUrl: (user?.attributes?.avatarUrl as string) ?? null,
        },
        tags,
        bannerImage: firstImageFromPostHtml(contentHtml),
      };
    });
  } catch (err) {
    console.error('Failed to fetch from Flarum API:', err);
    return [];
  }
}
