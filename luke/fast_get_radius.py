from pymongo import MongoClient
import numpy as np
from sklearn.cluster import KMeans
import gpxpy.geo
from tqdm import tqdm
from collections import defaultdict
client = MongoClient()
db = client.yelp

import matplotlib.pyplot as plt
from pathos.multiprocessing import ProcessingPool as Pool

def get_radius_for_city(city, tol=1):
    def get_all_reviews_by_user_for_city(city):
        bizes = list(db.businesses.find({"city": city}, { "business_id": 1, "latitude": 1, "longitude": 1, "categories": 1}))

        biz_ids = [biz['business_id'] for biz in bizes]
        all_reviews = list(db.reviews.find({"business_id": {"$in": biz_ids}}))

        user_reviews = defaultdict(list)

        def review_append(review):
          rel_biz = filter(lambda biz: biz['business_id'] == review['business_id'], bizes)[0]
          return review['user_id'], (rel_biz["latitude"], rel_biz["longitude"])

        p = Pool(8)
        result_map = p.map(review_append, all_reviews)

        for user, loc in result_map:
          user_reviews[user].append(loc)

        """for review in tqdm(all_reviews):
            rel_biz = filter(lambda biz: biz['business_id'] == review['business_id'], bizes)[0]
            user_reviews[review['user_id']].append((rel_biz["latitude"], rel_biz["longitude"]))"""
        return user_reviews

    def get_average_lat_and_long(set_lat_by_long):
        set_lat_by_long = np.asarray(set_lat_by_long).copy()
        return np.average(set_lat_by_long, axis=0)

    def get_max_distacne_from_mid(set_lat_by_long):
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
    city_radi = []
    review_weights = [] # the more reviews that a user has given the more confident we are that they are part of the competitive region
    for i, val in enumerate(city_reviews.values()):
        if len(val) > 1:
            dis_from_mid = get_max_distacne_from_mid(val)
            k = 2
            while dis_from_mid > 100:
                val = get_clusters(val, n_clusters=k)[0]
                k += 1
                dis_from_mid = get_max_distacne_from_mid(val)
            city_radi.append(dis_from_mid)
            review_weights.append(len(val))

    final = np.dot(np.array(review_weights).T, np.array(city_radi))/np.sum(review_weights)
    db.cityDistanceMetric.insert_one({"city" : city, "radius" : final})
    return city, final

cities = [city for city in db.businesses.find().distinct("city") if city not in db.cityDistanceMetric.find().distinct("city")]
print cities
print len(cities)
#print dview.map_sync(get_radius_for_city, cities)

#print get_radius_for_city("Henderson")
for city in cities:
    get_radius_for_city(city)
p.close()
p.terminate()
p.join()
