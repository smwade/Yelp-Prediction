import numpy as np
import math
import seaborn as sns
import gpxpy.geo
from datetime import datetime
from collections import Counter
from pymongo import MongoClient
from urlparse import parse_qs
from django.http import HttpResponse
from datetime import date
from dateutil.relativedelta import relativedelta
from utils.text_helpers import ProductModel
from utils.preprocess_reviews import tokenize, get_nouns
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans

import json

client = MongoClient()
db = client.yelp

def _get_business(business_id):
    """ Get all data assosiated with business. """
    return db.businesses.find_one({'business_id': business_id})

def _helper_get_business_reviews(biz_id, num_months=None):
    """ Get a list of all reviews for a business. """
    review_list = []
    pipe = {'business_id':biz_id}
    if num_months:
      pipe['date'] = { "$gte" : str(date.today() + relativedelta(months=-int(num_months))) }
    for review in db.reviews.find(pipe).sort('date'):
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
    competitors = sorted(_helper_get_competitors_in_region(business_id, float(radius)), key=lambda x: -1*len(set(x['categories']).intersection(set(biz['categories']))))
    competitors = competitors[:10]

    #TODO: FIlter this list intellegently
    return biz, competitors, radius

def get_cumulative_stars_dict(biz_id, num_months=None):
    to_return = []
    cur_sum = 0.
    for i, review in enumerate(_helper_get_business_reviews(biz_id, num_months)):
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
    above_feature = sum(better_than_average_review) / float(len(better_than_average_review))
    return HttpResponse(json.dumps(above_feature), content_type="application/json")

def get_competitors_and_stars(request, business_id):
    query_string = parse_qs(request.GET.urlencode())
    num_months = None
    if "months" in query_string.keys():
      num_months = query_string["months"][0]

    biz, competitors, radius = get_business_competitive_region(business_id)
    competitors_stars_dict = {str(business_id) : {"latitude": biz["latitude"], "longitude": biz["longitude"],  "stars" : get_cumulative_stars_dict(business_id, num_months), "name": biz["name"]}}

    for comp in competitors:
      competitors_stars_dict[comp["business_id"]] = {"latitude": comp["latitude"], "longitude": comp["longitude"], "stars" : get_cumulative_stars_dict(comp["business_id"], num_months), "name": comp["name"]}

    return HttpResponse(json.dumps(competitors_stars_dict), content_type="application/json")

def get_competitors_and_stars_by_radius(request, business_id, radius):
  query_string = parse_qs(request.GET.urlencode())
  num_months = None
  if "months" in query_string.keys():
    num_months = query_string["months"][0]

  biz = _get_business(business_id)
  #TODO: FIlter this list intellegently
  competitors = sorted(_helper_get_competitors_in_region(business_id, float(radius)), key=lambda x: -1*len(set(x['categories']).intersection(set(biz['categories']))))
  competitors = competitors[:10]

  competitors_stars_dict = {str(business_id) : {"latitude": biz["latitude"], "longitude": biz["longitude"],  "stars" : get_cumulative_stars_dict(business_id, num_months), "name": biz["name"]}}
  for comp in competitors:
    competitors_stars_dict[comp["business_id"]] = {"latitude": comp["latitude"], "longitude": comp["longitude"], "stars" : get_cumulative_stars_dict(comp["business_id"], num_months), "name": comp["name"]}

  return HttpResponse(json.dumps(competitors_stars_dict), content_type="application/json")

def get_setiment_extremes(request, business_id):
  reviews_list = _helper_get_business_reviews(business_id)
  query_string = parse_qs(request.GET.urlencode())
  words = query_string["word"]
  if not isinstance(query_string["word"], list):
    words = list(word)
  words = [el.lower() for el in words[0].split(" ")]
  product_model = ProductModel(reviews_list)
  def bold_word(review):
    import re
    for word in words:
      insensitive_word = re.compile(re.escape(word), re.IGNORECASE)
      review = insensitive_word.sub(" <b> " + word + " </b> ", review)
      #review = review.replace(word, " <b> " + word + " </b> ")
    return review
  return_dict = {'negative' : bold_word(product_model.get_most_negative(words)[0]), 'positive' : bold_word(product_model.get_most_positive(words)[0])}
  return HttpResponse(json.dumps(return_dict), content_type="application/json")

def get_refined_ratings(request, business_id):
  reviews = _helper_get_business_reviews(business_id)
  review_list = np.array([x['text'] for x in reviews])
  star_list = np.array([x['stars'] for x in reviews])
  tfidf_vectorizer = TfidfVectorizer(max_df=0.6, max_features=200000,
                                    min_df=0.1, stop_words='english',
                                    use_idf=True, tokenizer=tokenize, ngram_range=(1,3))
  tfidf_matrix = tfidf_vectorizer.fit_transform(review_list)
  NUM_CLUSTERS = 4
  vocab_list = tfidf_vectorizer.get_feature_names()
  k_means = KMeans(NUM_CLUSTERS)
  k_means.fit(tfidf_matrix)
  labels = np.array(k_means.labels_.tolist())
  word_groups = []
  group_scores = []
  for i in range(NUM_CLUSTERS):
    order_centroids = k_means.cluster_centers_.argsort()[:, ::-1]
    word_groups.append(", ".join([vocab_list[ind] for ind in order_centroids[i,:10]]))
    group_scores.append(np.mean(star_list[labels == i]))
  return HttpResponse(json.dumps({"wordsUsed" : word_groups, "rating" : group_scores}), content_type="application/json")
