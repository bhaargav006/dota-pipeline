from faunadb import query as q
from faunadb.objects import Ref
from faunadb.client import FaunaClient

client = FaunaClient(secret="secret", domain="localhost", scheme="http", port="8443")

# create db
client.query(q.create_database({"name": "my_app"}))

# Accessing the database
# Create an initial server key by using an admin key. The server key has unrestricted access to a single database;
# in this case, the server key will only access the blog post database we just created.

client.query(
  q.create_key(
    {"database": q.database("my_app"), "role": "server"}
  ))

# Set up a collection
# Create a collection using the CreateCollection function with a param_object containing the name of the collection.
# We shall name our collection "posts":
client.query(q.create_collection({"name": "posts"}))

# Create an index
# The customary way to access documents within a collection is by specifying a criteria for one of the fields.
# To enable criteria-based searches, we need to first create an index using the path of the field within the document.

client.query(
  q.create_index(
    {
      "name": "posts_by_title",
      "source": q.collection("posts"),
      "terms": [{"field": ["data", "title"]}]
    }
  ))

client.query(
  q.create_index(
    {
      "name": "posts_by_tags_with_title",
      "source": q.collection("posts"),
      "terms": [{"field": ["data", "tags"]}],
      "values": [{"field": ["data", "title"]}]
    }
  ))

# Create a post

client.query(
  q.create(
    q.collection("posts"),
    {"data": {"title": "What I had for breakfast .."}}
  ))

# Create several posts

client.query(
  q.map_expr(
    lambda post_title: q.create(
      q.collection("posts"),
      {"data": {"title": post_title}}
    ),
    [
      "My cat and other marvels",
      "Pondering during a commute",
      "Deep meanings in a latte"
    ]
  ))

# Retrieve posts

client.query(q.get(q.ref(q.collection("posts"), "192903209792046592")))



