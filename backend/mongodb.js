// https://docs.mongodb.com/drivers/node/
const { MongoClient } = require("mongodb")
const uri = "mongodb://mongo/ictusnet"
const client = new MongoClient(uri, { useUnifiedTopology: true })
async function insertMultipleDocuments(docs = []) {
  try {
    await client.connect()
    const database = client.db("ictusnet")
    const collection = database.collection("annotated_reports")
    // this option prevents additional documents from being inserted if one fails
    const options = { ordered: true }
    const result = await collection.insertMany(docs, options)
    console.log(`${result.insertedCount} documents were inserted`)
  } finally {
    await client.close()
  }
}
module.exports = {
  insertMultipleDocuments,
}