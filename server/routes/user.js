
import express from 'express'
import { getStats } from "../controllers/users.js"

const router = express.Router()

router.get('/stats', getStats)


export { router };