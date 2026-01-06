# my-project2

Express CRUD API with MySQL

## Installation

```bash
npm install
```

### Database Setup (MySQL)

1. Install MySQL on your machine
2. Create a database:
```sql
CREATE DATABASE my-project2;
```

3. Update the database credentials in `.env` file

4. Run the table initialization (the table will be created automatically on first run, or you can create it manually):
```sql
USE my-project2;

CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

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
my-project2/
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
- MySQL - Database
- CORS - Cross-origin resource sharing
- dotenv - Environment variables

## License

ISC
