import { MessageID, PaginationArg, ThreadID } from '@textshq/platform-sdk'
import { findLastReadMessageID } from '../mappers'

interface TumblrState {
  threads: {
    [key: ThreadID]: TumblrThread
  }
}

interface TumblrThread {
  messageIDs: MessageID[]
  lastReadTs: number
}

const state: TumblrState = {
  threads: {},
}

const emptyThread: TumblrThread = {
  messageIDs: [],
  lastReadTs: 0,
}

export const getThread = (id: ThreadID): TumblrThread => {
  const thread = state.threads[id]
  if (thread) {
    return thread
  }
  state.threads[id] = emptyThread
  return state.threads[id]
}

export const getThreadIDs = (): ThreadID[] => Object.keys(state.threads)

const updateThreadMessageIDs = (id: ThreadID, messageIDs: MessageID[]) => {
  const thread = getThread(id)
  state.threads[id] = {
    ...thread,
    messageIDs: messageIDs.slice(0).sort((a, b) => (a === b ? 0 : a > b ? 1 : -1)),
  }
}

export const addThreadMessageIDs = (id: ThreadID, messageIDs: MessageID[]) => {
  const thread = getThread(id)
  const newMessageIDs = messageIDs.filter(messageID => !thread.messageIDs.includes(messageID))
  updateThreadMessageIDs(id, [...thread.messageIDs, ...newMessageIDs])

  return newMessageIDs
}

export const updateThreadLastReadTs = (id: ThreadID, conversation?: { lastReadTs?: number }) => {
  const { lastReadTs } = conversation || {}
  if (!lastReadTs) {
    return
  }
  const thread = getThread(id)
  state.threads[id] = {
    ...thread,
    lastReadTs,
  }
}

export const getThreadLastReadMessageID = (id: ThreadID): MessageID => {
  const thread = getThread(id)
  return findLastReadMessageID(thread.messageIDs, thread.lastReadTs)
}

export const getThreadUnreadCount = (id: ThreadID): number => {
  const thread = getThread(id)
  if (!thread.messageIDs.length) {
    return 0
  }
  const lastReadMessageID = getThreadLastReadMessageID(id)
  const lastReadMessageIDIndex = thread.messageIDs.findIndex(messageID => messageID === lastReadMessageID)
  if (lastReadMessageIDIndex === -1) {
    return thread.messageIDs.length
  }
  return thread.messageIDs.slice(lastReadMessageIDIndex + 1).length
}
