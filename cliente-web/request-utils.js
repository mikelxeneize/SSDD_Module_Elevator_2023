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
        if (res.status != 204) {
          return res.json();
        }
        else{ //body vacio
          return null;
        }
      } else { //response != 20X
        console.log('Error', res.status);
        reject('Error ' + res.status);
      }
    })
    .catch((error) => { //error en el fetch
      console.error('Fetch error:', error);
      reject(error);
    });
}
