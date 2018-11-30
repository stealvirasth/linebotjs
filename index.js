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
      return replyText(event.replyToken, 'Thanks For Add Me.');

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
    case 'help':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Buttons Help',
          template: {
            type: 'buttons',
            thumbnailImageUrl: 'https://scontent.fbkk3-1.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/46712297_268191354043365_6515432230884474880_o.jpg?_nc_cat=108&efg=eyJpIjoidCJ9&_nc_eui2=AeGXDwUdm8Vls63ndP38QgxIP2SQmdzqMahrdjead-A9FAsrfaJNRRO4kraGELFNX64bfJbD6Ug2fUqhUn6pXGUAcrXO53RQpAennlKD_3XmubcE8EhkLv5ZjYP58bjZSMA&_nc_ht=scontent.fbkk3-1.fna&oh=4b9695b255305252fc51292821698cbc&oe=5CB17C45',
            title: 'คลิ๊กด้านล่าง เพื่อสั่งใช้งาน',
            text: 'ยินดี ให้บริการ',
            actions: [
              { label: 'Add line', type: 'uri', uri: 'https://line.me/ti/p/~api_2001' },
              { label: '[Help] Carousel', type: 'message', text: '!carousel' },
              { label: '[Help] Confirm', type: 'message', text: '!confirm' },
              { label: '[Help] Image carousel', type: 'message', text: '!image carousel' },
            ],
          },
        }
      );
    case '!confirm':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Confirm Template',
          template: {
            type: 'confirm',
            text: 'Do it?',
            actions: [
              { label: 'Yes', type: 'message', text: 'Yes!' },
              { label: 'No', type: 'message', text: 'No!' },
            ],
          },
        }
      )
    case '!carousel':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Carousel Template',
          template: {
            type: 'carousel',
            columns: [
              {
                thumbnailImageUrl: 'https://scontent.fbkk3-3.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/36363178_396144234225161_4212564190897897472_o.jpg?_nc_cat=104&efg=eyJpIjoidCJ9&_nc_eui2=AeEdjA-3tB5-ACsVmnB0oCQCWfBY_xgcru9F3Tc-eNP23q1MjcxOTALvceRx_UPT8mqjITUgbXiWAnNOnINuADKbeI-jHOdOwDjObb2RZkYBsAcLIuFVLGNYllx1JuCdlG0&_nc_ht=scontent.fbkk3-3.fna&oh=1b1194804344543e121a76eef2143764&oe=5C71898F',
                title: 'Facebook',
                text: 'เฟส น้อง ปาย',
                actions: [
                  { label: 'กดเพื่อดูต่อ.', type: 'uri', uri: 'https://m.facebook.com/ppyepye.sn' },
//                  { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
                ],
              },
              {
                thumbnailImageUrl: 'https://scontent.fbkk3-1.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/36885987_371410110051158_910226204223602688_o.jpg?_nc_cat=101&efg=eyJpIjoidCJ9&_nc_eui2=AeEK3nS4INsqNYBcKR9y9H_EhVZwbEgd6siv1002L0DrFxYVbp_KfICNgoMoxbVBm9UNsdP8AA-7xUkWWeKDmvr7hEJrSLEIjRax_o-P1K6vqLz98SXUxCIZHWQgrnLreP8&_nc_ht=scontent.fbkk3-1.fna&oh=45e515d03186a77aa6b6179f18cb9ad7&oe=5C9F5448',
                title: 'Facebokk',
                text: 'เฟส น้อง อิม',
                actions: [
                  { label: 'กดเพื่อดูต่อ.', type: 'uri', uri: 'https://m.facebook.com/phattranit.boonkhong.3' },
//                  { label: 'Say message', type: 'message', text: 'Rice=米' },
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
          altText: 'Image Carousel Template',
          template: {
            type: 'image_carousel',
            columns: [
              {
                imageUrl: 'https://scontent.fbkk4-3.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/35546808_2073207556228008_5423733075605454848_o.jpg?_nc_cat=100&efg=eyJpIjoidCJ9&_nc_eui2=AeGPBXyKTf-1PRV2rC6xPdVKu6SlwcbspzP6KDJ-N_FShVnUn_CX9m_J7Mbp5CRsWKxhjWNBQHZiMqUtL6fqrcuM632XGUnXfGKssf6a5U6oISr_FtfQl2gtxUjudILw23U&_nc_ht=scontent.fbkk4-3.fna&oh=b5ae68208e60f714e8edede020bd0aa8&oe=5C9F99ED',
                action: { label: 'Add Line Me.', type: 'uri', uri: 'https://line.me/ti/p/~api_2001' },
              },
              {
                imageUrl: 'https://scontent.fbkk3-1.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/35477082_2073207542894676_1892862855523336192_o.jpg?_nc_cat=101&efg=eyJpIjoidCJ9&_nc_eui2=AeGtBvIQvh86KeWTEZu2GDliEdgvpa7MVhKby7w0NxAS4lfKfdpTAttaH67VHhKdWjG7PV8DRdY4GHu8xbRlwgbOlB8NQUHFORVKQHT2WTPUD1LLuk98_XUAjuvBQljAUr8&_nc_ht=scontent.fbkk3-1.fna&oh=32c57ea7a4a998ebbd5fe18be06495b7&oe=5CA6766E',
                action: { label: '[Text]', type: 'postback', data: '~' },
              },
              {
                imageUrl: 'https://scontent.fbkk4-3.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/35728711_2073207569561340_6492145412126801920_o.jpg?_nc_cat=100&efg=eyJpIjoidCJ9&_nc_eui2=AeFUcL_RmfvSCOSh7iCAdI9yy63ikTYc6jh_2KUg06jffSTBoODS1Msg1FKL77uNn1y8vOWIRxo4Aj1syayC_bZFdhJbdr0naDEwnEhtG4SaROUv-lP-qZMKfbkarCoC4f0&_nc_ht=scontent.fbkk4-3.fna&oh=783ab9bcc24293dfa2a103f9fb038bcf&oe=5C732DD2',
                action: { label: '[Text]', type: 'message', text: '~' },
              },
              {
                imageUrl: 'https://scontent.fbkk3-3.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/35474062_2073209112894519_955532663177871360_o.jpg?_nc_cat=105&efg=eyJpIjoidCJ9&_nc_eui2=AeEuZXuxz7lRTXCWZ_7qNLq2YmqlxZprOF2His6rGhJVLRQdrBQZgHQajwW85IviCmDvG40JaL79p1ucydS1AxXIqfqlPDzRfOZL5wCRgRig6KOKEpFxAMPpTqefIkEwex0&_nc_ht=scontent.fbkk3-3.fna&oh=a663ca1f17b3d06986eca8e05de1d490&oe=5C67EB3D',
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
          altText: 'Datetime pickers Template',
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
          altText: 'Imagemap Template',
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