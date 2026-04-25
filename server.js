const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "nst_secret_key_123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60
    }
  })
);

// Serve your HTML/CSS/JS/assets
app.use(express.static(__dirname));

// Demo users
const users = [
  {
    id: 1,
    username: "rishabh",
    passwordHash: bcrypt.hashSync("123456", 10),
    role: "student"
  },
  {
    id: 2,
    username: "admin",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "staff"
  }
];

// Login API
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = users.find(
      (u) => u.username.toLowerCase() === String(username).toLowerCase()
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    res.json({
      success: true,
      message: "Login successful",
      user: req.session.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Current logged in user
app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      loggedIn: false
    });
  }

  res.json({
    loggedIn: true,
    user: req.session.user
  });
});

// Logout API
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({
      success: true,
      message: "Logged out successfully"
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
