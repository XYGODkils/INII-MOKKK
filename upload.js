exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Metode tidak diizinkan.' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Isi permintaan tidak valid.' }) };
  }

  const { filename, contentType, dataBase64 } = payload;

  if (!dataBase64) {
    return { statusCode: 400, body: JSON.stringify({ error: 'File tidak ditemukan.' }) };
  }

  try {
    const buffer = Buffer.from(dataBase64, 'base64');
    const blob = new Blob([buffer], { type: contentType || 'application/octet-stream' });

    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', blob, filename || 'file');

    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form
    });

    const text = (await response.text()).trim();

    if (response.ok && text.indexOf('http') === 0) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: text })
      };
    }

    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: text || 'Upload ke penyimpanan gagal.' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Terjadi kesalahan di server.' })
    };
  }
};
