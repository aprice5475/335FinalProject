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

function getTopHeadlines() {
  // TODO:
}

function getAllNews() {
  //TODO:
}
