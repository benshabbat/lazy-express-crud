# my-project

Express CRUD API with In-Memory Storage

## Installation

```bash
npm install
```

### Note

This project uses in-memory storage for demonstration purposes.
Data will be lost when the server restarts.
For production, consider using a real database like MongoDB or MySQL.

## Usage

### Development mode with auto-reload:
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

## API Endpoints

### Get all items
```
GET http://localhost:3000/api/items
```

### Get item by ID
```
GET http://localhost:3000/api/items/:id
```

### Create new item
```
POST http://localhost:3000/api/items
Content-Type: application/json

{
    "name": "New Item",
    "description": "Item description",
    "price": 150
}
```

### Update item
```
PUT http://localhost:3000/api/items/:id
Content-Type: application/json

{
    "name": "Updated Item",
    "description": "Updated description",
    "price": 200
}
```

### Delete item
```
DELETE http://localhost:3000/api/items/:id
```

## Project Structure

```
my-project/
├── src/
│   ├── controllers/
│   │   └── itemController.js
│   ├── models/
│   │   └── Item.js
│   ├── routes/
│   │   └── itemRoutes.js
│   ├── middlewares/
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Technologies

- Express.js - Web framework
- In-Memory Storage (for demo)
- helmet - Security headers
- express-rate-limit - Rate limiting protection
- CORS - Cross-origin resource sharing
- dotenv - Environment variables

## Security Features

This API includes several security measures:

- **Helmet**: Security headers (XSS, clickjacking, etc.)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Type and length validation on all inputs
- **MongoDB ObjectId Validation**: Prevents NoSQL injection (when using MongoDB)
- **SQL Parameterized Queries**: Prevents SQL injection (when using MySQL)
- **Payload Size Limit**: 10MB max to prevent DoS
- **Error Message Sanitization**: No sensitive data exposed in production

### Production Security Checklist

Before deploying to production:

- [ ] Configure CORS with specific origins
- [ ] Use strong passwords in production databases
- [ ] Set NODE_ENV=production
- [ ] Use HTTPS/TLS
- [ ] Keep dependencies updated
- [ ] Use a process manager (PM2)
- [ ] Set up proper logging
- [ ] Configure firewall rules
- [ ] Use secrets management (not .env in production)
- [ ] Enable database authentication

## License

ISC
