const express = require("express");
require("dotenv").config();
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

app.use(cors({ origin: ["http://localhost:5173"] }));
app.use(express.json());

// JWT Token Creation
function createToken(user) {
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
}

// JWT Token Verification Middleware
function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).send("Authorization header missing");
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).send("Token missing");
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    if (!verify?.email)
      return res.status(401).send("Token verification failed");
    req.user = verify.email;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).send("You are not authorized");
  }
}

// MongoDB Setup
const uri = process.env.DB_URL;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let usersCollection, productsCollection, cartCollection;

const dbConnect = async () => {
  try {
    await client.connect();
    console.log("Database Connected Successfully✅");
  } catch (error) {
    console.log(error.name, error.message);
  }
};
dbConnect();

usersCollection = client.db("ecommerceDB").collection("users");
productsCollection = client.db("ecommerceDB").collection("products");
cartCollection = client.db("ecommerceDB").collection("cart");

app.get("/", (req, res) => {
  res.send("Welcome to the E-commerce server");
});

// =============== User Authentication ===============
// User SignUp
app.post("/auth/signup", async (req, res) => {
  const user = req.body;
  const token = createToken(user);
  const isUserExist = await usersCollection.findOne({ email: user?.email });

  if (isUserExist?._id) {
    return res.status(400).send("User already exists");
  }
  await usersCollection.insertOne(user);
  return res.send({ token, user });
});

// User Login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await usersCollection.findOne({ email });

  if (!user || user.password !== password) {
    return res.status(401).send("Invalid email or password");
  }
  const token = createToken(user);
  res.send({ token });
});

// Test API
app.get("/", (req, res) => {
  res.send("Welcome to the Server");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`Server is listening at ${port}`);
});
