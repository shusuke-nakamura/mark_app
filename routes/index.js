var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var knex = require('knex')({
  dialect: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'my-nodeapp-db',
    charset: 'utf8'
  }
});

var Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('pagination');

var User = Bookshelf.Model.extend({
  tableName: 'users'
});

var Markdata = Bookshelf.Model.extend({
  tableName: 'markdata',
  hasTimestamp: true,
  user: function () {
    return this.belongsTo(User);
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.login == null) {
    res.redirect('/login');
    return;
  }
  new Markdata(['title']).orderBy('created_at', 'DESC').where('user_id', '=', req.session.login.id).fetchPage({ page: 1, pageSize: 10, withRelated: ['user'] }).then((collection) => {
    var data = {
      title: 'Markdown Search',
      login: req.session.login,
      message: '※最近の投稿データ',
      form: { find: '' },
      content: collection.toArray()
    };
    res.render('index', data);
  });
});

router.post('/', (req, res, next) => {
  new Markdata().orderBy('created_at', 'DESC').where('content', 'like', '%' + req.body.find + '%').fetchAll({ withRelated: ['user'] }).then((collection) => {
    var data = {
      title: 'Markdown Search',
      login: req.session.login,
      message: '※"' + req.body.find + '" で検索された最近の投稿データ',
      form: req.body,
      content: collection.toArray()
    };
    red.render('index', data);
  });
});

module.exports = router;
