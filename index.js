const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./config/.env") });
// const Jimp = require("jimp");
// const QRCode = require("qrcode-reader");
// const express = require("express");
// const TelegramBot = require("node-telegram-bot-api");
const Vision = require("@google-cloud/vision");

// const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// bot.onText(/\/start/, (msg) => {
//   bot.sendMessage(msg.chat.id, "Adicionar recibo?", {
//     reply_markup: {
//       keyboard: [["QR Code", "Foto"]],
//     },
//   });
// });

// bot.on("message", (msg) => {
//   console.log('message received')
//   if (msg.photo) {
//     console.log('message is photo')
//     bot.getFileLink(msg.photo[2].file_id).then((fileURI) => {
//       console.log(`photo uri ${fileURI}`)
//       imgToText(fileURI)
//       /* READ QR CODE */
//       // Jimp.read(fileURI).then((image) => {
//       //   const qr = new QRCode();
//       //   qr.callback = (error, result) => {
//       //     if (error) {
//       //       return console.log("error", error);
//       //     }
//       //     console.log(result.result); // QRCode url is stored here
//       //   };
//       //   qr.decode(image.bitmap);
//       // });
//     })
//   }
// });

const imgToText = async (fileName) => {
  /* GOOGLE VISION API */
  const client = new Vision.ImageAnnotatorClient();

  const [result] = await client.textDetection(fileName);
  const detections = result.textAnnotations[0];

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
    return curr.price + acc
  }, 0)
  console.log(array);
  console.log(`Total: ${total.toFixed(2)}`)
}

imgToText('./img/sample-crop.jpg')

/* EXPRESS SERVER */
// const app = express();

// app.get("/", async (req, res) => {
//   // const detections = await quickstart();
//   // console.log(detections[0].description);
//   res.send("I'm back");
// });

// app.listen(process.env.PORT, () => {
//   console.log(`Server running on port ${process.env.PORT}`);
// });
