import React, { useEffect, useState } from "react";

interface ForumThread {
  id: string;
  attributes: {
    title: string;
    slug: string;
    createdAt: string;
  };
  relationships: {
    firstPost: {
      data: {
        id: string;
      };
    };
  };
}
interface ForumPost {
  id: string;
  attributes: {
    contentHtml: string;
  };
}

interface ForumApiResponse {
  data: ForumThread[];
  included: ForumPost[];
}

interface Announcement {
  title: string;
  slug: string;
  created: string;
  content: string;
}

async function getForumAnnouncements(url: string): Promise<ForumApiResponse | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error occured getting announcements! (${response.status})`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

async function getAnnoucementPosts(): Promise<Announcement[]> {
  let mergedAnnouncements = [];
  let announcementThreads = [];
  let announcementPosts = [];
  const rawForumData = await getForumAnnouncements(
    "https://forum.vatsim-scandinavia.org/api/discussions?filter[tag]=announcements"
  );

  if (!rawForumData) return [];

  announcementThreads = rawForumData.data;
  announcementPosts = rawForumData.included.filter(
    (item: any) => item.type === "posts"
  );

  announcementThreads.sort((a: any, b: any) => {
    const dateA = new Date(a.attributes.createdAt);
    const dateB = new Date(b.attributes.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  for (const thread of announcementThreads) {
    const announcementData = {
      title: thread.attributes.title,
      slug: thread.attributes.slug,
      created: thread.attributes.createdAt,
      content:
        announcementPosts.find(
          (post: any) => post.id === thread.relationships.firstPost.data.id
        )?.attributes.contentHtml || "",
    };

    mergedAnnouncements.push(announcementData)
  }

  return mergedAnnouncements;
}

const sanitizeHtml = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove all <img> tags
  const images = doc.querySelectorAll("img");
  images.forEach((img) => img.remove());

  return doc.body.innerHTML;
};

const Annoucements = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const posts = await getAnnoucementPosts();
      setData(posts);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        {[...Array(2)].map((_, index) => (
          <div
            key={index}
            className="p-2 mt-2 mb-4 animate-pulse  rounded"
          >
            <div className="h-6 bg-gray-300 dark:bg-secondary rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-secondary rounded w-full mb-1"></div>
            <div className="h-4 bg-gray-300 dark:bg-secondary rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {data.slice(0, 2).map((post) => (
        <div
          className="p-2 mt-2 mb-4 hover:bg-white dark:hover:bg-black hover:brightness-[95%] animate-entry"
          key={post.slug}
        >
          <a
            href={"https://forum.vatsim-scandinavia.org/d/" + post.slug}
            target="_blank"
            rel="noopener"
          >
            <div className="flex">
              <div className="w-[90%]">
                <div className="font-semibold text-lg md:text-xl text-secondary dark:text-white">
                  {post.title}
                </div>
                <div
                  className="text-sm line-clamp-2"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(post.content),
                  }}
                ></div>
              </div>
              <div className="text-grey text-right text-md dark:text-gray-300 font-bold w-[10%]">
                {new Date(post.created)
                  .toLocaleDateString("default", {
                    day: "2-digit",
                    month: "short",
                  })
                  .toUpperCase()}
              </div>
            </div>
          </a>
        </div>
      ))}
    </>
  );
};

export default Annoucements;
