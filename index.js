const telegramBot = require("node-telegram-bot-api");
const api = require("superagent");

require("dotenv").config();

const token = process.env.TELEGRAM_TOKEN;

const bot = new telegramBot(token, { polling: true });

const intro = `\nThis is Cryp Bot @thecryp_bot\n\nA Telegram based crypto price telling bot which tells you the current price of the crypto you ask for.\nFor asking, just write the name of the crypto and our bot will tell you the price of that crypto in us dollars.\n\nThanks!`;

bot.on("message", done);

function done(req) {
    let chatId = req.chat.id;

    bot.on("polling_error", function (err) {
        if (err.code === "ERR_UNESCAPED_CHARACTERS") {
            bot.sendMessage(chatId, "Error!\nUnescaped characters are not allowed.");
        }
    });

    if (req.text === "/start" | req.text === "/") {
        bot.sendMessage(chatId, `Hi, ${req.from.first_name}\n${intro}`)
    }

    else if (req.text === "/dev" | req.text === "/developer") {
        bot.sendMessage(chatId, "Our Developer:\nhttps://x.com/tejasm_");
    }

    else if (req.text === "/list") {
        api.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200&page=1&sparkline=false`).set("x-cg-demo-api-key", "CG-kcGxuD4fFpba8VZhHzhNYMj7").set("accept", "application/json").end((err, res) => {
            if (err === null) {
                let str = "";

                for (let i = 0; i < res._body.length; i++) {
                    const e = res._body[i];

                    str += `\n${i + 1}.  ${e.name}`;
                }

                str += "\n\n200!";

                bot.sendMessage(chatId, str);
            }

            else {
                console.log(err);
                bot.sendMessage(chatId, "Error!\nSomething went wrong");
            }
        });
    }

    else {
        let words = req.text.match(/\S+/g);
        let crypto = words.toString().replace(",", "-").toLowerCase();

        api.get(`https://api.coingecko.com/api/v3/coins/${crypto}`).set("x-cg-demo-api-key", "CG-kcGxuD4fFpba8VZhHzhNYMj7").set("accept", "application/json").end((err, res) => {
            if (err === null) {
                let body = res._body;

                let name = body.name;
                let symbol = body.symbol

                let price = body.market_data.current_price.usd;
                let cap = body.market_data.market_cap.usd;

                bot.sendMessage(chatId, `${name} (${symbol})\n\nPrice :  $${price >= 1 ? price.toLocaleString("en-US") : price}\nMarket Cap :  $${cap >= 1 ? cap.toLocaleString("en-US") : cap}`)
            }

            else {
                let words = req.text.match(/\S+/g);
                let crypto = words.toString().replace(",", "").toLowerCase();

                api.get(`https://api.coingecko.com/api/v3/coins/${crypto}`).set("x-cg-demo-api-key", "CG-kcGxuD4fFpba8VZhHzhNYMj7").set("accept", "application/json").end((err, res) => {
                    if (err === null) {
                        let body = res._body;

                        let name = body.name;

                        let price = body.market_data.current_price.usd;
                        let cap = body.market_data.market_cap.usd;

                        bot.sendMessage(chatId, `${name}\n\nPrice :  $${price >= 1 ? price.toLocaleString("en-US") : price}\nMarket Cap :  $${cap >= 1 ? cap.toLocaleString("en-US") : cap}`)
                    }

                    else {
                        bot.sendMessage(chatId, `No Crypto Found "${req.text}"`);
                    }
                });
            }
        });
    }
}