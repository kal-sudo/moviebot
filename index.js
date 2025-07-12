import axios from 'axios';
import {Telegraf} from 'telegraf';
import { message } from 'telegraf/filters';
import dotenv from 'dotenv';
import omdb from 'omdbapi';
dotenv.config();
if (!process.env.omdbkey) {
  console.error('Error: OMDB_API_KEY is not set in the .env file.');
  process.exit(1);
}
if (!process.env.teletoken) {
  console.error('Error: TELEGRAM_BOT_TOKEN is not set in the .env file.');
  process.exit(1);
}
const bot=new Telegraf(process.env.teletoken);
bot.start((ctx)=>ctx.reply("Hey There!Tell me the name of the movie and I'll tell you everything else!"));
bot.command('quit', async (ctx) => {
  await ctx.leaveChat();
})
bot.on(message('text'), async (ctx) => {
  const mss=ctx.message.text;
  try{
	  const ares=await axios.get(process.env.omdbkey,{
		  params:{
			  s:mss,
		  }
	  });
	  if(ares.data.Response==="True" && ares.data.Search.length>0){
	  for(let i=0;i<=Math.min(2,ares.data.Search.length);i++){
	  let res=await axios.get(process.env.omdbkey,{
		  params:{
			  i:ares.data.Search[i].imdbID,
			  plot:'full',
		  }
	 });
      
          if(res.data.Poster!='undefined' && res.data.Poster!='N/A' ){
          try{
  	  await axios.head(res.data.Poster,{timeout:2000});		  
          await ctx.replyWithPhoto({url:res.data.Poster},{caption:`Type is: ${res.data.Type.charAt(0).toUpperCase()+res.data.Type.slice(1)}\n`+
                    `Release Date is: ${res.data.Year}\n`+
                    `Title is: ${res.data.Title}\n`+
                    `Runtime (in Mins):${res.data.Runtime}\n`+
                    `Genre:${res.data.Genre}\n`+
                  `The Plot For The Movie Is As Follows->${res.data.Plot}\n`+
                  `Country Of Origin:${res.data.Country}`
	  });
	  }catch (urlError) {
              console.error("URL validation error:", urlError.message);
              await ctx.reply(`Type is: ${res.data.Type.charAt(0).toUpperCase()+res.data.Type.slice(1)}\n`+
                    `Release Date is: ${res.data.Year}\n`+
                    `Title is: ${res.data.Title}\n`+
                    `Runtime (in Mins):${res.data.Runtime}\n`+
                    `Genre:${res.data.Genre}\n`+
                  `The Plot For The Movie Is As Follows->${res.data.Plot}\n`+
                  `Country Of Origin:${res.data.Country}` +
		  '\nFailed to load poster image.');
            }
	  }
          else{
	  ctx.reply(`Type is: ${res.data.Type.charAt(0).toUpperCase()+res.data.Type.slice(1)}\n`+
		    `Release Date is: ${res.data.Year}\n`+
		    `Title is: ${res.data.Title}\n`+
		    `Runtime (in Mins):${res.data.Runtime}\n`+
		    `Genre:${res.data.Genre}\n`+
		  `The Plot For The Movie Is As Follows->${res.data.Plot}\n`+
		  `Country Of Origin:${res.data.Country}`
	  )}
      }
	  }
	  else{
		  ctx.reply("Not Found.");
	  }
  } catch (error) {
    console.error("Error:", error);
    ctx.reply("Sorry, something went wrong while fetching the movie data.");
  }
  });
bot.launch();
