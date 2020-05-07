const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./config/.env") });
const Jimp = require("jimp");
const TelegramBot = require("node-telegram-bot-api");
const Vision = require("@google-cloud/vision");

const client = new Vision.ImageAnnotatorClient();
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

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
      image.write('sample.jpg')
      imgToText('./sample.jpg')
    })
    .catch(error => {
      console.log(error)
    })
}

const imgToText = async (fileName) => {
  /* GOOGLE VISION API */
  console.log('sending image to recognize')

  const [result] = await client.textDetection(fileName)
  const detections = result.textAnnotations[0];
  console.log(detections)

  var array = detections.description.split(/\r?\n/)
  array = array.filter(a => a.length > 13)
  array = array.map(product => {
    return product = {
      name: product.substring(13, 28).trim(),
      quantity: parseInt(product.substring(29, 34).trim().replace(',', '.')),
      price: parseFloat(product.slice(-5).trim().replace(',', '.'))
    }
  })

  const total = array.reduce((acc, curr) => {
    return (curr.price * curr.quantity) + acc
  }, 0)
  console.log(array);
  console.log(`Total: ${total.toFixed(2)}`)
}

// imgToText('./sample.jpg')
