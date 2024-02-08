# platform-tumblr

## Conversations (aka Threads)

### Limitations

- There is only 1:1 chats in Tumblr
- There is no support for stickers

### List Threads

- We get list of threads by making an HTTP `GET` request to `/conversations`

### List Messages

- We get messages by making an HTTP `GET` request to `/conversations/messages`
- We get a list of messages for a thread. But also a `token` that is used to establish a websocket connection that allows us to listen to new messages in conversations.

### Sending a Message

- To send a message we need to make an HTTP `POST` request to `/conversations/messages`
- Messages are not sent via websocket

### Receiving a Message

- We establish a WebSocket connection at `wss://telegraph.srvcs.tumblr.com/socket?token=${token}`
- The `token` comes from the [List Messages](#list-messages) request.
- Once the WebSocket connection is established, we need to subscribe to the events for each thread that we are interested in.
- In order to keep the connection alive, we need to dispatch "ping" messages in the WebSocket every 30 seconds.
