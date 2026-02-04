import type { BJ } from '@/types/bj';

export const mockBJs: BJ[] = [
  {
    id: '1',
    name: '크리에이터1',
    platform: 'youtube',
    thumbnailUrl: 'https://via.placeholder.com/150',
    channelUrl: 'https://www.youtube.com/channel/UC1234567890',
    youtubeChannelId: 'UC1234567890',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: '크리에이터2',
    platform: 'youtube',
    thumbnailUrl: 'https://via.placeholder.com/150',
    channelUrl: 'https://www.youtube.com/channel/UC0987654321',
    youtubeChannelId: 'UC0987654321',
    createdAt: new Date().toISOString(),
  },
];
