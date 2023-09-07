const SQL = require('sql-template-strings');
const dbPromise = require('./database.js');
const { createArticleNotification } = require('./notifications-dao');
const { getSubscribersByAuthor } = require('./subscriptions-dao');

async function createArticle(article) {
  const db = await dbPromise;

  const result = await db.run(SQL`
      INSERT INTO articles (title, content, author, image_src)
      VALUES (${article.title}, ${article.content}, ${article.author}, ${article.imageSrc})
    `);

  // After successfully creating an article, create notifications for each subscriber
  const subscribers = await getSubscribersByAuthor(article.author);
  await Promise.all(
    subscribers.map((subscriber) =>
      createArticleNotification({
        read_status: false,
        notification_type: 'new_article',
        subscription: subscriber.id,
        article_id: result.lastID,
      })
    )
  );

  return result.lastID;
}

async function updateArticle(article) {
  const db = await dbPromise;

  const result = await db.run(SQL`
      UPDATE articles
      SET
        title = ${article.title},
        content = ${article.content},
        author = ${article.author},
        image_src = ${article.imageSrc}
      WHERE id = ${article.id}
    `);

  if (result.changes > 0) {
    return article.id;
  } else {
    return null; // Indicates that no article was updated
  }
}

async function deleteArticle(articleId) {
  const db = await dbPromise;

  // Delete any notifications associated with the article
  await db.run(SQL`DELETE FROM notifications WHERE article_id = ${articleId}`);

  // Delete the article
  const result = await db.run(SQL`
    DELETE FROM articles WHERE id = ${articleId}
  `);

  if (result.changes > 0) {
    return true; // Indicates that the article and notifications were successfully deleted
  } else {
    return false; // Indicates that no article was deleted
  }
}

module.exports = {
  createArticle,
  deleteArticle,
  updateArticle,
};
