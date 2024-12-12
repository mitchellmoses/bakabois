import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://admin:SING4pinkpink!@cluster0.p4w1u.mongodb.net/fantasy_headlines';

export const handler = async (event) => {
    let client;
    try {
        client = await MongoClient.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
            socketTimeoutMS: 15000
        });
        
        const db = client.db('fantasy_headlines');
        const headlines = await db.collection('headlines')
            .find({}, {
                projection: {
                    'headlines.text': 1,
                    'headlines.generated_at': 1,
                    'date': 1
                }
            })
            .sort({ date: -1 })
            .limit(10)
            .toArray();
            
        // Clean up the headline text by removing quotes
        headlines.forEach(doc => {
            doc.headlines = doc.headlines.map(h => ({
                ...h,
                text: h.text.replace(/["""]/g, '') // Remove all types of quotes
            }));
        });
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(headlines)
        };
    } catch (error) {
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code
        });
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: error.message })
        };
    } finally {
        if (client) await client.close();
    }
}; 