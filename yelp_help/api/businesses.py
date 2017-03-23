import numpy as np
import math
import seaborn as sns
import gpxpy.geo
from datetime import datetime
from collections import Counter
from pymongo import MongoClient

from django.http import HttpResponse
import json

client = MongoClient()
db = client.yelp

def get_business(request, biz_id):
    """ Get all data assosiated with business. """
    return HttpResponse(json.dumps(db.businesses.find_one({'business_id': biz_id})), content_type="application/json")

def _helper_get_business_reviews(biz_id):
    """ Get a list of all reviews for a business. """
    review_list = []
    for review in db.reviews.find({'business_id':biz_id}).sort('date'):
        review_list.append(review)
    return review_list

def get_business_reviews(request, biz_id):
    """ Get a list of all reviews for a business. """
    return HttpResponse(json.dumps(_helper_get_business_reviews(biz_id)), content_type="application/json")

def _helper_get_competitors_in_region(business_id, r):
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

def get_business_competitive_region(business_id):
    biz = db.businesses.find_one({'business_id': business_id})
    radius = db.distance.find_one( {'city' : biz['city']} )["radius"]
    competitors = _helper_get_competitors_in_region(business_id, radius)

    #TODO: FIlter this list intellegently
    competitors = competitors[:10]
    return biz, competitors, radius

def get_cumulative_stars_dict(biz_id):
    to_return = []
    cur_sum = 0.
    for i, review in enumerate(_helper_get_business_reviews(biz_id)):
        cur_sum += review['stars']
        to_return.append({'date' : review['date'], 'value' : cur_sum/(i+1)})
    return to_return

def get_distrobution(request, business_id):
  reviews_list = _helper_get_business_reviews(business_id)
  review_stars = []
  for review in reviews_list:
      review_stars.append(review['stars'])

  rating_groups = Counter(review_stars)
  to_return = []
  for key in range(1, 6):
    val = rating_groups[key] if key in rating_groups.keys() else 0
    to_return.append({"letter" : key, "frequency" : val})

  return HttpResponse(json.dumps(to_return), content_type="application/json")


def get_competitors_radius_distance(request, business_id):
  biz = db.businesses.find_one({'business_id': business_id})
  radius = db.distance.find_one( {'city' : biz['city']} )["radius"]
  return HttpResponse(json.dumps(radius), content_type="application/json")

def get_ratings_above_average(request, business_id):
    reviews_list = _helper_get_business_reviews(business_id)
    review_counts = []
    average_stars = []
    review_stars = []
    for review in reviews_list:
        user = db.users.find_one({'user_id':review['user_id']})
        review_counts.append(user['review_count'])
        average_stars.append(user['average_stars'])
        review_stars.append(review['stars'])

    better_than_average_review = [i < j for i,j in zip(average_stars, review_stars)]
    above_feature = sum(better_than_average_review) / len(better_than_average_review)
    return HttpResponse(json.dumps(above_feature), content_type="application/json")

def get_competitors_and_stars(request, business_id):
    biz, competitors, radius = get_business_competitive_region(business_id)
    competitors_stars_dict = {str(business_id) : {"latitude": biz["latitude"], "longitude": biz["longitude"],  "stars" : get_cumulative_stars_dict(business_id)}}

    for comp in competitors:
      competitors_stars_dict[comp["business_id"]] = {"latitude": comp["latitude"], "longitude": comp["longitude"], "stars" : get_cumulative_stars_dict(comp["business_id"])}

    return HttpResponse(json.dumps(competitors_stars_dict), content_type="application/json")