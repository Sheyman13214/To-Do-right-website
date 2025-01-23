require("dotenv").config()
const express = require("express")
const path = require("path")
const cors = require("cors")
const mongoose = require("mongoose")
const { body, validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const logger = require("./logger")
const Task = require("./models/Task")
const User = require("./models/User")
const auth = require("./middleware/auth")

const app = express()
const port = process.env.PORT || 3003

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info("Connected to MongoDB"))
  .catch((error) => logger.error("MongoDB connection error:", error))

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, "build")))

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack)
  res.status(500).send("Something broke!")
})

// User routes
app.post(
  "/api/users",
  [body("name").notEmpty().trim(), body("phone").notEmpty().trim(), body("password").isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const user = new User(req.body)
      await user.save()
      const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
      res.status(201).send({ user, token })
    } catch (error) {
      logger.error("User creation error:", error)
      res.status(400).send(error)
    }
  },
)

app.post("/api/users/login", async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.body.phone })
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(400).send({ error: "Invalid login credentials" })
    }
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    res.send({ user, token })
  } catch (error) {
    logger.error("Login error:", error)
    res.status(400).send(error)
  }
})

// Task routes
app.get("/api/tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id })
    res.send(tasks)
  } catch (error) {
    logger.error("Error fetching tasks:", error)
    res.status(500).send(error)
  }
})

app.post(
  "/api/tasks",
  [auth, body("title").notEmpty().trim(), body("items").isArray(), body("description").trim()],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const task = new Task({
        ...req.body,
        user: req.user._id,
      })
      await task.save()
      res.status(201).send(task)
    } catch (error) {
      logger.error("Error creating task:", error)
      res.status(400).send(error)
    }
  },
)

app.patch(
  "/api/tasks/:id",
  [
    auth,
    body("title").optional().notEmpty().trim(),
    body("items").optional().isArray(),
    body("description").optional().trim(),
  ],
  async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["title", "items", "description"]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates!" })
    }

    try {
      const task = await Task.findOne({ _id: req.params.id, user: req.user._id })

      if (!task) {
        return res.status(404).send()
      }

      updates.forEach((update) => (task[update] = req.body[update]))
      await task.save()
      res.send(task)
    } catch (error) {
      logger.error("Error updating task:", error)
      res.status(400).send(error)
    }
  },
)

app.delete("/api/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id })

    if (!task) {
      return res.status(404).send()
    }

    res.send(task)
  } catch (error) {
    logger.error("Error deleting task:", error)
    res.status(500).send(error)
  }
})

// Handle React routing, return all requests to React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"))
})

app.listen(port, "0.0.0.0", () => {
  logger.info(`Server is running on http://localhost:${port}`)
  logger.info(`You can also try http://127.0.0.1:${port}`)
})
