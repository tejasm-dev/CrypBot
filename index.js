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

        api.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200&page=1&sparkline=false`).set("x-cg-demo-api-key", "CG-kcGxuD4fFpba8VZhHzhNYMj7").set("accept", "application/json").end((err, res) => {
            if (err === null) {
                let body = findCrypto(crypto, res._body);

                let name = body.name;
                let symbol = body.symbol

                let price = body.current_price >= 1 ? body.current_price.toLocaleString("en-US") : body.current_price;
                let cap = body.market_cap >= 1 ? body.market_cap.toLocaleString("en-US") : body.market_cap;

                let change_24h = body.price_change_percentage_24h >= 1 ? body.price_change_percentage_24h.toLocaleString("en-US") : body.price_change_percentage_24h;

                let high_24h = body.high_24h >= 1 ? body.high_24h.toLocaleString("en-US") : body.high_24h;
                let low_24h = body.low_24h >= 1 ? body.low_24h.toLocaleString("en-US") : body.low_24h;

                bot.sendMessage(chatId, `${name} (${symbol})\n\nPrice :  $${price}\nMarket Cap :  $${cap}\nPrice Change (24hr) : ${change_24h}\n24hr High : ${high_24h}\n24hr Low : ${low_24h}`);
            }

            else {
                let words = req.text.match(/\S+/g);
                let crypto = words.toString().replace(",", "").toLowerCase();

                api.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200&page=1&sparkline=false`).set("x-cg-demo-api-key", "CG-kcGxuD4fFpba8VZhHzhNYMj7").set("accept", "application/json").end((err, res) => {
                    if (err === null) {
                        let body = findCrypto(crypto, res._body);

                        let name = body.name;
                        let symbol = body.symbol

                        let price = body.current_price >= 1 ? body.current_price.toLocaleString("en-US") : body.current_price;
                        let cap = body.market_cap >= 1 ? body.market_cap.toLocaleString("en-US") : body.market_cap;

                        let change_24h = body.price_change_percentage_24h >= 1 ? body.price_change_percentage_24h.toLocaleString("en-US") : body.price_change_percentage_24h;

                        let high_24h = body.high_24h >= 1 ? body.high_24h.toLocaleString("en-US") : body.high_24h;
                        let low_24h = body.low_24h >= 1 ? body.low_24h.toLocaleString("en-US") : body.low_24h;

                        bot.sendMessage(chatId, `${name} (${symbol})\n\nPrice :  $${price}\nMarket Cap :  $${cap}\nPrice Change (24hr) : ${change_24h}\n24hr High : ${high_24h}\n24hr Low : ${low_24h}`);
                    }

                    else {
                        bot.sendMessage(chatId, `No Crypto Found "${req.text}"`);
                    }
                });
            }
        });
    }
}

function findCrypto(crypto, array) {
    return array.find(e =>
        e.id.toLowerCase() === crypto.toLowerCase() ||
        e.name.toLowerCase() === crypto.toLowerCase() ||
        e.symbol.toLowerCase() === crypto.toLowerCase()
    );
}