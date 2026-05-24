from services.database import db_manager
from services.analytics import analytics_service
import json

def test():
    print("Initializing Database Manager...")
    db_manager.initialize()
    
    print("Testing basic query...")
    df = db_manager.execute_query("SELECT COUNT(*) as count FROM subscribers")
    print(f"Total subscribers count query result: {df['count'].iloc[0]}")
    
    print("Testing analytics service dashboard calculations...")
    dashboard_data = analytics_service.get_dashboard_data(category="Tech")
    print("Dashboard keys: ", list(dashboard_data.keys()))
    print("Metrics: ", json.dumps(dashboard_data['metrics'], indent=2))
    
    print("Cohort count: ", len(dashboard_data['cohorts']))
    print("Referral virality coefficient: ", dashboard_data['referral']['virality_coefficient'])
    print("Monetization history count: ", len(dashboard_data['monetization']['history']))
    print("Funnel stage count: ", len(dashboard_data['funnel']))
    
    print("Testing subscribers list paginated...")
    sub_list = analytics_service.get_subscriber_list(category="Tech", page=1, page_size=5)
    print(f"Subscribers returned: {len(sub_list['subscribers'])} of total {sub_list['total_count']}")
    
    print("All backend tests completed successfully!")

if __name__ == "__main__":
    test()
