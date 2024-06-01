const express = require('express');
const http2Express = require('http2-express-bridge')
const http2 = require('http2');
const { readFileSync } = require('fs')

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

app.use(express.static('public'));

//C:\Users\AlexeyKuzmin\react\sample-streaming-requests-with-fetch-api

const options = {
  key: readFileSync('./cert/cert.key'),
  cert: readFileSync('./cert/cert.crt'),
  allowHTTP1: true
}
const server = http2.createSecureServer(options, app)

const listener = server.listen(process.env.PORT || 3000, function() {
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
