export type FeatureAnnouncement = {
  id: string;
  publishedAt: string;
  path: string;
};

export const FEATURE_ANNOUNCEMENT_DAYS = 7;

// Add new feature announcements here. Entries automatically disappear seven days after launch.
export const featureAnnouncements: FeatureAnnouncement[] = [
  {
    id: 'timetable',
    publishedAt: '2026-08-25',
    path: '/generator/timetable',
  },
];

export const isFeatureAnnouncementActive = (
  announcement: FeatureAnnouncement,
  now = new Date(),
) => {
  const launchDate = new Date(`${announcement.publishedAt}T00:00:00`);
  const expiresAt = new Date(launchDate);
  expiresAt.setDate(expiresAt.getDate() + FEATURE_ANNOUNCEMENT_DAYS);
  return now >= launchDate && now < expiresAt;
};
