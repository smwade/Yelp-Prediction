from pymongo import MongoClient
from datetime import datetime

def get_rating_time_series(biz_id):
    """ Get reviews over time. """
    client = MongoClient()
    db = client.yelp
    cursor = db.reviews.find({'business_id': biz_id}).sort('date',1)
    stars = []
    dates = []
    for review in cursor:
        stars.append(review['stars'])
        dates.append(datetime.strptime(review['date'], '%Y-%m-%d'))

    return stars, dates


if __name__ == '__main__':
    BIZ_ID = 'sbW8qHJgzEIH42B0S-3New'
    print get_rating_time_series(BIZ_ID)


