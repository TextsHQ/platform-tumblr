import { Message, MessageID, ThreadID } from '@textshq/platform-sdk'
import { findLastReadMessageID } from '../mappers'

interface TumblrState {
  threads: {
    [key: ThreadID]: TumblrThread
  }
}

interface TumblrThread {
  messages: TumblrMessage[]
  lastReadTs: number
}

type TumblrMessage = Pick<Message, 'id' | 'isSender'>

const state: TumblrState = {
  threads: {},
}

const emptyThread: TumblrThread = {
  messages: [],
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

const updateThreadMessageIDs = (id: ThreadID, messages: TumblrMessage[]) => {
  const thread = getThread(id)
  state.threads[id] = {
    ...thread,
    messages: messages.slice(0).sort(({ id: a }, { id: b }) => (a === b ? 0 : a > b ? 1 : -1)),
  }
}

export const addThreadMessageIDs = (id: ThreadID, messages: TumblrMessage[]): TumblrMessage[] => {
  const thread = getThread(id)
  const newMessages = messages.filter(m => thread.messages.findIndex(tm => m.id === tm.id) === -1)
  updateThreadMessageIDs(id, [...thread.messages, ...newMessages])

  return newMessages
}

export const updateThreadLastReadTs = (id: ThreadID, conversation?: { lastReadTs: number }) => {
  const { lastReadTs } = conversation || { lastReadTs: Number(`${Date.now()}`.slice(0, -3)) }
  const thread = getThread(id)
  state.threads[id] = {
    ...thread,
    lastReadTs,
  }
}

export const getThreadLastReadMessageID = (id: ThreadID): MessageID => {
  const thread = getThread(id)
  return findLastReadMessageID(thread.messages.map(m => m.id), thread.lastReadTs)
}

export const getThreadUnreadCount = (id: ThreadID): number => {
  const thread = getThread(id)
  if (!thread.messages.length) {
    return 0
  }
  const lastReadMessageID = getThreadLastReadMessageID(id)
  const lastReadMessageIDIndex = thread.messages.findIndex(m => m.id === lastReadMessageID)
  const messages = lastReadMessageIDIndex === -1
    ? thread.messages
    : thread.messages.slice(lastReadMessageIDIndex + 1)

  return messages.filter(m => !m.isSender).length
}
