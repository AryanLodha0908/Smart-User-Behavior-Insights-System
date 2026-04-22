"""
Sample Dataset Generator
Generates realistic synthetic user behavior data for testing
"""

import random
import json
from datetime import datetime, timedelta
import pymongo

MONGO_URI = "mongodb://localhost:27017/behavior_insights"
client = pymongo.MongoClient(MONGO_URI)
db = client['behavior_insights']

PAGES = [
    {'url': '/home', 'title': 'Home'},
    {'url': '/products', 'title': 'Products'},
    {'url': '/about', 'title': 'About Us'},
    {'url': '/pricing', 'title': 'Pricing'},
    {'url': '/blog', 'title': 'Blog'},
    {'url': '/contact', 'title': 'Contact'},
    {'url': '/blog/post-1', 'title': 'Blog Post 1'},
    {'url': '/product/item-1', 'title': 'Product Item 1'}
]

WEBSITES = [
    {'domain': 'example1.com', 'name': 'Example Site 1'},
    {'domain': 'example2.com', 'name': 'Example Site 2'},
    {'domain': 'example3.com', 'name': 'Example Site 3'}
]


def generate_uuid():
    import uuid
    return str(uuid.uuid4())


def generate_engagement_pattern():
    """Generate realistic engagement patterns"""
    patterns = {
        'highly_engaged': {
            'duration': random.randint(300, 1200),  # 5-20 minutes
            'scroll_depth': random.randint(70, 100),
            'clicks': random.randint(5, 15),
            'pages': random.randint(3, 8),
            'bounce_prob': random.uniform(0.1, 0.3)
        },
        'moderately_engaged': {
            'duration': random.randint(60, 300),
            'scroll_depth': random.randint(40, 70),
            'clicks': random.randint(1, 5),
            'pages': random.randint(1, 3),
            'bounce_prob': random.uniform(0.4, 0.6)
        },
        'low_engaged': {
            'duration': random.randint(5, 60),
            'scroll_depth': random.randint(0, 40),
            'clicks': random.randint(0, 2),
            'pages': random.randint(1, 1),
            'bounce_prob': random.uniform(0.7, 0.95)
        }
    }

    pattern_type = random.choices(
        list(patterns.keys()),
        weights=[0.3, 0.5, 0.2]
    )[0]

    return patterns[pattern_type]


def create_sample_website():
    """Create sample website in database"""
    website_data = random.choice(WEBSITES)

    website = db.websites.find_one({'domain': website_data['domain']})

    if not website:
        from uuid import uuid4
        website = {
            'name': website_data['name'],
            'domain': website_data['domain'],
            'trackingId': str(uuid4()),
            'createdAt': datetime.now(),
            'sessions': 0,
            'events': 0,
            'status': 'active'
        }
        result = db.websites.insert_one(website)
        print(f"✅ Created website: {website_data['domain']}")
        return result.inserted_id

    return website['_id']


def generate_sample_session():
    """Generate a single sample session"""
    pattern = generate_engagement_pattern()
    website_id = create_sample_website()

    session = {
        'sessionId': generate_uuid(),
        'userId': generate_uuid(),
        'websiteId': website_id,
        'startTime': datetime.now() - timedelta(hours=random.randint(1, 168)),
        'endTime': datetime.now() - timedelta(hours=random.randint(0, 167)),
        'duration': pattern['duration'],
        'pages': [
            {
                'url': page['url'],
                'title': page['title'],
                'timeOnPage': random.randint(10, 120),
                'scrollDepth': random.randint(20, 100),
                'clicks': random.randint(0, 5),
                'timestamp': datetime.now() - timedelta(minutes=random.randint(1, 60))
            }
            for page in random.sample(PAGES, random.randint(1, min(4, len(PAGES))))
        ],
        'totalClicks': pattern['clicks'],
        'totalScrollDepth': pattern['scroll_depth'],
        'avgScrollDepth': pattern['scroll_depth'],
        'engagementScore': 10 - (pattern['bounce_prob'] * 10),  # Inverse relationship
        'bounced': pattern['bounce_prob'] > 0.6,
        'bounceProb': pattern['bounce_prob'],
        'deviceType': random.choice(['mobile', 'desktop']),
        'userAgent': random.choice([
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        ]),
        'location': {
            'country': random.choice(['US', 'UK', 'CA', 'AU', 'DE']),
            'city': random.choice(['New York', 'London', 'Toronto', 'Sydney', 'Berlin'])
        },
        'createdAt': datetime.now(),
        'updatedAt': datetime.now()
    }

    return session


def generate_sample_data(num_sessions=100):
    """Generate multiple sample sessions"""
    print(f"📊 Generating {num_sessions} sample sessions...\n")

    # Clear existing data (optional)
    # db.sessions.delete_many({})
    # db.websites.delete_many({})

    sessions = []
    for i in range(num_sessions):
        session = generate_sample_session()
        sessions.append(session)

        if (i + 1) % 20 == 0:
            print(f"  Generated {i + 1}/{num_sessions} sessions")

    # Insert into database
    if sessions:
        result = db.sessions.insert_many(sessions)
        print(f"\n✅ Inserted {len(result.inserted_ids)} sessions into database")

    # Generate summary statistics
    high_engagement = sum(1 for s in sessions if s['engagementScore'] > 6)
    medium_engagement = sum(1 for s in sessions if 3 < s['engagementScore'] <= 6)
    low_engagement = sum(1 for s in sessions if s['engagementScore'] <= 3)
    bounce_count = sum(1 for s in sessions if s['bounced'])

    print(f"\n📈 Dataset Summary:")
    print(f"  High Engagement:    {high_engagement} ({high_engagement*100/num_sessions:.1f}%)")
    print(f"  Medium Engagement:  {medium_engagement} ({medium_engagement*100/num_sessions:.1f}%)")
    print(f"  Low Engagement:     {low_engagement} ({low_engagement*100/num_sessions:.1f}%)")
    print(f"  Bounced Sessions:   {bounce_count} ({bounce_count*100/num_sessions:.1f}%)")

    # Save sample to JSON for reference
    import os
    os.makedirs('data', exist_ok=True)
    with open('data/sample_dataset.json', 'w') as f:
        json.dump(sessions[:5], f, indent=2, default=str)  # Save first 5 as example
        print(f"\n💾 Sample data saved to data/sample_dataset.json")


def export_to_csv():
    """Export sessions to CSV"""
    import csv

    sessions = list(db.sessions.find().limit(1000))

    if not sessions:
        print("No sessions to export")
        return

    with open('data/sessions_export.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([
            'sessionId', 'userId', 'duration', 'engagementScore',
            'bounced', 'bounceProb', 'pages', 'clicks', 'avgScrollDepth',
            'startTime', 'deviceType'
        ])

        for session in sessions:
            writer.writerow([
                session['sessionId'],
                session['userId'],
                session['duration'],
                session['engagementScore'],
                session['bounced'],
                session['bounceProb'],
                len(session['pages']),
                session['totalClicks'],
                session['avgScrollDepth'],
                session['startTime'],
                session['deviceType']
            ])

    print(f"✅ Exported {len(sessions)} sessions to data/sessions_export.csv")


if __name__ == '__main__':
    print("🚀 Smart Behavior Insights - Sample Data Generator\n")

    # Generate sample data
    generate_sample_data(num_sessions=150)

    # Export to CSV
    export_to_csv()

    print("\n✅ Sample data generation complete!")
