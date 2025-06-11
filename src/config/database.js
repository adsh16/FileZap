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
let bucket_files, bucket_batch;

async function connectDB() {
    try {
        await client.connect();
        db = client.db("filezap");
        bucket_files = new GridFSBucket(db, { bucketName: 'files' });
        bucket_batch = new GridFSBucket(db, { bucketName: 'batch' });
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

function getBucket(type) {
    if(type == "files"){
        if (!bucket_files) {
            throw new Error('Files bucket not initialized');
        }
        return bucket_files;
    }
    else if(type == "batch"){
        if (!bucket_batch) {
            throw new Error('Batch bucket not initialized');
        }
        // Handle batch operations if needed
        return bucket_batch;
    }
}

module.exports = {
    connectDB,
    getDB,
    getBucket,
    client
};
