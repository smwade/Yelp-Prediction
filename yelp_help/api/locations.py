import numpy as np
import math
import us
import seaborn as sns
import gpxpy.geo
from datetime import datetime
from collections import Counter
from pymongo import MongoClient
from urlparse import parse_qs

from django.http import HttpResponse
import json

client = MongoClient()
db = client.yelp

def get_all_businesses(request):
    """ Get all data associated with business. """
    query_string = parse_qs(request.GET.urlencode())
    city_val = query_string["city"][0]
    print query_string
    print city_val
    to_return = []
    for bizes in db.businesses.find({"city": city_val}):
      to_return.append({ 'value': bizes["business_id"], 'label': bizes["name"] + " (" + bizes["address"] + ")"})
    return HttpResponse(json.dumps(to_return[:100]), content_type="application/json")

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
