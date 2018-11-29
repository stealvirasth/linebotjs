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
      return replyText(event.replyToken, 'Thanks For add Line Me');

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
    case 'โครงงาน':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'โครงงาน โรงเรียน พุทธโกศัยวิทยา',
          template: {
            type: 'buttons',
            thumbnailImageUrl: 'https://scontent.fcnx1-1.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/46996342_209230016635514_2470389635889496064_n.jpg?_nc_cat=107&efg=eyJpIjoidCJ9&_nc_eui2=AeGAwJglvKUpcTuwm_w8AHckIXW-AV17R3qTwv21ApnTIlk4FeT-yimZJ9xf6NV8pCggxqDFe0nBz5rlU4sbgFjh7xd01BAYJHQTqnuARsjdYA&_nc_ht=scontent.fcnx1-1.fna&oh=f80376dd48840fb459d695a215c136c9&oe=5C76A442',
            title: 'โครงงาน ของ ม.ต้น และ ม.ปลาย',
            text: 'โรงเรียน พุทธโกศัยวิทยา จ.แพร่',
            actions: [
              { label: 'เพจ โรงเรียนพุทธโกศัยวิทยา', type: 'uri', uri: 'https://line.me/ti/p/~api_2001' },
              { label: 'กดเพื่อดู โครงงาน ม.ต้น', type: 'message', text: 'โครงงาน ม.ต้น' },
              { label: 'กดเพื่อดู โครงงาน ม.ปลาย', type: 'message', text: 'โครงงาน ม.ปลาย' },
              { label: 'ผู้เขียน Template', type: 'postback', data: 'สามเณร สุรเดช กอนสัน', text: 'คือผู้ใด' },
            ],
          },
        }
      );
    case '!confirm':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Confirm alt text',
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
          altText: 'Carousel alt text',
          template: {
            type: 'carousel',
            columns: [
              {
                thumbnailImageUrl: buttonsImageURL,
                title: 'โครงงาน ม.ต้น',
                text: 'โรงเรียน พุทธโกศัยวิทยา',
                actions: [
                  { label: 'Go to line.me', type: 'uri', uri: 'https://line.me/ti/p/~api_2001' },
                  { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
                ],
              },
              {
                thumbnailImageUrl: buttonsImageURL,
                title: 'hoge',
                text: 'fuga',
                actions: [
                  { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
                  { label: 'Say message', type: 'message', text: 'Rice=米' },
                ],
              },
            ],
          },
        }
      );
    case 'โครงงาน':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'โครงงาน สามเณร ม.ต้น',
          template: {
            type: 'buttons',
            thumbnailImageUrl: buttonsImageURL,
            title: 'โรงเรียน พุทธโกศัยวิทยา',
            text: 'คำสั่ง กดดูด้านล่าง..!',
            actions: [
              { label: 'Go to line.me', type: 'uri', uri: 'https://line.me/ti/p/~api_2001' },
              { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
              { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
              { label: 'Say message', type: 'message', text: 'Rice=米' },
            ],
          },
        }
      );      
    case 'โครงงาน ม.ต้น':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'โครงงาน ของสามเณร ม.ต้น',
          template: {
            type: 'image_carousel',
            columns: [
              {
                imageUrl: 'https://scontent.fcnx1-1.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/47036311_209229983302184_7128375582156390400_n.jpg?_nc_cat=104&efg=eyJpIjoidCJ9&_nc_eui2=AeGK2xkinsXgLimKDQ-GBq5rSfOKj0pcAEp1BJRjb8f3r5-yepbNN2bCqbeSEdme64xaIj7KYz-OlD-hDpP8saoynkJWY4yZbuPafDulOvzxyw&_nc_ht=scontent.fcnx1-1.fna&oh=d94284744f1561f4ae6a2669132a1f58&oe=5C75C205',
                action: { label: 'กดเพื่อรับชม ข้อมูลต่อไป', type: 'uri', uri: 'https://line.me/ti/p/~api_2001' },
              },
              {
                imageUrl: 'https://scontent.fcnx1-1.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/46972229_209230029968846_5032725927356792832_n.jpg?_nc_cat=104&efg=eyJpIjoidCJ9&_nc_eui2=AeEGzwuqyM506Vfz97FUbUmIKNd8WoKsulkgAY5olMRSOmlkzYYzfVNUy9Vcj2MjQF9FFKKsnVnTiAiBpVzlqgzgT6eAki9rPspYqNTlDWD1iA&_nc_ht=scontent.fcnx1-1.fna&oh=c66047435e0e5a1004c37127bd59a0a6&oe=5C9F6A65',
                action: { label: 'กดเพื่อรับชม ข้อมูลต่อไป', type: 'uri', uri: 'https://line.me/ti/p/~api_2001' },
              },
              {
                imageUrl: 'https://scontent.fcnx1-1.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/46996342_209230016635514_2470389635889496064_n.jpg?_nc_cat=107&efg=eyJpIjoidCJ9&_nc_eui2=AeGAwJglvKUpcTuwm_w8AHckIXW-AV17R3qTwv21ApnTIlk4FeT-yimZJ9xf6NV8pCggxqDFe0nBz5rlU4sbgFjh7xd01BAYJHQTqnuARsjdYA&_nc_ht=scontent.fcnx1-1.fna&oh=f80376dd48840fb459d695a215c136c9&oe=5C76A442',
                action: { label: 'โลโก้ โรงเรียน', type: 'uri', uri: 'https://scontent.fcnx1-1.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/46996342_209230016635514_2470389635889496064_n.jpg?_nc_cat=107&efg=eyJpIjoidCJ9&_nc_eui2=AeGAwJglvKUpcTuwm_w8AHckIXW-AV17R3qTwv21ApnTIlk4FeT-yimZJ9xf6NV8pCggxqDFe0nBz5rlU4sbgFjh7xd01BAYJHQTqnuARsjdYA&_nc_ht=scontent.fcnx1-1.fna&oh=f80376dd48840fb459d695a215c136c9&oe=5C76A442' },
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
    case 'โครงงาน ม.ปลาย':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'โครงงาน ของสามเณร ม.ปลาย',
          template: {
            type: 'image_carousel',
            columns: [
              {
                imageUrl: 'https://scontent.fcnx1-1.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/47035688_209229989968850_1400467304830992384_n.jpg?_nc_cat=106&efg=eyJpIjoidCJ9&_nc_eui2=AeH82fuUqZ9KUiMOzKS2zsntp_WeUfelnn06CB9RPZ_-Ur06Ojt3ws4Fqfe_nXuk0gRKaWQpn_fnT0CGbUfaltrPcq305OkCdQolpYJHQQHRCg&_nc_ht=scontent.fcnx1-1.fna&oh=fcae53b94d3a51c6668b1870ac36447d&oe=5C772B07',
                action: { label: 'กดเพื่อรับชม ข้อมูลต่อไป', type: 'uri', uri: 'https://line.me/ti/p/~api_2001' },
              },
              {
                imageUrl: 'https://scontent.fcnx1-1.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/46998193_209229979968851_4494381717020213248_n.jpg?_nc_cat=108&efg=eyJpIjoidCJ9&_nc_eui2=AeFz40ELZrcC4sc1ig-hI0XFj4KOA6mxElDFjFXOEUEBTKkNGcsOji48v2quBdGX7ly2gwi2NPzeRcH9-mYCcyOvSzN0Rt6vC_A3d13IsRfOtA&_nc_ht=scontent.fcnx1-1.fna&oh=66f02f1705c93e283721cf93cb4e1e3e&oe=5C63C9CD',
                action: { label: 'กดเพื่อรับชม ข้อมูลต่อไป', type: 'uri', uri: 'https://line.me/ti/p/~api_2001' },
              },
              {
                imageUrl: 'https://scontent.fcnx1-1.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/46996342_209230016635514_2470389635889496064_n.jpg?_nc_cat=107&efg=eyJpIjoidCJ9&_nc_eui2=AeGAwJglvKUpcTuwm_w8AHckIXW-AV17R3qTwv21ApnTIlk4FeT-yimZJ9xf6NV8pCggxqDFe0nBz5rlU4sbgFjh7xd01BAYJHQTqnuARsjdYA&_nc_ht=scontent.fcnx1-1.fna&oh=f80376dd48840fb459d695a215c136c9&oe=5C76A442',
                action: { label: 'โลโก้ โรงเรียน', type: 'uri', uri: 'https://scontent.fcnx1-1.fna.fbcdn.net/v/t1.0-9/fr/cp0/e15/q65/46996342_209230016635514_2470389635889496064_n.jpg?_nc_cat=107&efg=eyJpIjoidCJ9&_nc_eui2=AeGAwJglvKUpcTuwm_w8AHckIXW-AV17R3qTwv21ApnTIlk4FeT-yimZJ9xf6NV8pCggxqDFe0nBz5rlU4sbgFjh7xd01BAYJHQTqnuARsjdYA&_nc_ht=scontent.fcnx1-1.fna&oh=f80376dd48840fb459d695a215c136c9&oe=5C76A442' },
                },
              },
            ]
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