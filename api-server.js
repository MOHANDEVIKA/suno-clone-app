// Combined Express API with OpenAI + Hugging Face + Cloudinary
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cloudinary = require('cloudinary').v2;
const tmp = require('tmp');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.post('/api/generate-lyrics', async (req, res) => {
  const { theme } = req.body;
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: `Write a short original Telugu song based on the theme: "${theme}". Include chorus and 2 verses.`
      }],
      temperature: 0.8,
    });

    const lyrics = completion.data.choices[0].message.content.trim();
    res.json({ lyrics });
  } catch (err) {
    console.error('Lyrics generation error:', err);
    res.status(500).json({ error: 'Failed to generate lyrics.' });
  }
});

app.post('/api/generate-music', async (req, res) => {
  const { lyrics } = req.body;
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/facebook/musicgen-small', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: lyrics })
    });

    if (!response.ok) throw new Error('Music generation failed');

    const buffer = await response.buffer();
    const tempFile = tmp.fileSync({ postfix: '.mp3' });
    fs.writeFileSync(tempFile.name, buffer);

    const uploadResult = await cloudinary.uploader.upload(tempFile.name, {
      resource_type: 'video',
      folder: 'suno-clone',
      use_filename: true,
      unique_filename: false,
      overwrite: true
    });

    tempFile.removeCallback();
    res.json({ audioUrl: uploadResult.secure_url });
  } catch (err) {
    console.error('Music generation error:', err);
    res.status(500).json({ error: 'Failed to generate music.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
