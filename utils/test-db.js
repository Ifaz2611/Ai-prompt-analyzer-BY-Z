import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI not set. Check .env.local');
  process.exit(1);
}

console.log('Testing MongoDB connection...');
console.log('URI prefix:', uri.slice(0, 60) + '...');

try {
  await mongoose.connect(uri, { dbName: 'share_prompt', serverSelectionTimeoutMS: 8000 });
  console.log('✅ MongoDB connected! readyState:', mongoose.connection.readyState);
  console.log('DB name:', mongoose.connection.db.databaseName);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  await mongoose.connection.close();
  console.log('✅ Test passed - database is working');
} catch (e) {
  console.error('❌ MongoDB connection failed:', e.message);
  if (e.code === 'ECONNREFUSED' || e.message.includes('querySrv')) {
    console.error('\nHint:');
    console.error('- Atlas cluster may be paused (check Atlas dashboard)');
    console.error('- Network Access IP whitelist must include your IP or 0.0.0.0/0');
    console.error('- DNS SRV query failed - check firewall/VPN blocks port 53');
    console.error('- Verify MONGODB_URI is correct (see atlas-credentials.env)');
  }
  process.exit(1);
}
