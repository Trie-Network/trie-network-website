/**
 * Trending Utils
 * 
 * Utility functions for calculating trending scores and sorting algorithms
 * for AI models and datasets based on activity patterns.
 */

export interface TrendingScore {
  totalActivity: number;
  recentActivity: number;
  weightedScore: number;
  lastUsed: number;
}

export interface TrendingOptions {
  recentDays?: number;
  weightRecent?: number;
  weightTotal?: number;
}

/**
 * Calculate trending score based on activity patterns
 * @param usageHistory Array of usage records with Epoch timestamps
 * @param options Configuration for scoring algorithm
 * @returns TrendingScore object with various metrics
 */
export function calculateTrendingScore(
  usageHistory: any[], 
  options: TrendingOptions = {}
): TrendingScore {
  const {
    recentDays = 7,
    weightRecent = 0.7,
    weightTotal = 0.3
  } = options;

  if (!usageHistory || usageHistory.length === 0) {
    return {
      totalActivity: 0,
      recentActivity: 0,
      weightedScore: 0,
      lastUsed: 0
    };
  }

  const now = Date.now() / 1000; // Current epoch in seconds
  const recentThreshold = now - (recentDays * 24 * 60 * 60); // 7 days ago

  // Count recent activity (last 7 days)
  const recentActivity = usageHistory.filter(
    (record: any) => record.Epoch && record.Epoch >= recentThreshold
  ).length;

  // Total activity count
  const totalActivity = usageHistory.length;

  // Get most recent usage timestamp
  const lastUsed = Math.max(
    ...usageHistory.map((record: any) => record.Epoch || 0)
  );

  // Calculate weighted score (recent activity weighted more heavily)
  const weightedScore = (recentActivity * weightRecent) + (totalActivity * weightTotal);

  return {
    totalActivity,
    recentActivity,
    weightedScore,
    lastUsed
  };
}

/**
 * Sort items by trending score (most trending first)
 * @param a First item to compare
 * @param b Second item to compare
 * @param options Trending calculation options
 * @returns Comparison result for sorting
 */
export function sortByTrendingScore(
  a: any, 
  b: any, 
  options: TrendingOptions = {}
): number {
  const scoreA = calculateTrendingScore(a?.usageHistory || [], options);
  const scoreB = calculateTrendingScore(b?.usageHistory || [], options);

  // Primary sort: weighted score (most trending first)
  if (scoreA.weightedScore !== scoreB.weightedScore) {
    return scoreB.weightedScore - scoreA.weightedScore;
  }

  // Secondary sort: total activity
  if (scoreA.totalActivity !== scoreB.totalActivity) {
    return scoreB.totalActivity - scoreA.totalActivity;
  }

  // Tertiary sort: most recent usage
  return scoreB.lastUsed - scoreA.lastUsed;
}

/**
 * Sort items by pure activity count (token chain length)
 * @param a First item to compare
 * @param b Second item to compare
 * @returns Comparison result for sorting
 */
export function sortByActivityCount(a: any, b: any): number {
  const activityA = a?.usageHistory?.length || 0;
  const activityB = b?.usageHistory?.length || 0;

  if (activityA !== activityB) {
    return activityB - activityA;
  }

  // Tiebreaker: most recent usage
  const lastUsedA = Math.max(...(a?.usageHistory?.map((r: any) => r.Epoch || 0) || [0]));
  const lastUsedB = Math.max(...(b?.usageHistory?.map((r: any) => r.Epoch || 0) || [0]));
  
  return lastUsedB - lastUsedA;
}

/**
 * Get activity summary text for display
 * @param usageHistory Array of usage records
 * @param options Trending calculation options
 * @returns Formatted activity summary string
 */
export function getActivitySummary(
  usageHistory: any[], 
  options: TrendingOptions = {}
): string {
  const score = calculateTrendingScore(usageHistory, options);
  
  if (score.totalActivity === 0) {
    return 'No activity';
  }

  const recentText = score.recentActivity > 0 
    ? `${score.recentActivity} recent` 
    : 'No recent activity';

  return `${score.totalActivity} total uses • ${recentText}`;
}

/**
 * Filter items that have meaningful activity
 * @param data Array of items to filter
 * @param type Type of item ('model' or 'dataset')
 * @param minActivity Minimum activity threshold
 * @returns Filtered array of items
 */
export function filterByActivity(
  data: any[], 
  type: string, 
  minActivity: number = 1
): any[] {
  return data?.filter((item: any) =>
    item?.metadata?.type === type &&
    item?.usageHistory &&
    Array.isArray(item.usageHistory) &&
    item.usageHistory.length >= minActivity
  ) || [];
}
