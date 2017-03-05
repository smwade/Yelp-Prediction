# Yelp Prediction

## Overview

I started cleaning the data for another class but I have not trained any models.  Also, I focused on just Arizona, but we might want to utilize all the data. I set up some folders here where we can centralize our work by adding models and more data cleaning.

## Installation

All the work I have done so far has been in python.  If you don't have it installed I recomend using the Anaconda distribution (https://docs.continuum.io/anaconda/install)

For python, a good interactive work environment is Jupyter Notebook.  Most my cleaning and exploratory analysis is done using that so your going to want it.  It just runs in the browser and is pretty easy. (if you really hate it you can just export it to a .py file)

## Setting up Mongodb
After download the raw JSON files you can import to MongoDB real easy.  Run the following:

 $ mongoimport --db yelp --collection businesses yelp_academic_dataset_business.json

 $ mongoimport --db yelp --collection users yelp_academic_dataset_user.json

 $ mongoimport --db yelp --collection reviews yelp_academic_dataset_review.json

 $ mongoimport --db yelp --collection checkins yelp_academic_dataset_checkin.json

 $ mongoimport --db yelp --collection tips yelp_academic_dataset_tip.json

Then you can start the database by running `$mongo` and `use yelp` to switch to the database.

#### Steps
1. $ pip install -r requirements.txt (Installs required packages)
2. $ mkdir raw_data (place the raw data from yelp here)
3. $ mkdir data (this is where the cleaned data will go)
4. $ jupyter notebook (Starts session in the browser)
5. Navigate to data_cleaning
6. open and run data_exploaration_and_cleaning.ipynb (clean small dataset)

## Content
- raw_data
- data_cleaning
- data
- images
- models

## Notes
Although there is a lot of cleaning here there is still tons to do.
- better cleaning
- use whole dataset (or find good way to deal with large data)
- Natural language processing on reviews
- Computer vision on images
- Implement machine leanring models
- and all that bizz...

If you have questions, seanwademail@gmail.com
