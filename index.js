import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import "dotenv/config";

const app = express();
const port = 3000;


const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: process.env.DB_PASSWORD,
  port: 5432
})

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisitaed() {
  const result = await db.query("SELECT country_code FROM visited_countries");

  let visited_countries = [];

  result.rows.forEach(country => {
    visited_countries.push(country.country_code);
  });
  return visited_countries;
}

// GET home page
app.get("/", async (req, res) => {
  const countries = await checkVisitaed();
  res.render("index.ejs", { countries: countries, total: countries.length });
});

// INSERT new country
app.post("/add", async (req, res) => {
  const input = req.body["country"];

  const result = await db.query(
    "SELECT country_code FROM countries WHERE country_name = $1", [input]
  );

  if (result.rows.length !== 0) {
    const data = result.rows[0];
    const countryCode = data.country_code;

    await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [countryCode,]);
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
