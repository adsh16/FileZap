const { MongoClient, ServerApiVersion, GridFSBucket } = require('mongodb');
require('dotenv').config(); // Load environment variables from .env file


// Use the correct username and encode the password
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${encodeURIComponent(process.env.MONGODB_PASSWORD)}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority&appName=${process.env.MONGODB_APP_NAME}`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db;
let uploads_bucket;

async function connectDB() {
    try {
        await client.connect();
        db = client.db("filezap");
        uploads_bucket = new GridFSBucket(db, { bucketName: 'uploads' });
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
    if (!uploads_bucket) {
        throw new Error('Uploads bucket not initialized');
    }
    return uploads_bucket;
}

module.exports = {
    connectDB,
    getDB,
    getBucket,
    client
};
