from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class MetricInsight(BaseModel):
    value: str
    label: str
    insight: str
    status: str  # 'positive', 'neutral', 'negative'

class HighLevelMetrics(BaseModel):
    total_subscribers: MetricInsight
    open_rate: MetricInsight
    growth_velocity: MetricInsight
    revenue_efficiency: MetricInsight

class CohortRetentionRow(BaseModel):
    cohort_month: str
    original_size: int
    acquisition_source: str
    retention_rates: List[float]  # Index 0 is Month 0 (100%), index 1 is Month 1, etc.
    avg_open_rate: float
    avg_click_rate: float

class ReferralFlywheelNode(BaseModel):
    id: str
    label: str
    size: int
    type: str  # 'source', 'subscriber', 'influencer'

class ReferralFlywheelLink(BaseModel):
    source: str
    target: str
    value: int
    conversion_rate: float

class ReferralFlywheelData(BaseModel):
    nodes: List[ReferralFlywheelNode]
    links: List[ReferralFlywheelLink]
    virality_coefficient: float
    total_referrals: int
    insight: str

class MonetizationMetrics(BaseModel):
    month: str
    sponsorship_revenue: float
    premium_subscription_revenue: float
    total_revenue: float
    active_sponsors: int
    avg_cpm: float
    revenue_per_subscriber: float

class MonetizationResponse(BaseModel):
    history: List[MonetizationMetrics]
    sponsorship_yield_insight: str
    premium_growth_insight: str
    overall_rev_insight: str

class FunnelStage(BaseModel):
    stage: str
    count: int
    percentage_of_total: float
    percentage_of_previous: float
    insight: str

class SubscriberRecord(BaseModel):
    subscriber_id: str
    email: str
    category: str
    acquisition_source: str
    signup_month: str
    status: str
    months_active: int
    tier: str
    open_rate: float
    click_rate: float
    unsubscribe_rate: float
    deliverability_score: float
    premium_subscription_revenue: float

class SubscriberListResponse(BaseModel):
    subscribers: List[SubscriberRecord]
    total_count: int
    page: int
    page_size: int

class BenchmarkComparison(BaseModel):
    metric: str
    actual: float
    benchmark: float
    difference: float
    status: str  # 'outperforms', 'underperforms', 'aligns'
    insight: str

class DashboardPayload(BaseModel):
    metrics: HighLevelMetrics
    cohorts: List[CohortRetentionRow]
    referral: ReferralFlywheelData
    monetization: MonetizationResponse
    funnel: List[FunnelStage]
    benchmarks: List[BenchmarkComparison]
