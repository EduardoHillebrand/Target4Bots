require('dotenv').config();
var app = require('express')();
var http = require('http').Server(app); 
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

var port = process.env.PORT || 8080;
var rooms = [];

app.get('/', function(req, res){
  res.render(__dirname + "/home.html", {name:'home'});
});

app.post('/', function(req, res){
  	rooms['home'] = req.body.text;
  	res.send(req.body.text)
});


app.get('/:room', function(req, res){
  res.render(__dirname + "/home.html", {name:req.params.room});
});

app.post('/:room', function(req, res){
  rooms[req.params.room] = req.body.text;
  res.send(req.body.text)
});

app.get('/api/:room', function(req, res){
  res.send(rooms[req.params.room] || '');
});


io.on('connection', function(socket){
  
  socket.emit('message', '*** oi ***');

  socket.on('get', function(msg){
  	socket.emit('message', rooms[msg] || '');
  });
  socket.on('post', function(msg){
  	try{
  		msg = JSON.parse(msg)
	  	rooms[msg.room] = msg.text;
	  	socket.emit('message', msg.text || '');	
  	}catch(err){
	  	socket.emit('err', 'failure, try again.');	
  	}
  	
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(port, function(){
  console.log('listening on: ',port);
});