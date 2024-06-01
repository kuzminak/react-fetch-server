const express = require('express');
const http2Express = require('http2-express-bridge')
const http2 = require('http2');
const { readFileSync } = require('fs')
const fs = require('fs');

const txtMap = new Map();

// only change required
const app = http2Express(express)

app.set('query parser', 'simple');


app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache');
  next();
});


app.set('query parser', 'simple');

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache');
  next();
});

app.post('/send', (req, res) => {
  const key = req.query.key;
  res.status(200);
  
  req.on('data', (chunk) => {
    console.log(`Received: ${chunk}`);
    const set = txtMap.get(key);
    if (!set) return;
    for (const res of set) {
      res.write(chunk);
    }
  });
  
  req.on('end', (chunk) => {
    if (res.writableEnded) return;
    res.send('Ended');
  });
});


// app.get('/receive?key=${key}', (req, res) => {
//   // const key = req.query.key;
//   // if (!txtMap.has(key)) {
//   //   txtMap.set(key, new Set());
//   // }
//   // txtMap.get(key).add(res);
//   // res.on('close', () => {
//   //   const set = txtMap.get(key);
//   //   set.delete(res);
//   //   if (set.size === 0) txtMap.delete(key);
//   // });
//   res.status(200);
//   res.set('Content-Type', 'text/plain');
// });

// https://rahulramesha.medium.com/serving-hello-world-with-http2-and-express-js-4dd0ffe76860
// https://www.loginradius.com/blog/engineering/guest-post/http-streaming-with-nodejs-and-fetch-api/
// https://dev.to/bsorrentino/how-to-stream-data-over-http-using-node-and-fetch-api-4ij2

app.get('/receive', async (req, res) => {
  res.set('Content-Type', 'text/plain');
  //res.set('Transfer-Encoding', 'chunked');

  for await (const chunk of generateData()) {
    res.write(chunk);
    console.log(`Sent: ${chunk}`);
  }
  res.end();
});


app.get('/infscrolldata', async (req, res) => {
  res.set('Content-Type', 'application/json');
  res.set('Access-Control-Allow-Origin', '*');
  // read json file
  // var obj;
  // fs.readFile('inf-scroll-data.json', 'utf8', function (err, data) {
  //   if (err) throw err;
  //   obj = JSON.parse(data);
  //
  //   jsonAsStr = JSON.stringify(obj) + "\n";
  //   res.write(jsonAsStr);
  //   console.log(`Sent: ${jsonAsStr}`);
  // });

  const cursor = req.query.cursor ? parseInt(req.query.cursor) : 0;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;

  console.log(`cursor: ${cursor}, limit: ${limit}`);

  res.write('[');
  let cnt = 0;
  for await (let chunk of generateIfnScrollData(cursor, limit)) {
    chunk = (cnt > 0) ? ',' + chunk : chunk;
    cnt++;
    res.write(chunk);
    console.log(`Sent: ${chunk}`);
  }
  res.write(']');
  res.end();
});

app.use(express.static('public'));

//C:\Users\AlexeyKuzmin\react\sample-streaming-requests-with-fetch-api

const options = {
  key: readFileSync('./cert/cert.key'),
  cert: readFileSync('./cert/cert.crt'),
  allowHTTP1: true
}
const server = http2.createSecureServer(options, app)

const listener = server.listen(process.env.PORT || 3001, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

async function* generateData() {
  for (let i = 0; i < 5; i++) {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Yield data chunk

    yield `data chunk ${i}\n`;
  }
}

async function* generateIfnScrollData(cursor, limit) {
  for (let i = cursor; i < limit; i++) {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Yield data chunk
    obj = {
      imageSrc: 'https://s3.amazonaws.com/codecademy-content/programs/react/ravenous/pizza.jpg',
      title: `${i}: FETCH This is test title!`,
      text: 'FETCH This is test text!'
    }

    obj['id'] = i;

    yield JSON.stringify(obj) + "\n";
  }
}

