export enum CampaignStates { // eslint-disable-line no-restricted-syntax
  // created a campaign, but not paid for
  created = 'Created',
  // completed the payment successfully, but not yet moderated
  pending = 'Pending',
  // Approved by moderation.
  approved = 'Approved',
  // rejected by moderation.
  rejected = 'Rejected',
  // Finished running and is pending to send the report.
  waitingReport = 'WaitingReport',
  // Complete, The user received the report.
  completed = 'Completed',
}

export type Product = {
  slug: string;
  price: string;
  description: string;
  impressions: string;
};

export type AudienceOption = {
  key: string;
  description: string;
};

export type LanguageOption = {
  key: string;
  description: string;
};
