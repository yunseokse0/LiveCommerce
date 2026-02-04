export type AdType = 'top_banner' | 'bottom_banner' | 'popup';

export type ABTestVariant = 'A' | 'B';

export interface Ad {
  id: string;
  type: AdType;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  displayOrder: number;
  cpm?: number;
  cpc?: number;
  abTestGroup?: string;
  abTestVariant?: ABTestVariant;
  abTestWeight?: number;
  targetPages?: string[];
  targetUserGroups?: string[];
  scheduleDays?: number[];
  scheduleStartTime?: string;
  scheduleEndTime?: string;
  timezone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdStats {
  id: string;
  adId: string;
  eventType: 'impression' | 'click';
  userId: string;
  pageUrl: string;
  createdAt: string;
}

export interface AdStatsSummary {
  adId: string;
  impressions: number;
  clicks: number;
  ctr: number;
}
