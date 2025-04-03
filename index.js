const telegramBot = require("node-telegram-bot-api");
const api = require("superagent");

require("dotenv").config();

const token = process.env.TELEGRAM_TOKEN;  // Telegram bot token
const apikey = process.env.APIKEY;  // CoinGecko Free API Key

const bot = new telegramBot(token, { polling: true });

const intro = `\nThis is Cryp Bot @thecryp_bot\n\nA Telegram based crypto price telling bot which tells you the current price of the crypto you ask for.\nFor asking, just write the name of the crypto and our bot will tell you the price of that crypto in us dollars.\n\nThanks!`;

bot.on("message", done);  // message event handler

function done(req) {
    let chatId = req.chat.id;

    // handling polling errors
    bot.on("polling_error", function (err) {
        if (err.code === "ERR_UNESCAPED_CHARACTERS") {
            bot.sendMessage(chatId, "Error!\nUnescaped characters are not allowed.");
        }
    });

    // start conversation
    if (req.text === "/start" | req.text === "/") {
        bot.sendMessage(chatId, `Hi, ${req.from.first_name}\n${intro}`)
    }

    // developer info
    else if (req.text === "/dev" | req.text === "/developer") {
        bot.sendMessage(chatId, "Our Developer:\nhttps://x.com/tejasm_");
    }

    // command to list 200 crypto currencies
    else if (req.text === "/list") {
        // Get request on free CoinGecko API
        api.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=200&order=market_cap_desc&page=1&sparkline=false`).set("x-cg-demo-api-key", apikey).set("accept", "application/json").end((err, res) => {
            if (err === null) {
                let str = "";

                for (let i = 0; i < res._body.length; i++) {
                    const e = res._body[i];

                    str += `\n${i + 1}.  ${e.name}`;
                }

                str += "\n\n200!";

                bot.sendMessage(chatId, str);
            }

            // handling errors in api request
            else {
                bot.sendMessage(chatId, "Error!\nSomething went wrong");
            }
        });
    }

    // giving detail about crypto user asks for
    else {
        let words = req.text.match(/\S+/g);
        let crypto = words.toString().replace(",", "-").toLowerCase();  // if user writes "shiba inu", this will replace it to "shiba-inu"

        api.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=200&order=market_cap_desc&page=1&sparkline=false`).set("x-cg-demo-api-key", apikey).set("accept", "application/json").end((err, res) => {
            if (err === null) {
                // extract specific crypto from the list
                let body = findCrypto(crypto, res._body);

                // if crypto is not found
                if (!body) {
                    let words2 = req.text.match(/\S+/g);
                    let crypto2 = words2.toString().replace(",", "").toLowerCase();  // if user writes "binance coin", this will replace it to "binancecoin"

                    api.get(`https://api.coingeco.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200&page=1&sparkline=false`).set("x-cg-demo-api-key", apikey).set("accept", "application/json").end((err2, res2) => {
                        if (err2 === null) {
                            let body2 = findCrypto(crypto2, res2._body);

                            // if crypto is again not found
                            if (!body2) {
                                bot.sendMessage(chatId, `No Crypto Found "${req.text}"`);
                                return;
                            }

                            let name = body2.name;
                            let symbol = body2.symbol;

                            // convert numbers from 1000000 to 1,000,000 if the number is more than 1

                            let price = body2.current_price >= 1 ? body2.current_price.toLocaleString("en-US") : body2.current_price;
                            let cap = body2.market_cap >= 1 ? body2.market_cap.toLocaleString("en-US") : body2.market_cap;

                            let change_24h = body2.price_change_percentage_24h >= 1 ? body2.price_change_percentage_24h.toLocaleString("en-US") : body2.price_change_percentage_24h;

                            let high_24h = body2.high_24h >= 1 ? body2.high_24h.toLocaleString("en-US") : body2.high_24h;
                            let low_24h = body2.low_24h >= 1 ? body2.low_24h.toLocaleString("en-US") : body2.low_24h;

                            // send crypto data
                            bot.sendMessage(chatId, `${name} (${symbol})\n\nPrice :  $${price}\nMarket Cap :  $${cap}\nPrice Change (24hr) : ${change_24h}\n24hr High : ${high_24h}\n24hr Low : ${low_24h}`);

                            return;
                        }

                        // error handler
                        else {
                            bot.sendMessage(chatId, "An error occurred!");
                            return;
                        }
                    });

                    return;
                }

                let name = body.name;
                let symbol = body.symbol;

                // convert numbers from 1000000 to 1,000,000 if the number is more than 1
                
                let price = body.current_price >= 1 ? body.current_price.toLocaleString("en-US") : body.current_price;
                let cap = body.market_cap >= 1 ? body.market_cap.toLocaleString("en-US") : body.market_cap;

                let change_24h = body.price_change_percentage_24h.toFixed(2);

                let high_24h = body.high_24h >= 1 ? body.high_24h.toLocaleString("en-US") : body.high_24h;
                let low_24h = body.low_24h >= 1 ? body.low_24h.toLocaleString("en-US") : body.low_24h;

                // send crypto data
                bot.sendMessage(chatId, `${name} (${symbol})\n\nPrice :  $${price}\nMarket Cap :  $${cap}\n24hr Price Change : ${change_24h}%\n24hr High : $${high_24h}\n24hr Low : $${low_24h}`);
                return;
            }

            // error handler
            else {
                bot.sendMessage(chatId, "An error occurred!");
                return;
            }
        });
    }
}

// This function extracts the specific crypto from the list provided, by checking either id, name or symbol
function findCrypto(crypto, array) {
    return array.find(e =>
        e.id.toLowerCase() === crypto.toLowerCase() ||
        e.name.toLowerCase() === crypto.toLowerCase() ||
        e.symbol.toLowerCase() === crypto.toLowerCase()
    );
}