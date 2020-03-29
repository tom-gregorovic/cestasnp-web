const express = require('express');
const sanitize = require('mongo-sanitize');
const moment = require('moment');

const DB = require('../db/db');
const request = require('request');

const db = new DB();
const router = express.Router();

// retrieve travellers details
router.get('/details/:travellerId', function (req, res) {
  let travellerId = sanitize(req.params.travellerId);
  db.getTravellerDetails(travellerId)
    .then(results => {
      res.json(results);
    })
    .catch(e => {
      console.error('err ', e);
    })
});

router.get('/article/:travellerId', function (req, res) {
  let travellerId = sanitize(req.params.travellerId);
  db.getTravellerArticle(travellerId, function (results) {
    res.json(results);
  });
});

router.get('/messages/:travellerId', function (req, res) {
  let travellerId = sanitize(req.params.travellerId);
  db.getTravellerMessages(travellerId)
    .then(results => {
      res.json(results);
    })
    .catch(e => {
      console.error('err ', e);
    })
});

router.post('/lastMessages', function (req, res) {
  db.getTravellersMessages(req.body.travellerIds, function (results) {
    res.json(results);
  });
});

router.post('/comments', function (req, res) {
  db.getTravellerComments(req.body.articleId, req.body.travellerId, function (results) {
    res.json(results);
  });
});

router.get('/finishedTravellers', function (req, res) {
  db.findBy('traveler_details', {
    finishedTracking: true,
    end_date: { $ne: "" },
  })
    .then(results => {
      res.json(results);
    })
    .catch(e => {
      console.error('error ', e)
    })
});

router.get('/activeTravellers', function (req, res) {
  db.findBy('traveler_details', { finishedTracking: false })
    .then(activeTravellers => {

      let trvlrsObject = {};

      let trvlrPromises = activeTravellers.map(({ user_id, start_date }) => {
        trvlrsObject[user_id] = {
          start: start_date,
        };
        return db.getTravellerLastMessage(user_id);
      });

      Promise.all(trvlrPromises)
        .then(function (msgs) {
          let now = new Date();
          let expired = msgs
            .filter(msg => {
              let startDate = new Date(trvlrsObject[msg.user_id].start);
              let published = "empty"
              if (msg.pub_date && msg.pub_date != 0) {
                published = new Date(msg.pub_date);
              }
              if (published === "empty" &&
                startDate.valueOf() < now.valueOf() &&
                now.valueOf() - startDate.valueOf() >= 259200000) {
                msg.completed = 0
                msg.pub_date = moment(startDate).format('YYYY-MM-DD')
                return msg
              } else if (published !== "empty" &&
                startDate.valueOf() < now.valueOf() &&
                now.valueOf() > published.valueOf() &&
                now.valueOf() - published.valueOf() >= 259200000) {
                if (published.valueOf() - startDate.valueOf() >= 864000000) {
                  msg.completed = 1
                  msg.pub_date = moment(msg.pub_date).format('YYYY-MM-DD')
                } else {
                  msg.completed = 0
                  msg.pub_date = moment(msg.pub_date).format('YYYY-MM-DD')
                }
                return msg
              }
            })

          if (expired.length > 0) {
            let finishPromises = expired.map(({ user_id, completed, pub_date }) => {
              return db.finishTracking(user_id, completed, pub_date)
            });
            Promise.all(finishPromises)
              .then(function () {
                res.json(activeTravellers);
              })
              .catch(function (e) {
                throw e;
              });
          } else {
            res.json(activeTravellers);
          }
        })
        .catch(function (e) {
          throw e;
        });
    })
    .catch(e => {
      console.error('error ', e)
    })
});

