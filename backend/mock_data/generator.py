import json
import os
import random
from datetime import datetime, timedelta

def generate_mock_data():
    random.seed(42)  # For deterministic data generation
    
    categories = ['Tech', 'Fintech', 'AI/Data', 'Growth/Marketing']
    sources = ['Organic Search', 'X/Twitter', 'Referral Flywheel', 'Paid Ads', 'Partner Swaps', 'Direct']
    
    # 1. Generate Subscribers
    subscribers = []
    # Create ~5000 subscribers to have a realistic subset
    num_subscribers = 5000
    
    # Timeline: Jan 2025 to May 2026
    start_date = datetime(2025, 1, 1)
    end_date = datetime(2026, 5, 1)
    
    # We will map each subscriber to a category for filtering convenience
    sub_ids = [f"sub_{i:05d}" for i in range(1, num_subscribers + 1)]
    
    for i in range(num_subscribers):
        sub_id = sub_ids[i]
        category = random.choice(categories)
        source = random.choices(
            sources, 
            weights=[25, 20, 25, 12, 10, 8], 
            k=1
        )[0]
        
        # Signup month
        delta_days = random.randint(0, (end_date - start_date).days)
        signup_date = start_date + timedelta(days=delta_days)
        signup_month = signup_date.strftime("%Y-%m")
        
        # Churn logic based on source
        # Organic and referral have lower churn, Paid Ads has higher churn
        base_churn = {
            'Organic Search': 0.03,
            'X/Twitter': 0.05,
            'Referral Flywheel': 0.025,
            'Paid Ads': 0.12,
            'Partner Swaps': 0.06,
            'Direct': 0.04
        }[source]
        
        # Adjust base churn based on category
        if category == 'Fintech':
            base_churn *= 0.9 # Fintech readers slightly higher retention
        elif category == 'Growth/Marketing':
            base_churn *= 1.1 # Marketing readers churn slightly faster
            
        is_churned = random.random() < base_churn
        
        # Tier logic (free vs premium)
        # Premium conversion higher in Fintech and Referral Flywheel
        premium_prob = 0.05
        if source == 'Referral Flywheel':
            premium_prob += 0.03
        if category == 'Fintech':
            premium_prob += 0.04
            
        tier = 'premium' if random.random() < premium_prob else 'free'
        
        # Activity/Engagement rates
        # Open and click rates based on source
        open_base = {
            'Organic Search': 0.52,
            'X/Twitter': 0.45,
            'Referral Flywheel': 0.62,
            'Paid Ads': 0.32,
            'Partner Swaps': 0.40,
            'Direct': 0.58
        }[source]
        
        open_rate = min(0.95, max(0.1, open_base + random.normalvariate(0, 0.08)))
        click_rate_of_open = min(0.4, max(0.02, 0.18 + random.normalvariate(0, 0.05)))
        click_rate = open_rate * click_rate_of_open
        
        # Deliverability
        deliverability_score = min(1.0, max(0.90, 0.985 + random.normalvariate(0, 0.01)))
        unsubscribe_rate = min(0.05, max(0.001, (1.0 - open_rate) * 0.015))
        
        # Calculate months active
        months_since_signup = (end_date.year - signup_date.year) * 12 + (end_date.month - signup_date.month)
        if months_since_signup <= 0:
            months_since_signup = 1
            
        if is_churned:
            months_active = random.randint(1, max(1, months_since_signup))
            status = 'churned'
        else:
            months_active = months_since_signup
            status = 'active'
            
        # Revenues (premium subscribers pay $8/month)
        premium_subscription_revenue = 8.0 * months_active if tier == 'premium' else 0.0
        
        subscribers.append({
            "subscriber_id": sub_id,
            "email": f"reader_{i+1}@domain.com",
            "category": category,
            "acquisition_source": source,
            "signup_month": signup_month,
            "status": status,
            "months_active": months_active,
            "tier": tier,
            "open_rate": round(open_rate, 4),
            "click_rate": round(click_rate, 4),
            "unsubscribe_rate": round(unsubscribe_rate, 4),
            "deliverability_score": round(deliverability_score, 4),
            "premium_subscription_revenue": premium_subscription_revenue
        })

    # 2. Generate Referrals
    referrals = []
    # Identify prospective referrers (e.g. active users in 'Referral Flywheel' source, or high open rates)
    referral_flywheel_subs = [s for s in subscribers if s['acquisition_source'] == 'Referral Flywheel']
    other_active_subs = [s for s in subscribers if s['status'] == 'active' and s['open_rate'] > 0.5]
    potential_referrers = list(set([s['subscriber_id'] for s in referral_flywheel_subs] + [s['subscriber_id'] for s in other_active_subs]))
    
    # We will randomly link some subscribers as referred by these potential referrers
    # Let's say 20% of all subscribers were referred by someone
    referred_subs = random.sample(subscribers, int(num_subscribers * 0.22))
    
    for sub in referred_subs:
        # Avoid self-referral
        referrer = random.choice(potential_referrers)
        while referrer == sub['subscriber_id']:
            referrer = random.choice(potential_referrers)
            
        # Mark the subscriber source as Referral Flywheel if not already, to stay consistent
        sub['acquisition_source'] = 'Referral Flywheel'
        
        # Referral details
        conversion_rate = min(0.8, max(0.05, 0.35 + random.normalvariate(0, 0.1)))
        virality_coefficient = min(0.5, max(0.01, 0.12 + random.normalvariate(0, 0.04)))
        
        referrals.append({
            "referral_id": f"ref_{random.randint(100000, 999999)}",
            "referrer_id": referrer,
            "referred_id": sub['subscriber_id'],
            "conversion_rate": round(conversion_rate, 4),
            "virality_coefficient": round(virality_coefficient, 4),
            "category": sub['category']
        })

    # 3. Generate Sponsorships (Campaigns)
    sponsorships = []
    sponsors = {
        'Tech': ['Vercel', 'Supabase', 'Linear', 'Retool', 'PostHog', 'Neon'],
        'Fintech': ['Ramp', 'Brex', 'Stripe', 'Mercury', 'Plaid', 'Deel'],
        'AI/Data': ['Pinecone', 'LangChain', 'OpenAI', 'HuggingFace', 'Weights & Biases', 'Snowflake'],
        'Growth/Marketing': ['HubSpot', 'Beehiiv', 'ConvertKit', 'Semrush', 'Ahrefs', 'Mailchimp']
    }
    
    # Monthly campaigns from Jan 2025 to May 2026
    current_month_date = start_date
    campaign_id_counter = 1
    
    while current_month_date <= end_date:
        month_str = current_month_date.strftime("%Y-%m")
        # Generate 2 to 4 campaigns per category per month
        for cat in categories:
            num_campaigns = random.randint(2, 4)
            for _ in range(num_campaigns):
                sponsor = random.choice(sponsors[cat])
                
                # Dynamic volume based on month (growing audience means higher cost/impressions)
                months_elapsed = (current_month_date.year - start_date.year) * 12 + (current_month_date.month - start_date.month)
                audience_size = int(1000 + (months_elapsed * 250) + random.randint(-100, 100))
                
                # CPM ranges $35 to $60
                cpm = round(random.uniform(35.0, 60.0), 2)
                impressions = int(audience_size * random.uniform(0.95, 0.99)) # deliverability discount
                
                # Revenue = (impressions / 1000) * CPM
                revenue = round((impressions / 1000.0) * cpm, 2)
                
                # Clicks
                ctr = random.uniform(0.015, 0.045)
                clicks = int(impressions * ctr)
                
                sponsorships.append({
                    "campaign_id": f"cmp_{campaign_id_counter:04d}",
                    "month": month_str,
                    "date": (current_month_date + timedelta(days=random.randint(1, 28))).strftime("%Y-%m-%d"),
                    "sponsor_name": sponsor,
                    "category": cat,
                    "sponsorship_revenue": revenue,
                    "cpm_economics": cpm,
                    "impressions": impressions,
                    "clicks": clicks
                })
                campaign_id_counter += 1
                
        # Next month
        if current_month_date.month == 12:
            current_month_date = datetime(current_month_date.year + 1, 1, 1)
        else:
            current_month_date = datetime(current_month_date.year, current_month_date.month + 1, 1)

    # 4. Generate Benchmarks/Target metrics (industry standards)
    benchmarks = [
        {"category": "Tech", "target_open_rate": 0.40, "target_click_rate": 0.06, "target_unsubscribe_rate": 0.005, "target_cpm": 40.0, "target_retention_12m": 0.70},
        {"category": "Fintech", "target_open_rate": 0.45, "target_click_rate": 0.07, "target_unsubscribe_rate": 0.004, "target_cpm": 50.0, "target_retention_12m": 0.75},
        {"category": "AI/Data", "target_open_rate": 0.42, "target_click_rate": 0.08, "target_unsubscribe_rate": 0.006, "target_cpm": 45.0, "target_retention_12m": 0.68},
        {"category": "Growth/Marketing", "target_open_rate": 0.38, "target_click_rate": 0.05, "target_unsubscribe_rate": 0.007, "target_cpm": 35.0, "target_retention_12m": 0.60}
    ]

    # Combine into database payload
    data = {
        "subscribers": subscribers,
        "referrals": referrals,
        "sponsorships": sponsorships,
        "benchmarks": benchmarks
    }
    
    # Save file
    os.makedirs(os.path.dirname(__file__), exist_ok=True)
    out_path = os.path.join(os.path.dirname(__file__), 'mock_data.json')
    with open(out_path, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Generated mock data at {out_path}: {len(subscribers)} subscribers, {len(referrals)} referrals, {len(sponsorships)} sponsorships.")

if __name__ == "__main__":
    generate_mock_data()
