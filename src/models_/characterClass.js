import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
});

export default mongoose.models.characterClass || mongoose.model('characterClass', schema);
