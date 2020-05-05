var express = require('express');
var router = express.Router();

var MarkdownIt = require('markdown-it');
var markdown = new MarkdownIt();

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
var Bookself = require('bookshelf')(knex);

var User = Bookself.Model.extend({
  tableName: 'users'
});

var Markdata = Bookself.Model.extend({
  tableName: 'markdata',
  hasTimestamps: true,
  user: function () {
    return this.belongsTo(User);
  }
});

router.get('/', (req, res, next) => {
  res.redirect('/');
  return;
});

router.get('/:id', (req, res, next) => {
  var request = req;
  var response = res;
  if (req.session.login == null) {
    res.redirect('/');
    return;
  }
  Markdata.query({ where: { user_id: req.session.login.id }, andWhere: { id: req.params.id } }).fetch().then((model) => {
    makepage(request, response, model, false);
  });
});

router.post('/:id', (req, res, next) => {
  var request = req;
  var response = res;
  var obj = new Markdata({ id: req.params.id }).save({ content: req.body.source }, { patch: true }).then((model) => {
    makepage(request, response, model, true);
  });
});

function makepage(req, res, model, flg) {
  var footer;
  if (flg) {
    var d1 = new Date(model.attributes.created_at);
    var dstr1 = d1.getFullYear() + '-' + (d1.getMonth() + 1) + '-' + d1.getDate();
    var d2 = new Date(model.attributes.updated_at);
    var dstr2 = d2.getFullYear() + '-' + (d2.getMonth() + 1) + '-' + d2.getDate();
    footer = '(created: ' + dstr1 + ', updated: ' + dstr2 + ')';
  } else {
    footer = '(Updating date and time information...)';
  }
  var data = {
    title: 'Markdown',
    id: req.params.id,
    head: model.attributes.title,
    footer: footer,
    content: markdown.render(model.attributes.content),
    source: model.attributes.content
  };
  res.render('mark', data);
}

module.exports = router;