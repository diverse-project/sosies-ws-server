### Sosies WebSocket Server

WebSocket gateway with a dummy protocol to share data across different clients  

> :warning: Work in progress



## Protocol
**All messages must be JSON objects**

### Client to Server "/"
This is the protocol handles by the server for clients who connect to the route `/`  
`var client = new WebSocket('ws://host:port/');`
#### Register
Register yourself as a new client by giving an ID
```js
{
  "type": "REGISTER",
  "id": "yourId"
}
```
Send new data to the server. Those data will be broadcasted to all connected `/viz` clients.
#### Data
```js
{
  "type": "DATA",
  "data": <any_json_serializable_value>
}
```

### Client to Server "/viz"
This is the protocol handles by the server for clients who connect to the route `/viz`  
`var client = new WebSocket('ws://host:port/viz');`
#### All Data
Ask the server to give the current data of all clients connected to `/`
```js
{
  "type": "ALL_DATA",
}
```

### Server to Client "/"
*nothing*

### Server to Client "/viz"
#### Data
Message you get when a `/` client sends data to the server
```js
{
  "type": "DATA",
  "id": "idOfTheClientWhoSentTheData",
  "data": <the_data_of_client>
}
```
#### All Data
This is the answer you get when a `/viz` client ask for `ALL_DATA`
```js
{
  "type": "ALL_DATA",
  "clients": array<client> // with client:  { id: 'theId', data: <theData> }
}
```
#### Close
Message you get as a `/viz` when a `/` disconnects from the server
```js
{
  "type": "CLOSE",
  "id": "idOfTheDisconnectedClient"
}
```
