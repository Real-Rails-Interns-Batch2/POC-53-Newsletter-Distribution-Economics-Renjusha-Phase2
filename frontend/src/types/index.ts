export interface MetricInsight {
  value: string;
  label: string;
  insight: string;
  status: 'positive' | 'neutral' | 'negative';
}

export interface HighLevelMetrics {
  total_subscribers: MetricInsight;
  open_rate: MetricInsight;
  growth_velocity: MetricInsight;
  revenue_efficiency: MetricInsight;
}

export interface CohortRetentionRow {
  cohort_month: string;
  original_size: number;
  acquisition_source: string;
  retention_rates: number[];
  avg_open_rate: number;
  avg_click_rate: number;
}

export interface ReferralFlywheelNode {
  id: string;
  label: string;
  size: number;
  type: 'source' | 'subscriber' | 'influencer';
}

export interface ReferralFlywheelLink {
  source: string;
  target: string;
  value: number;
  conversion_rate: number;
}

export interface ReferralFlywheelData {
  nodes: ReferralFlywheelNode[];
  links: ReferralFlywheelLink[];
  virality_coefficient: number;
  total_referrals: number;
  insight: string;
}

export interface MonetizationMetrics {
  month: string;
  sponsorship_revenue: number;
  premium_subscription_revenue: number;
  total_revenue: number;
  active_sponsors: number;
  avg_cpm: number;
  revenue_per_subscriber: number;
}

export interface MonetizationResponse {
  history: MonetizationMetrics[];
  sponsorship_yield_insight: string;
  premium_growth_insight: string;
  overall_rev_insight: string;
}

export interface FunnelStage {
  stage: string;
  count: number;
  percentage_of_total: number;
  percentage_of_previous: number;
  insight: string;
}

export interface SubscriberRecord {
  subscriber_id: string;
  email: string;
  category: string;
  acquisition_source: string;
  signup_month: string;
  status: string;
  months_active: number;
  tier: string;
  open_rate: number;
  click_rate: number;
  unsubscribe_rate: number;
  deliverability_score: number;
  premium_subscription_revenue: number;
}

export interface SubscriberListResponse {
  subscribers: SubscriberRecord[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface BenchmarkComparison {
  metric: string;
  actual: number;
  benchmark: number;
  difference: number;
  status: 'outperforms' | 'underperforms' | 'aligns';
  insight: string;
}

export interface DashboardPayload {
  metrics: HighLevelMetrics;
  cohorts: CohortRetentionRow[];
  referral: ReferralFlywheelData;
  monetization: MonetizationResponse;
  funnel: FunnelStage[];
  benchmarks: BenchmarkComparison[];
}

export interface Filters {
  category: string;
  source: string;
  cohort_period: string;
  revenue_range: string;
  referral_segment: string;
  open_rate_threshold: number | null;
}
