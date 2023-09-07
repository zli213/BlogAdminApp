const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");
const { use } = require('passport');


async function getUserArticles(user) {
    try {
        const db = await dbPromise;
        return await db.all(SQL`SELECT * FROM articles WHERE author = ${user.id}`)
    } catch (error) {
        console.error(error);
    }
   
}
async function getUserArticlesByDate(user) {
    try {
        const db = await dbPromise;
        return await db.all(SQL`
        SELECT * 
        FROM articles 
        WHERE author = ${user.id}
        ORDER BY date ASC
        `) 
    } catch (error) {
        console.error(error);
    }
    
}
async function getUserArticlesByTitle(user) {
    try {
        const db = await dbPromise;
        return await db.all(SQL`
        SELECT * 
        FROM articles 
        WHERE author = ${user.id}
        ORDER BY title COLLATE NOCASE ASC
        `) 
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    getUserArticles,
    getUserArticlesByDate,
    getUserArticlesByTitle

}