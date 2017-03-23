from __future__ import division, print_function
import numpy as np
from matplotlib import pyplot as plt
import seaborn as sns
import gpxpy.geo
from collections import defaultdict
from datetime import datetime
from pymongo import MongoClient

def random_review(n=1):
    """ Return n random reviews. """
    client = MongoClient()
    db = client.yelp
    review_list = []
    for review in db.reviews.aggregate([{'$sample': {'size': n}}]):
        review_list.append(review)
    return review_list

def random_business(n=1):
    """ Return n random reviews. """
    client = MongoClient()
    db = client.yelp
    business_list = []
    for review in db.businesses.aggregate([{'$sample': {'size': n}}]):
        business_list.append(review)
    return business_list

def get_business_name(biz_id):
    """ Get the name of a business. """
    client = MongoClient()
    db = client.yelp
    return db.businesses.find_one({'business_id': biz_id})['name']

def get_business(biz_id):
    """ Get all data assosiated with business. """
    client = MongoClient()
    db = client.yelp
    return db.businesses.find_one({'business_id': biz_id})

def get_business_reviews(biz_id):
    """ Get a list of all reviews for a business. """
    client = MongoClient()
    db = client.yelp
    review_list = []
    for review in db.reviews.find({'business_id':biz_id}).sort('date'):
        review_list.append(review)
    return review_list

def get_review_count(biz_id):
    """ Get number of reviews for a business. """
    review_list = get_business_reviews(biz_id)
    return len(review_list)

def get_business_users(biz_id):
    """ Get a list of all users to review a business. """
    client = MongoClient()
    db = client.yelp
    all_reviews = get_business_reviews(biz_id)
    user_list = []
    for review in all_reviews:
        user = db.users.find_one({'user_id':review['user_id']})
        user_list.append(user)
    return user_list

def get_business_checkins(biz_id):
    """ Get a list of checkin times and amount. """
    client = MongoClient()
    db = client.yelp
    checkins = db.checkins.find_one({'business_id': biz_id})['checkin_info']
    checkin_time = np.array([datetime.strptime(x, '%H-%M') for x in checkins.keys()])
    checkin_num = np.array([x for x in checkins.values()])
    sort_idx = np.argsort(checkin_time)
    plt.bar(range(len(checkin_time)), checkin_num[sort_idx], align='center')
    plt.title('Daily Checkins')
    plt.show()

def get_competitors_in_region(business_id, r):
    """r is in miles"""
    business = db.businesses.find_one({"business_id" : business_id})
    latitude, longitude = float(business['latitude']), float(business['longitude'])
    lat = math.radians(latitude)
    lon = math.radians(longitude)

    radius  = 3959.
    # Radius of the parallel at given latitude
    parallel_radius = radius*math.cos(lat)

    lat_min = math.degrees(lat - r/radius)
    lat_max = math.degrees(lat + r/radius)
    lon_min = math.degrees(lon - r/parallel_radius)
    lon_max = math.degrees(lon + r/parallel_radius)

    pipe = {"latitude": {"$gte": lat_min, "$lt": lat_max},
            "longitude": {"$gte": lon_min, "$lt": lon_max},
            "categories" : {"$elemMatch":{"$in" : business["categories"]}},
            "is_open" : 1}

    close_enough_biznuz = db.businesses.find(pipe)
    return [close_biz for close_biz in list(close_enough_biznuz) if
            (gpxpy.geo.haversine_distance(latitude, longitude, close_biz['latitude'], close_biz['longitude'])/1609.34) < r]

def get_cumulative_stars_dict(biz_id):
    to_return = []
    cur_sum = 0
    for i, review in enumerate(get_business_reviews(biz_id)):
        cur_sum += review['stars']
        to_return.append({'date' : review['date'], 'value' : cur_sum/(i+1)})
    return to_return

def get_all_reviews_by_user_for_city(city):
    """A function which queries for all the reviews associated to all the buisnesses in a city
    returns a dict (biz_id : review_locations)"""
    client = MongoClient()
    db = client.yelp
    bizes = list(db.businesses.find({"city": city}, { "business_id": 1, "latitude": 1, "longitude": 1, "categories": 1}))
    user_reviews = defaultdict(list)
    for biz in bizes:
        biz_id = biz['business_id']
        rel_review = db.reviews.find({"business_id": biz_id})
        for review in list(rel_review):
            user_reviews[review['user_id']].append((biz["latitude"], biz["longitude"]))
    return user_reviews

#Manipulating Latitude and Longitude
def get_average_lat_and_long(set_lat_by_long):
    """We get some wierd outliers from the 'set_lat_by_long' we'll need to take care of these some how
    returns: the average latitude and longitude
    NOTE: this is simply the average of the latitude and longitude values (not based on geodicics)"""
    set_lat_by_long = np.asarray(set_lat_by_long).copy()
    return np.average(set_lat_by_long, axis=0)

def get_max_distacne_from_mid(set_lat_by_long):
    """Because of the outliers (these are caused by a missing sign) get_average_lat_and_long returns a point
    that is very far from the actual center"""
    set_lat_by_long = np.asarray(set_lat_by_long)
    mid = get_average_lat_and_long(set_lat_by_long)
    return np.max([gpxpy.geo.haversine_distance(mid[0], mid[1], lat, lon)/1609.34 for lat, lon in set_lat_by_long])

def get_radius_from_review_centers_dict(review_centers_dict, tol=1):
    review_center_radi = []
    review_center_weights = []
    for val in review_centers_dict.values():
        dis_from_mid = get_max_distacne_from_mid(val)
        review_center_radi.append(dis_from_mid)
        review_center_weights.append(len(val))
    return np.dot(np.array(review_center_weights).T, np.array(review_center_radi))/np.sum(review_center_weights)

if __name__ == '__main__':
    #print(get_business_name('-gefwOTDqW9HWGDvWBPSMQ'))
    print(get_cumulative_stars_dict("4JNXUYY8wbaaDmk3BPzlWw"))
