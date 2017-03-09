from __future__ import division, print_function
from pymongo import MongoClient
from data_manager import get_business_reviews, get_business_users
from datetime import datetime
import numpy as np
from collections import Counter
from matplotlib import pyplot as plt
import seaborn as sns

def visualize_business(biz_id):
    """ Give business summary. """
    client = MongoClient()
    db = client.yelp

    # get all reviews
    reviews_list = get_business_reviews(biz_id)
    user_list = get_business_users(biz_id)
        
    biz = db.businesses.find_one({'business_id':biz_id}, {'_id':0})
    print("Name: {}".format(biz['name']))
    print("State: {}".format(biz['state']))
    print("City: {}".format(biz['city']))
    print("Categories: {}".format(biz['categories']))
    print("Stars: {}".format(biz['stars']))
    print("Review Count: {}".format(biz['review_count']))
    print("-"*45)


    # Plot the average ratting over time
    # -----------------------------------------------
    review_dates = []
    review_stars = []
    average_list = []
    for review in reviews_list:
        review_dates.append(datetime.strptime(review['date'], '%Y-%m-%d'))
        review_stars.append(review['stars'])
        average_list.append(np.mean(review_stars))

    review_dates = np.array(review_dates)
    average_list = np.array(average_list)
    sort_idx = np.argsort(review_dates)
    plt.plot(review_dates[sort_idx], average_list[sort_idx])
    plt.title('Average Rating Over Time')
    plt.xlabel('Time')
    plt.ylabel('Stars')
    plt.show()
    
    
    
    # Type of Users Leaving Reviews
    # -----------------------------------------------
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
    print("Percent of Reviews Above Average for Person: {}".format(above_feature))
    
    # Reviews Distribution
    # -----------------------------------------------
    rating_groups = Counter(review_stars)
    plt.bar(rating_groups.keys(), rating_groups.values())
    plt.title('Review Distribution for %s' % biz['name'])
    plt.show()
    
    return

if __name__ == '__main__':
    # visualize_business('4bEjOyTaDG24SY5TxsaUNQ')
