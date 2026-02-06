// api/query-persistent.js - Vercel Serverless Function with Vercel KV Storage
// Note: This requires Vercel KV to be set up in your Vercel project
// For development/testing, use the simple query.js instead

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const STORAGE_KEY = 'latest_query';

  // Handle POST - Store the query data
  if (req.method === 'POST') {
    try {
      const { email, ...fields } = req.body;

      if (!email) {
        return res.status(400).json({ 
          error: 'Email is required' 
        });
      }

      const queryData = {
        email,
        ...fields,
        timestamp: new Date().toISOString()
      };

      // Store in Vercel KV
      await kv.set(STORAGE_KEY, queryData);

      return res.status(200).json({
        success: true,
        message: 'Query saved successfully',
        data: queryData
      });

    } catch (error) {
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  // Handle GET - Retrieve the stored query data
  if (req.method === 'GET') {
    try {
      const queryData = await kv.get(STORAGE_KEY);

      if (!queryData) {
        return res.status(404).json({
          error: 'No query data found',
          message: 'Please submit a query first'
        });
      }

      return res.status(200).json(queryData);

    } catch (error) {
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  // Handle DELETE - Clear the stored data
  if (req.method === 'DELETE') {
    try {
      await kv.del(STORAGE_KEY);
      return res.status(200).json({
        success: true,
        message: 'Query data cleared'
      });
    } catch (error) {
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ 
    error: 'Method not allowed' 
  });
}
