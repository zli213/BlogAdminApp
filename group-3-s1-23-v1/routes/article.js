const express = require("express");
const passport = require('../middleware/passport');
const articleDao = require('../modules/article-dao');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth-middleware');
// Show the aticle to articlePage
router.get('/articlePage', async (req, res) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.user = req.user ? req.user : {};
    const articleId = req.query.id;
    if (!articleId || articleId == 'null'){
        console.error('no articleId for some reason, redirect to error page')
        res.status(404).render('404');
    }
    const article = await articleDao.getArticleById(articleId);
    const countLikes = await articleDao.countLikes(articleId);
    const countComments = await articleDao.countComments(articleId);
    let content = ''
    let isLiked = false;
    let isSubscribed = false;
    let isEditable = false;
    // Check if the user has liked the article
    if (req.user && req.user.id) {
        const likeStatus = await articleDao.checkLike(article.id, req.user.id);
        const subsciptionStatus = await articleDao.getSubscriptionStatus(req.user.id, article.author_id);
        isLiked = !!likeStatus;
        isSubscribed = !!subsciptionStatus;
        isEditable = req.user.id == article.author_id
    }

    // Hack so that we could include basic text content mock data
    try {
        content = JSON.parse(article.content);
      } catch (error) {
        content = article.content;
      }
    // Transfer the articleId and authorId to req.body
    res.locals.articleId = article.id;
    // res.locals.authorId = article.author_id;
    req.session.authorId = article.author_id;
    req.session.articleId = article.id;
    // Fetch three levels of comments for the article
    try {
        // Fetch top-level comments for the article
        const topLevelComments = await articleDao.getFirstLevelComments(article.id);
        // Fetch second-level comments for the article
        for (let i = 0; i < topLevelComments.length; i++) {
            const secondLevelComments = await articleDao.getReplies(article.id, topLevelComments[i].id);
            topLevelComments[i].replies = secondLevelComments;
            // Fetch third-level comments for the second-level comments
            for (let j = 0; j < secondLevelComments.length; j++) {
                const thirdLevelComments = await articleDao.getReplies(article.id, secondLevelComments[j].id);
                secondLevelComments[j].replies = thirdLevelComments;
            }
        }
        // Pass the comments to the view
        res.locals.topLevelComments = topLevelComments;
        res.render('articlePage', { article: article, comments: topLevelComments, content: content, countLikes: countLikes, countComments: countComments, userId: req.user ? req.user.id : "", isLiked: isLiked, isSubscribed: isSubscribed, isEditable: isEditable });
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).json({ error: 'Failed to get comments.' });
    }
}
);
// Add a like to the article
router.post('/likeArticle', ensureAuthenticated, async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const articleId = req.body.articleId;
    try {
        // Add a like record in the database
        await articleDao.addLike(articleId, req.user.id);

        // Get the updated like count
        const countLikes = await articleDao.countLikes(articleId);

        // Send a response, return the updated like total as JSON data to the client
        res.json({ count: countLikes });
    } catch (error) {
        // Handle error
        console.error('Error adding like:', error);
        res.status(500).json({ error: 'Failed to add like.' });
    }

});
// Remove a like from the article
router.delete('/unlikeArticle', ensureAuthenticated, async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const articleId = req.body.articleId;
    try {
        // Remove the like record from the database
        await articleDao.removeLike(articleId, req.user.id);
        const countLikes = await articleDao.countLikes(articleId);
        res.json({ count: countLikes });
    } catch (error) {
        // Handle error
        console.error('Error removing like:', error);
        res.status(500).json({ error: 'Failed to remove like.' });
    }
});
// Subscribe to the author
router.post('/subscribe', ensureAuthenticated, async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const authorId = req.session.authorId;
    try {
        // Add a subscription record in the database
        await articleDao.addSubscription(req.user.id, authorId);
        // Send a response, return the updated like total as JSON data to the client
        res.json({ status: 'success' });
    } catch (error) {
        // Handle error
        console.error('Error adding subscription:', error);
        res.status(500).json({ error: 'Failed to add subscription.' });
    }
});
// Unsubscribe from the author
router.delete('/unsubscribe', ensureAuthenticated, async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const authorId = req.session.authorId;
    try {
        // Remove the subscription record from the database
        await articleDao.removeSubscription(req.user.id, authorId);
        res.json({ status: 'success' });
    } catch (error) {
        // Handle error
        console.error('Error removing subscription:', error);
        res.status(500).json({ error: 'Failed to remove subscription.' });
    }
});
// Unsubscribe an author from the subscription page
router.delete('/unsubscribe/:authorId', ensureAuthenticated, async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    // Get the authorId from the request body
    const authorId = req.params.authorId;
    try {
        // Remove the subscription record from the database
        await articleDao.removeSubscription(req.user.id, authorId);
        res.json({ status: 'success' });
    } catch (error) {
        // Handle error
        console.error('Error removing subscription:', error);
        res.status(500).json({ error: 'Failed to remove subscription.' });
    }
});
// Add a comment to the article
router.post('/addComment', ensureAuthenticated, async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const articleId = req.session.articleId;
    const { content, commenterId, parentComment } = req.body;
    try {
        // Add a comment record in the database
        await articleDao.addComment(articleId, commenterId, content, parentComment);
        res.json({ status: 'success' });
    } catch (error) {
        // Handle error
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment.' });
    }
});
// Delete a comment from the article
router.delete('/deleteComment', ensureAuthenticated, async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const commentId = req.body.commentId;
    try {
        // Remove the comment record from the database
        await articleDao.deleteCommentAndChildren(commentId);
        res.json({ status: 'success' });
    } catch (error) {
        // Handle error
        console.error('Error removing comment:', error);
        res.status(500).json({ error: 'Failed to remove comment.' });
    }
});

module.exports = router;