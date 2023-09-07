const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth-middleware');
const userDao = require('../modules/user-dao');
const subscriberDao = require('../modules/subscribers-dao')
const userBrowsingDao = require('../modules/userBrowsing-dao');
const analyticsDao = require('../modules/analytics-dao');
const viewArticlesDao = require('../modules/viewAricles-dao');
const articleDao = require('../modules/article-dao')

router.get("/", (req, res) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user ? req.user : {}
  res.render("home");
});

router.get('/userBrowsing', ensureAuthenticated, async function (req, res) {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user;

  //curruent url
  const currentUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  const queryIndex = currentUrl.indexOf('=');
  const queryPart = queryIndex !== -1 ? currentUrl.slice(queryIndex + 1) : '';

  let sortedUserArticles = [];


  const sortBy = req.query.sortOption;
  if (sortBy === 'date') {
    sortedUserArticles = await userBrowsingDao.getUserArticlesByDate(req.user);
  } else if (sortBy === 'title') {
    sortedUserArticles = await userBrowsingDao.getUserArticlesByTitle(req.user);
  } else {
    sortedUserArticles = await userBrowsingDao.getUserArticles(req.user);
  }

  const numOfArticles = sortedUserArticles.length;
  res.locals.userArticles = sortedUserArticles;

  res.locals.numOfArticles = numOfArticles;


  res.locals.queryPart = queryPart;
  res.locals.title = 'User Browsing';
  res.render('userBrowsing');
});

router.get('/about', async function (req, res) {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user ? req.user : {}
  res.locals.title = 'About';
  res.render('about');
});

router.get("/contact", (req, res) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user ? req.user : {}
  res.locals.title = "Contact";
  res.render("contact");
});

router.get("/signin", (req, res) => {

  if (req.query.error) {
    res.locals.error = req.query.error
  }
  res.locals.title = "Sign In";
  res.render("signin");
});

router.get('/analytics', ensureAuthenticated, async function (req, res) {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user;
  res.locals.title = 'User Analytics';

  const userSubscribers = await analyticsDao.getNumOfSubscribers(req.user);
  const userCommentsArray = await analyticsDao.getTotalNumOfComments(req.user);
  const userTotalNumOfLikes = await analyticsDao.getTotalNumOfLikes(req.user);
  const userTop3Articles = await analyticsDao.getUserTop3Articles(req.user);


  let userTotalNumOfComments = 0;
  for (let i = 0; i < userCommentsArray.length; i++) {
    userTotalNumOfComments += userCommentsArray[i].comment_count;
  }

  res.locals.userSubscribers = userSubscribers;
  res.locals.userTotalNumOfComments = userTotalNumOfComments;
  res.locals.userTotalNumOfLikes = userTotalNumOfLikes;
  res.locals.userTop3Articles = userTop3Articles;

  res.render('userAnalytics');
});

//send json to client side for chart
router.get('/analytics/chartData', ensureAuthenticated, async function (req, res) {
  const chartData = await analyticsDao.getCommentDateByAuthor(req.user);

  res.json(chartData);
});

router.get('/manageAccount', ensureAuthenticated, async function (req, res) {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user;
  res.locals.title = 'Manage My Account';
  res.render('manageAccount');

});

router.get("/signup", (req, res) => {
  res.locals.title = "Sign Up";
  res.render("signup");
});

router.get('/signupsuccess', (req, res) => {

  res.locals.title = "Sign Up Success"
  res.render('signupSuccess')
})

router.get("/subscriptions", ensureAuthenticated, async (req, res) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user
  try {
    // Fetch the subscription list of the user
    const subscriptionList = await articleDao.getSubscribedAuthors(req.user.id);
    // Fetch the count of comments and likes for each ahthor
    for (let i = 0; i < subscriptionList.length; i++) {
      const countComments = await articleDao.countAuthorComments(subscriptionList[i].author_id);
      const countLikes = await articleDao.countAuthorLikes(subscriptionList[i].author_id);
      subscriptionList[i].countComments = countComments;
      subscriptionList[i].countLikes = countLikes;
    }
    res.render('subscriptionView', { st: subscriptionList });

  } catch (error) {
    // Handle error
    console.error('Error getting subscription list:', error);
    res.status(500).json({ error: 'Failed to get subscription list.' });
  }
});

router.get("/404", (req, res) => {

  res.locals.baseUrl = `${req.protocol}://${req.get('host')}`;
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user ? req.user : {}
  res.locals.title = "Error";
  res.render("404");

});

router.get("/500", (req, res) => {

  res.locals.baseUrl = `${req.protocol}://${req.get('host')}`;
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user ? req.user : {}
  res.locals.title = "Error";
  res.render('500', { message: 'Did someone pull out a cable?' });
});

