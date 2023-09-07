const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");
const { use } = require('passport');


async function getAllArticles() {
    try {
      const db = await dbPromise;
      return await db.all(SQL`
      SELECT articles.*, users.username AS authorUsername FROM articles 
      JOIN users ON articles.author = users.id`);
    } catch (error) {
      console.error(error);
    }
    
  }

  async function getAllArticlesByDate() {
    try {
      const db = await dbPromise;
      return await db.all(SQL`
      SELECT articles.*, users.username AS authorUsername FROM articles 
      JOIN users ON articles.author = users.id
      ORDER BY date ASC
    `);
    } catch (error) {
      console.error(error);
    }
    
  }

  async function getAllArticlesByTitle() {
    try {
      const db = await dbPromise;
      return await db.all(SQL`
      SELECT articles.*, users.username AS authorUsername FROM articles 
      JOIN users ON articles.author = users.id
      ORDER BY title COLLATE NOCASE ASC
    `);
    } catch (error) {
      console.error(error);
    }
    
  }

  async function getAllArticlesByauthorUsername() {
    try {
      const db = await dbPromise;
      return await db.all(SQL`
      SELECT articles.*, users.username AS authorUsername FROM articles 
      JOIN users ON articles.author = users.id
      ORDER BY authorUsername COLLATE NOCASE ASC
      `);
    } catch (error) {
      console.error(error);
    }
   
  }

async function getRandomArticles() {
    try {
      const db = await dbPromise;
      const randomArticle = await db.all(SQL`
      SELECT articles.*, users.username AS authorUsername FROM articles 
      JOIN users ON articles.author = users.id
      ORDER BY RANDOM();
      `)

      if(randomArticle.length >= 10){
        randomArticle.splice(10);
      }
      return randomArticle;
    } catch (error) {
      console.error(error);
    }
    
}

async function getTop5Articles() {
  try {
    const db = await dbPromise;
    const articles = await db.all(SQL`
    SELECT articles.*, users.username AS authorUsername 
    FROM articles 
    JOIN users ON articles.author = users.id`);
    const articleArray = [];
  
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
      const eachArticle = {
        id: article.id,
        title: article.title,
        content: article.content,
        author: article.author,
        date: article.date,
        image_src: article.image_src,
        additional_images: article.additional_images,
        comments: comments.commentCount,
        likes: likes.likeCount,
        popularity: popularity,
        authorUsername: article.authorUsername,
      };
      articleArray.push(eachArticle);
    }
  
    articleArray.sort((a, b) => b.popularity - a.popularity);

    if(articleArray.length >= 5){
        articleArray.splice(5);
    }
    
    return articleArray;
  } catch (error) {
    console.error(error);
  }
   
}




module.exports = {
    getAllArticles,
    getAllArticlesByDate,
    getAllArticlesByTitle,
    getAllArticlesByauthorUsername,
    getRandomArticles,
    getTop5Articles

}