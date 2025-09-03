export interface ForumData {
    data: AnnouncementThread[];
    included: ForumIncluded[];
}

export interface AnnouncementThread {
    id: string;
    type: string;
    attributes: {
        title: string;
        slug: string;
        createdAt: string;
    };
    relationships: {
        firstPost: {
            data: {
                id: string;
                type: string;
            };
        };
    };
}

export interface ForumIncluded {
    id: string;
    type: string;
    attributes: {
        contentHtml: string;
        createdAt: string;
    };
}