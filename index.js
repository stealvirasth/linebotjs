'use strict';
const line = require('@line/bot-sdk');
const express = require('express');
const config = {
  channelAccessToken: 'yaJGg1EyAvAuzZuBrECvVvk4NfNyT2nZSrf7UyTziLgp5J2X5M84vl3xTaYVtlQHzeEeTRaJtoSXQ9KBDQiJg9wKabmI2aq0bc3qLPa44uubCS + s3EM0dcklBhP51XIMky8WwuknPueqAcRxjaVxbAdB04t89/1O/w1cDnyilFU=',
  channelSecret: '30b2cb328b70622bf3e55900549c54f7',
};
let baseURL = 'https://magician1.herokuapp.com/callback';
const client = new line.Client(config);
const app = express();
app.post('/callback', line.middleware(config), (req, res) => {
  if (req.body.destination) console.log("Destination User ID: " + req.body.destination);
  if (!Array.isArray(req.body.events)) return res.status(500).end();
  Promise
    .all(req.body.events.map(handleEvent))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

const pushText = (to, texts) => {
  return client.pushMessage(to, { type: 'text', text: texts });
};

const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
};

function handleEvent(event) {
  if (event.replyToken.match(/^(.)\1*$/)) {
    return console.log("Test hook recieved: " + JSON.stringify(event.message));
  }

  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken, event.source);
        case 'image':
          if (event.source.type == 'group') return;
          return handleImage(message, event.replyToken);
        case 'video':
          if (event.source.type == 'group') return;
          return handleVideo(message, event.replyToken);
        case 'audio':
          if (event.source.type == 'group') return;
          return handleAudio(message, event.replyToken);
        case 'location':
          if (event.source.type == 'group') return;
          return handleLocation(message, event.replyToken);
        case 'sticker':
          return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'ขอบคุณที่เป็นเพื่อนกับแน็ค');

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`);

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);
    
    case 'postback':
      let data = event.postback.data;
      if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
        data += `(${JSON.stringify(event.postback.params)})`;
      }
      return replyText(event.replyToken, `ตอบกลับ: ${data}`);

    case 'beacon':
      return replyText(event.replyToken, `Beacon: ${event.beacon.hwid}`);

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function handleMessage(message, replyToken) {
  let msg = message.text;
  let to = replyToken;
  if (!to) return;
  if (msg == 'สวัสดี') {
    return replyText(to, 'สวัสดี');
  }
  client.replyMessage(replyToken,
{
  "type": "flex",
  "altText": "FLEX",
  "contents":
{
  "type": "bubble",
  "header": {
    "type": "box",
    "layout": "horizontal",
    "contents": [
      {
        "type": "text",
        "text": "NEWS DIGEST",
        "weight": "bold",
        "color": "#aaaaaa",
        "size": "sm"
      }
    ]
  },
  "hero": {
    "type": "image",
    "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_4_news.png",
    "size": "full",
    "aspectRatio": "20:13",
    "aspectMode": "cover",
    "action": {
      "type": "uri",
      "uri": "http://linecorp.com/"
    }
  },
  "body": {
    "type": "box",
    "layout": "horizontal",
    "spacing": "md",
    "contents": [
      {
        "type": "box",
        "layout": "vertical",
        "flex": 1,
        "contents": [
          {
            "type": "image",
            "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/02_1_news_thumbnail_1.png",
            "aspectMode": "cover",
            "aspectRatio": "4:3",
            "size": "sm",
            "gravity": "bottom"
          },
          {
            "type": "image",
            "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/02_1_news_thumbnail_2.png",
            "aspectMode": "cover",
            "aspectRatio": "4:3",
            "margin": "md",
            "size": "sm"
          }
        ]
      },
      {
        "type": "box",
        "layout": "vertical",
        "flex": 2,
        "contents": [
          {
            "type": "text",
            "text": "7 Things to Know for Today",
            "gravity": "top",
            "size": "xs",
            "flex": 1
          },
          {
            "type": "separator"
          },
          {
            "type": "text",
            "text": "Hay fever goes wild",
            "gravity": "center",
            "size": "xs",
            "flex": 2
          },
          {
            "type": "separator"
          },
          {
            "type": "text",
            "text": "LINE Pay Begins Barcode Payment Service",
            "gravity": "center",
            "size": "xs",
            "flex": 2
          },
          {
            "type": "separator"
          },
          {
            "type": "text",
            "text": "LINE Adds LINE Wallet",
            "gravity": "bottom",
            "size": "xs",
            "flex": 1
          }
        ]
      }
    ]
  },
  "footer": {
    "type": "box",
    "layout": "horizontal",
    "contents": [
      {
        "type": "button",
        "action": {
          "type": "uri",
          "label": "More",
          "uri": "https://linecorp.com"
        }
      }
    ]
  }
}
})
}


function handleText(message, replyToken, source) {
  const buttonsImageURL = `${baseURL}/static/buttons/1040.jpg`;
  switch (message.text) {
    case 'invite':
      return replyText(replyToken, `เข้ากลุ่มแชทบอท\n${botInvite}`);
    case 'profile':
      if (source.userId) {
        var profile;
        try {
          client.getProfile(source.userId)
          .then((p) => {
            profile = p;
          });
        } catch(err) {
          console.error(err);
        }
        return replyText(replyToken, `ชื่อ: ${profile.displayName}\nสถานะ: ${profile.statusMessage}`);
      } else {
        return replyText(replyToken, 'คุณไม่สามารถใช้คำสั่งนี้ได้');
      }
    case '!buttons':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Buttons alt text',
          template: {
            type: 'buttons',
            thumbnailImageUrl: 'https://scontent.fbkk3-1.fna.fbcdn.net/v/t31.0-8/fr/cp0/e15/q65/30424995_216673702424941_779553180074180544_o.jpg?_nc_cat=101&efg=eyJpIjoidCJ9&_nc_eui2=AeEhWRGlyOCKlIYd4QaKkQ9-Qyr5mjeI2P9Xnin-IgoIUAWaet1qKzXXWxg_K8K8v3kjt2c96mZaO52e7wErCtkEUw0PZ69596W3bkpt1MqQijcFH_gOZe0zC4LXYY6uCfY&_nc_ht=scontent.fbkk3-1.fna&oh=44271adb9dde5e441161fdc9534bb4d8&oe=5CA21D76',
            title: 'My button sample',
            text: 'Hello, my button',
            actions: [
              { label: 'Go to line.me', type: 'uri', uri: 'https://line.me/ti/p/~api_2001' },
              { label: 'สวัสดี', type: 'postback', data: 'สวัสดีงับ~~~' },
              { label: 'ฮัลโหล', type: 'postback', data: 'Hello', text: 'Hi' },
              { label: 'Message', type: 'message', text: 'Magicavi [ แน็ค ]' },
            ],
          },
        }
      );
    case '!confirm':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Templat Confirm',
          template: {
            type: 'confirm',
            text: 'คุณเป็นกระเทยไหม..!!',
            actions: [
              { label: 'ใช่', type: 'message', text: 'ใช่!' },
              { label: 'ไม่ใช่', type: 'message', text: 'ไม่ใช่!' },
            ],
          },
        }
      )
    case '!carousel':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Template Carousel ',
          template: {
            type: 'carousel',
            columns: [
              {
                thumbnailImageUrl: 'https://scontent.fbkk3-1.fna.fbcdn.net/v/t31.0-8/fr/cp0/e15/q65/30424995_216673702424941_779553180074180544_o.jpg?_nc_cat=101&efg=eyJpIjoidCJ9&_nc_eui2=AeEhWRGlyOCKlIYd4QaKkQ9-Qyr5mjeI2P9Xnin-IgoIUAWaet1qKzXXWxg_K8K8v3kjt2c96mZaO52e7wErCtkEUw0PZ69596W3bkclient.replyMessage(replyToken,
{
  "type": "flex",
  "altText": "FLEX",
  "contents":
{
  "type": "bubble",
  "header": {
    "type": "box",
    "layout": "horizontal",
    "contents": [
      {
        "type": "text",
        "text": "NEWS DIGEST",
        "weight": "bold",
        "color": "#aaaaaa",
        "size": "sm"
      }
    ]
  },
  "hero": {
    "type": "image",
    "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_4_news.png",
    "size": "full",
    "aspectRatio": "20:13",
    "aspectMode": "cover",
    "action": {
      "type": "uri",
      "uri": "http://linecorp.com/"
    }
  },
  "body": {
    "type": "box",
    "layout": "horizontal",
    "spacing": "md",
    "contents": [
      {
        "type": "box",
        "layout": "vertical",
        "flex": 1,
        "contents": [
          {
            "type": "image",
            "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/02_1_news_thumbnail_1.png",
            "aspectMode": "cover",
            "aspectRatio": "4:3",
            "size": "sm",
            "gravity": "bottom"
          },
          {
            "type": "image",
            "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/02_1_news_thumbnail_2.png",
            "aspectMode": "cover",
            "aspectRatio": "4:3",
            "margin": "md",
            "size": "sm"
          }
        ]
      },
      {
        "type": "box",
        "layout": "vertical",
        "flex": 2,
        "contents": [
          {
            "type": "text",
            "text": "7 Things to Know for Today",
            "gravity": "top",
            "size": "xs",
            "flex": 1
          },
          {
            "type": "separator"
          },
          {
            "type": "text",
            "text": "Hay fever goes wild",
            "gravity": "center",
            "size": "xs",
            "flex": 2
          },
          {
            "type": "separator"
          },
          {
            "type": "text",
            "text": "LINE Pay Begins Barcode Payment Service",
            "gravity": "center",
            "size": "xs",
            "flex": 2
          },
          {
            "type": "separator"
          },
          {
            "type": "text",
            "text": "LINE Adds LINE Wallet",
            "gravity": "bottom",
            "size": "xs",
            "flex": 1
          }
        ]
      }
    ]
  },
  "footer": {
    "type": "box",
    "layout": "horizontal",
    "contents": [
      {
        "type": "button",
        "action": {
          "type": "uri",
          "label": "More",
          "uri": "https://linecorp.com"
        }
      }
    ]
  }
}
})pt1MqQijcFH_gOZe0zC4LXYY6uCfY&_nc_ht=scontent.fbkk3-1.fna&oh=44271adb9dde5e441161fdc9534bb4d8&oe=5CA21D76',
                title: 'Template',
                text: 'Magicavi',
                actions: [
                  { label: 'Add Line Me', type: 'uri', uri: 'https://line.me/ti/p/~api_2001' },
                  { label: '----', type: 'postback', data: '~~~' },
                ],
              },
              {
                thumbnailImageUrl: 'https://scontent.fbkk4-3.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/40225721_732251267115437_1776744897097760768_o.jpg?_nc_cat=106&efg=eyJpIjoidCJ9&_nc_eui2=AeGf5_R-edVXk8nBpwTqlZ5jL3OAovI5XQH3g7VaVzU0VAxjZI1hSkwoKozOaclNTluHJFFQELJVObXz5SfDfERIZy0dn95RDwe3yuYe2mpeHw&_nc_ht=scontent.fbkk4-3.fna&oh=0a2b5cd2b5b837296c20b4e0fbfadb22&oe=5C71EE37',
                title: 'Template',
                text: 'Magicavi',
                actions: [
                  { label: 'สวัสดี', type: 'postback', data: 'สวัสดีคับ', text: 'สวัสดีๆ' },
                  { label: 'Message', type: 'message', text: 'Nice 👍' },
                ],
              },
            ],
          },
        }
      );
    case '!image carousel':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Template Image Carousel',
          template: {
            type: 'image_carousel',
            columns: [
              {
                imageUrl: 'https://scontent.fbkk3-1.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/46712297_268191354043365_6515432230884474880_o.jpg?_nc_cat=108&efg=eyJpIjoidCJ9&_nc_eui2=AeFBKosEdXXzVuVQ7i3PhJ9cP2SQmdzqMahrdjead-A9FIZ6qgEO-hadW0mEEcU4lmKyI5BS7a6VWJWqp4O5Q-pHmpYE39ONlrLKKeNcaYOf6IIusOVe5yq3hRfFDgFkou0&_nc_ht=scontent.fbkk3-1.fna&oh=b957cae8fc99007b9957c76e70013a9d&oe=5CB17C45',
                action: { label: 'Go to LINE', type: 'uri', uri: 'https://line.me/ti/p/~api_2001' },
              },
              {
                imageUrl: 'https://scontent.fbkk3-1.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/41721433_2150286725251857_1964699426249244672_n.jpg?_nc_cat=101&efg=eyJpIjoidCJ9&_nc_eui2=AeEnczXzjuur37zKw-hDsbsGGQ796gfXY_PrCmbuq1-n2sm5QlYcCY-hOQhvlZKG_CTVeemiFRKhcvYkdzLpAo72E8H-TnzOYZv1eaS7dE7h7VlwfwQVXzPjbtLfS742sE4&_nc_ht=scontent.fbkk3-1.fna&oh=0a46bb8e5e58d9c318f3f0be157d9c73&oe=5C735BDF',
                action: { label: '~~~', type: 'postback', data: '☢☢☢☢' },
              },
              {
                imageUrl: 'https://scontent.fbkk3-3.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/41781953_2150287121918484_4960353520806002688_n.jpg?_nc_cat=105&efg=eyJpIjoidCJ9&_nc_eui2=AeFgHOrs397wourJCnOJRXGe5nx8oRgcJas6Di7_j5ZGc6HTBcR6GJNPhC83-c1g7cgB5wMd48bFJeHzgNn12-MGZFLAWwloU9l8mhun1aYp8XjuI1dMt2kG7PSB-2B9c8U&_nc_ht=scontent.fbkk3-3.fna&oh=5078a21f7815d3b60bb5bde2eceef573&oe=5C67331F',
                action: { label: 'Message', type: 'message', text: 'น่ารัก~~' },
              },
              {
                imageUrl: 'https://scontent.fbkk3-3.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/39700495_2137437203138376_1543600556008800256_o.jpg?_nc_cat=104&efg=eyJpIjoidCJ9&_nc_eui2=AeE2_pMA4BnMF_5rp_o3soN5sNM5oG76iSc1pF83ovxM1_e-JQRe2TgirsHscNDxm7KGD8FK-S_gAamh31Xx4mnaxGRvNNdpFpv13WMDYMaNATmNWV7__jBRV8LUMhJK1pI&_nc_ht=scontent.fbkk3-3.fna&oh=7cd6a38a66c7744a6d331bb8ea1d9957&oe=5C722E09',
                action: {
                  label: 'datetime',
                  type: 'datetimepicker',
                  data: 'DATETIME',
                  mode: 'datetime',
                },
              },
            ]
          },
        }
      );
    case '!datetime':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Datetime pickers alt text',
          template: {
            type: 'buttons',
            text: 'Select date / time !',
            actions: [
              { type: 'datetimepicker', label: 'date', data: 'DATE', mode: 'date' },
              { type: 'datetimepicker', label: 'time', data: 'TIME', mode: 'time' },
              { type: 'datetimepicker', label: 'datetime', data: 'DATETIME', mode: 'datetime' },
            ],
          },
        }
      );
    case '.imagemap':
      return client.replyMessage(
        replyToken,
        {
          type: 'imagemap',
          baseUrl: `${baseURL}/static/rich`,
          altText: 'Imagemap alt text',
          baseSize: { width: 1040, height: 1040 },
          actions: [
            { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
            { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
            { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
            { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
          ],
          video: {
            originalContentUrl: `${baseURL}/static/imagemap/video.mp4`,
            previewImageUrl: `${baseURL}/static/imagemap/preview.jpg`,
            area: {
              x: 280,
              y: 385,
              width: 480,
              height: 270,
            },
            externalLink: {
              linkUri: 'https://line.me/ti/p/~api_2001',
              label: 'LINE'
            }
          },
        }
      );
    case '!template':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Buttons Template',
          template: {
            type: 'buttons',
            thumbnailImageUrl: 'https://scontent.fbkk3-1.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/46712297_268191354043365_6515432230884474880_o.jpg?_nc_cat=108&efg=eyJpIjoidCJ9&_nc_eui2=AeFBKosEdXXzVuVQ7i3PhJ9cP2SQmdzqMahrdjead-A9FIZ6qgEO-hadW0mEEcU4lmKyI5BS7a6VWJWqp4O5Q-pHmpYE39ONlrLKKeNcaYOf6IIusOVe5yq3hRfFDgFkou0&_nc_ht=scontent.fbkk3-1.fna&oh=b957cae8fc99007b9957c76e70013a9d&oe=5CB17C45',
            title: 'My button Template',
            text: 'Hello my button!',
            actions: [
              { label: 'Go to line.me', type: 'uri', uri: 'https://line.me/ti/p/~api_2001' },
              { label: 'Message', type: 'message', text: 'Magicavi [ แน็ค ]' },
              { label: 'Help Buttons', type: 'message', text: '!buttons' },              
              { label: 'Help Image carousel', type: 'message', text: '!image carousel' },              
            ],
          },
        }
      );      
    case 'bye':
      switch (source.type) {
        case 'user':
          return replyText(replyToken, 'Bot can\'t leave from 1:1 chat');
        case 'group':
          return replyText(replyToken, '✅ | กำลังออกจากกลุ่มค่ะ')
            .then(() => client.leaveGroup(source.groupId));
        case 'room':
          return replyText(replyToken, '✅ | กำลังออกจากห้องค่ะ')
            .then(() => client.leaveRoom(source.roomId));
      }
    default:
      return handleMessage(message, replyToken);
      
  }
}

function handleImage(message, replyToken) {
  let getContent;
  if (message.contentProvider.type === "line") {
    var downloadPath = path.join(__dirname, 'downloaded', `${message.id}.jpg`);
    var previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);
    getContent = downloadContent(message.id, downloadPath)
      .then((downloadPath) => {
        cp.execSync(`convert -resize 240x jpeg:${downloadPath} jpeg:${previewPath}`);
        return {
          originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
          previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
        };
      });
  } else if (message.contentProvider.type === "external") {
    getContent = Promise.resolve(message.contentProvider);
  }
  var image_url;
  return getContent
    .then(({ originalContentUrl, previewImageUrl }) => {
      image_url = originalContentUrl.originalContentUrl;
      return client.replyMessage(
        replyToken,
        {
          type: 'image',
          originalContentUrl,
          previewImageUrl,
        }
      )
    });
}

function handleVideo(message, replyToken) {
  let getContent;
  if (message.contentProvider.type === "line") {
    const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.mp4`);
    const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);
    getContent = downloadContent(message.id, downloadPath)
      .then((downloadPath) => {
        cp.execSync(`convert mp4:${downloadPath}[0] jpeg:${previewPath}`);

        return {
          originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
          previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
        }
      });
  } else if (message.contentProvider.type === "external") {
    getContent = Promise.resolve(message.contentProvider);
  }

  return getContent
    .then(({ originalContentUrl, previewImageUrl }) => {
      return client.replyMessage(
        replyToken,
        {
          type: 'video',
          originalContentUrl,
          previewImageUrl,
        }
      );
    });
}

