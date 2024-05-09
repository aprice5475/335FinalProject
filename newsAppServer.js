process.stdin.setEncoding("utf8");

const path = require("path");
const express = require("express");
const http = require("http");
const fs = require("fs");
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();

require("dotenv").config({
  path: path.resolve(__dirname, "credentialsDontPost/.env"),
});
const MONGO_URI = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.kzycles.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const API_URL = "https://newsapi.org/v2/everything?";

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));

async function getTopHeadlines() {
  // TODO:
}

async function getAllNews() {
  //TODO:
}

app.get("/", (req, res) => {
  res.redirect("index");
});
app.get("/index", (req, res) => {
  res.render("index");
});
app.get("/search", (req, res) => {
  res.render("searchForm");
});
app.post("/search", (req, res) => {
  res.render("postSearchForm");
});
app.get("/register", (req, res) => {
  res.render("registrationForm");
});
app.post("/register", (req, res) => {
  res.render("postRegistration");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", (req, res) => {
  res.redirect("/index");
});
