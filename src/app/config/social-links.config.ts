export interface SocialLink {
  id: number;
  platform: 'Facebook' | 'LinkedIn' | 'GitHub' ;
  url: string;
  title?: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: 1,
    platform: 'GitHub',
    url: 'https://github.com/HryhoriiKyrylchenko',
    title: 'GitHub Profile'
  },
  {
    id: 2,
    platform: 'LinkedIn',
    url: 'https://www.linkedin.com/in/hryhorii-kyrylchenko/',
    title: 'LinkedIn Profile'
  },
  {
    id: 3,
    platform: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61565373477170',
    title: 'Facebook Page'
  }
];
