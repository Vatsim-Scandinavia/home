import React, { useEffect, useState } from "react";

async function PullForumData(URL: string) {
  try {
    const response = await fetch(URL);
    if (response.ok) {
      const data = await response.json();
      return data.data;
    } else {
      console.error("Error fetching data:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

async function AnnoucementPosts() {
  const posts = [];
  const announcements = await PullForumData(
    "https://forum.vatsim-scandinavia.org/api/discussions?filter[tag]=announcements"
  );

  announcements.sort((a: any, b: any) => {
    const dateA = new Date(a.attributes.createdAt);
    const dateB = new Date(b.attributes.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  for (const post of announcements) {
    const firstPost = await PullForumData(
      "https://forum.vatsim-scandinavia.org/api/posts?filter[id]=" +
        post.relationships.firstPost.data.id
    );
    const firstPostContent = firstPost[0].attributes.contentHtml;
    const postdata = {
      slug: post.attributes.slug,
      title: post.attributes.title,
      created: post.attributes.createdAt,
      content: firstPostContent,
    };
    posts.push(postdata);
  }
  return posts;
}

const sanitizeHtml = (html: any) => {
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
      const posts = await AnnoucementPosts();
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
      {data.splice(0, 2).map((post) => (
        <div
          className="p-2 mt-2 mb-4 hover:bg-white dark:hover:bg-black hover:brightness-[95%] animate-entry"
          key={post.slug}
        >
          <a
            href={"https://forum.vatsim-scandinavia.org/d/" + post.slug}
            target="_blank"
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
