const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");
const { createSubscriptionNotification, createCommentNotification } = require("./notifications-dao");

// Fetches article by id
async function getArticleById(id) {
  const db = await dbPromise;
  return await db.get(
    SQL`SELECT articles.id, articles.title, articles.content, articles.date, articles.image_src, articles.additional_images, users.fname || ' ' || users.lname as author_name, users.id as author_id, avatar_src FROM articles, users WHERE articles.id = ${id} AND users.id = articles.author`
  );
}
//Fetches author avatar
async function getAuthorAvatar(authorId) {
  const db = await dbPromise;
  return await db.get(SQL`SELECT avatar_src FROM users WHERE id = ${authorId}`);
}
// Fetches all comments for an article
async function getComments(articleId) {
  const db = await dbPromise;
  return await db.all(
    SQL`SELECT comments.id, comments.content, comments.date, comments.commenter, users.fname || ' ' || users.lname as commenter_name, comments.parent_comment FROM comments, users WHERE comments.article = ${articleId} AND users.id = comments.commenter`
  );
}
// Count the number of likes for an article
async function countLikes(articleId) {
  const db = await dbPromise;
  return await db.get(
    SQL`SELECT COUNT(*) as count FROM likes WHERE article = ${articleId}`
  );
}
// Count the number of likes for an author
async function countAuthorLikes(authorId) {
  const db = await dbPromise;
  return await db.get(
    SQL`SELECT COUNT(*) as count FROM likes WHERE article IN (SELECT id FROM articles WHERE author = ${authorId})`
  );
}
//count the number of comments for an article
async function countComments(articleId) {
  const db = await dbPromise;
  return await db.get(
    SQL`SELECT COUNT(*) as count FROM comments WHERE article = ${articleId}`
  );
}
// Count the number of comments for an author
async function countAuthorComments(authorId) {
  const db = await dbPromise;
  return await db.get(
    SQL`SELECT COUNT(*) as count FROM comments WHERE article IN (SELECT id FROM articles WHERE author = ${authorId})`
  );
}

async function addComment(articleId, commenterId, content, parentComment) {
  const db = await dbPromise;

  // Generate a current timestamp in local time zone
  let date = new Date();
  let localDateStr =
    date.getFullYear() +
    "-" +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    date.getDate().toString().padStart(2, "0") +
    " " +
    date.getHours().toString().padStart(2, "0") +
    ":" +
    date.getMinutes().toString().padStart(2, "0") +
    ":" +
    date.getSeconds().toString().padStart(2, "0");

  // Insert the comment and get the result
  const result = await db.run(
    SQL`INSERT INTO comments (content, date, commenter, article, parent_comment) VALUES (${content}, ${localDateStr}, ${commenterId}, ${articleId}, ${parentComment})`
  );

  // Fetch the author of the article
  const article = await db.get(
    SQL`SELECT * FROM articles WHERE id = ${articleId}`
  );

  // Create a new comment notification if the commenter is a subscriber of the author
  await createCommentNotification(commenterId, article.author, result.lastID, articleId);

  return result;
}

// Fetched the first level comments for an article
async function getFirstLevelComments(articleId) {
  const db = await dbPromise;
  return await db.all(
    SQL`SELECT comments.id, comments.content, comments.date, comments.commenter, users.fname || ' ' || users.lname as commenter_name, users.avatar_src as commenter_avatar, comments.parent_comment FROM comments, users WHERE comments.article = ${articleId} AND users.id = comments.commenter AND comments.parent_comment IS NULL`
  );
}
// Fetches the replies for a comment
async function getReplies(commentId, parentCommentId) {
  const db = await dbPromise;
  return await db.all(
    SQL`SELECT comments.id, comments.content, comments.date, comments.commenter, users.fname || ' ' || users.lname as commenter_name, users.avatar_src as commenter_avatar, comments.parent_comment FROM comments, users WHERE comments.article = ${commentId} AND users.id = comments.commenter AND comments.parent_comment = ${parentCommentId}`
  );
}
// Fetches the replies for a reply
async function getRepliesForReply(replyId, parentCommentId, parentReplyId) {
  const db = await dbPromise;
  return await db.all(
    SQL`SELECT comments.id, comments.content, comments.date, comments.commenter, users.fname || ' ' || users.lname as commenter_name, users.avatar_src as commenter_avatar, comments.parent_comment FROM comments, users WHERE comments.article = ${replyId} AND users.id = comments.commenter AND comments.parent_comment = ${parentCommentId} AND comments.parent_comment = ${parentReplyId}`
  );
}

