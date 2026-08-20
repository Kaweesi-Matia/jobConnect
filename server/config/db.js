import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI);
  }

  cached.conn = await cached.promise;

  console.log('MongoDB connected');

  return cached.conn;
};
