from pymongo import MongoClient

client = MongoClient()

# Create a database
db = client.test
# Create a collection (aka table)
db.insert_one(
        {
        "id": '1eeee',
        "name" :"sean"})

