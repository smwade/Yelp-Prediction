import re
import pandas as pd
import nltk
from nltk.stem.snowball import SnowballStemmer
from data_manager import get_business_reviews
class ProductModel:

    def __init__(self, biz_id):
        import graphlab as gl
        review_objects = get_business_reviews(biz_id)
        reviews = [x['text'].encode('utf-8') for x in review_objects]
        sf = gl.SFrame(reviews)
        self.product_model = gl.product_sentiment.create(sf, features=['X1'])

    def get_most_positive(self, keywords=None, k=10):
        return list(self.product_model.get_most_positive(keywords=keywords, k=k)['X1'])
    
    def get_most_negative(self, keywords=None, k=10):
        return list(self.product_model.get_most_negative(keywords=keywords, k=k)['X1'])

    def sentiment_summary(self, keywords):
        return pd.DataFrame(r.to_numpy(), columns=['keyword', 'sd_sentiment', 'mean_sentiment', 'review_count'])
    
    def search(self, query, num_results=10):
        r = self.product_model.review_searcher.query(query, num_results=num_results)
        return list(r['X1'])


if __name__ == '__main__':
    # text = "lines is some string of words and phrases."
    # print get_nouns(text)

    product_model = ProductModel('lliksv-tglfUz1T3B3vgvA')
    print "Most negative:"
    print "-"*40
    print product_model.get_most_negative(['wait'])[0]

    print "Most Positive:"
    print "-"*40
    print product_model.get_most_positive(['wait'])[2]
    # print product_model.sentiment_summary(['dessert'])







