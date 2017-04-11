from data_manager import get_business_reviews
from preprocess_reviews import get_nouns, tokenize

import numpy as np
from gensim import corpora, models, similarities

def get_business_review_topics(biz_id):
    """ Create LDA and return top words for 6 topics
    Args:
        biz_id : (string) business id
        
    Returns:
        return_list : (list) a list of lists. Each one being the topcis and the top words
            i.e. [['fish', 'dog'], ['ice cream', cookies], ['tree', 'plant']]"""
    review_list = np.array([x['text'] for x in get_business_reviews(biz_id)])

    # preprocess
    tokenized_docs = [get_nouns(tokenize(x)) for x in review_list]

    #create a Gensim dictionary from the texts
    dictionary = corpora.Dictionary(tokenized_docs)

    #remove extremes (similar to the min/max df step used when creating the tf-idf matrix)
    dictionary.filter_extremes(no_below=1, no_above=0.8)

    #convert the dictionary to a bag of words corpus for reference
    corpus = [dictionary.doc2bow(text) for text in tokenized_docs]

    lda = models.LdaModel(corpus, num_topics=7, id2word=dictionary, 
            update_every=5, chunksize=5, passes=6)

    topics_matrix = lda.show_topics(formatted=False, num_words=20)
    
    return_list = []
    for topic_num, words in topics_matrix:
        topic_words = []
	for word in words:
	    topic_words.append(word[0])
        return_list.append(topic_words)
    return return_list