// Add a like to an article with the given articleId and likerId
async function addLike(articleId, likerId) {
  const db = await dbPromise;
  return await db.run(
    SQL`INSERT INTO likes (liker, article) VALUES (${likerId}, ${articleId})`
  );
}
// Remove a like from an article with the given articleId and likerId
async function removeLike(articleId, likerId) {
  const db = await dbPromise;
  return await db.run(
    SQL`DELETE FROM likes WHERE liker = ${likerId} AND article = ${articleId}`
  );
}
// Check like status for an article with the given articleId and likerId
async function checkLike(articleId, likerId) {
  const db = await dbPromise;
  return await db.get(
    SQL`SELECT * FROM likes WHERE liker = ${likerId} AND article = ${articleId}`
  );
}

// Add subscription to the database and create a notification for the author
async function addSubscription(subscriberId, authorId) {
  const db = await dbPromise;
  const result = await db.run(
    SQL`INSERT INTO subscriptions (subscriber, author) VALUES (${subscriberId}, ${authorId})`
  );
  const subscriptionId = result.lastID;

  await createSubscriptionNotification({
    read_status: false,
    notification_type: "new_subscriber",
    subscription: subscriptionId,
  });

  return result;
}

// Remove subscription from the database
async function removeSubscription(subscriberId, authorId) {
  const db = await dbPromise;
  return await db.run(
    SQL`DELETE FROM subscriptions WHERE subscriber = ${subscriberId} AND author = ${authorId}`
  );
}
// Fetches subscription status if the user is subscribed to the author
async function getSubscriptionStatus(subscriberId, authorId) {
  const db = await dbPromise;
  return await db.get(
    SQL`SELECT * FROM subscriptions WHERE subscriber = ${subscriberId} AND author = ${authorId}`
  );
}
// Fetches the author you are subscribed to, and shows the avatar, name, id, the favorite number of articles， the number of comments， the recent article and the popular article
async function getSubscribedAuthors(subscriberId) {
  const db = await dbPromise;
  const subscribedAuthors = await db.all(SQL`
    SELECT 
        users.id AS author_id,
        users.avatar_src AS author_avatar,
        users.fname || ' ' || users.lname as author_name,
        (SELECT id FROM articles WHERE articles.author = users.id ORDER BY date DESC LIMIT 1) AS recent_article_id,
        (SELECT articles.id 
            FROM articles 
            LEFT JOIN likes ON articles.id = likes.article 
            WHERE articles.author = users.id 
            GROUP BY articles.id 
            ORDER BY COUNT(likes.liker) DESC 
            LIMIT 1
        ) AS popular_article_id
    FROM 
        users 
        JOIN subscriptions ON users.id = subscriptions.author
    WHERE 
        subscriptions.subscriber = ${subscriberId}
`);

  // Get the information of the whole article.
  for (let author of subscribedAuthors) {
    if (author.recent_article_id) {
      author.recent_article = await db.get(
        SQL`SELECT articles.id,articles.title,articles.date,articles.image_src FROM articles WHERE id = ${author.recent_article_id}`
      );
    }
    if (author.popular_article_id) {
      author.popular_article = await db.get(
        SQL`SELECT articles.id,articles.title,articles.date,articles.image_src FROM articles WHERE id = ${author.popular_article_id}`
      );
    }
  }

  return subscribedAuthors;
}
// Delete comments, if there are child comments, delete them together
async function deleteCommentAndChildren(commentId) {
  const db = await dbPromise;

  // First, find all direct children of the comment
  const children = await db.all(
    `SELECT id FROM comments WHERE parent_comment = ?`,
    commentId
  );

  // Recursively delete all children
  for (let child of children) {
    await deleteCommentAndChildren(child.id);
  }

  // After all children are deleted, delete the comment itself
  return await db.run(`DELETE FROM comments WHERE id = ?`, commentId);
}

module.exports = {
  getArticleById,
  getComments,
  countLikes,
  countComments,
  addComment,
  addLike,
  removeLike,
  addSubscription,
  removeSubscription,
  getSubscriptionStatus,
  getAuthorAvatar,
  checkLike,
  getFirstLevelComments,
  getReplies,
  getRepliesForReply,
  getSubscribedAuthors,
  countAuthorComments,
  countAuthorLikes,
  deleteCommentAndChildren,
};
