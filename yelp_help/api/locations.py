import numpy as np
import math
import us
import seaborn as sns
import gpxpy.geo
from datetime import datetime
from collections import Counter
from pymongo import MongoClient

from django.http import HttpResponse
import json

client = MongoClient()
db = client.yelp

def get_all_states(request):
    """ Get all data assosiated with business. """
    to_return = []
    for abriv in db.businesses.find().distinct("state"):
      if abriv in dir(us.states):
        to_return.append({ 'value': abriv, 'label': eval("us.states.{}.name".format(abriv)) })
    return HttpResponse(json.dumps(to_return), content_type="application/json")

def get_all_cities(request, state_code):
    """ Get all data assosiated with business. """
    to_return = []
    for city in db.businesses.find({"state": state_code}).distinct("city"):
      to_return.append({ 'value': city, 'label': city })
    return HttpResponse(json.dumps(to_return), content_type="application/json")
