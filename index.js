const fs = require('fs')
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./config/.env") });
const Jimp = require("jimp");
const TelegramBot = require("node-telegram-bot-api");
const Vision = require("@google-cloud/vision");

const client = new Vision.ImageAnnotatorClient();
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const localImage = "./image.jpg"

// bot.onText(/\/start/, (msg) => {
//   bot.sendMessage(msg.chat.id, "Adicionar recibo?", {
//     reply_markup: {
//       keyboard: [["QR Code", "Foto"]],
//     },
//   });
// });

bot.on("message", (msg) => {
  console.log('message received')
  if (msg.photo) {
    console.log('message is photo')
    bot.getFileLink(msg.photo[2].file_id).then((fileURI) => {
      downloadImage(fileURI)
    })
  }
});

const downloadImage = async (fileURI) => {
  Jimp.read({
    url: fileURI
  })
    .then(image => {
      image.write(localImage)
      imgToText(localImage)
    })
    .catch(error => {
      console.log(error)
    })
}

const imgToText = async (fileName) => {
  /* GOOGLE VISION API */
  console.log('sending image to recognize')
  client.textDetection(fileName)
    .then(response => {
      const [result] = response
      const detections = result.textAnnotations[0];
      parseData(detections.description)
      fs.unlink(localImage, err => {
        if (err) throw err
      })
    })
    .catch(err => {
      console.log(err)
    })
}

const parseData = (detectedText) => {
  const formatData = (product) => {
    return product = {
      name: product.substring(13, 28).trim(),
      quantity: parseInt(product.substring(29, 34).trim().replace(',', '.')),
      price: parseFloat(product.slice(-5).trim().replace(',', '.'))
    }
  }

  const parsedText = detectedText
    .split(/\r?\n/)
    .filter(a => a.length > 13)
    .map(product => formatData(product))

  const total = parsedText.reduce((acc, curr) => {
    return (curr.price * curr.quantity) + acc
  }, 0)

  console.log(parsedText);
  console.log(`Total: ${total.toFixed(2)}`)
}

// imgToText('./sample.jpg')
