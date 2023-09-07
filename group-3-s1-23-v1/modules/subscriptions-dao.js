const SQL = require('sql-template-strings');
const dbPromise = require('./database.js');

async function getSubscribersByAuthor(authorId) {
  try {
    const db = await dbPromise;
    const subscribers = await db.all(
      SQL`SELECT s.*, u.avatar_src, u.username FROM subscriptions s JOIN users u ON s.subscriber = u.id WHERE author = ${authorId}`
    );
    return subscribers;
  } catch (error) {
    console.error('getSubscribersByAuthor', error);
  }
}

async function getSubscriptionsBySubscriber(subscriberId) {
  try {
    const db = await dbPromise;
    const subscribers = await db.all(
      SQL`SELECT s.*, u.avatar_src, u.username FROM subscriptions s JOIN users u ON s.author = u.id WHERE subscriber = ${subscriberId}`
    );
    return subscribers;
  } catch (error) {
    console.error('getSubscriptionsBySubscriber', error);
  }
}

module.exports = {
  getSubscribersByAuthor,
  getSubscriptionsBySubscriber
};