router.get("/comingsoon", (req, res) => {

  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user ? req.user : {}
  res.locals.title = "Coming Soon";
  res.render("comingsoon");

});

router.get('/manageAccount', ensureAuthenticated, async (req, res) => {

  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user;
  res.locals.title = 'Manage My Account';
  res.render('manageAccount');
});

router.get('/browsearticles', async function (req, res) {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user ? req.user : {}
  res.locals.title = 'View Articles';
  
  const randomArticles = await viewArticlesDao.getRandomArticles();
  const top5Articles = await viewArticlesDao.getTop5Articles();


  //curruent url
  const currentUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  const queryIndex = currentUrl.indexOf('=');
  const queryPart = queryIndex !== -1 ? currentUrl.slice(queryIndex + 1) : '';

  let sortedArticles = [];

  const sortBy = req.query.sortOption;
  if (sortBy === 'date') {
    sortedArticles = await viewArticlesDao.getAllArticlesByDate();
  } else if (sortBy === 'title') {
    sortedArticles = await viewArticlesDao.getAllArticlesByTitle();
  } else if (sortBy === 'author') {
    sortedArticles = await viewArticlesDao.getAllArticlesByauthorUsername();
  } else {
    sortedArticles = await viewArticlesDao.getAllArticles();
  }

  res.locals.allArticles = sortedArticles;
  res.locals.randomArticles = randomArticles;
  res.locals.top5Articles = top5Articles;
  res.locals.queryPart = queryPart;
  res.render('browsearticles');
});

router.get('/signout', ensureAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

router.get("/subscribeView", ensureAuthenticated, async function (req, res) {
  //Todo get user information 
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user;
  const authorId = req.user.id;
  let subscribers = await subscriberDao.getSubscriberByUserId(authorId);
  // Check for each subscriber if he/she also subscribed the current user
  for (let subscriber of subscribers) {
    let mutualSubscription = await subscriberDao.checkMutualSubscription(authorId, subscriber.id);
    subscriber.mutualSubscription = mutualSubscription;
  }
  res.locals.subscribers = subscribers;
  res.render("subscribeView");
});
router.get('/unsubscribe/:subscriberId', ensureAuthenticated, async (req, res) => {
  const userId = req.user.id;
  const subscriberId = req.params.subscriberId;
  try {
    await subscriberDao.removeSubscription(userId, subscriberId);
    res.json({ status: 'success', subscribed: false });
  } catch (error) {
    console.error('Error removing subscription:', error);
    res.status(500).json({ error: 'Failed to remove subscription.' });
  }
});


router.get("/authorPage/:authorId", ensureAuthenticated, async function (req, res) {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user;
  
  let articles = await subscriberDao.getArticleByAuthorId(req.params.authorId);
  articles.map(article => {
    // Hack to display both JSON.stringified html and plain text 
    try {
      article.content = JSON.parse(article.content);
    } catch (ignored) {}
  })
  res.locals.articles = articles
  res.locals.currentAuthor = await subscriberDao.getAuthorInformById(req.params.authorId);
  res.render("authorPage");
});

router.get('/dosubscribe/:subscriberId', ensureAuthenticated, async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const loginId = req.user.id;
  const user = await userDao.getUser(loginId);
  const userId = loginId;
  const subscriberId = req.params.subscriberId;
  try {
    // Check if the subscription already exists
    const existingSubscription01 = await subscriberDao.checkMutualSubscription(subscriberId, userId);
    const existingSubscription02 = await subscriberDao.getSubscription(subscriberId, userId);
    if (existingSubscription01 || existingSubscription02.length > 0) {
      res.json({ status: 'failed', message: 'Subscription already exists' });
      return;
    } else {
      // Add the subscription record to the database
      await subscriberDao.addSubscription(subscriberId, userId);
      res.json({ status: 'success', subscribed: true });
    }
  } catch (error) {
    console.error('Error adding subscription:', error);
    res.status(500).json({ error: 'Failed to add subscription.' });
  }
});

router.get("/createArticle", ensureAuthenticated, async (req, res) => {

  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user;
  res.locals.title = "Write Articles";
  res.render("editArticle");
});

router.get("/editArticle:id", ensureAuthenticated, async (req, res) => {

  const article = await articleDao.getArticleById(req.params.id)
  res.locals.article = article
  // Hack so that we could include basic text content mock data
  try {
    res.locals.content = JSON.parse(article.content);
  } catch (error) {
    res.locals.content = article.content;
  }
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user;
  res.locals.title = "Write Articles";
  res.render("editArticle");
});

router.use('/auth', require('./auth'));

router.use('/api', require('./api'));

router.use('/editAccount', require('./manageAccount-routes'));

router.use('/article', require('./article-routes'));

router.use('/notifications', require('./notifications-routes'));

module.exports = router;