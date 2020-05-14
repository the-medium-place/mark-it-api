const express = require("express");
const router = express.Router();
const db = require("../models");

// GET ALL MARKETS (JSON)
router.get("/api/markets", function (req, res) {
    db.markets.findAll({
    }).then(dbMarket => res.json(dbMarket));
});

// POST NEW FAVORITE MARKET (USDA MARKET ID#)
router.post("/api/markets", function (req, res) {
    // LOGGED IN USER ID 
    const userID = req.session.user.id;
    db.market.create({
        market_id: req.body.market_id
    }).then((dbMarket) => {
        // CREATE ENTRY IN JUNCTION TABLE
        dbMarket.addUser(userID)
    })
});




