var distance = require('google-distance-matrix');
distance.key(process.env.GOOGLEDISTANCEAPI);

exports.ETAsystem = (req, res) => {
  var origins = ['San Francisco CA'];
  var destinations = ['New  York NY'];
  var modeOfTransport = 'driving';
  var thingsToAvoid = 'tolls';

  distance.avoid(thingsToAvoid);

  distance.mode(mode);

  distance.matrix(origins, destinations, function (err, distances) {
    if (!err) {
      console.log(distances.rows[0].elements[0]);
      res.render('etademo', {
        title: 'ETA DEMO',
        eta: distances.rows[0].elements[0]
      });
    } else {
      res.status(500);
    }
  });
}