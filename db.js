const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://admin1:admin1@cluster0.1naqm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
 console.log("db connected")
  // perform actions on the collection object
  client.close();
});