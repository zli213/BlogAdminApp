const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");
const { use } = require('passport');


async function getNumOfSubscribers(user){
  try {
    const db = await dbPromise;
    const subscribers = await db.all(SQL`
      SELECT * 
      FROM subscriptions
      WHERE author =  ${user.id}
      `);

    return subscribers.length;

  } catch (error) {
    console.error(error);
  }
  
}

async function getTotalNumOfComments(user) {
  try {
    const db = await dbPromise;
    const totalComments = await db.all(SQL`
      SELECT articles.id, COUNT(comments.id) AS comment_count
      FROM articles
      JOIN comments ON articles.id = comments.article
      WHERE articles.author = ${user.id}
      GROUP BY articles.id
    `);
    return totalComments;
  } catch (error) {
    console.error(error);
  }
 
}

async function getCommentDateByAuthor(user) {
  try {
    const db = await dbPromise;
    const commentDates = await db.all(SQL`
    SELECT subquery.comment_date AS comment_date, COALESCE(total_comments, 0) AS total_comments
    FROM (
      SELECT DATE('now', '-' || (n-1) || ' days') AS comment_date
      FROM (
        SELECT 1 AS n UNION ALL
        SELECT 2 UNION ALL
        SELECT 3 UNION ALL
        SELECT 4 UNION ALL
        SELECT 5 UNION ALL
        SELECT 6 UNION ALL
        SELECT 7 UNION ALL
        SELECT 8 UNION ALL
        SELECT 9 UNION ALL
        SELECT 10
      ) AS numbers
    ) AS subquery
    LEFT JOIN (
      SELECT DATE(comments.date) AS comment_date, COUNT(comments.id) AS total_comments
      FROM comments
      INNER JOIN articles ON comments.article = articles.id
      WHERE articles.author = ${user.id}
      GROUP BY DATE(comments.date)
    ) AS comments_count ON subquery.comment_date = comments_count.comment_date
    ORDER BY subquery.comment_date;
    `);
    return commentDates;
  } catch (error) {
    console.error(error)
  }
  
}


async function getTotalNumOfLikes(user) {
  try {
    const db = await dbPromise;
    const totalLikes = await db.all(SQL`
    SELECT *
    FROM articles, likes
    WHERE articles.id = likes.article
    AND articles.author = ${user.id}; 
    `);
    return totalLikes.length;
  } catch (error) {
    console.error(error);
  }
  
}

async function getUserTop3Articles(user) {
  try {
    const db = await dbPromise;
    const articles = await db.all(SQL`SELECT * FROM articles WHERE author = ${user.id}`);
    const userArticles = [];
  
    for (const article of articles) {
      const comments = await db.get(SQL
        `SELECT COUNT(*) AS commentCount 
        FROM comments 
        WHERE article = ${article.id}
        `);
      const likes = await db.get(SQL`
        SELECT COUNT(*) AS likeCount 
        FROM likes 
        WHERE article = ${article.id}
        `);
  
      const popularity = (comments.commentCount || 0) * 2 + (likes.likeCount || 0);
      const userArticle = {
        id: article.id,
        title: article.title,
        content: article.content,
        author: article.author,
        date: article.date,
        image_src: article.image_src,
        additional_images: article.additional_images,
        comments: comments.commentCount,
        likes: likes.likeCount,
        popularity: popularity
      };
      userArticles.push(userArticle);
    }
  
    userArticles.sort((a, b) => b.popularity - a.popularity);

    if(userArticles.length >= 3){
        userArticles.splice(3);
    }
    
    return userArticles;
  } catch (error) {
    
  }
    
}

module.exports = {
  getNumOfSubscribers,
  getTotalNumOfComments,
  getTotalNumOfLikes,
  getUserTop3Articles,
  getCommentDateByAuthor

}