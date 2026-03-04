const express = require('express');
const router = express.Router();
const {
    getMyList,
    getListTypes,
    addToList,
    updateListItem,
    removeFromList
} = require('../controllers/listController');
const { authMiddleware } = require('../middleware/authMiddleware');

// GET list types - Lista típusok (nyilvános)
router.get('/types', getListTypes);

// GET my list - Saját listám (védett)
router.get('/my', authMiddleware, getMyList);

// POST add to list - Hozzáadás a listához (védett)
router.post('/', authMiddleware, addToList);

// PUT update list item - Lista elem módosítása (védett)
router.put('/:id', authMiddleware, updateListItem);

// DELETE remove from list - Eltávolítás a listából (védett)
router.delete('/:id', authMiddleware, removeFromList);

module.exports = router;
