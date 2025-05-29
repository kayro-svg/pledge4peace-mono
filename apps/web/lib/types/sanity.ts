export interface SanityCampaign {
  _id: string;          // Sanity document ID
  id?: string;          // Optional custom ID field
  title: string;
  description: string;
  commitmentText?: string;
  goalPledges: number;
  currentPledges?: number; // Current number of pledges
  gallery?: {
    _type: string;
    asset: {
      _ref: string;
      _type: string;
    };
    alt?: string;
  }[];
  // Add any other fields that might be used in the application
}
