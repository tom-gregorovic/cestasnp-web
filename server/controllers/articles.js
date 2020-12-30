const express = require('express');
const sanitize = require('mongo-sanitize');
const bodyParser = require('body-parser');
const DB = require('../db/db');
const promiseAsJson = require('../util/promiseUtils');

const query = new DB();
const router = express.Router();

const ORDER = {
  newestFirst: { created: -1 },
  oldestFirst: { created: 1 }
};

const filterBy = {
  tags: {
    $nin: [
      'akcie',
      'spravy-z-terenu',
      'spravy_z_terenu',
      'oznamy',
      'akcie-ostatne',
      'nezaradene'
    ]
  }
};

const filtersSplit = category => {
  return category.split('+').map(filter => {
    const newFilter = {};
    newFilter.tags = filter;
    return newFilter;
  });
};

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// count the entire article collection
router.get('/', (req, res) => {
  promiseAsJson(() => query.countCollection(req.app.locals.db, 'articles', filterBy), res);
});

// operates pagination for all articles
router.get('/:page', (req, res) => {
  promiseAsJson(() => query.nextSorted(
    req.app.locals.db, 
    'articles',
    ORDER.newestFirst,
    sanitize(req.params.page),
    filterBy
  ), res);
});

// returns single article by ID
router.get('/article/:articleId', (req, res) => {
  const articleId = sanitize(parseInt(req.params.articleId, 10));

  promiseAsJson(() => query.findByWithDB(req.app.locals.db, 'articles', { sql_article_id: articleId }), res);
});

// returns all articles matching category
router.get('/category/:category', (req, res) => {
  const filters = filtersSplit(sanitize(req.params.category));
  const finalFilter = {};
  finalFilter.$and = filters;

  promiseAsJson(() => query.countCollection(req.app.locals.db, 'articles', finalFilter), res);
});

// returns articles matching category on certain page
router.get('/category/:category/:page', (req, res) => {
  const filters = filtersSplit(sanitize(req.params.category));
  const finalFilter = {};
  finalFilter.$and = filters;

  promiseAsJson(() => query.nextSorted(
    req.app.locals.db, 'articles',
    ORDER.newestFirst,
    sanitize(req.params.page),
    finalFilter
  ), res);
});

// increases article count
router.put('/increase_article_count', (req, res) => {
  query.increaseArticleCount(req.body.id, results => {
    res.json(results);
  });
});

// returns 2 newest articles for homepage
router.get('/for/home', (req, res) => {
  promiseAsJson(() => query.newestSorted(req.app.locals.db,
    'articles', ORDER.newestFirst, filterBy, 2), res);
});

module.exports = router;
