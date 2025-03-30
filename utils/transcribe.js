const { createClient } = require('@deepgram/sdk');
const fs = require('fs');

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

const transcribeAudio = async (filePath, mimetype) => {
  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      fs.createReadStream(filePath),
      {
        model: "nova-2",
      }
    );
     
     
    if (error) {
      throw new Error(`Transcription failed: ${error.message}`);
    }
    console.log(result.results.channels[0].alternatives[0].transcript)
    const transcript =  result.results.channels[0].alternatives[0].transcript;
    return transcript;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
};

module.exports = transcribeAudio;
