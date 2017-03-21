from tqdm import tqdm
from pymongo import MongoClient
import re
import nltk
from nltk.tokenize import RegexpTokenizer
from nltk.stem.porter import PorterStemmer
from nltk.corpus import stopwords


def tokenize(text, stem=False):
    """ Tokenize a string.
    Args:
      text : (string) the text to tokenize
      stem : (bool) a bool for stemming
    Returns:
      filtered_words : (list) a list of all tokens 
    """
    tokenizer = nltk.tokenize.TweetTokenizer()
    words = tokenizer.tokenize(text)
    #words = nltk.word_tokenize(text)
    filtered_words = []
    for token in words:
        if re.search('[a-zA-Z]', token):
            if stem:
                token = stemmer.stem(token)
            filtered_words.append(token.lower())
    return filtered_words

def get_nouns(text):
    """ Return a list of all the nouns in a string. """
    if type(text) == list:
        text = ' '.join(text)
    is_noun = lambda x: 'NN' in x
    tokens = tokenize(text)
    nouns = [word for (word, pos) in nltk.pos_tag(tokens) if is_noun(pos)]
    return nouns

def tokenize_2(review_list):
    """ Tokenize a list of reviews.
    Args:
      review_list : (list) list of review strings

    Returns:
      texts_list : (list) a list of lists of tokens
    """
    texts_list = []
    for doc in tqdm(review_list):

        # Parse the doc into tokens
        tokenizer = RegexpTokenizer(r'\w+')
        raw = doc.lower()
        tokens = tokenizer.tokenize(raw)

        # Remove stop words
        en_stop = stopwords.words('english')
        stopped_tokens = [i for i in tokens if not i in en_stop]

        # Stem the words
        p_stemmer = PorterStemmer()
        texts = [p_stemmer.stem(i) for i in stopped_tokens]
        texts_list.append(texts)
    return texts_list

def prepare_classify(num_example):
    """ Prepare positive and negative examples for sentiment classification.
    Args:
      num_example : (int) the number of example to make

    Returns:
      pos_list : (list) list of tuples like ("test text", "pos")
      neg_list : (list) list of tuples like ("test text", "neg")
    """
    client = MongoClient()
    db = client.yelp
    pos_cursor = db.reviews.find({'stars':{'$gt':3}})
    neg_cursor = db.reviews.find({'stars':{'$lt':3}})

    pos_list = []
    neg_list = []

    for i in range(num_example):
        pos_review = pos_cursor.next()
        neg_review = neg_cursor.next()
        
        pos_list.append((pos_review['text'], 'pos'))
        neg_list.append((neg_review['text'], 'neg'))

    return pos_list, neg_list
