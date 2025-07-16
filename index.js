import axios from 'axios';
import {Telegraf} from 'telegraf';
import { message } from 'telegraf/filters';
import dotenv from 'dotenv';
import omdb from 'omdbapi';
import tmdb from 'node-themoviedb';
dotenv.config();
if (!process.env.tmdbkey) {
  console.error('Error: tmdb_iAPI_KEY is not set in the .env file.');
  process.exit(1);
}
if (!process.env.teletoken) {
  console.error('Error: TELEGRAM_BOT_TOKEN is not set in the .env file.');
  process.exit(1);
}
const bot=new Telegraf(process.env.teletoken);
const mdb=new tmdb(process.env.tmdbkey);
const gencodes=new Map([
  ["Action", 28],
  ["Adventure", 12],
  ["Animation", 16],
  ["Comedy", 35],
  ["Crime", 80],
  ["Documentary", 99],
  ["Drama", 18],
  ["Family", 10751],
  ["Fantasy", 14],
  ["History", 36],
  ["Horror", 27],
  ["Music", 10402],
  ["Mystery", 9648],
  ["Romance", 10749],
  ["Romantic",10749],	
  ["Science Fiction", 878],
  ["TV Movie", 10770],
  ["Thriller", 53],
  ["War", 10752],
  ["Western", 37]
]);
bot.start((ctx)=>ctx.reply("Hey There!This is your personal movie hunter!Tell me what you're looking for today.You may use genre,release date or any combination of these to receive the appropriate recommendations"));
bot.command('quit', async (ctx) => {
  await ctx.leaveChat();
})
bot.on(message('text'), async (ctx) => {
  const mss=ctx.message.text;
 
  let genres=[];
  for(const [key,value] of gencodes){
	let l=[];
	const reg=new RegExp(key,'i');
//	console.log(n);
//	console.log(k);
	l=mss.match(reg);
	if(l!==null && l.length>0){
	genres=[...genres,...l];}
  }
  let no_genres=false;
  let no_year=false;
  if(genres.length===0){
	  no_genres=true;}
  let  year=mss.match(/After \d{4}/i);
  let  nl=mss.match(/Before \d{4}/i);
  if((year===null || year.length===0)&&(nl===null || nl.length===0)){
	  no_year=true;
  }
  else if(year===null || year.length===0){
	  year=nl;
  }
  else if(nl===null || nl.length===0){
  }
  else{
	  year=[...year,...nl];
  }
  console.log(year);
  console.log(genres);
  let genarg='';
  let ygte='';
  let ylte='';
  if(!no_genres){
  for(let i=0;i<genres.length;i++){
	  const con=genres[i].charAt(0).toUpperCase()+genres[i].slice(1);
	  genres[i]=gencodes.get(con);
	  genarg+=genres[i];
	  if(i!=genres.length-1){
	  genarg+=',';}

  }
  }
 if(!no_year){
	 for(let i=0;i<year.length;i++){
		 const pyg=/after \d{4}/;
	         const pyl=/before \d{4}/;
	    if(pyg.test(year[i])){
		    ygte+=`${year[i].slice(6)}/01/01`;
	    }
	    if(pyl.test(year[i])){
		    ylte+=`${year[i].slice(7)}/01/01`;
	    }
}
}
console.log(ygte,ylte);
  console.log(genarg);
  try{
	 const args={
		  query:{
			  with_genres:genarg,
			  include_adult:false,
			  sort_by:'popularity_desc',
			  language:'en-US',
			  'release_date.gte':ygte,
			  'release_date.lte':ylte,
			  page:1,
		  },
	 };
	  const res=await mdb.discover.movie(args);
	  const recs=res.data.results;
	  if (recs.length > 0) {
      console.log(`\nFound ${recs.length} movie(s):`);

	  for(let i=0;i<Math.min(recs.length,3);i++){
		  console.log(recs[i].poster_path);
		  try{

		  ctx.replyWithPhoto({url:`https://image.tmdb.org/t/p/w500/${recs[i].poster_path}`},{caption:`Release Date is: ${recs[i].release_date}\n`+
                    `Title is: ${recs[i].title}\n`+
                  `The Plot For The Movie Is As Follows->${recs[i].overview}\n`+
                  `Original Language:${recs[i].original_language}\n`+
		   `is Adult:${recs[i].adult}\n`+
                  `Review Average Is:${recs[i].vote_average} out of ${recs[i].vote_count} reviews.`});    
          }
		catch{
		  ctx.reply(
                    `Release Date is: ${recs[i].release_date}\n`+
                    `Title is: ${recs[i].title}\n`+
                  `The Plot For The Movie Is As Follows->${recs[i].overview}\n`+
                  `Original Language:${recs[i].original_language}\n`+
		  `Review Average Is:${recs[i].vote_average} out of ${recs[i].vote_count} reviews.`);
	  }
	  }
	  }
	  else{
		  console.log("\nCouldn't find any movies suitable to request.");
	  }
  }
	catch(error){

     if (error.code === 'ECONNRESET') {
      console.error('Caught ECONNRESET error: The connection was reset by the peer.');
     ctx.reply('Network Reset was  detected.Kindly repeat your query!')}
	  else{
    console.error("Error:", error);
    ctx.reply("Sorry, something went wrong while fetching the movie data.");}
  }
  });
bot.launch();
