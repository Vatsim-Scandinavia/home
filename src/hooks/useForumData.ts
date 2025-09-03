import { useEffect, useState } from "react";
import useFetchForumData from "@/hooks/useFetchForumData";

const sortData = (announcementThreads: any[]) => {
    announcementThreads.sort((a: any, b: any) => {
        const dateA = new Date(a.attributes.createdAt);
        const dateB = new Date(b.attributes.createdAt);
        return dateB.getTime() - dateA.getTime();
    });
};

const sanitizeHtml = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    // Remove all <img> tags
    const images = doc.querySelectorAll("img");
    images.forEach((img) => img.remove());
    return doc.body.innerHTML;
};

const mergeThreadsAndPosts = (announcementThreads: any[], announcementPosts: any[]) => {
    return announcementThreads.map((thread: any) => ({
        title: thread.attributes.title,
        slug: thread.attributes.slug,
        created: thread.attributes.createdAt,
        content: sanitizeHtml(
            announcementPosts.find(
                (post: any) => post.id === thread.relationships.firstPost.data.id
            )?.attributes.contentHtml || ""
        ),
    }));
};

/**
 * Custom hook to fetch and manage forum data.
 * @returns {Object} - The merged announcements, loading state, and error state.
 */
export default function useForumData() {
    const [mergedAnnouncements, setMergedAnnouncements] = useState<any[]>([]);
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
                (item: any) => item.type === "posts"
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