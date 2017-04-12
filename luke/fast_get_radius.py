from pymongo import MongoClient
import matplotlib.pyplot as plt
import math
import numpy as np
import gpxpy.geo
from tqdm import tqdm
from collections import defaultdict
from sklearn.cluster import KMeans
import json
from sklearn.cluster import KMeans

client = MongoClient()
db = client.yelp

from pathos.multiprocessing import ProcessingPool as Pool

def get_all_reviews_by_user_for_city(city):
    """A function which queries for all the reviews associated to all the buisnesses in a city
    returns a dict (biz_id : review_locations)"""
    bizes = list(db.businesses.find({"city": city}, { "business_id": 1, "latitude": 1, "longitude": 1, "categories": 1}))
    user_reviews = defaultdict(list)
    for biz in tqdm(bizes):
        biz_id = biz['business_id']
        rel_review = db.reviews.find({"business_id": biz_id})
        for review in list(rel_review):
            user_reviews[review['user_id']].append((biz["latitude"], biz["longitude"]))
    return user_reviews


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

def get_all_centers_as_array(reviews_dict):
    x_centers_list = []
    y_centers_list = []
    associated_id = []
    for uid, user_review in reviews_dict.iteritems():
        if len(user_review) == 1:
            continue #We don't care about single reviewers! They give us no information.
        x, y = get_average_lat_and_long(user_review)
        x_centers_list.append(x)
        y_centers_list.append(y)
        associated_id.append(uid)
    return np.array([x_centers_list, y_centers_list]).T, associated_id

from sklearn.covariance import EllipticEnvelope

def clean_reviewer_average_radius_with_EllipticEnvelope(reviews):
    good_points = {}
    classifier = EllipticEnvelope(contamination=0.005)
    centers, user_ids = get_all_centers_as_array(reviews)
    classifier.fit(centers)
    inlier_indexes = np.where(classifier.predict(centers) != -1)
    user_ids = np.array(user_ids)[inlier_indexes]
    for i, user_id in enumerate(user_ids):
        good_points[user_id] = reviews[user_id]
    return good_points

def get_radi_from_review_centers_dict(review_centers_dict, tol=1):
    review_center_radi = []
    review_center_weights = []
    for val in review_centers_dict.values():
        dis_from_mid = get_max_distacne_from_mid(val)
        review_center_radi.append(dis_from_mid)
        review_center_weights.append(len(val))
    return np.dot(np.array(review_center_weights).T, np.array(review_center_radi))/np.sum(review_center_weights)


cities = [city for city in db.businesses.find().distinct("city")]
henderson_reviews = get_all_reviews_by_user_for_city("Henderson")

print get_radius_from_review_centers_dict(clean_reviewer_average_radius_with_EllipticEnvelope(henderson_reviews))

#db.cityDistanceMetric.insert_one({"city" : city, "radius" : final})
#return city, final

print cities
print len(cities)
#print dview.map_sync(get_radius_for_city, cities)

#print get_radius_for_city("Henderson")
#for city in cities:
    #get_radius_for_city(city)
p.close()
p.terminate()
p.join()
