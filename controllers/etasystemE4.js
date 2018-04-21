var distance = require('google-distance-matrix');
var {
  WebClient
} = require('@slack/client');

distance.key(process.env.GOOGLEDISTANCEAPI);

exports.ETAsystem = (req, res) => {
  if (!req.user) {
    req.flash('error', {
      msg: 'Sign up please!'
    });
    return res.redirect('/');
  }
  if (!req.user.work) {
    req.flash('error', {
      msg: 'Where do you live and work?'
    });
    return res.redirect('/locations');
  }
  if (!req.user.home) {
    req.flash('error', {
      msg: 'Where do you live and work?'
    });
    return res.redirect('/locations');
  }
  if (!req.user.slackToken) {
    req.flash('error', {
      msg: 'Sign up with slack please!'
    });
    return res.redirect('/slack');
  }
  var origins = req.user.home;
  if (req.params.location) {
    var origins = req.params.location;
  }
  var destinations = req.user.work;
  var modeOfTransport = req.user.modeOfTransport;
  var transport;
  if (req.body.mode == 'walking') {
    modeOfTransport = req.body.mode;
    transport = ' walking ';

  } else if (req.body.mode == 'bicycling') {
    modeOfTransport = req.body.mode;
    transport = ' riding my bike ';

  } else if (req.body.mode == 'transit') {
    modeOfTransport = req.body.mode;
    transport = ' catching a bus ';
  } else {
    modeOfTransport = 'driving';
    transport = ' driving  ';
  }

  // var thingsToAvoid = 'tolls';
  // distance.avoid(thingsToAvoid);

  distance.traffic_model('best_guess');
  distance.mode(modeOfTransport);
  if (modeOfTransport == 'transit') {
  }
  var apiForSlack = req.user.slackToken;
  console.log(apiForSlack);
  const web = new WebClient(apiForSlack);
  origins = [origins];
  destinations = [destinations];
  if (req.body.latitude && req.body.longitude) {
    // origins = [req.body.latitude,req.body.longitude]
    origins = ['Brisbane', '' + req.body.latitude + ',' + req.body.longitude+ ''];
    console.warn(origins);
  }
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
            console.info(timeValue);
            console.info(distanceValue);
            var lateness;
            var dist;
            if (timeValue <= 0) {
              lateness = 'I just arrived '
            } else if (timeValue < 1800) {
              lateness = 'I\'m running late!\n';
            } else if (timeValue >= 1800) {
              lateness = 'I\'m running really late!\n';
            }
            if (distanceValue <= 10) {
              dist = ''
            } else if (distanceValue < 1000) {
              dist = 'i\'m only ';
            } else if (distanceValue >= 1000) {
              dist = 'It\'s going to take a while as i\'m ';
            }
            var message = 'Hey everyone, \n' + lateness + 'I will be there in ' + time + '\n'
            + dist + transport +  distance;

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
  if (!req.user) {
    req.flash('error', {
      msg: 'Sign up please!'
    });
    return res.redirect('/');
  }
  if (!req.user.work) {
    req.flash('error', {
      msg: 'Where do you live and work?'
    });
    return res.redirect('/locations');
  }
  if (!req.user.home) {
    req.flash('error', {
      msg: 'Where do you live and work?'
    });
    return res.redirect('/locations');
  }
  if (!req.user.slackToken) {
    req.flash('error', {
      msg: 'Sign up with slack please!'
    });
    return res.redirect('/slack');
  }
  return res.render('etademo', {
    title: 'Test ETA to Slack',
    modeOfTransport: req.user.modeOfTransport
  });
}
