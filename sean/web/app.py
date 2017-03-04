# mongo.py

from flask import Flask
from flask import jsonify
from flask import request
from flask_pymongo import PyMongo

app = Flask(__name__)

app.config['MONGO_DBNAME'] = 'yelp'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/yelp'

mongo = PyMongo(app)

@app.route('/biz', methods=['GET'])
def get_all_biz():
    s = mongo.db.businesses.find()
    output = []
    for x in s:
        output.append({'name': x['name']})
    return jsonify({'result':s.count()})

@app.route('/city/', methods=['GET'])
def get_one_star(name):
    s = mongo.db.businesses.find_one({'city' : city})
    return jsonify({'name':s['name']})

@app.route('/star', methods=['POST'])
def add_star():
  star = mongo.db.stars
  name = request.json['name']
  distance = request.json['distance']
  star_id = star.insert({'name': name, 'distance': distance})
  new_star = star.find_one({'_id': star_id })
  output = {'name' : new_star['name'], 'distance' : new_star['distance']}
  return jsonify({'result' : output})

if __name__ == '__main__':
    app.run(debug=True)
