from fastapi import APIRouter, Query, Response
from fastapi.responses import StreamingResponse
import io
from typing import Optional
from schemas.analytical_models import DashboardPayload, SubscriberListResponse
from services.analytics import analytics_service

router = APIRouter(prefix="/api/intelligence", tags=["intelligence"])

@router.get("/dashboard", response_model=DashboardPayload)
def get_dashboard_intelligence(
    category: Optional[str] = Query('All', description="Filter by newsletter category"),
    source: Optional[str] = Query('All', description="Filter by subscriber source"),
    cohort_period: Optional[str] = Query('All', description="Filter by cohort period (signup month)"),
    revenue_range: Optional[str] = Query('All', description="Filter by revenue range"),
    referral_segment: Optional[str] = Query('All', description="Filter by referral segment"),
    open_rate_threshold: Optional[float] = Query(None, description="Filter by minimum open rate")
):
    # Process inputs
    data = analytics_service.get_dashboard_data(
        category=category,
        source=source,
        cohort_period=cohort_period,
        revenue_range=revenue_range,
        referral_segment=referral_segment,
        open_rate_threshold=open_rate_threshold
    )
    return data

@router.get("/subscribers", response_model=SubscriberListResponse)
def get_subscribers(
    category: Optional[str] = Query('All'),
    source: Optional[str] = Query('All'),
    cohort_period: Optional[str] = Query('All'),
    revenue_range: Optional[str] = Query('All'),
    referral_segment: Optional[str] = Query('All'),
    open_rate_threshold: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    data = analytics_service.get_subscriber_list(
        category=category,
        source=source,
        cohort_period=cohort_period,
        revenue_range=revenue_range,
        referral_segment=referral_segment,
        open_rate_threshold=open_rate_threshold,
        page=page,
        page_size=page_size
    )
    return data

@router.get("/export")
def export_data(
    category: Optional[str] = Query('All'),
    source: Optional[str] = Query('All'),
    cohort_period: Optional[str] = Query('All'),
    revenue_range: Optional[str] = Query('All'),
    referral_segment: Optional[str] = Query('All'),
    open_rate_threshold: Optional[float] = Query(None),
    format: str = Query('csv', regex='^(csv|json)$')
):
    df = analytics_service.export_subscribers(
        category=category,
        source=source,
        cohort_period=cohort_period,
        revenue_range=revenue_range,
        referral_segment=referral_segment,
        open_rate_threshold=open_rate_threshold
    )
    
    if format == 'csv':
        stream = io.StringIO()
        df.to_csv(stream, index=False)
        response = Response(content=stream.getvalue(), media_type="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=subscriber_economics_export.csv"
        return response
    else:
        # JSON format
        json_data = df.to_json(orient='records')
        response = Response(content=json_data, media_type="application/json")
        response.headers["Content-Disposition"] = "attachment; filename=subscriber_economics_export.json"
        return response
