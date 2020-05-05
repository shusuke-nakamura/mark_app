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

var User = Bookshelf.Model.extend({
  tableName: 'users'
});

const { check, validationResult } = require('express-validator');

router.get('/', (req, res, next) => {
  var data = {
    title: 'Login',
    form: { name: '', password: '' },
    content: '名前とパスワードを入力下さい。'
  }
  res.render('login', data);
});

router.post('/', validateParam(), (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty) {
    var content = '<ul class="error">';
    var result_arr = errors.toArray();
    for (var n in result_arr) {
      content += '<li>' + result_arr[n].msg + '</li>';
    }
    content += '</ul>';
    var data = {
      title: 'Login',
      content: content,
      form: req.body
    }
    res.render('login', data);
  } else {
    var nm = req.body.name;
    var pw = req.body.password;
    User.query({ where: { name: nm }, andWhere: { password: pw } }).fetch().then((model) => {
      if (model == null) {
        var data = {
          title: '再入力',
          content: '<p class="error">名前またはパスワードが違います。</p>',
          form: req.body
        };
        res.render('login', data);
      } else {
        req.session.login = model.attributes;
        var data = {
          title: 'Login',
          content: '<p>ログインしました！<br>トップページに戻ってメッセージを送信してください。</p>',
          form: req.body
        };
        res.render('login', data);
      }
    });
  }
});

function validateParam() {
  return [
    check('name').notEmpty().withMessage('NAME は必ず入力して下さい。'),
    check('password').notEmpty().withMessage('PASSWORD はメールアドレスを記入して下さい。'),
  ];
}

module.exports = router;