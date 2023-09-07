const SQL = require('sql-template-strings');
const dbPromise = require('./database.js');
const notificationsDao = require('./notifications-dao.js');

async function getSubscriberByUserId(authorId) {
  const db = await dbPromise;
  const result = await db.all(SQL`
        select * from subscriptions as s, users as u
        where s.author=${authorId} and s.subscriber = u.id
    `);
  return result;
}

async function getArticleByAuthorId(authorIdOfSubscriber) {
  const db = await dbPromise;
  const result2 = await db.all(SQL`
    select * from articles
    where author=${authorIdOfSubscriber} 
    `);
  return result2;
}

async function getAuthorInformById(authorIdOfSubscriber) {
  const db = await dbPromise;

  const result2 = await db.all(SQL`
        SELECT users.*, COUNT(likes.liker) AS total_likes
        FROM users
        LEFT JOIN articles ON users.id = articles.author
        LEFT JOIN likes ON articles.id = likes.article
        WHERE users.id = ${authorIdOfSubscriber}
    `);

  return result2;
}

// Add subscription to the database
async function addSubscription(subscriberId, authorId) {
  const db = await dbPromise;
  const result = await db.run(SQL`
    INSERT INTO subscriptions (subscriber, author) VALUES (${authorId},${subscriberId})`);
    await notificationsDao.createSubscriptionNotification({
        read_status: false,
        notification_type: "new_subscriber",
        subscription: result.lastID,
      });
  return result;
}
// Remove subscription from the database
async function removeSubscription(subscriberId, authorId) {
  const db = await dbPromise;
  return await db.run(SQL`
    DELETE FROM subscriptions WHERE subscriber = ${subscriberId} AND author = ${authorId}`);
}
// check if the user has subscribed to the author
async function getSubscription(authorId, subscriberId) {
  const db = await dbPromise;
  const result = await db.all(SQL`
        select * from subscriptions
        where author=${authorId} and subscriber = ${subscriberId}
    `);
  return result;
}
async function checkMutualSubscription(authorId, subscriberId) {
  const db = await dbPromise;
  const result = await db.all(SQL`
        SELECT * 
        FROM subscriptions s1
        INNER JOIN subscriptions s2 ON s1.subscriber = s2.author AND s1.author = s2.subscriber
        WHERE s1.subscriber = ${subscriberId} AND s1.author = ${authorId}
    `);
  return result.length > 0; // Returns true if they subscribe to each other, false otherwise
}

module.exports = {
  getSubscriberByUserId,
  getArticleByAuthorId,
  getAuthorInformById,
  addSubscription,
  removeSubscription,
  getSubscription,
  checkMutualSubscription,
};
