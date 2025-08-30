import os

structure = {
    "FarmersTradingBackend": {
        "package.json": '{\n  "name": "FarmersTradingBackend",\n  "version": "1.0.0",\n  "main": "src/app.js",\n  "scripts": {\n    "start": "node src/app.js"\n  },\n  "dependencies": {\n    "express": "^4.18.2",\n    "body-parser": "^1.20.1"\n  }\n}\n',
        "README.md": "# Farmers Trading Backend\nThis is the backend for the Farmers Trading App.",
        "src": {
            "app.js": "// Main entry of the app\nconst express = require('express');\nconst bodyParser = require('body-parser');\n\nconst app = express();\napp.use(bodyParser.json());\n\n// Routes would be set up here\n\nconst PORT = process.env.PORT || 5000;\napp.listen(PORT, () => {\n  console.log(`Server listening on port ${PORT}`);\n});\n",
            "config": {
                "db.js": "// Database configuration file\nmodule.exports = {\n  // db configuration settings\n};\n"
            },
            "controllers": {
                "authController.js": "// Authentication controller\nexports.login = (req, res) => { res.send('Login'); };\nexports.register = (req, res) => { res.send('Register'); };",
                "dashboardController.js": "// Dashboard controller\nexports.getDashboard = (req, res) => { res.send('Dashboard'); };",
                "ordersController.js": "// Orders controller\nexports.getOrders = (req, res) => { res.send('Orders list'); };",
                "shelfController.js": "// Shelf controller\nexports.getShelf = (req, res) => { res.send('Shelf items'); };",
                "profileController.js": "// Profile controller\nexports.getProfile = (req, res) => { res.send('Profile details'); };",
                "supportController.js": "// Support controller\nexports.getSupport = (req, res) => { res.send('Support info'); };"
            },
            "models": {
                "User.js": "// User model\nclass User {}\nmodule.exports = User;",
                "Order.js": "// Order model\nclass Order {}\nmodule.exports = Order;",
                "Item.js": "// Item model\nclass Item {}\nmodule.exports = Item;",
                "Notification.js": "// Notification model\nclass Notification {}\nmodule.exports = Notification;",
                "Message.js": "// Message model\nclass Message {}\nmodule.exports = Message;"
            },
            "routes": {
                "authRoutes.js": "// Auth routes\nconst express = require('express');\nconst router = express.Router();\nconst authController = require('../controllers/authController');\n\nrouter.post('/login', authController.login);\nrouter.post('/register', authController.register);\n\nmodule.exports = router;",
                "dashboardRoutes.js": "// Dashboard routes\nconst express = require('express');\nconst router = express.Router();\nconst dashboardController = require('../controllers/dashboardController');\n\nrouter.get('/', dashboardController.getDashboard);\n\nmodule.exports = router;",
                "ordersRoutes.js": "// Orders routes\nconst express = require('express');\nconst router = express.Router();\nconst ordersController = require('../controllers/ordersController');\n\nrouter.get('/', ordersController.getOrders);\n\nmodule.exports = router;",
                "shelfRoutes.js": "// Shelf routes\nconst express = require('express');\nconst router = express.Router();\nconst shelfController = require('../controllers/shelfController');\n\nrouter.get('/', shelfController.getShelf);\n\nmodule.exports = router;",
                "profileRoutes.js": "// Profile routes\nconst express = require('express');\nconst router = express.Router();\nconst profileController = require('../controllers/profileController');\n\nrouter.get('/', profileController.getProfile);\n\nmodule.exports = router;",
                "supportRoutes.js": "// Support routes\nconst express = require('express');\nconst router = express.Router();\nconst supportController = require('../controllers/supportController');\n\nrouter.get('/', supportController.getSupport);\n\nmodule.exports = router;"
            },
            "services": {
                "authService.js": "// Auth service functions",
                "orderService.js": "// Order service functions",
                "shelfService.js": "// Shelf service functions",
                "profileService.js": "// Profile service functions"
            }
        }
    }
}

def create_structure(base_path, structure):
    for name, content in structure.items():
        current_path = os.path.join(base_path, name)
        if isinstance(content, dict):
            os.makedirs(current_path, exist_ok=True)
            create_structure(current_path, content)
        else:
            with open(current_path, "w") as file:
                file.write(content)

if __name__ == "__main__":
    base_dir = os.getcwd()  # Current directory where the script is run
    create_structure(base_dir, structure)
    print("Folder structure and files created successfully.")