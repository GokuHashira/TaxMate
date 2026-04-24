const express = require('express');
const router = express.Router();

router.post('/token', async (req, res) => {
  const apiKey = process.env.HEYGEN_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      token: null,
      fallback: true,
      message: 'HeyGen API key not configured — using avatar fallback mode'
    });
  }

  try {
    const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HeyGen token error:', response.status, errorText);
      return res.status(200).json({
        token: null,
        fallback: true,
        message: 'HeyGen token generation failed — using avatar fallback mode'
      });
    }

    const data = await response.json();
    res.json({ token: data.data?.token || data.token });
  } catch (error) {
    console.error('HeyGen token fetch error:', error.message);
    res.status(200).json({
      token: null,
      fallback: true,
      message: 'HeyGen unavailable — using avatar fallback mode'
    });
  }
});

module.exports = router;
