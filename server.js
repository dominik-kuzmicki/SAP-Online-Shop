const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(express.json()); // Для правильной работы с req.body

// Конфигурация SAP
const url = 'https://d5h.acbaltica.com/sap/bc/rest';
const username = "user_demo";
const password = "3J%==~B[a]EYinAZ=Aw}C>ppVSUzu\\6@p2[B<=sG";
const authHeader = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

// Получение CSRF токена
async function getCsrfToken() {
  try {
    const response = await axios.get(`${url}/zdemo_orders?userId=182`, {
      headers: {
        'Authorization': authHeader,
        'x-csrf-token': 'Fetch'
      },
      withCredentials: true  // Включаем использование cookies
    });

    // Извлекаем CSRF токен из заголовков
    const csrfToken = response.headers['x-csrf-token'];
    if (!csrfToken) throw new Error('Не удалось получить CSRF токен');
    
    // Извлекаем куки из заголовка Set-Cookie вручную
    const cookies = response.headers['set-cookie'];
    console.log('Извлеченные куки:', cookies);

    return { csrfToken, cookies };
  } catch (error) {
    throw new Error('Ошибка при получении CSRF токена: ' + error.message);
  }
}

// Создание заказа
async function createOrder(order) {
  try {
    const { csrfToken, cookies } = await getCsrfToken();
    console.log('Передача CSRF токена в запрос:', csrfToken); // Логируем передаваемый токен

    // Подготовим куки в правильном формате для заголовка Cookie
    const cookieHeader = cookies.map(cookie => cookie.split(';')[0]).join('; ');
    console.log('Передаем куки в запрос:', cookieHeader);  // Логируем куки, которые будут переданы в запрос

    // Отправляем запрос с CSRF токеном и кук в заголовках
    const response = await axios.post(`${url}/zdemo_orders?userId=182`, order, {
      headers: {
        'Authorization': authHeader,
        'x-csrf-token': csrfToken,
        'Content-Type': 'application/json',
        'Cookie': cookieHeader  // Явно передаем куки вручную
      },
      withCredentials: true
    });

    console.log('Ответ сервера:', response.data); // Логируем ответ от сервера
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании заказа:', error.response?.data || error.message); // Логируем ошибку
    if (error.response) {
      console.log('Подробности ответа сервера:', error.response.data); // Логируем подробности ответа
    }
    throw new Error('Ошибка при создании заказа: ' + error.message);
  }
}

// Получение данных о заказах
async function getOrders() {
  try {
    // Отправляем GET запрос для получения данных
    const response = await axios.get(`${url}/zdemo_orders?userId=182`, {
      headers: {
        'Authorization': authHeader
      },
      withCredentials: true
    });

    console.log('Ответ сервера:', response.data); // Логируем ответ от сервера
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении данных о заказах:', error.response?.data || error.message); // Логируем ошибку
    if (error.response) {
      console.log('Подробности ответа сервера:', error.response.data); // Логируем подробности ответа
    }
    throw new Error('Ошибка при получении данных о заказах: ' + error.message);
  }
}


app.post('/api', async (req, res) => {
  try {
    const result = await createOrder(req.body);
    res.json(result);
  } catch (err) {
    console.error('Ошибка SAP API:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api', async (req, res) => {
  try {
    const result = await getOrders();
    res.json(result);
  } catch (err) {
    console.error('Ошибка при получении заказов:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));