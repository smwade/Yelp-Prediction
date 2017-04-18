// How to create yelp database

mongoimport --db yelp --collection businesses yelp_academic_dataset_business.json
mongoimport --db yelp --collection users yelp_academic_dataset_user.json
mongoimport --db yelp --collection reviews yelp_academic_dataset_review.json
mongoimport --db yelp --collection checkins yelp_academic_dataset_checkin.json
mongoimport --db yelp --collection tips yelp_academic_dataset_tip.json

// Clean the yelp database
use yelp

// Create Inedexes for speed
db.reviews.createIndex({'stars':1})
db.reviews.createIndex({'date':1})
db.reviews.createIndex({'user_id':1})
db.reviews.createIndex({'business_id':1})

db.businesses.createIndex({'business_id':1})
db.businesses.createIndex({'review_count':1})
db.businesses.createIndex({'stars':1})
db.businesses.createIndex({'state':1})
db.businesses.createIndex({'categories':1})
db.businesses.createIndex({'attributes':1})

db.users.createIndex({'review_count':1})
db.users.createIndex({'user_id':1})

// Make categories lowercase
if (false) {
	db.businesses.find().forEach(
  function(e) {
    for(i=0; i < e.categories.length; i++) {
      e.categories[i] = e.categories[i].toLowerCase()
    }
    db.businesses.save(e);
 }
}
