const SQL = require('sql-template-strings');
const dbPromise = require('./database.js');
const subscriptionsDao = require('./subscriptions-dao');

async function getNotification(id) {
  try {
    const db = await dbPromise;
    const notification = await db.get(
      SQL`SELECT * FROM notifications WHERE id = ${id}`
    );
    return notification;
  } catch (error) {
    console.error('getNotification', error);
  }
}

// Fetches all 'new_comment' notifications for a given subscriptionId
async function getCommentNotificationsBySubscription(subscriptionId) {
  try {
    const db = await dbPromise;
    return await db.all(
      SQL`SELECT * FROM notifications WHERE subscription = ${subscriptionId} AND notification_type = 'new_comment' AND read_status = false`
    );
  } catch (error) {
    console.error('getCommentNotificationsBySubscription', error);
  }
}

async function createArticleNotification(notification) {
  try {
    const db = await dbPromise;
    const result = await db.run(SQL`
      INSERT INTO notifications (read_status, notification_type, date, article_id, subscription)
      VALUES (${notification.read_status}, ${notification.notification_type}, CURRENT_TIMESTAMP, ${notification.article_id}, ${notification.subscription})
    `);

    return result.lastID;
  } catch (error) {
    console.error('createArticleNotification', error);
  }
}

async function createSubscriptionNotification(notification) {
  try {
    const db = await dbPromise;
    const result = await db.run(SQL`
      INSERT INTO notifications (read_status, notification_type, date, subscription)
      VALUES (${notification.read_status}, ${notification.notification_type}, CURRENT_TIMESTAMP, ${notification.subscription})
    `);

    return result.lastID;
  } catch (error) {
    console.error('createSubscriptionNotification', error);
  }
}

async function getArticleNotificationsBySubscription(subscriptionId) {
  try {
    const db = await dbPromise;
    const notifications = await db.all(SQL`
        SELECT * FROM notifications 
        WHERE subscription = ${subscriptionId} 
        AND notification_type = 'new_article'
        AND read_status = false
    `);
    return notifications;
  } catch (error) {
    console.error('getArticleNotificationsBySubscription', error);
  }
}

async function createCommentNotification(
  commenterId,
  authorId,
  commentId,
  articleId
) {
  try {
    const db = await dbPromise;
    // Check if the commenterId is the same as the authorId and return if not
    if (commenterId != authorId) {
      return;
    }

    const subscribers = await subscriptionsDao.getSubscribersByAuthor(authorId);
    const result = [];

    subscribers.forEach(async (subscriber) => {
      // Insert a new notification into the notifications table for each subscriber
      const newNotification = await db.run(SQL`
          INSERT INTO notifications (read_status, notification_type, date, subscription, comment_id, article_id)
          VALUES (0, 'new_comment', CURRENT_TIMESTAMP, ${subscriber.id}, ${commentId}, ${articleId})
      `);
    });
    return result;
  } catch (error) {
    console.error('createCommentNotification', error);
  }
}

// Fetches all notifications for a given subscriptionId
async function getNotificationsBySubscription(subscriptionId) {
  try {
    const db = await dbPromise;
    return await db.all(
      SQL`SELECT * FROM notifications WHERE subscription = ${subscriptionId}`
    );
  } catch (error) {
    console.error('getNotificationsBySubscription', error);
  }
}

async function getSubscriberNotificationsBySubscription(subscriptionId) {
  try {
    const db = await dbPromise;
    const notifications = await db.all(
      SQL`SELECT * FROM notifications WHERE subscription = ${subscriptionId} AND notification_type = 'new_subscriber' AND read_status = false`
    );
    return notifications;
  } catch (error) {
    console.error('getSubscriberNotificationsBySubscription', error);
  }
}

async function updateNotificationStatus(id, readStatus) {
  try {
    const db = await dbPromise;
    const result = await db.run(
      SQL`UPDATE notifications SET read_status = ${readStatus} WHERE id = ${id}`
    );
    return result;
  } catch (error) {
    console.error('updateNotificationStatus', error);
  }
}

async function deleteNotification(id) {
  try {
    const db = await dbPromise;
    const result = await db.run(
      SQL`DELETE FROM notifications WHERE id = ${id}`
    );
    return result;
  } catch (error) {
    console.error('deleteNotification', error);
  }
}

module.exports = {
  getNotification,
  createArticleNotification,
  createSubscriptionNotification,
  createCommentNotification,
  getArticleNotificationsBySubscription,
  getSubscriberNotificationsBySubscription,
  getCommentNotificationsBySubscription,
  getNotificationsBySubscription,
  updateNotificationStatus,
  deleteNotification,
};
