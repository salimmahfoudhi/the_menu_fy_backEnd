const participantSchema = new mongoose.Schema({
   type: { type: String, enum: ['user', 'Restaurant'] },
    refId: { type: mongoose.Schema.Types.ObjectId, refPath: 'type' }});
const Participant = mongoose.model('Participant', conversationSchema);
