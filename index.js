const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173", "https://chemnitz-map-app.web.app"],
  })
);
app.use(express.json());

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
