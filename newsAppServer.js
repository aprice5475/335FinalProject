process.stdin.setEncoding("utf8");

const path = require("path");
const express = require("express");
const http = require("http");
const fs = require("fs");
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();

require("dotenv").config({
  path: path.resolve(__dirname, "credentials/.env"),
});
const MONGO_URI = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.kzycles.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const API_URL_EVERYTHING = "https://newsapi.org/v2/everything?";
const API_URL_TOP_HEADLINES = "https://newsapi.org/v2/top-headlines?";
const NUM_OF_ARTICLES_TO_DISPLAY = 10;

const databaseAndCollection = {
  db: process.env.MONGO_DB_NAME,
  collection: process.env.MONGO_COLLECTION,
};

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

function getDate() {
  return new Date().toLocaleDateString("EN-CA");
}
function getCountry(countryCode) {
  switch (countryCode) {
    case "us":
      return "the United States";
    case "gb":
      return "the United Kingdom";
    case "mx":
      return "Mexico";
    case "fr":
      return "France";
    case "de":
      return "Germany";
    case "ca":
      return "Canada";
    default:
      break;
  }
}
/**
 *
 * @param articles
 * @returns a list of articles without the removed ones from the API
 */
function cleanArticles(articles) {
  let cleanArticles = [];
  let i = 0;
  while (
    cleanArticles.length < NUM_OF_ARTICLES_TO_DISPLAY &&
    i < articles.length
  ) {
    if (articles[i].source.name !== "[Removed]") {
      cleanArticles.push(articles[i]);
    }
    i++;
  }
  return cleanArticles;
}
/**
 *
 * @param  country
 * @returns top headlines from api for the given country
 */
async function getTopHeadlines(country) {
  console.log(
    `${API_URL_TOP_HEADLINES}country=${country}&from=${getDate()}&sortBy=popularity&apiKey=${
      process.env.API_KEY
    }`
  );
  return await fetch(
    `${API_URL_TOP_HEADLINES}country=${country}&from=${getDate()}&sortBy=popularity&apiKey=${
      process.env.API_KEY
    }`
  )
    .then((response) => response.json())
    .then((json) => {
      let articles = cleanArticles(json.articles);
      return articles;
    });
}

/**
 *
 * @param query
 * @returns every article related to the search query
 */
async function getEverything(query) {
  console.log(`${API_URL_EVERYTHING}q=${query}&apiKey=${process.env.API_KEY}`);
  return await fetch(
    `${API_URL_EVERYTHING}q=${query}&apiKey=${process.env.API_KEY}`
  )
    .then((response) => response.json())
    .then((json) => {
      let articles = cleanArticles(json.articles);
      return articles;
    });
}

async function getHistory() {
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  try {
    await client.connect();
    const history = await client
      .db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .find({});
    return await history.toArray();
  } catch (error) {
    console.error(error);
  } finally {
    client.close();
  }
}
async function updateHistory(query) {
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  try {
    await client.connect();
    await client
      .db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .insertOne({ query: query });
  } catch (error) {
    console.error(error);
  } finally {
    client.close();
  }
}
/**
 * Removes all queries from the history list
 */
async function clearHistory() {
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  try {
    await client.connect();
    await client
      .db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .deleteMany();
  } catch (error) {
    console.error(error);
  } finally {
    client.close();
  }
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
app.post("/search", async (req, res) => {
  const { newsType, country, query } = req.body;
  let articles;
  let args;
  if (newsType === "Everything") {
    articles = await getEverything(query);
    args = {
      numOfResults: articles === null ? 0 : articles.length,
      query: query,
      results: articles,
    };

    await updateHistory(query);
    res.render("allArticles", args);
  } else {
    articles = await getTopHeadlines(country);
    args = {
      numOfResults: articles.length,
      country: getCountry(country),
      results: articles,
      date: new Date().toLocaleDateString("EN-US"),
    };
    res.render("topHeadlines", args);
  }
});
app.get("/history", async (req, res) => {
  const result = await getHistory();
  let table = "<table border = 'solid 1px'>";
  table += "<tr><th>Search History</th></tr>";
  for (e of result) {
    table += "<tr><td>" + e.query + "</td></tr>";
  }
  table += "</table>";
  args = {
    table: table,
    length: result.length,
  };
  res.render("history", args);
});

app.get("/clearHistory", (req, res) => {
  res.render("clearHistory");
});
app.post("/clearHistory", async (req, res) => {
  await clearHistory();
  res.redirect("/index");
});

const portNo = 4100;
const webServer = http.createServer(app);
webServer.listen(portNo);
process.stdout.write(
  `Web server started and running at http://localhost:${portNo}\n`
);
const msg = "Stop to shutdown the server: ";
process.stdout.write(msg);
process.stdin.on("readable", () => {
  let dataInput = process.stdin.read();
  if (dataInput != null) {
    let command = dataInput.trim();
    if (command.toLowerCase() === "stop") {
      webServer.close();
      process.stdout.write("Shutting down server.");
      process.exit(0);
    } else {
      process.stdout.write("Invalid command: " + command);
    }
    process.stdout.write(msg);
    process.stdin.resume();
  }
});
