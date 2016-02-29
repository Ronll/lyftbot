var express = require('express');
var request = require('request');

var accountSid = 'AC6495fc21f3029512d474773e739cc64e';
var authToken = "d6afadc2f571b20ac3cd7294faf274a9";
var twilio = require('twilio')(accountSid, authToken);

var bodyParser = require('body-parser');
var app = express();
  var rides = {}

var rideSize = {
  "lyft_plus": 6,
  "lyft_line": 2,
  "lyft":4
}

var port = process.env.PORT || 3000;
var lat = 37.7833;
var lng = -122.4167;
var end_lat = 37.807413;
var end_lng = -122.430445;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.post('/', function(req, res){
  //remove lyft prefix
  var phoneNumber = req.body.From;
  var myPhoneNumber = req.body.To;
  var message = req.body.Body.slice(5);
  var passangers = req.body.Body.slice(0,1);
  var possibleRides = [];
  var costEstimates;
  var etaEstimates;


  var optionsETA = {
    url : 'https://api.lyft.com/v1/eta?lat=' + lat + '&lng=' + lng,
  headers: {
    'Authorization': 'bearer gAAAAABW0zi87zqNYjxE0bXiiSr1oVoavFeq-xv2eQ4lrVIIaKJKEtrZlTPlD9_m90hREB_wEHT_CBPO90qWS1Kp5PWuohJWk11Cnk91Qwsa1UjlaawgOx3zknfY4KDeCdpuNsCwYO_U_aKqMB83UEdW4aghZJ3EGqSyLFmf2E1mSrJGsoTZVDNe4lZalKhHQuE5RzkEQZO72y8l5Jrwh4VgkyKao2U1PQ=='
  }
  }

  var optionsCOST = {
    url : 'https://api.lyft.com/v1/cost?start_lat=' + lat + '&start_lng=' + lng + '&end_lat=' + end_lat + '&end_lng=' + end_lng,
    headers: {
      'Authorization': 'bearer gAAAAABW0zi87zqNYjxE0bXiiSr1oVoavFeq-xv2eQ4lrVIIaKJKEtrZlTPlD9_m90hREB_wEHT_CBPO90qWS1Kp5PWuohJWk11Cnk91Qwsa1UjlaawgOx3zknfY4KDeCdpuNsCwYO_U_aKqMB83UEdW4aghZJ3EGqSyLFmf2E1mSrJGsoTZVDNe4lZalKhHQuE5RzkEQZO72y8l5Jrwh4VgkyKao2U1PQ=='
    }
  }

  request(optionsETA, function (error, response, body) {
      var body = JSON.parse(body);
      console.log(body, 'herererererr out of loop 1');
      etaEstimates = body.eta_estimates ;
      console.log(typeof body)
      for( var i = 0; i < etaEstimates.length ; i++){
	if(rideSize[etaEstimates[i].ride_type] <= passangers){
	  possibleRides.push(etaEstimates[i]);
	  rides[etaEstimates[i].ride_type].eta = etaEstimates.eta_secounds / 60;
	}
      }  
      console.log('out of loop 1');
      possibleRides.sort(function(a,b){
	return a.eta_estimates - b.eta_estimates
      })
      request(optionsCOST, function(error, response, body){
        var body = JSON.parse(body);
	console.log('in request 2');
	if(error) console.log(error);
	costEstimates = body.cost_estimates; 
	for(var y = 0; y < costEstimates.length; y++){
	  console.log('coste y', costEstimates);
	  rides[costEstimates[y].ride_type].costMin = costEstimates.estimated_cost_cents_min
	rides[costEstimates[y].ride_type].costMax = costEstimates.estimated_cost_cents_max
	}
	console.log('out of loop 2');
	costEstimates.sort(function(a,b){
	  return a.cost_secounds - b.cost_secounds 
	})

	var bestCost = costEstimates[0]; 
	var bestETA = possibleRides[0];
	var sms = "Best rate is " + bestCost.display_name + " for " + bestCost.estimated_cost_cents_min / 100 + '-' + bestCost.estimated_cost_cents_max / 100  + "$ in " + rides[bestCost.ride_type].eta + "minutes" + 
	"Best Time is " + bestETA.display_name + " in " + rides[bestETA.ride_type].eta + " minutes for " + rides[bestETA.ride_type].costMin / 100 + '-' + rides[bestETA.ride_type].costMax / 100 + '$' 
	console.log(sms);
      client.messages.create({
	body: sms,
	to: phoneNumber,
	from: myPhoneNumber
      }, function(err, message) {
	process.stdout.write(message.sid);
	res.end();  
      });
      })
  })


})

app.listen(port, function () {
  console.log('Ready');
});
