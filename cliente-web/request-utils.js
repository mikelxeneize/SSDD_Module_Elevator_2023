export function sendHttpRequest(ip, port, path, tipo, body) {

  const url = `http://${ip}:${port}${path}`;

  const encoder = new TextEncoder();
  const contenidoEnBytes = encoder.encode(body);

  const options = {
    method: tipo,
    /* headers: {
      'Content-Type': 'application/json',
      'Content-Length': contenidoEnBytes.length.toString(),
    }, */
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  console.log('Request:', url, tipo);

  return fetch(url, options)
  .then(async (res) => {
    if (res.ok) {
      const textData = await res.text();
      console.log(textData);
      try {
        const jsonData = JSON.parse(textData);
        return jsonData;
      } catch (error) {
        return null;
      }
    } else {
      console.log('Error', res.status);
      return Promise.reject(`Error ${res.status}`);
    }
  })
  .catch((error) => {
    console.error('Fetch error:', error);
    return Promise.reject(error);
  });

}