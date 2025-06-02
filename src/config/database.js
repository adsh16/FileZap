const { MongoClient, ServerApiVersion, GridFSBucket } = require('mongodb');
require('dotenv').config(); // Load environment variables from .env file

// const uri =`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER}/?authSource=${authSource}&authMechanism=${authMechanism}`;
// const uri =`mongodb+srv://adi:${process.env.MONGODB_PASSWORD}@cluster0.xwovo4e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"`;
const uri = `mongodb+srv://adi:${encodeURIComponent(process.env.MONGODB_PASSWORD)}@cluster0.xwovo4e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db;
let bucket;

async function connectDB() {
    try {
        await client.connect();
        db = client.db("filezap");
        bucket = new GridFSBucket(db, { bucketName: 'uploads' });
        console.log("✅ Connected to MongoDB!");
        
        // Test the connection
        await db.command({ ping: 1 });
        console.log("✅ Database ping successful!");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
}

function getDB() {
    if (!db) {
        throw new Error('Database not connected');
    }
    return db;
}

function getBucket() {
    if (!bucket) {
        throw new Error('GridFS bucket not initialized');
    }
    return bucket;
}

module.exports = {
    connectDB,
    getDB,
    getBucket,
    client
};
