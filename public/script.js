const input = document.querySelector("#txt");
const output = document.querySelector("#output");
const key = location.hash;

const stream = new ReadableStream({
    start(controller) {
        input.addEventListener('input', (event) => {
            event.preventDefault();
            console.log(event);
            controller.enqueue(input.value);
            input.value = '';
        });
    }
}).pipeThrough(new TextEncoderStream());

//https://developer.chrome.com/docs/capabilities/web-apis/fetch-streaming-requests

// TypeError: Failed to execute 'fetch' on 'Window': The `duplex` member must be specified for a request with a streaming body
// TypeError: Failed to execute 'fetch' on 'Window': Request with a streaming body cannot have mode set to 'no-cors'
// https://developer.mozilla.org/en-US/docs/Web/API/RequestInit
fetch(`/send?key=${key}`, {
    method: 'POST',
    headers: {'Content-Type': 'text/plain'},
    body: stream,
    allowHTTP1ForStreamingUpload: false,
    duplex: 'half'
})
    .then(r => console.log(r))
    .catch(e => console.error(e));



fetch(`/infscrolldata?key=${key}`).then(async res => {
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    while (true) {
        const {done, value} = await reader.read();
        if (done) return;
        output.append(value);
    }
});

// async function get() {
//     const response = await fetch(`/receive?key=${key}`);
//     const reader = response.body.getReader();
//
//     while (true) {
//         const {value, done} = await reader.read();
//         if (done) break;
//         console.log('Received', value);
//     }
//
//     console.log('Response fully received');
// }
//
// get()

