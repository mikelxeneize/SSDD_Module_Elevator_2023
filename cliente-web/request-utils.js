export function sendHttpRequest(ip, port, path, tipo, body) {
  
  const url = `http://${ip}:${port}${path}`;

  const encoder = new TextEncoder();
  const contenidoEnBytes = encoder.encode(body);

  const options = {
    method: tipo,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': contenidoEnBytes.length.toString(),
    },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  console.log('Request:', url, tipo);

  return fetch(url, options)
    .then((res) => {
      if (res.ok) {
        return res.json().then((data) => [res.status, data]);
      } else {
        console.log('Error', res.status);
        return Promise.reject('Error ' + res.status);
      }
    })
    .catch((error) => {
      console.error('Fetch error:', error);
      return Promise.reject(error);
    });
}
