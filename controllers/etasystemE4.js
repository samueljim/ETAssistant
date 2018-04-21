var distance = require('google-distance-matrix');
var {
  WebClient
} = require('@slack/client');

distance.key(process.env.GOOGLEDISTANCEAPI);

exports.ETAsystem = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  if (!req.user.work) {
    return res.redirect('/');
  }
  if (!req.user.home) {
    return res.redirect('/');
  }
  if (!req.user.slackToken) {
    return res.redirect('/');
  }
  var origins = req.user.home;
  if (req.params.location) {
    var origins = req.params.location;
  }
  var destinations = req.user.work;
  var modeOfTransport = req.user.modeOfTransport;
  if (req.params.mode == 'walking') {
    modeOfTransport = req.params.mode;
  } else if (req.params.mode == 'bicycling') {
    modeOfTransport = req.params.mode;
  } else if (req.params.mode == 'transit') {
    modeOfTransport = req.params.mode;
  } else {
    modeOfTransport = 'driving';
  }

  // var thingsToAvoid = 'tolls';
  // distance.avoid(thingsToAvoid);

  distance.mode(modeOfTransport);

  var apiForSlack = req.user.slackToken;
  console.log(apiForSlack);
  const web = new WebClient(apiForSlack);

  web.channels.list()
    .then((slack) => {
      distance.matrix(origins, destinations, function (err, distances) {
        if (!err) {
          console.log(distances.rows[0].elements[0]);
          if (distances.rows[0].elements[0].status == 'OK') {
            var time = distances.rows[0].elements[0].duration.text;
            var timeValue = distances.rows[0].elements[0].duration.value;
            var distance = distances.rows[0].elements[0].distance.text;
            var distanceValue = distances.rows[0].elements[0].distance.value;

            if (timeValue <= 0) {
              var message = 'I just arrived '
            } else if (timeValue <= 5) {
              var message = 'I\'m only five seconds out '
            } else if (timeValue >= 25) {
              var message = 'longer than 25 '
            }
            //else if () {}
            //else if () {}
            //else if () {}
            //else if () {}
            else {
              var message = 'Hey everyone, I\'m running late!\nI will be there in '
            }

            web.chat.postMessage({
                channel: slack.channels[0].id,
                text: message
              })
              .then((slackMessage) => {
                console.log('Message sent: ', slackMessage.ts);
                req.flash('success', {
                  msg: 'Sent!'
                });
                return res.render('etademo', {
                  title: 'Message sent'
                });
              }).catch(console.error);
          }
        } else {
          res.status(500);
        }
      });
    }).catch(console.error);
}

exports.ETAsystemPage = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  if (!req.user.work) {
    return res.redirect('/');
  }
  if (!req.user.home) {
    return res.redirect('/');
  }
  if (!req.user.slackToken) {
    return res.redirect('/');
  }
  return res.render('etademo', {
    title: 'Test ETA to Slack',
    modeOfTransport: req.user.modeOfTransport
  });
}
