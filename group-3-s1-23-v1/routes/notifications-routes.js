const express = require("express");
const router = express.Router();
const notificationsDao = require("../modules/notifications-dao");
const subscriptionDao = require("../modules/subscriptions-dao");
const { ensureAuthenticated } = require("../middleware/auth-middleware");

router.get("/author/:authorId/subscriptions", ensureAuthenticated, async (req, res) => {
  try {
    const authorId = req.params.authorId;
    const subscriptions = await subscriptionDao.getSubscribersByAuthor(authorId);
    const notifications = await Promise.all(
      subscriptions.map(async (subscription) => {
        const notifications =
          await notificationsDao.getArticleNotificationsBySubscription(
            subscription.id
          );
          const commentNotifications =
          await notificationsDao.getCommentNotificationsBySubscription(
            subscription.id
          );
          return {
            subscription,
            notifications: [...notifications, ...commentNotifications],
          };
      })
    );

    if (notifications) {
      res.json(notifications.flat());
    } else {
      res.locals.baseUrl = `${req.protocol}://${req.get("host")}`;
      res.locals.message = "No notifications found for the author.";
      res.status(404).render("404");
    }
  } catch (error) {
    console.error("/author/:authorId/subscriptions", error);
    res.locals.baseUrl = `${req.protocol}://${req.get("host")}`;
    res.locals.message = "Error getting subscriptions for the author";
    res.status(500).render("500");
  }
});


router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    // Subscriptions for the user
    const subscriptions = await subscriptionDao.getSubscriptionsBySubscriber(
      req.user.id
    );
    // Subscribers for the user
    const subscribers = await subscriptionDao.getSubscribersByAuthor(
      req.user.id
    );
    // Get new article and comment notifications for subscriptions
    const subscriptionNotifications = await Promise.all(
      subscriptions.map(async (subscription) => {
        const notifications =
          await notificationsDao.getArticleNotificationsBySubscription(
            subscription.id
          );
          const commentNotifications =
          await notificationsDao.getCommentNotificationsBySubscription(
            subscription.id
          );
          return {
            subscription,
            notifications: [...notifications, ...commentNotifications],
          };
      })
    );

    // Get notifications for any new subscribers
    const subscriberNotifications = await Promise.all(
      subscribers.map(async (subscription) => {
        const notifications =
          await notificationsDao.getSubscriberNotificationsBySubscription(
            subscription.id
          );
        return {
          subscription,
          notifications,
        };
      })
    );

    const notifications = [
      ...subscriptionNotifications,
      ...subscriberNotifications,
    ];

    if (notifications) {
      res.json(notifications.flat());
    } else {
      res.locals.baseUrl = `${req.protocol}://${req.get("host")}`;
      res.locals.message = "No notifications found for the user.";
      res.status(404).render("404");
    }
  } catch (error) {
    console.error("/notification/user/:id", error);
    res.locals.baseUrl = `${req.protocol}://${req.get("host")}`;
    res.locals.message = "Error getting notifications for the user";
    res.status(500).render("500");
  }
});

router.put("/:id/mark-as-read", ensureAuthenticated, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const result = await notificationsDao.updateNotificationStatus(notificationId, true);
    
    if (result) {
      res.sendStatus(200);
    } else {
      res.locals.baseUrl = `${req.protocol}://${req.get("host")}`;
      res.locals.message = "Notification not found.";
      res.status(404).render("404");
    }
  } catch (error) {
    console.error("/notification/:id/mark-as-read", error);
    res.locals.baseUrl = `${req.protocol}://${req.get("host")}`;
    res.locals.message = "Error updating notification status";
    res.status(500).render("500");
  }
});
module.exports = router;
