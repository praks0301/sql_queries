// api/query.js - Vercel Serverless Function

let queryData = null; // In-memory storage (resets on cold start)

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle POST - Store the query data
  if (req.method === 'POST') {
    try {
      console.log('Received body:', req.body); // Debug log
      
      const { email, ...fields } = req.body;

      if (!email) {
        return res.status(400).json({ 
          error: 'Email is required' 
        });
      }

      // Store the data
      queryData = {
        email,
        ...fields,
        timestamp: new Date().toISOString()
      };

      console.log('Stored data:', queryData); // Debug log

      return res.status(200).json({
        success: true,
        message: 'Query saved successfully',
        data: queryData
      });

    } catch (error) {
      console.error('Error in POST:', error); // Debug log
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  // Handle GET - Retrieve the stored query data
  if (req.method === 'GET') {
    if (!queryData) {
      return res.status(404).json({
        error: 'No query data found',
        message: 'Please submit a query first'
      });
    }

    return res.status(200).json(queryData);
  }

  // Method not allowed
  return res.status(405).json({ 
    error: 'Method not allowed' 
  });
}
