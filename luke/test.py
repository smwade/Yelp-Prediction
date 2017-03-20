import numpy as np
a = np.arange(10)

from ipyparallel import Client
import matplotlib.pyplot as plt
client = Client()
dview = client[:]

dview.push({"bizes" : np.arange(5)})

dview.scatter("a_partition", a)

from collections import defaultdict
user_reviews = defaultdict(list)

dview.push({"user_reviews" : user_reviews})

dview.execute("""user_reviews[a_partition.sum()].append(bizes.sum())""")

user_revs_list = dview.gather("user_reviews", block=True)

print user_revs_list
