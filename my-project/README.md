# my-project

Express CRUD API with MongoDB

## Installation

```bash
npm install
```

### Database Setup (MongoDB)

1. Install MongoDB on your machine
2. Start MongoDB service
3. Update the `MONGODB_URI` in `.env` file if needed

The database will be created automatically when you start the server.

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
- MongoDB with Mongoose - Database
- CORS - Cross-origin resource sharing
- dotenv - Environment variables

## License

ISC
