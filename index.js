const app = require ('express')();
app.get("/", (req,res) => res.sendFile(__dirname + "/index.html"));
app.listen(9091, ()=> console.log("listening on http por 9091"));
const http = require('http');
const websocketServer = require('websocket').server;
const httpServer = http.createServer();
httpServer.listen(9090, () => console.log('Listening on port 9090'))

//an object to store all of the clients and their guid
const clients = {};

const wsServer = new websocketServer({
		"httpServer": httpServer
})

wsServer.on("request", request => {
	//connect
	const connection = request.accept(null, request.origin);
	connection.on("open", () => console.log('opened!'))
	connection.on("close", () => console.log("closed!"))
	connection.on("message", message => {
		const result = JSON.parse(messsage.utf8Data)
		//I have received a message from the client
		console.log(result)
	})

	//generate a new clientID
	const clientId = guid();
	clients[clientId] = {
		"connection": connection
	}

	//sends response back to client
	const payLoad = {
		"method": "connect",
		"clientID": clientId
	}
	//send back the client connect
	connection.send(JSON.stringify(payLoad))

})

const guid=()=> {
  const s4=()=> Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);     
  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
}