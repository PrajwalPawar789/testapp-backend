const express = require('express');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const qs = require('qs');
const fetch = require('cross-fetch');

const app = express();
const port = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000', // Update with the URL where your React app is running
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
  exposedHeaders: ['Authorization'],
}));

let authToken;
let conversationId = ''; // Initialize conversationId variable

// Set up multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Authentication route
app.get('/authenticate', async (req, res) => {
  try {
    const response = await axios.post('https://api.symbl.ai/oauth2/token:generate', {
      type: 'application',
      appId: '6331503556564766444137434f3964694e6842414c57417942463433784b6450',
      appSecret: '73527441635445677143524c636c76684f3766586a684f6247347a384d545966627951616d7a5579754e6957634f78323638583446705835475a4b5456727133',
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    authToken = response.data.accessToken;
    res.json(response.data);
  } catch (error) {
    console.error('Error authenticating:', error.message);
    res.status(error.response ? error.response.status : 500).send(error.message);
  }
});

// Process audio route
app.post('/process-audio', upload.single('file'), async (req, res) => {
  try {
    const accessToken = authToken; // Use the access token obtained during authentication
    const symblaiParams = {
      name: 'Use cases discovery call',
      conversationType: 'sales',
      features: {
        featureList: ['insights', 'callScore']
      },
      metadata: {
        salesStage: 'Discovery',
        prospectName: 'Wayne Enterprises'
      }
    };

    const fetchResponse = await fetch(`https://api.symbl.ai/v1/process/audio?${qs.stringify(symblaiParams)}`, {
      method: 'POST',
      body: req.file.buffer,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': req.file.mimetype
      }
    });

    const responseBody = await fetchResponse.json();
    conversationId = responseBody.conversationId; // Set conversationId after processing audio
    res.json(responseBody);
  } catch (error) {
    console.error('Error processing audio:', error.message);
    res.status(error.response ? error.response.status : 500).send(error.message);
  }
});

// Get call score status route
app.get('/call-score-status', async (req, res) => {
  try {
    const accessToken = authToken; // Use the access token obtained during authentication
    // Ensure you have the conversationId obtained from the previous response
    if (!conversationId) {
      throw new Error("ConversationId is not initialized.");
    }

    const fetchResponse = await fetch(`https://api.symbl.ai/v1/conversations/${conversationId}/callscore`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const responseBody = await fetchResponse.json();
    res.json(responseBody);
  } catch (error) {
    console.error('Error getting call score status:', error.message);
    res.status(error.response ? error.response.status : 500).send(error.message);
  }
});

// Get call score route
app.get('/get-call-score', async (req, res) => {
  try {
    const accessToken = authToken; // Use the access token obtained during authentication
    // Ensure you have the conversationId obtained from the previous response
    if (!conversationId) {
      throw new Error("ConversationId is not initialized.");
    }

    const fetchResponse = await fetch(`https://api.symbl.ai/v1/conversations/${conversationId}/callscore`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const responseBody = await fetchResponse.json();
    res.json(responseBody);
  } catch (error) {
    console.error('Error getting call score:', error.message);
    res.status(error.response ? error.response.status : 500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
