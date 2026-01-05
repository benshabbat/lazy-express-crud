# lazy-express-crud

[![npm version](https://img.shields.io/npm/v/lazy-express-crud.svg)](https://www.npmjs.com/package/lazy-express-crud)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 🚀 CLI tool to instantly generate a complete Express.js CRUD API with ES6 modules

Quickly scaffold a production-ready Express.js REST API with full CRUD operations, organized project structure, and best practices built-in.

## Features

✨ **Complete CRUD API** - All Create, Read, Update, Delete operations out of the box  
📁 **Organized Structure** - Clean separation of routes, controllers, and models  
🎯 **ES6 Modules** - Modern JavaScript with import/export syntax  
🔒 **Security Built-in** - Input validation and error handling  
⚡ **Zero Config** - Start coding immediately  
➕ **Extensible** - Easily add more resources with `add-crud-resource`  
🌐 **CORS Enabled** - Ready for frontend integration  
📦 **Lightweight** - Minimal dependencies

## Quick Start

### Create a new project

```bash
# Using npx (recommended - no installation needed)
npx lazy-express-crud my-api

# Or install globally
npm install -g lazy-express-crud
lazy-crud my-api
```

### Start your server

```bash
cd my-api
npm install
npm run dev
```

Your API is now running at `http://localhost:3000`! 🎉

## Adding More Resources

After creating your project, easily add more CRUD resources:

```bash
cd my-api

# Add resources (must start with uppercase)
add-crud User
add-crud Product
add-crud Category
```

This automatically creates:
- ✅ Model: `src/models/User.js`
- ✅ Controller: `src/controllers/userController.js`
- ✅ Routes: `src/routes/userRoutes.js`

Then simply add the route to your `server.js`:

```javascript
import userRoutes from './routes/userRoutes.js';
app.use('/api/users', userRoutes);
```

## Project Structure

```
my-api/
├── src/
│   ├── controllers/      # Business logic
│   │   └── itemController.js
│   ├── models/          # Data models
│   │   └── Item.js
│   ├── routes/          # API routes
│   │   └── itemRoutes.js
│   ├── middlewares/     # Custom middleware
│   └── server.js        # App entry point
├── .env                 # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Default API Endpoints

The generated project includes a complete Item resource:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items |
| GET | `/api/items/:id` | Get item by ID |
| POST | `/api/items` | Create new item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

### Example Request

```bash
# Get all items
curl http://localhost:3000/api/items

# Create new item
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"My Item","description":"Item description","price":99}'
```

## Configuration

The generated project uses environment variables. Edit `.env`:

```env
PORT=3000
NODE_ENV=development
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload (nodemon)

## Security Features

✅ Project name validation (prevents path traversal and injection)  
✅ Length limits to prevent DoS attacks  
✅ Reserved name checking (node_modules, .git, etc.)  
✅ Resource name validation (prevents reserved JavaScript keywords)  
✅ Hidden file prevention (no dot prefix)  
✅ Character whitelist validation  
✅ Error handling middleware  
✅ Input validation in all controllers  
✅ Automatic server.js updates with safety checks

## Database Integration

The generated project uses **in-memory storage** for quick prototyping. For production, replace the model implementation with your database of choice:

- 🍃 **MongoDB** with Mongoose
- 🐘 **PostgreSQL** with Sequelize or Prisma
- 🐬 **MySQL** with Sequelize
- 🔥 **Firebase** Firestore

## Requirements

- Node.js >= 14.0.0
- npm or yarn

## Commands Reference

### lazy-crud [project-name]

Creates a new Express CRUD API project

**Options:**
- `project-name` - Name of your project (optional, defaults to "express-crud-app")

**Example:**
```bash
lazy-crud my-awesome-api
```

### add-crud [ResourceName]

Adds a new CRUD resource to an existing project (must be run from project root)

**Options:**
- `ResourceName` - Name of the resource, must start with uppercase (e.g., User, Product)

**Example:**
```bash
add-crud User
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © 2026

## Support

- 🐛 [Report a bug](https://github.com/benshabbat/lazy-express-crud/issues)
- 💡 [Request a feature](https://github.com/benshabbat/lazy-express-crud/issues)
- ⭐ Star this project on [GitHub](https://github.com/benshabbat/lazy-express-crud)

## Keywords

express, crud, api, generator, cli, scaffold, boilerplate, rest-api, es6-modules, nodejs, backend

---

Made with ❤️ for the Node.js community
