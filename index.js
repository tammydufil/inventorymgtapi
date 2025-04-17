const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json());
app.use(cors());

const generalRoute = require("./routes/generalRoute.js");
const authenticateUser = require("./middleware/auth.js");

// app.use(authenticateUser);

app.use("/inventorymgtapi/api/", generalRoute);

// Create HTTPS server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
