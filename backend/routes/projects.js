const express = require('express')

const router = express.Router()
const projectController = require('../controllers/projectController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/',  projectController.create)
router.get('/', projectController.list)
router.get('/:id', projectController.get)
router.get('/:id/board', projectController.board)
router.put('/:id', projectController.update)
router.delete('/:id', authMiddleware, projectController.remove)

module.exports = router
