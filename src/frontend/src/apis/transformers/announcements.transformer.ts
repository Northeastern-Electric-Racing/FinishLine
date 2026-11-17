import { AnnouncementPage, BaseAnnouncement } from 'shared';

export const baseAnnouncementTransformer = (announcement: BaseAnnouncement): BaseAnnouncement => {
  return {
    ...announcement,
    dateMessageSent: new Date(announcement.dateMessageSent),
    dateDeleted: announcement.dateDeleted ? new Date(announcement.dateDeleted) : undefined
  };
};

export const announcementPageTransformer = (page: AnnouncementPage): AnnouncementPage => {
  return {
    ...page,
    announcements: page.announcements.map(baseAnnouncementTransformer)
  };
};
