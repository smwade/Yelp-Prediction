
git pull https://github.com/smwade/Yelp-Prediction.git

commands to remember:

get into my environment:
source activate opencv2

open up jupyter:
jupyter notebook


activate the mongogdb to be used:
mongod


get into console mongo environment:
mongo

example of mongo commands:
use yelp
db.businesses.find({"stars": {$gte:4.5}, "categories": {"$in": ["Tobacco Shops"]}}).sort({'address':1}).limit(3)

