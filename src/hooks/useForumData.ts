import { useEffect, useState } from "react";
import useFetchForumData from "@/hooks/useFetchForumData";
import type { ForumPost, ForumThread, MergedAnnouncement } from "@/interfaces/Forum";

/**
 * Sort announcement threads by creation date in descending order.
 * @param announcementThreads Array of announcement threads.
 */
const sortData = (announcementThreads: ForumThread[]) => {
    announcementThreads.sort((a, b) => {
        const dateA = new Date(a.attributes.createdAt);
        const dateB = new Date(b.attributes.createdAt);
        return dateB.getTime() - dateA.getTime();
    });
};

/**
 * Sanitize HTML string by removing unwanted tags.
 * @param html HTML string to sanitize.
 * @returns Sanitized HTML string.
 */
const sanitizeHtml = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    // Remove all <img> tags
    const images = doc.querySelectorAll("img");
    images.forEach((img) => img.remove());
    return doc.body.innerHTML;
};

/**
 * Merge announcement threads and posts into a single array.
 * @param announcementThreads Array of announcement threads.
 * @param announcementPosts Array of announcement posts.
 * @returns Merged array of announcement threads and posts.
 */
const mergeThreadsAndPosts = (announcementThreads: ForumThread[], announcementPosts: ForumPost[]) => {
    return announcementThreads.map((thread: ForumThread) => ({
        title: thread.attributes.title,
        slug: thread.attributes.slug,
        created: thread.attributes.createdAt,
        content: sanitizeHtml(
            announcementPosts.find(
                (post) => post.id === thread.relationships.firstPost.data.id
            )?.attributes.contentHtml || ""
        ),
    }));
};

/**
 * Custom hook to fetch and manage forum data.
 * @returns {Object} - The merged announcements, loading state, and error state.
 */
export default function useForumData(): object {
    const [mergedAnnouncements, setMergedAnnouncements] = useState<MergedAnnouncement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { forumData, isLoading: isForumDataLoading, error: forumDataError } = useFetchForumData();

    useEffect(() => {
        if (isForumDataLoading) {
            setIsLoading(true);
            return;
        }
        if (forumDataError) {
            setError(forumDataError);
            setIsLoading(false);
            return;
        }
        try {
            const announcementThreads = forumData?.data ?? [];
            const announcementPosts = forumData?.included?.filter(
                (item) => item.type === "posts"
            ) ?? [];
            sortData(announcementThreads);
            const merged = mergeThreadsAndPosts(announcementThreads, announcementPosts);
            setMergedAnnouncements(merged);
            setError(null);
        } catch (err: any) {
            setError(err.message || "An error occurred while processing forum data.");
        } finally {
            setIsLoading(false);
        }
    }, [forumData, isForumDataLoading, forumDataError]);

    return { mergedAnnouncements, isLoading, error };
}