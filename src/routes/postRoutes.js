const router = require('express').Router();
const { createPost, listPosts } = require('../controllers/postController');


router.post('/createPost', createPost);
router.get('/', listPosts);       // View scheduled posts

module.exports = router;
