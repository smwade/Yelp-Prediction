"""yelp_help URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from views.home import index
from api import businesses, locations

urlpatterns = [
    url(r'^api/business/(?P<business_id>[\w-]+)/competitor-stars/$', businesses.get_competitors_and_stars),
    url(r'^api/business/(?P<business_id>[\w-]+)/get-competitive-radius/$', businesses.get_competitors_radius_distance),
    url(r'^api/business/(?P<business_id>[\w-]+)/percent-above-average/$', businesses.get_ratings_above_average),
    url(r'^api/business/(?P<business_id>[\w-]+)/star-distrobution/$', businesses.get_distrobution),
    url(r'^api/states/', locations.get_all_states),
    url(r'^api/all-cities/(?P<state_code>[\w-]+)/$', locations.get_all_cities),
    url(r'^admin/', admin.site.urls),
    url(r'^$', index),
]
