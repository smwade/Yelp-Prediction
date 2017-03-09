from __future__ import division, print_function
import numpy as np
from matplotlib import pyplot as plt
import seaborn as sns
from datetime import datetime
from pymongo import MongoClient

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

if __name__ == '__main__':
    print(get_business_name('-gefwOTDqW9HWGDvWBPSMQ'))
