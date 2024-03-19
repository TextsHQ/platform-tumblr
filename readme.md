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
- The `token` comes from the [List Messages](#list-messages) request. Even though we do get a unique token with each request to list messages, we only need a single websocket connection to listen to updates for all the threads.
- Once the WebSocket connection is established, we need to subscribe to the events for each thread that we are interested in.
- In order to keep the connection alive, we need to dispatch "ping" messages in the WebSocket every 30 seconds.

### Message ID

- Messages in Tumblr does not have an ID attached to them. What they hav is a `ts` property which is a unix timestamp string. We use this property as an ID.

### New Messages (Unread Messages)

- The thread/conversation object comes with a `lastReadTs` property which is a number of _seconds_ since the epoch time. We use it to determine which messages were read/unread.
- There is an endpoint, `GET /user/counts`, that fetches information about the unread messages counts. We only get the number of unread messages per conversation/thread.
- We keep track of messages that we have already fetched and the count of unread messages. If we detect that the unread count from `GET /user/counts` is different than what we have locally, we fetch new messages and merge them to local state.
