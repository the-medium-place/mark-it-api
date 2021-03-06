const express = require('express');
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");
var SequelizeStore = require('connect-session-sequelize')(session.Store);

// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 8080;
require("dotenv").config();

// Requiring our models for syncing
const db = require('./models');

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session(
  {
    secret: process.env.SESSION_SECRET,
    store: new SequelizeStore({
      db: db.sequelize
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 2 * 60 * 60 * 1000
    }
  }));

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use(cors({
  origin: [CORS_ORIGIN],
  credentials: true
}));
// // USE THIS CONFIG WHEN RUNNING LOCALLY
// app.use(cors({
//    origin:["http://localhost:3000"],
//    credentials: true
// }));
//  //USE THIS CONFIG WHEN DEPLOYING TO HEROKU
// //  app.use(cors({
// //    origin:["https://awesome-mark-it.herokuapp.com"],
// //    credentials: true
// //  }));

// the deployed configuration at heroku
// app.use(cors({
//     origin:["https://awesome-mark-it.herokuapp.com/"]
// }));

// Static directory
// app.use(express.static('public'));

const userRoutes = require("./controllers/userController");
const marketRoutes = require("./controllers/marketController");
const productRoutes = require("./controllers/productController");
const scheduleRoutes = require("./controllers/scheduleController");
const geoJSONRoutes = require("./controllers/VendorGeoJSONController")

app.use(userRoutes);
app.use(marketRoutes);
app.use(productRoutes);
app.use(scheduleRoutes);
app.use(geoJSONRoutes);

const FORCE_SYNC_STRING = process.env.FORCE_SYNC_STRING || "FALSE";
let forceSync = false;
if (FORCE_SYNC_STRING === "TRUE") {
  forceSync = true;
}
console.log("boolean flag is " + forceSync)

db.sequelize.sync({ force: forceSync }).then(function () {
  app.listen(PORT, function () {
    console.log('App listening on PORT ' + PORT);
  });
});

// ===================================
// SET TO DELETE OLDER POSTED PRODUCTS
// ===================================
setInterval(() => {
  // CAPTURE CURRENT DATE AS MOMENT OBJECT
  const now = moment();

  db.product.destroy({
    // CHECK FOR PRODUCTS IN DB FOR 7 DAYS OR MORE
    where: sequelize.where(sequelize.fn('date', sequelize.col('createdAt')), '<', now.subtract(7, 'days').format())
  })
  // CHECK DATABASE DAILY 

  db.vendorgeojson.destroy({
    // CHECK FOR PRODUCTS IN DB FOR 7 DAYS OR MORE
    where: sequelize.where(sequelize.fn('date', sequelize.col('createdAt')), '<', now.subtract(7, 'days').format())
  })
  // RUN THE CHECK EVERY 24 HOURS
}, 1000 * 60 * 60 * 24);