import axios from "axios";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.tmdbkey;
//tmdb key ko set up karlo env me as tmdbkey:"bbxxxxxxxxxxxxxxxxxxxxxxxxxcad7"

async function fetchHindiHorrorMovies() {
  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/discover/movie",
      {
        params: {
          api_key: apiKey,
          with_genres: 28, //yaha pe hamlogo ko genre id daalna hoga
          language: "hi-IN",
          sort_by: "popularity.desc",
          include_adult: false,
          include_video: false,
        },
      }
    );
    return response.data.results.slice(0, 5);
  } catch (error) {
    console.error("Error fetching horror movies:", error.message);
    return [];
  }
}

const bot = new Telegraf(process.env.teletoken);

bot.start((ctx) =>
  ctx.reply(
    "Welcome! Give me your interested Genre and I will generate a movie list of top 5 movies for you"
  )
);

bot.command("quit", async (ctx) => {
  await ctx.leaveChat();
});

bot.on(message("text"), async (ctx) => {
  try {
    let tmdb_response = await fetchHindiHorrorMovies();
    let attempt = 10;
    while (tmdb_response.length === 0 && attempt > 0) {
      tmdb_response = await fetchHindiHorrorMovies();
      attempt--;
    }
    if (tmdb_response.length === 0) {
      ctx.reply("Could not fetch movie suggestions right now.");
      return;
    }
    for (const movie of tmdb_response) {
      ctx.replyWithPhoto(
        { url: "https://image.tmdb.org/t/p/w500/" + movie.poster_path },
        {
          caption: `
Title: ${movie.original_title}
Original Language: ${movie.original_language}
Release Date: ${movie.release_date}
Rating: ${movie.vote_average}
                    `,
        }
      );
    }
  } catch (err) {
    console.error(err);
    ctx.reply("Something went wrong. Please try again.");
  }
});

bot.launch();
