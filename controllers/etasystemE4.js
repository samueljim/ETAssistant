var distance = require('google-distance-matrix');
const { WebClient } = require('@slack/client');

distance.key(process.env.GOOGLEDISTANCEAPI);

exports.ETAsystem = (req, res) => {
  var origins = ['San Francisco CA'];
  var destinations = ['New  York NY'];
  var modeOfTransport = 'driving';
  if (req.params.mode = 'walking') {
    modeOfTransport = req.params.mode;
  } else if (req.params.mode = 'bicycling') {
    modeOfTransport = req.params.mode;
  } else if (req.params.mode = 'transit') {
    modeOfTransport = req.params.mode;
  } else {
    req.params.mode = 'driving';
  }

  // var thingsToAvoid = 'tolls';

  // distance.avoid(thingsToAvoid);

  distance.mode(modeOfTransport);

  var apiForSlack = req.user.slackToken;
  console.log(apiForSlack);
  const web = new WebClient(apiForSlack);

  web.channels.list()
    .then((res) => {
      distance.matrix(origins, destinations, function (err, distances) {
        if (!err) {
          console.log(distances.rows[0].elements[0]);
          if (distances.rows[0].elements[0].status == 'OK') {
            var time = distances.rows[0].elements[0].duration.text;
            var timeValue = distances.rows[0].elements[0].duration.value;
            var distance =  distances.rows[0].elements[0].distance.text;
            var distanceValue =  distances.rows[0].elements[0].distance.value;

            var message = 'Hey everyone, I\'m running late!\nI will be there in '
            + time + ' sorry for the delay' +
            + '\n i am ' + distance + ' from work.'

            web.chat.postMessage({ channel: res.channels[0].id, text: message })
            .then((res) => {
              // `res` contains information about the posted message
              console.log('Message sent: ', res.ts);
            })
            .catch(console.error);
          }
        } else {
          res.status(500);
        }
    })
    .catch(console.error);


  });
}
