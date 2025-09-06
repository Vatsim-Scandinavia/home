import React, { useEffect, useState } from "react";
import useForumData from "@/hooks/useForumData";

const sanitizeHtml = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove all <img> tags
  const images = doc.querySelectorAll("img");
  images.forEach((img) => img.remove());

  return doc.body.innerHTML;
};

const Announcements = () => {
  const { mergedAnnouncements, isLoading, error } = useForumData();

  if (isLoading) {
    return (
      <div>
        {[...Array(2)].map((_, index) => (
          <div
            key={index}
            className="p-2 mt-2 mb-4 animate-pulse rounded"
          >
            <div className="h-6 bg-gray-300 dark:bg-secondary rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-secondary rounded w-full mb-1"></div>
            <div className="h-4 bg-gray-300 dark:bg-secondary rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 mt-2 mb-4 text-danger font-bold">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      {mergedAnnouncements.slice(0, 2).map((post) => (
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

export default Announcements;
