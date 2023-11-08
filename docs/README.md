# Messaging API Specification

## Table of Contents

- [Concepts](#concepts)
- [Error Subcodes](#error-subcodes)
- [Methods](#methods)
  - [Lookup Conversations (Inbox)](#lookup-conversations-inbox)
  - [Participant Typeahead Lookup](#participant-typeahead-lookup)
  - [Participant Info](#participant-info)
  - [Lookup Unread Count](#lookup-unread-count)
  - [Lookup Messages (Conversation)](#lookup-messages-conversation)
  - [Sending a Message](#sending-a-message)
  - [Delete a Conversation](#delete-a-conversation)
  - [Flag a Conversation](#flag-a-conversation)
- [Objects](#objects)

## Concepts

A conversation can be uniquely identified in two ways:

- `conversation_id : Integer` - The value received in the `id` field in a Conversation object
- `participants : Array<BlogIdentifier>` - The blogs involved in the conversation.

Either format can be used for a request, but `conversation_id` should be preferred if available. It
is more performant, and the blogs involved in a conversation may change over time, so it is not a
stable identifier.

A `BlogIdentifier` can be either a blog's hostname or UUID. They can be mixed within a single
request. Hostname is not a stable identifier, so UUID should be preferred if available. Hostnames
must include a `.`, or will otherwise be interpreted as a UUID.

## Error Subcodes

Starting in Spring 2016, we can now surface error "subcodes" alongside the normal HTTP status error codes (4xx-5xx). They look like this:

```JSON
{
    "meta": {
        "msg": "Forbidden",
        "status": 403
    },
    "response": {},
    "errors": [
        {
            "code": 7001,
            "title": "Forbidden",
            "detail": "Requesting user must verify their email address before starting new conversations."
        }
    ]
}
```

Note the inclusion of the `errors` top-level key. This'll contain an array of any applicable errors. Each error object's `code` field is considered a "subcode" of the larger HTTP status code. These subcodes are to help inform the client application why the error is being thrown, and show special UI when applicable.

- `403.7001` means you are forbidden from executing the current action because you have an unverified email address.
- `403.7002` means you are forbidden from executing the current action because the other blog only allows messages from blogs _they follow_.
- `403.7003` means you are forbidden from executing the current action because the other blog only allows messages from blogs _they follow_ but for **web only**.

This list of subcodes will expand as new ones are added. See the individual methods listed before for how these subcodes are implemented and which client versions are compatible with them. Older versions of the clients will expect alternate status codes from before subcodes were supported.

## Methods

### Lookup Conversations (Inbox)

Get a listing of conversations for the requesting user's primary blog, or a specified blog.

Only conversations that the requesting user is a member of will be in the response.

Polling currently occurs:

- Every 15 seconds on web if inbox popover is open (using `/services/poll`). Based on the response, if the current inbox has new unreads, we make a call to `/svc/conversations` to fetch the actual conversations
- Every 5 seconds on iOS when push notifications are disabled, doesn't poll at all with notifications enabled.
- Every 1 second on Android when inside the conversation view; when outside, this interval increases by ^2 until 60 seconds when nothing new is retrieved.

#### Request

`GET /conversations`

- `participant : BlogIdentifier` (optional) - If omitted, the user's primary tumblelog is assumed
- `limit : Integer` (optional) - Max number of conversations to return; default 20, max 20.
- `before : Integer` (optional) - Timestamp to start returning conversations from, in
  reverse-cronological order
- `after : Integer` (optional) - Timestamp to start returning conversations from, in chronological
  order

**Example requests:**

Fetching inbox for primary blog:

    GET /conversations

Fetching inbox for a specific blog:

    GET /conversations?participant=cyle.tumblr.com

Fetching inbox for a specific blog, limiting to 5, last updated before timestamp 1442945692:

    GET /conversations?participant=cyle.tumblr.com&limit=5&before=1442945692

Fetching inbox for a specific blog, limiting to 5, last updated after timestamp 1442793600:

    GET /conversations?participant=cyle.tumblr.com&limit=5&after=1442793600

#### Response

`200` status code

- `data : Array<Conversation>` - List of standard conversation objects, but with only the most recent message in each
- `_links : Links` - Standard links object, for paginating conversations

**Example response:**

```JSON
{
    "meta": {
        "msg": "OK",
        "status": 200
    },
    "response": {
        "conversations": [
            {
                "can_send": true,
                "id": "311",
                "last_modified_ts": 1442944484,
                "last_read_ts": 1442944484,
                "messages": {
                    "data": [
                        { "latest message object here" }
                    ]
                },
                "object_type": "conversation",
                "participants": [
                    { "participant object here" },
                    { "participant object here" }
                ],
                "status": "ACTIVE"
            },
            { "... etc ..." }
        ]
    },
    "_links": {
        "next": {
            "href": "/svc/conversations?participant=cyle.tumblr.com&_=1442945756733&before=1442342209",
            "method": "GET",
            "query_params": {
                "_": "1442945756733",
                "before": "1442342209",
                "participant": "cyle.tumblr.com"
            }
        }
    }
}
```

#### Errors

- `404` - One of the requested blogs does not exist or does not have messaging enabled.

---

### Participant Typeahead Lookup

For starting a new conversation, this endpoint provides autocomplete results as the user types.

#### Request

`GET /conversations/participant_suggestions`

- `participant : BlogIdentifier` (optional) - If omitted, the requesting user's primary tumblelog is assumed
- `q : String` (optional) - The query as typed by the user so far; if omitted or 0-length, endpoint returns your "favorites"
- `limit : Integer` (optional) - Limit the amount of results returned. Default is 5, minimum is 1, maximum is 20.
- `include_recent : Boolean` (optional) - Whether or not the returned list should include the most recent blogs that the user has had conversations with. Default is false. Cannot be used with `recent_follows_only`.
- `recent_follows_only : Boolean` (optional) - Whether or not the returned list should include only the participant's most recently followed blogs. Default is false. Cannot be used with `include_recent`.
- `exclude_active : Boolean` (optional) - Whether or not the returned list should exclude suggestions that the participant has an active conversation with (meaning that the conversation exists and service has marked the conversation as `ACTIVE`). Default is false.

**Example requests:**

Fetching the zero-length results ("favorites") for the user's primary blog:

    GET /conversations/participant_suggestions

Fetching the zero-length results ("favorites") for a specific blog:

    GET /conversations/participant_suggestions?participant=cyle.tumblr.com

Fetching results for query "aguy" for the user's primary blog:

    GET /conversations/participant_suggestions?q=aguy

Fetching results for query "aguy" for a specific blog, limiting to 1 result:

    GET /conversations/participant_suggestions?participant=cyle.tumblr.com&q=aguy&limit=1

Fetching results for most recent talked blogs:

    GET /conversations/participant_suggestions?participant=cyle.tumblr.com&include_recent=true

Fetching results for most recently followed blogs:

    GET /conversations/participant_suggestions?participant=cyle.tumblr.com&recent_follows_only=true

Fetching results for suggestions that exclude suggestions with an active conversation with the participant:

    GET /conversations/participant_suggestions?participant=cyle.tumblr.com&exclude_active=true

#### Response

`200` status code

- `blogs : Array<Participant>` - List of standard participant objects; like `APIFormat::blog_info()` but with fewer fields

**Example response:**

```JSON
{
    "meta": {
        "msg": "OK",
        "status": 200
    },
    "response": {
        "blogs": [
            { "participant object here" },
            { "participant object here" }
        ]
    }
}
```

#### Errors

This should never return an error, as it operates with defaults if no parameters are given.

---

### Participant Info

Retrieve detailed information about a given conversation participant. This info is a little more customized than what you'd find in the standard blog info.

#### Request

`GET /conversations/participant_info`

- `participant : BlogIdentifier` - Requester's blog who is participating in the conversation
- `q : BlogIdentifier` - The blog you want info for
- `filter : String` (optional) - A comma-separated list of fields to return, default is to return everything

**Example request:**

Getting participant info for the given participant and query:

    GET /conversations/participant_info?participant=cyle.tumblr.com&q=coulton.tumblr.com

Getting participant info, but only the `mutual_tags`, for the given query:

    GET /conversations/participant_info?participant=cyle.tumblr.com&q=coulton.tumblr.com&filter=mutual_tags

#### Response

`200` status code

- `is_blog_following_you : boolean` - Whether or not the queried blog follows the requesting participant
- `is_following_blog : boolean` - Whether or not the requesting user follows the queried blog
- `duration_blog_following_you: int` - The duration in seconds for how long the queried blog has been following the requesting participant; or this key won't be present at all if they aren't following the requesting participant
- `duration_following_blog: int` - The duration in seconds for how long the requesting participant has been following the queried blog; or this key won't be present at all if the requesting participant isn't following them
- `blog_tags : Array<String>` - A list of tags that the queried blog commonly uses

Not used yet, but for future planning:

- `mutual_tags : Array<String>` - A list of tags that the queried blog and the requesting participant both use
- `mutual_follows : Array<String>` - A list of blog names that the queried blog and the requesting participant both follow

**Example response:**

```JSON
{
    "meta": {
        "msg": "OK",
        "status": 200
    },
    "response": {
        "is_blog_following_you": true,
        "is_following_blog": false,
        "duration_blog_following_you": 3600,
        "blog_tags": [ "coffins", "dead", "me" ],
        "mutual_tags": [ "me" ], // not used yet; for future planning only
        "mutual_follows": [ "guyfieri", "shahkashani" ] // not used yet; for future planning only
    }
}
```

#### Errors

- `400` - You forgot to send along a participant or query.
- `404` - The requested blog does not exist.

---

### Lookup Unread Count

Get a count of how many of your conversations have unread messages.

Proposed polling TBD.

#### Request

`GET /conversations/unread_messages_count`

- `participant : BlogIdentifier` (optional) - Which blog's inbox to check. If omitted, check all of the current user's blogs' inboxes.

**Example request:**

Fetching unread message counts for all of the requesting user's blogs:

    GET /conversations/unread_messages_count

Fetching unread message counts for the specified blog:

    GET /conversations/unread_messages_count?participant=cyle.tumblr.com

#### Response

`200` status code

- `unread_messages_count : { BlogIdentifier : { Conversation ID : Unread count } }` - An object containing unread message count objects per blog, per conversation. At the top level, the object will have blog UUID keys. Within each blog UUID key, objects will have conversation ID keys. The values for the conversation ID keys represent the number of unread messages for that conversation. If the unread count for a conversation is 0, it will be omitted. If the blog has no unread messages, it will be omitted. Accordingly, the response may be completely empty (not even containing the `unread_messages_count` key) if there are no unread messages in any conversations for any blogs.

**Example responses:**

Several blogs have unread messages:

```JSON
{
  "meta": {
    "status": 200,
    "msg": "OK"
  },
  "response": {
    "unread_messages_count": {
      "ianboardapp.tumblr.com": {
        "1073": 1
      },
      "cyle-oh-okay.tumblr.com": {
        "998": 2
      }
    }
  }
}
```

One blog has a unread messages:

```JSON
{
  "meta": {
    "status": 200,
    "msg": "OK"
  },
  "response": {
    "unread_messages_count": {
      "ianboardapp.tumblr.com": {
        "1073": 1
      }
    }
  }
}
```

No blogs have unread messages:

```JSON
{
  "meta": {
    "status": 200,
    "msg": "OK"
  },
  "response": {}
}
```

#### Errors

- `403` - You are not a member of the specified participant blog.
- `404` - The specified participant blog cannot be found.

---

### Lookup Messages (Conversation)

Get messages for a specific conversation.

Polling currently occurs:

- Every 2 seconds on web if conversation is open (using `/services/poll`). Based on the response, if the current conversation has new unreads, we make a call to `/svc/conversations/messages` to fetch the actual messages
- Every 5 seconds on iOS when push notifications are disabled, doesn't poll at all with notifications enabled.
- Every 1 second on Android when inside the conversation view; when outside, this interval increases by ^2 until 60 seconds when nothing new is retrieved.

#### Request

`GET /conversations/messages`

- `conversation_id : Integer` or `participants : Array<BlogIdentifier>` - Conversation identifier
- `participant : BlogIdentifier` - If omitted, the user's primary tumblelog is assumed
- `message_id : Integer` (optional) - Message identifier
- `limit : Integer` (optional) - Number of messages to return; default 20, max 20.
- `before : Integer` (optional) - Timestamp or Message ID to start returning messages from, in
  reverse-chronological order.
- `after : Integer` (optional) - Timestamp or Message ID to start returning messages from, in
  chronological order.

**Example requests:**

Fetching a conversation by ID for a participant:

    GET /conversations/messages?conversation_id=311&participant=cyle.tumblr.com

Fetching a conversation by ID for a participant, limiting to the 5 most recent messages:

    GET /conversations/messages?conversation_id=311&participant=cyle.tumblr.com&limit=5

Fetching a conversation by ID for a participant, limiting to the 5 most recent messages before timestamp 1442342209:

    GET /conversations/messages?conversation_id=311&participant=cyle.tumblr.com&limit=5&before=1442342209

Fetching a conversation between two participants, via the specified participant:

    GET /conversations/messages?participant=cyle.tumblr.com&participants[]=cyle.tumblr.com&participants[]=shahkashani.tumblr.com

Fetching a specific message for a given conversation ID:

    GET /conversations/messages?conversation_id=311&participant=cyle.tumblr.com&message_id=14827819

#### Response

`200` status code

- `data : Conversation` - Standard conversation object

**Example response:**

```JSON
{
    "meta": {
        "msg": "OK",
        "status": 200
    },
    "response": {
        "can_send": true,
        "id": "1073",
        "last_modified_ts": 1442947454,
        "last_read_ts": 1442947643,
        "messages": {
            "data": [
                { "message object here" },
                { "message object here" },
            ]
        },
        "object_type": "conversation",
        "participants": [
            { "participant object here" },
			{ "participant object here" }
        ],
        "status": "ACTIVE"
    }
}
```

##### Errors

- `400` - You did not send a participants list or a conversation ID.
- `403` - The participant blog making the request is not a participant of the requested conversation.
- `403` - (App version < 6.1 only) You need to verify your email address before you can use messaging.
- `403.7001` - (App version >= 6.1 only) You need to verify your email address before you can use messaging.
- `403.7002` - (App version >= 6.4 only) You need to follow the other participant blog to message them; should only happen on new conversation.
- `403.7003` - (Web only) You need to follow the other participant blog to message them; should only happen on new conversation.
- `404` - The requested conversation does not exist.
- `428` - (App version < 6.4 only) The blog you are trying to send to does not follow you, and has the follows-only toggle enabled.
- `429` - You have reached the limit of starting new conversations; only happens in place of a `404`.

---

### Sending a Message

Add a new message to a conversation. The conversation will be created if it does not yet exist.

#### Request

`POST /conversations/messages`

**Note:** The following parameters must be sent as form data, not as URL querystring params.

General:

- `conversation_id : Integer` or `participants : Array<BlogIdentifier>` - Conversation identifier
- `participant : BlogIdentifier` - Blog to send the message from
- `type : String` - The message type: `"text"`, `"postref"`, `"image"`, or `"sticker"`

Text-related (required only for `type=text`):

- `message : String` - The content of the message (html-entity encoded)

Post-related (required only for `type=postref`)

- `post[id] : Integer` - ID of the post to include in the message
- `post[blog] : BlogIdentifier` - The blog that the post ID belongs to.
- `context : String` (optional) - The context of where the post is sent from, either `post-chrome`, `fast-post-chrome`, or `messaging-gif`

Image-related (required only for `type=image`)

- The request must be `multipart/form-data` encoded
- `data : File` - The file being uploaded

Sticker-related (required only for `type=sticker`)

- `sticker_id : Integer` - ID of the sticker being sent

**Example requests:**

All of the examples below are fired at this endpoint:

    POST /conversations/messages
    Content-Type: application/x-www-form-urlencoded
    Content-Length: [POST body size]

Except for image sending, which requires `Content-Type: multipart/form-data`

And each one of these examples is the POST body.

Posting a "hey" text message to a conversation by ID for a specified participant:

    conversation_id=311&participant=cyle.tumblr.com&type=text&message=hey

Posting a "cool app" text message to a conversation by participants for a specified participant:

    participants[0]=cyle.tumblr.com&participants[1]=ianboardapp.tumblr.com&participant=cyle.tumblr.com&type=text&message=cool%20app

Posting a post reference to a conversation by ID for a specified participant:

    conversation_id=311&participant=cyle.tumblr.com&type=postref&post[id]=12345678&post[blog]=ianboardapp.tumblr.com

#### Response

`201` status code

- `data : Conversation` - Standard conversation object

**Example response:**

Returns the same result as "Lookup Messages", but updated with the latest messages.

##### Errors

- `401` - Not Authorized error caused by a malformed request, most likely. One of your POST keys might be wrong.
- `403` - You are not a member of any of the participant blogs.
- `403` - The requesting participant blog is not a member of the conversation.
- `403` - Including blogs that you do not have permission to view.
- `403` - You do not have permission to include the post in the request.
- `403` - You are sending a blacklisted message/post.
- `403` - (App version < 6.1 only) You need to verify your email address before you can use messaging.
- `403.7001` - (App version >= 6.1 only) You need to verify your email address before you can use messaging.
- `403.7002` - (App version >= 6.4 only) The blog you are trying to send to does not follow you, and has the follows-only toggle enabled.
- `403.7003` - (Web only) The blog you are trying to send to does not follow you, and has the follows-only toggle enabled.
- `404` - The requested conversation does not exist.
- `404` - One of the specified blogs cannot be found.
- `404` - The requested post does not exist, or does not belong to the specified blog.
- `428` - (App version < 6.4 only) The blog you are trying to send to does not follow you, and has the follows-only toggle enabled.
- `429` - Rate limit exceeded either for sending individual messages or starting new conversations.

---

### Batch-Sending a Message

Add a new, single message to multiple conversations at once. The conversations will be created if they do not yet exist.

Note: You can only send a message to a maximum of 5 conversations in one request.

Also note: This is NOT available on the web `/svc/` routes, this is only available via the `/v2/` API routes.

#### Request

`POST /conversations/messages/batch`

**Note:** The following parameters must be sent as form data, not as URL querystring params.

General:

- `conversations : array` - Conversation identifiers, each must have either a `conversation_id` or `participants` array, similar to the regular message sending endpoint.
- `participant : BlogIdentifier` - Blog to send the message from
- `type : String` - The message type: `"text"` or `"postref"`

Text-related (required only for `type=text`):

- `message : String` - The content of the message (html-entity encoded)

Post-related (required only for `type=postref`)

- `post[id] : Integer` - ID of the post to include in the message
- `post[blog] : BlogIdentifier` - The blog that the post ID belongs to.
- `context : String` (optional) - The context of where the post is sent from, either `post-chrome`, `fast-post-chrome`, or `messaging-gif`

Image and sticker messages are not supported in batch sending.

**Example requests:**

All of the examples below are fired at this endpoint:

    POST /conversations/messages/batch
    Content-Type: application/x-www-form-urlencoded
    Content-Length: [POST body size]

And each one of these examples is the POST body.

Posting a "hey" text message to two conversations by ID for a specified participant:

    conversations[0][conversation_id]=311&conversations[1][conversation_id]=312&participant=cyle.tumblr.com&type=text&message=hey

Posting a "cool app" text message to one conversation by participants for a specified participant:

    conversations[0]participants[0]=cyle.tumblr.com&conversations[0]participants[1]=ianboardapp.tumblr.com&participant=cyle.tumblr.com&type=text&message=cool%20app

Posting a post reference to two conversations by ID for a specified participant:

    conversations[0][conversation_id]=311&conversations[1][conversation_id]=312&participant=cyle.tumblr.com&type=postref&post[id]=12345678&post[blog]=ianboardapp.tumblr.com

#### Response

`200` status code

- `data : Conversation[]` - An array of the affected conversation objects

**Example response:**

Returns the same result as "Lookup Messages", but updated with the latest messages.

##### Errors

- `401` - Not Authorized error caused by a malformed request, most likely. One of your POST keys might be wrong.
- `403` - You are not a member of any of the participant blogs.
- `403` - The requesting participant blog is not a member of the conversation.
- `403` - Including blogs that you do not have permission to view.
- `403` - You do not have permission to include the post in the request.
- `403` - You are sending a blacklisted message/post.
- `403` - (App version < 6.1 only) You need to verify your email address before you can use messaging.
- `403.7001` - (App version >= 6.1 only) You need to verify your email address before you can use messaging.
- `403.7002` - (App version >= 6.4 only) The blog you are trying to send to does not follow you, and has the follows-only toggle enabled.
- `404` - The requested conversation does not exist.
- `404` - One of the specified blogs cannot be found.
- `404` - The requested post does not exist, or does not belong to the specified blog.
- `428` - (App version < 6.4 only) The blog you are trying to send to does not follow you, and has the follows-only toggle enabled.
- `429` - Rate limit exceeded either for sending individual messages or starting new conversations.

---

### Delete a Conversation

"Delete" a conversation. The conversation can be restarted by the person doing the deleting, and it'll be restarted if the other person sends a message.

This effectively "resets" the chat history for the person doing the deleting, so they won't see old messages in the conversation.

#### Request

`DELETE /conversations/messages`

- `conversation_id : Integer` - ID of the conversation
- `participant : BlogIdentifier` - Blog whose inbox to delete the conversation from

**Example request:**

Deleting a conversation by ID for the specified participant:

    DELETE /conversations/messages?conversation_id=311&participant=cyle.tumblr.com

#### Response

`200` status code

**Example response:**

```JSON
{
    "meta": {
        "msg": "OK",
        "status": 200
    },
    "response": []
}
```

#### Errors

- `400` - You forgot to send along a conversation ID and/or participant.
- `403` - The requesting blog is not of participant of the requested conversation.
- `404` - The requested conversation does not exist.

---

### Flag a Conversation

"Flag" a conversation. Depending on the given `type`, this will modify a conversation's state for the requesting user/blog.

Supported values for `type` are `spam` and `unblur`.

Flagging with `type=spam` will delete the conversation, block the other participant, and trigger a log entry for later tracking.

Flagging with `type=unblur` will set an ephemeral state on the given conversation for the given participant so that when they load the conversation again, the IMAGE-type messages will remain unblurred. Users see blurred IMAGE-type messages when they receive IMAGE-type messages from blogs they don't follow.

#### Request

`POST /conversations/flag`

- `conversation_id : Integer` - ID of the conversation
- `participant : BlogIdentifier` - Blog whose inbox to delete the conversation from
- `type : String` (optional) - The type of flagging to do, `spam` is the default, `unblur` is also supported.
- `context : String` (optional) - The context of where the flagging is happening, either `inline` (default) or `menu`

**Example request:**

Flagging a conversation by ID as spam for the specified participant:

    POST /conversations/flag
    conversation_id=311&participant=cyle.tumblr.com&type=spam&context=inline

Flagging a conversation by ID as unblurred for the specified participant:

    POST /conversations/flag
    conversation_id=311&participant=cyle.tumblr.com&type=unblur&context=inline

#### Response

`200` status code

**Example response:**

```JSON
{
    "meta": {
        "msg": "OK",
        "status": 200
    },
    "response": []
}
```

#### Errors

- `400` - You forgot to send along a conversation ID and/or participant.
- `400` - You provided an invalid flagging type.
- `403` - The requesting blog is not of participant of the requested conversation.
- `404` - The requested conversation does not exist.

## Objects

### Conversation

- `object_type : String` - `"conversation"`
- `id : Integer` - ID of the conversation
- `status : String` - Your state in the conversation: `"active"` or `"inactive"`
- `last_modified_ts : Integer` - Most recent message timestamp (Will include join/parts, if they exist)
- `last_read_ts : Integer` - Timestamp of the last read message in the conversation from the perspective of the participant who sent the request
- `unread_messages_count : Integer` - How many unread messages are within this conversation for the requesting participant.
- `can_send : Boolean` - Whether or not the requesting participant can send any messages to this conversation (the other blog may be suspended, private, etc).
- `is_possible_spam : Boolean` - Whether or not the conversation is possible spam.
- `is_blurred_images : Boolean` - Whether or not the conversation UI should blur IMAGE messages sent from the other participant.
- `participants['data'] : Array<Blog>` - List of standard blog objects
- `messages['data'] : Array<Message>` - List of standard message objects; reverse-cron
- `messages['_links'] : Links` - Standard links object, for paginating messages

### Message

- `object_type : String` - `"message"`
- `id : Integer` - ID of the message
- `type : String` - The message type: `"TEXT"` or `"POSTREF"` or `"IMAGE"`
- `ts : Integer` - Creation timestamp
- `participant : BlogIdentifier` - Sender of the message
- `unread : Boolean` - Read-status for the requesting user

Text Specific Properties:

- `content['text'] : String` - Plaintext message
- `content['formatting'] : Array<TextFormattingRange>` - Formatting to be applied to plaintext message; ordered chronologically based on start index

Post Specific Properties:

- `post : Post` - Standard APIFormat `Post` object

Image/Sticker Specific Properties:

- `images : Array` - Standard APIFormat `photos`-type array, containing:
  - `images[0] : Object` - Standard `photo`-type object with the following properties:
    - `images[0]['alt_sizes'] : Array` - Alternate sizes of the image; each is a standard `image` object with `url`, `width`, and `height` keys.
    - `images[0]['original_size'] : Object` - Original size version of the image; a standard `image` object with `url`, `width`, and `height` keys.

### Participant (from typeahead)

- `key : String` - (deprecated) The unique blog identifier.
- `uuid : String` - The unique blog identifier.
- `name : String` - The name of the blog.
- `title : String` - The title of the blog.
- `url : String` - The URL of the blog.
- `avatar_url : String` - The avatar URL for the blog.
- `theme : Object` - The theme parameters of the blog.
- `tags : Array<String>` - The list of tags on the blog.

### Participant (full, from conversation)

All of the above, also the typical information found in `APIFormat::blog_info()`.

### TextFormattingRange

- `type : String` - The formatting type (e.g. `"link"`); see below for supported types
- `position[0] : Integer` - Start index (inclusive, referring to `content['text']`) of formatting
- `position[1] : Integer` - End index (exclusive, referring to `content['text']`) of formatting
- `attributes : Object` - Additional attributes (specific to formatting type, see below for more detail)

#### type: link

- `attributes['url'] : String` - URL of the link (fully normalized with protocol)
- `attributes['blog_name'] : String` (optional) - Blog name, if the URL is a Tumblr URL
- `attributes['post_id'] : String` (optional) -  Post ID, if the URL is a Tumblr URL and contains a post ID
- `attributes['messaging_blog_name'] : String` (optional) - Blog name, if the URL is a Tumblr Conversation URL (/message/blogname)

To extract `blog_name` and `post_id`, we currently support the following formats:

- Tumblr domain URLs (blogname.tumblr.com)
- CNAME URLs (blogname.domain.com)
- Tiny URLs (tmblr.co/Z)
