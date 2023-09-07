const express = require('express');
const router = express.Router();
const passport = require('../middleware/passport');
const {
  createArticle, deleteArticle, updateArticle
} = require('../modules/articles-dao');
const { ensureAuthenticated } = require('../middleware/auth-middleware');

router.post('/publish', ensureAuthenticated, async (req, res) => {
  try {
    const articleData = req.body;
    articleData.author = req.user.id;
    const articleId = await createArticle(articleData);

    res.json({ articleId });
  } catch (error) {
    console.error('/article/publish:', error);
    res.locals.baseUrl = `${req.protocol}://${req.get('host')}`;
    res.locals.message =
      'There was an error publishing the article. Please try again later.';
    res.status(500).render('500');
  }
});

router.put('/update', ensureAuthenticated, async (req, res) => {
  try {
    const articleData = req.body;
    articleData.author = req.user.id;
    const articleId = await updateArticle(articleData);

    res.json({ articleId });
  } catch (error) {
    console.error('/article/publish:', error);
    res.locals.baseUrl = `${req.protocol}://${req.get('host')}`;
    res.locals.message =
      'There was an error publishing the article. Please try again later.';
    res.status(500).render('500');
  }
});

router.delete('/delete', ensureAuthenticated, async (req, res) => {
  try {
    const isDeleted = await deleteArticle(req.body.articleId)
    res.json({isDeleted})
  } catch (error) {
    console.error('/article/delete', error)
  }
})


module.exports = router;