router.post('/addComment', function (req, res) {
  if (
    req.body['g-recaptcha-response'] === undefined ||
    req.body['g-recaptcha-response'] === '' ||
    req.body['g-recaptcha-response'] === null
  ) {
    res.json({ responseError: 'Please select captcha first' });
    return;
  }

  const secretKey = process.env.RECAPTCHA;
  const verificationURL =
    'https://www.google.com/recaptcha/api/siteverify?secret=' +
    secretKey +
    '&response=' +
    req.body['g-recaptcha-response'];
  // + '&remoteip=' +
  // req.connection.remoteAddress;

  request(verificationURL, function (error, response, body) {

    body = JSON.parse(body);
    if (body.success) {
      let comment = {};
      if (req.body.articleId !== 0 && req.body.articleId !== "") {
        // old system of comments relating to sql article id from Joomla
        comment.lang = 'sk-SK';
        comment.sql_user_id = 0;
        comment.parent = 0;
        comment.path = 0;
        comment.level = 0;
        comment.object_group = 'com_content';
        comment.object_params = '';
        comment.email = '';
        comment.homepage = '';
        comment.title = '';
        comment.isgood = 0;
        comment.ispoor = 0;
        comment.published = 1;
        comment.subscribe = 0;
        comment.source = '';
        comment.source_id = 0;
        comment.checked_out = 0;
        comment.checked_out_time = '0000-00-00 00:00:00';
        comment.editor = '';
        let sComment = sanitize(req.body.comment);
        comment.comment = sComment;
        let sName = sanitize(req.body.name);
        comment.name = sName;
        comment.username = sName;
        let sVisitorIp = sanitize(req.body.visitorIp);
        comment.ip = sVisitorIp;
        let sArticleId = sanitize(req.body.articleId);
        comment.article_sql_id = sArticleId;
        let sDate = sanitize(req.body.date);
        comment.date = sDate;

        db.addCommentOldTraveller(comment, function (com) {
          res.json(com);
          return;
        });
      } else {
        // new system using traveler_comments collection in mongo
        comment.lang = 'sk-SK';
        let sComment = sanitize(req.body.comment);
        comment.comment = sComment;
        let sName = sanitize(req.body.name);
        comment.name = sName;
        let sVisitorIp = sanitize(req.body.visitorIp);
        comment.ip = sVisitorIp;
        comment.travellerDetails = {};
        let sTravellerId = sanitize(req.body.travellerId);
        comment.travellerDetails.id = sTravellerId;
        let sTravellerName = sanitize(req.body.travellerName);
        comment.travellerDetails.name = sTravellerName;
        let sDate = sanitize(req.body.date);
        comment.date = sDate;

        db.addCommentNewTraveller(comment, function (com) {
          res.json(com);
          return;
        });
      }
    } else {
      res.json({ responseError: 'Failed captcha verification' });
      return;
    }
  });
});

router.post('/userCheck', function (req, res) {
  let { email, name, uid } = req.body
  Promise.all([
    db.findBy('users', { uid }),
    db.getTravellerDetails(uid),
    db.getTravellerMessages(uid),
  ])
    .then(([userDetails, travellerDetails, travellerMessages]) => {
      if (userDetails && userDetails.length > 0) {
        res.json({
          userDetails: userDetails[0],
          travellerDetails: travellerDetails[0] || {},
          travellerMessages: travellerMessages || [],
        });
        return;
      } else {
        db.createUser({ email, name, uid }, function (creation) {
          res.json(creation);
          return;
        })
      }
    });

  router.post('/setupTraveller', function (req, res) {
    let { meno, text, start_date, uid, start_miesto, number, email } = req.body
    db.createTraveller({ meno, text, start_date, uid, start_miesto, number, email }, function (resp) {
      res.json(resp)
      return
    })
  })

  router.post('/updateTraveller', function (req, res) {
    let { meno, text, start_date, uid, start_miesto, number, end_date, completed, email, finishedTracking } = req.body
    db.updateTraveller({ meno, text, start_date, uid, start_miesto, number, end_date, completed, email, finishedTracking }, function (resp) {
      res.json(resp)
      return
    })
  })

  router.post('/sendMessage', function (req, res) {
    let { lon, lat, accuracy, text, pub_date, user_id, img, pub_date_milseconds, details_id } = req.body
    db.sendMessage({ lon, lat, accuracy, text, pub_date, user_id, img, pub_date_milseconds, details_id }, function (resp) {
      res.json(resp)
      return
    })
  })

})

module.exports = router;