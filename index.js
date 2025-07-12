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
  const reviewCollection = client.db("admission").collection("reviews");
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
    app.post("/reviews", async (req, res) => {
      try {
        const reviewData = req.body;
        const result = await reviewCollection.insertOne(reviewData);
        res.status(201).send({
          success: true,
          message: "Review submitted successfully",
          data: result,
        });
      } catch (error) {
        console.error("Error saving review:", error);
        res.status(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    });
    app.get("/reviews", async (req, res) => {
      try {
        const result = await reviewCollection.find().toArray();
        res.status(201).send({
          success: true,
          message: "Review submitted successfully",
          data: result,
        });
      } catch (error) {
        console.error("Error saving review:", error);
        res.status(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    });

    app.get("/admission/:email", async (req, res) => {
      try {
        const email = req.params.email;

        if (!email) {
          return res.status(400).json({ message: "Email is required" });
        }

        const admission = await admissionCollection.findOne({ email });

        if (!admission) {
          return res
            .status(404)
            .json({ message: "No admission found with this email" });
        }

        res.status(200).json({ success: true, data: admission });
      } catch (error) {
        console.error("Error fetching admission by email:", error);
        res.status(500).json({ success: false, message: "Server Error" });
      }
    });

    app.put("/profile/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const profileData = req.body;

        if (!email) {
          return res.status(400).json({
            success: false,
            message: "Email parameter is required to update profile",
          });
        }

        const filter = { email: email };

        const updateDoc = {
          $set: {
            CandidateName: profileData.CandidateName,
            email: profileData.email,
            selectedCollege: profileData.selectedCollege,
            address: profileData.address,
          },
        };

        const result = await admissionCollection.updateOne(filter, updateDoc, {
          upsert: true,
        });

        res.status(200).json({
          success: true,
          message: "Profile updated successfully",
          data: result,
        });
      } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
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