function handleAudio(message, replyToken) {
  let getContent;
  if (message.contentProvider.type === "line") {
    const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.m4a`);
    getContent = downloadContent(message.id, downloadPath)
      .then((downloadPath) => {
        return {
            originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
        };
      });
  } else {
    getContent = Promise.resolve(message.contentProvider);
  }

  return getContent
    .then(({ originalContentUrl }) => {
      return client.replyMessage(
        replyToken,
        {
          type: 'audio',
          originalContentUrl,
          duration: message.duration,
        }
      );
    });
}

function downloadContent(messageId, downloadPath) {
  return client.getMessageContent(messageId)
    .then((stream) => new Promise((resolve, reject) => {
      const writable = fs.createWriteStream(downloadPath);
      stream.pipe(writable);
      stream.on('end', () => resolve(downloadPath));
      stream.on('error', reject);
    }));
}

function handleLocation(message, replyToken) {
  return client.replyMessage(
    replyToken,
    {
      type: 'location',
      title: message.title,
      address: message.address,
      latitude: message.latitude,
      longitude: message.longitude,
    }
  );
}

function handleSticker(message, replyToken) {
  if (!message.packageId) return;
  return client.replyMessage(
    replyToken,
    {
      type: 'sticker',
      packageId: message.packageId,
      stickerId: message.stickerId,
    }
  );
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  if (baseURL) {
    console.log('listening on '+baseURL+':'+port+'/callback');
  } else {
    console.log("It seems that BASE_URL is not set.");
  }
});