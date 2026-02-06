# Telegram Query Interface - n8n Integration

A web interface for Telegram mini apps that allows users to select data fields and integrates with n8n workflows.

## Features

- Email input validation
- Field selection (max 7 fields from 12 options)
- RESTful API for data storage and retrieval
- Mobile-friendly design
- Ready for Vercel deployment

## Available Fields

1. Registration Time
2. Event Time
3. ID
4. Transaction Type (deposit, withdraw, transfer, all)
5. Transaction Method (wire_transfer, crypto, mobile_money, bank_transfer, card, all)
6. Status (approved, declined, pending, timeout, all)
7. FTD
8. Email
9. KYC Status
10. Country
11. Telephone
12. Balance

## API Endpoints

### POST /api/query
Save a new query with email and selected fields.

**Request:**
```json
{
  "email": "user@example.com",
  "field1": "registrationtime",
  "field2": "balance",
  "field3": "country"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Query saved successfully",
  "data": {
    "email": "user@example.com",
    "field1": "registrationtime",
    "field2": "balance",
    "field3": "country",
    "timestamp": "2024-02-06T10:30:00.000Z"
  }
}
```

### GET /api/query
Retrieve the most recent saved query.

**Response:**
```json
{
  "email": "user@example.com",
  "field1": "registrationtime",
  "field2": "balance",
  "field3": "country",
  "timestamp": "2024-02-06T10:30:00.000Z"
}
```

## Deployment to Vercel

### Option 1: Simple In-Memory Storage (Development/Testing)
Uses the basic `api/query.js` endpoint. Data resets on serverless function cold starts.

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Option 2: Persistent Storage with Vercel KV (Production)
Uses `api/query-persistent.js` for permanent data storage.

1. Set up Vercel KV in your project:
   - Go to your Vercel dashboard
   - Select your project
   - Go to Storage tab
   - Create a new KV Database

2. Update the API endpoint in `index.html`:
   - Change `/api/query` to `/api/query-persistent`

3. Deploy:
```bash
vercel
```

## n8n Integration

### Setup in n8n

1. **HTTP Request Node (GET)**
   - Method: GET
   - URL: `https://your-vercel-app.vercel.app/api/query`
   - This retrieves the latest query data

2. **Parse JSON**
   - The response includes email and field1-field7

3. **Build SQL Query**
   - Use the fields to construct your SELECT statement:
   ```sql
   SELECT {{ $json.field1 }}, {{ $json.field2 }}, {{ $json.field3 }}
   FROM users
   WHERE email = '{{ $json.email }}'
   ```

4. **Example n8n Workflow**
   ```
   Webhook/Schedule → HTTP Request (GET /api/query) → MySQL/PostgreSQL Query → Response
   ```

### Example SQL Query Builder in n8n

```javascript
// In a Function node
const fields = [];
for (let i = 1; i <= 7; i++) {
  const field = $json[`field${i}`];
  if (field) {
    fields.push(field);
  }
}

const sql = `SELECT ${fields.join(', ')} FROM users WHERE email = '${$json.email}'`;

return { sql };
```

## File Structure

```
.
├── index.html              # Main web interface
├── api/
│   ├── query.js           # Simple in-memory API endpoint
│   └── query-persistent.js # Persistent storage with Vercel KV
├── vercel.json            # Vercel configuration
├── package.json           # Dependencies
└── README.md              # This file
```

## Local Development

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Run locally:
```bash
vercel dev
```

3. Access at `http://localhost:3000`

## Telegram Mini App Integration

Add this to your Telegram Bot:

```javascript
const webApp = window.Telegram.WebApp;

// Open the web app
webApp.ready();
webApp.expand();

// Optional: Send data back to Telegram
webApp.sendData(JSON.stringify(queryData));
```

## API Testing with cURL

**POST request:**
```bash
curl -X POST https://your-app.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "field1": "balance",
    "field2": "country"
  }'
```

**GET request:**
```bash
curl https://your-app.vercel.app/api/query
```

## Environment Variables (for Vercel KV)

If using persistent storage, Vercel KV will automatically set these:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

No manual configuration needed!

## Support

For issues or questions, check the Vercel and n8n documentation:
- [Vercel Docs](https://vercel.com/docs)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv)
- [n8n Docs](https://docs.n8n.io)
