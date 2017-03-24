from pymongo import MongoClient
import numpy as np
import gpxpy.geo
from tqdm import tqdm
from collections import defaultdict
client = MongoClient()
db = client.yelp
from sklearn.cluster import KMeans
    
def get_radius_for_city(city, industry):
    def get_all_reviews_by_user_for_city(city):
        bizes = list(db.businesses.find({"city": city, 'categories': {"$in": [industry]}}, { "business_id": 1, "latitude": 1, "longitude": 1}))
        user_reviews = defaultdict(list)
        for biz in bizes:
            rel_review = db.reviews.find({"business_id": biz['business_id']})
            for review in list(rel_review):
                user_reviews[review['user_id']].append((biz["latitude"], biz["longitude"]))
        
        return user_reviews    
    
    def get_average_lat_and_long(set_lat_by_long):
        set_lat_by_long = np.asarray(set_lat_by_long).copy()
        return np.average(set_lat_by_long, axis=0)

    def get_max_distance_from_mid(set_lat_by_long):
        set_lat_by_long = np.asarray(set_lat_by_long)
        mid = get_average_lat_and_long(set_lat_by_long)
        return np.max([gpxpy.geo.haversine_distance(mid[0], mid[1], lat, lon)/1609.34 for lat, lon in set_lat_by_long])
    
    def get_clusters(data, n_clusters=2):
        kmeans = KMeans(n_clusters=2).fit(data)
        centers = kmeans.cluster_centers_
        to_return = [[] for i in range(len(centers))]
        for x in data:
            dist = np.linalg.norm(centers - x, 1, axis=1)
            index = np.argmin(dist)
            to_return[index].append(x)
        return sorted([np.vstack(i) for i in to_return], key=lambda x: len(x))[::-1]
    
    city_reviews = get_all_reviews_by_user_for_city(city)
    if len(city_reviews) == 0:
        return None
    city_radi = []
    review_weights = [] # the more reviews that a user has given the more confident we are that they are part of the competitive region
    for i, val in enumerate(city_reviews.values()):
        if len(val) > 1:
            dis_from_mid = get_max_distance_from_mid(val)
            k = 2
            while dis_from_mid > 100:
                val = get_clusters(val, n_clusters=k)[0]
                k += 1
                dis_from_mid = get_max_distance_from_mid(val)
            city_radi.append(dis_from_mid)
            review_weights.append(len(val))
            
    if len(np.array(review_weights).T) == 0:
        return None
    final = np.dot(np.array(review_weights).T, np.array(city_radi))/np.sum(review_weights)
    return city, final, industry


def put_stuff_in_database():
    cities = db.businesses.find().distinct('city')
    industries = db.businesses.find().distinct('categories')
    count = 0
    for city in cities:
        for industry in industries:
            if industry == None:
                continue
            items = get_radius_for_city(city, industry)
            if items == None:
                continue

            db.findIndustryDist.insert_one({"city": items[0], "radius": items[1], "industry": items[2]})



