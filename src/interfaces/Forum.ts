export interface ForumThread {
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

export interface ForumPost {
    id: string;
    type: string;
    attributes: {
        contentHtml: string;
    };
}

export interface MergedAnnouncement {
    title: string;
    slug: string;
    created: string;
    content: string;
}

export interface ForumData {
    data: ForumThread[];
    included: ForumPost[];
}