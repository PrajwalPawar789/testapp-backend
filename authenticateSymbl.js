const axios = require('axios');

const authenticateWithSymbl = async () => {
  try {
    const response = await axios.post('http://localhost:3000/symbl/authenticate');
    console.log('Authentication successful:', response.data);
  } catch (error) {
    console.error('Error authenticating with Symbl:', error.response.data);
  }
};

// Call the authentication function
authenticateWithSymbl();
