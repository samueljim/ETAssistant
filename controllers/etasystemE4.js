var distance = require('google-distance-matrix');
const {
  SlackOAuthClient
} = require('messaging-api-slack');
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

  var thingsToAvoid = 'tolls';
  var apiForSlack;

  distance.avoid(thingsToAvoid);

  distance.mode(modeOfTransport);

  const client = SlackOAuthClient.connect(
    apiForSlack
  );

  client.getChannelList().then(res => {
    console.log(res);
    // [
    //   { ... },
    //   { ... },
    // ]
  });

  distance.matrix(origins, destinations, function (err, distances) {
    if (!err) {
      console.log(distances.rows[0].elements[0]);
      if (distances.rows[0].elements[0].status == 'OK') {

      }
    } else {
      res.status(500);
    }
  });
}
