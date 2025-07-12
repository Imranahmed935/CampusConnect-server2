const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.haqk7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const admissionCollection = client.db("admission").collection("campuses");
  try {
    app.post("/admission", async (req, res) => {
      try {
        const collegeData = req.body;
        const result = await admissionCollection.insertOne(collegeData);
        res.status(201).send({
          success: true,
          message: "Admission data saved successfully",
          data: result,
        });
      } catch (error) {
        console.error("Error saving admission data:", error);
        res.status(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    });

    app.get("/admission", async (req, res) => {
      try {
        const admissions = await admissionCollection.find().toArray(); 
        res.status(200).json(admissions);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("The server is going on!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
