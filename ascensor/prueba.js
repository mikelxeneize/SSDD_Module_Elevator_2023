const http = require('http');

function sendDataSync(url, data) {
    const postData = JSON.stringify(data);

    const options = {
        hostname: url,
        port: 3000,
        path: '/data',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };

    const req = http.request(options);

    req.write(postData);
    req.end();

    return new Promise((resolve, reject) => {
        req.on('response', (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                resolve(responseData);
            });
        });

        req.on('error', (error) => {
            reject(error);
        });
    });
}

function getDataSync(url) {
    const options = {
        hostname: url,
        port: 3000,
        path: '/data',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options);

    req.end();

    return new Promise((resolve, reject) => {
        req.on('response', (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                resolve(responseData);
            });
        });

        req.on('error', (error) => {
            reject(error);
        });
    });
}

module.exports = {
    sendDataSync,
    getDataSync
};
