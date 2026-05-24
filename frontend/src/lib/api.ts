import { Filters, DashboardPayload, SubscriberListResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/intelligence';

function buildQueryString(filters: Filters): string {
  const params = new URLSearchParams();
  
  if (filters.category && filters.category !== 'All') params.append('category', filters.category);
  if (filters.source && filters.source !== 'All') params.append('source', filters.source);
  if (filters.cohort_period && filters.cohort_period !== 'All') params.append('cohort_period', filters.cohort_period);
  if (filters.revenue_range && filters.revenue_range !== 'All') params.append('revenue_range', filters.revenue_range);
  if (filters.referral_segment && filters.referral_segment !== 'All') params.append('referral_segment', filters.referral_segment);
  if (filters.open_rate_threshold !== null && filters.open_rate_threshold !== undefined) {
    params.append('open_rate_threshold', (filters.open_rate_threshold / 100).toString()); // convert from pct to fraction
  }
  
  return params.toString();
}

export async function fetchDashboardData(filters: Filters): Promise<DashboardPayload> {
  const qs = buildQueryString(filters);
  const response = await fetch(`${API_BASE_URL}/dashboard?${qs}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard intelligence: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchSubscribersList(
  filters: Filters,
  page: number = 1,
  pageSize: number = 20
): Promise<SubscriberListResponse> {
  const qs = buildQueryString(filters);
  const response = await fetch(`${API_BASE_URL}/subscribers?${qs}&page=${page}&page_size=${pageSize}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch subscriber list: ${response.statusText}`);
  }
  return response.json();
}

export function getExportUrl(filters: Filters, format: 'csv' | 'json'): string {
  const qs = buildQueryString(filters);
  return `${API_BASE_URL}/export?${qs}&format=${format}`;
}
