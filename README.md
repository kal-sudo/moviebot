This is a telegram bot in progress which, after completion, will serve as a movie recommendation bot for friday night movies.

You can contribute or test the bot locally

### Steps to test the bot locally
- after cloning the repository, use following commands to test the bot
```bash
npm install
```
This will install required packages for you.

- Create a file named ```.env``` in the **root directory** with below contents
```
teletoken="YOUR_TELEGRAM_KEY"
omdbkey="http://www.omdbapi.com/?apikey=YOUR_API_CODE"
tmdbkey="bbxxxxxxxxxxxxxxxxxxxxxxxxxcad7" 
```
Keep in mind that your omdb key should only be the key part, **it must not contain URL**.
