/**
 * Search Utils
 * 
 * Enhanced search utilities for better content-based searching
 * across models, datasets, and infrastructure providers.
 */

export interface SearchResult {
  item: any;
  score: number;
  matchType: 'name' | 'description' | 'both';
  highlightedName?: string;
  highlightedDescription?: string;
}

export interface SearchOptions {
  includeDescription?: boolean;
  caseSensitive?: boolean;
  minScore?: number;
  maxResults?: number;
}

/**
 * Calculate search relevance score based on match quality
 * @param item The item being searched
 * @param query The search query
 * @param type The type of item (model, dataset, infra)
 * @returns Object with match information and score
 */
export function calculateSearchScore(
  item: any, 
  query: string, 
  type: string
): { score: number; matchType: 'name' | 'description' | 'both'; nameMatch: boolean; descMatch: boolean } {
  const normalizedQuery = query.trim().toLowerCase();
  let score = 0;
  let nameMatch = false;
  let descMatch = false;
  let matchType: 'name' | 'description' | 'both' = 'name';

  // Check name match
  if (type === 'infra') {
    const name = item?.name?.toLowerCase() || '';
    if (name.includes(normalizedQuery)) {
      nameMatch = true;
      score += 100; // High score for name match
      
      // Bonus for exact match
      if (name === normalizedQuery) score += 50;
      // Bonus for starts with
      else if (name.startsWith(normalizedQuery)) score += 25;
    }
  } else {
    const name = item?.metadata?.name?.toLowerCase() || '';
    if (name.includes(normalizedQuery)) {
      nameMatch = true;
      score += 100; // High score for name match
      
      // Bonus for exact match
      if (name === normalizedQuery) score += 50;
      // Bonus for starts with
      else if (name.startsWith(normalizedQuery)) score += 25;
    }
  }

  // Check description match
  const description = type === 'infra' 
    ? item?.description?.toLowerCase() || ''
    : item?.metadata?.description?.toLowerCase() || '';
    
  if (description.includes(normalizedQuery)) {
    descMatch = true;
    score += 50; // Lower score for description match
    
    // Bonus for exact phrase match
    if (description.includes(` ${normalizedQuery} `)) score += 20;
  }

  // Determine match type
  if (nameMatch && descMatch) {
    matchType = 'both';
    score += 25; // Bonus for both matches
  } else if (descMatch) {
    matchType = 'description';
  }

  return { score, matchType, nameMatch, descMatch };
}

/**
 * Highlight matching text in a string
 * @param text The text to highlight
 * @param query The search query
 * @param maxLength Maximum length of highlighted text
 * @returns Highlighted text with HTML-like tags
 */
export function highlightMatch(text: string, query: string, maxLength: number = 100): string {
  if (!text || !query) return text;
  
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedText = text.toLowerCase();
  const queryIndex = normalizedText.indexOf(normalizedQuery);
  
  if (queryIndex === -1) return text;
  
  // Find context around the match
  const start = Math.max(0, queryIndex - 20);
  const end = Math.min(text.length, queryIndex + normalizedQuery.length + 20);
  
  let highlighted = text.substring(start, end);
  
  // Add ellipsis if truncated
  if (start > 0) highlighted = '...' + highlighted;
  if (end < text.length) highlighted = highlighted + '...';
  
  // Highlight the match (using simple text replacement for now)
  const regex = new RegExp(`(${query})`, 'gi');
  highlighted = highlighted.replace(regex, `**$1**`);
  
  return highlighted;
}

/**
 * Enhanced search function with scoring and ranking
 * @param data Array of items to search through
 * @param query Search query
 * @param type Type of items to search (model, dataset, infra)
 * @param options Search options
 * @returns Ranked search results
 */
export function enhancedSearch(
  data: any[], 
  query: string, 
  type: string, 
  options: SearchOptions = {}
): SearchResult[] {
  const {
    includeDescription = true,
    minScore = 0,
    maxResults = 10
  } = options;

  if (!query.trim()) return [];

  const results: SearchResult[] = [];

  for (const item of data) {
    // Skip items that don't match basic criteria
    if (type === 'infra') {
      if (!item?.name) continue;
    } else {
      if (item?.metadata?.type !== type || 
          !item?.usageHistory || 
          !Array.isArray(item.usageHistory) || 
          item.usageHistory.length === 0) {
        continue;
      }
    }

    const { score, matchType, nameMatch, descMatch } = calculateSearchScore(item, query, type);
    
    if (score >= minScore) {
      results.push({
        item,
        score,
        matchType,
        highlightedName: nameMatch ? highlightMatch(
          type === 'infra' ? item.name : item.metadata?.name || '', 
          query
        ) : undefined,
        highlightedDescription: descMatch ? highlightMatch(
          type === 'infra' ? item.description || '' : item.metadata?.description || '', 
          query
        ) : undefined
      });
    }
  }

  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);
  
  // Limit results
  return results.slice(0, maxResults);
}

/**
 * Simple search function (backward compatible)
 * @param data Array of items to search through
 * @param query Search query
 * @param type Type of items to search
 * @returns Filtered items
 */
export function simpleSearch(data: any[], query: string, type: string): any[] {
  const normalizedQuery = query.trim().toLowerCase();
  
  if (type === 'infra') {
    return data?.filter((item: any) => {
      const nameMatch = item?.name?.toLowerCase()?.includes(normalizedQuery);
      const descriptionMatch = item?.description?.toLowerCase()?.includes(normalizedQuery);
      return nameMatch || descriptionMatch;
    }) || [];
  }
  
  return data?.filter((item: any) => {
    if (item?.metadata?.type !== type || 
        !item?.usageHistory || 
        !Array.isArray(item.usageHistory) || 
        item.usageHistory.length === 0) {
      return false;
    }
    
    const nameMatch = item?.metadata?.name?.toLowerCase()?.includes(normalizedQuery);
    const descriptionMatch = item?.metadata?.description?.toLowerCase()?.includes(normalizedQuery);
    
    return nameMatch || descriptionMatch;
  }) || [];
}
