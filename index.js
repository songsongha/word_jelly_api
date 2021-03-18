const app = require ('express')();
app.get("/", (req,res) => res.sendFile(__dirname + "/index.html"));
app.listen(9091, ()=> console.log("listening on http por 9091"));
const http = require('http');
const websocketServer = require('websocket').server;
const httpServer = http.createServer();
httpServer.listen(9090, () => console.log('Listening on port 9090'))

//an object to store all of the clients and their guid
const clients = {};
// an object to store all of the games that have been created
const games = {};
const wsServer = new websocketServer({
		"httpServer": httpServer
})

wsServer.on("request", request => {
	//connect
	const connection = request.accept(null, request.origin);
	connection.on("open", () => console.log('opened!'))
	connection.on("close", () => console.log("closed!"))
	connection.on("message", message => {
		const result = JSON.parse(message.utf8Data)
		//I have received a message from the client
		//a user wants to create a new game
		if (result.method === 'create'){
			const clientId = result.clientId
			const gameId = guid();
			//storeing game data by Id
			games[gameId] = {
				"id": gameId,
				"balls": 20,
				"clients": []
			}

			const payLoad = {
				"method": 'create',
				"game": games[gameId]
			}

			const con = clients[clientId].connection;
			con.send(JSON.stringify(payLoad));

		}
		// user wants to join a game
		if (result.method === 'join'){
			const clientId = result.clientId;
			const gameId = result.gameId;
			const game = games[gameId];
			console.log("joined game")

			if (game.clients.length >=3)
			{
				//sorry max players reached, need to send user some sort of message
				return;
			}

			// assign a color to player
			const color = {"0":"Red", "1":"Green", "2":"Blue"}[game.clients.length];
			game.clients.push({
				"clientId": clientId,
				"color": color
			})
			//start the game if 3 people have joined
			if(game.clients.length === 3) updateGameState();

			const payLoad = {
				"method": 'join',
				"game": game
			}

			//loop through all clients and tell them that people have joined
			game.clients.forEach(c=>{
				clients[c.clientId].connection.send(JSON.stringify(payLoad));
			})

		}

		//user wants to play
		if (result.method === 'play'){
			const clientId = result.clientId;
			const gameId = result.gameId;
			const ballId = result.ballId;

			let state = games[gameId].state;
			if (!state){
				state={};
			}
			state[ballId] = color;
			games[gameId].state = state;
			const game = games[gameId]

			const payLoad = {
				"method": 'play',
				"game": game

			}
		}

	})

	//generate a new clientId
	const clientId = guid();
	clients[clientId] = {
		"connection": connection
	}

	//sends response back to client
	const payLoad = {
		"method": "connect",
		"clientId": clientId
	}
	//send back the client connect
	connection.send(JSON.stringify(payLoad))

})

function updateGameState(){
	
	for (const g of Object.keys(games)){
		const game = games[g];
		const payLoad = {
				"method": 'update',
				"game": game
		}

		game.clients.forEach(c=>{
			client[c.clientId].connection.send(JSON.stringify(payLoad))
		})
	}
	setTimeout(updateGameState, 500);
}

const guid=()=> {
  const s4=()=> Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);     
  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
}