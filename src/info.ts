import { PlatformInfo, MessageDeletionMode, Attribute } from '@textshq/platform-sdk'

const info: PlatformInfo = {
  name: 'tumblr',
  version: '0.0.1',
  tags: ['Beta'],
  displayName: 'Tumblr',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16">
  <rect width="16" height="16" fill="#001935" rx="5"/>
  <path fill="#fff" fill-rule="evenodd" d="M8.632 9.797c0 .722.364.972.943.972h.822v1.833H8.841c-1.402 0-2.446-.721-2.446-2.448V7.391H5.123V5.894c1.4-.364 1.987-1.57 2.054-2.616h1.455v2.374h1.698v1.74H8.632v2.405Z" clip-rule="evenodd"/>
  </svg>`,
  brand: {
    background: '#001935',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48">
    <path fill="black" fill-rule="evenodd" d="M25.896 29.392c0 2.164 1.092 2.914 2.83 2.914h2.465v5.5h-4.668c-4.206 0-7.338-2.163-7.338-7.343v-8.289h-3.817v-4.49c4.203-1.093 5.961-4.712 6.163-7.849h4.365v7.12h5.093v5.219h-5.093v7.218Z" clip-rule="evenodd"/>
    </svg>`,
  },
  deletionMode: MessageDeletionMode.UNSUPPORTED,
  attributes: new Set([
    Attribute.CANNOT_MESSAGE_SELF,
    Attribute.NO_SUPPORT_DUPLICATE_GROUP_CREATION,
    Attribute.NO_SUPPORT_GROUP_ADD_PARTICIPANT,
    Attribute.NO_SUPPORT_GROUP_REMOVE_PARTICIPANT,
    Attribute.NO_SUPPORT_GROUP_THREAD_CREATION,
    Attribute.NO_SUPPORT_TYPING_INDICATOR,
    Attribute.NO_SUPPORT_GROUP_TITLE_CHANGE,
    Attribute.NO_SUPPORT_GROUP_REMOVE_PARTICIPANT,
    Attribute.SUBSCRIBE_TO_THREAD_SELECTION,
    Attribute.SINGLE_THREAD_CREATION_REQUIRES_MESSAGE,
    Attribute.SUPPORTS_REPORT_THREAD,
    Attribute.CAN_FETCH_LINK_PREVIEW,
    Attribute.CAN_REMOVE_LINK_PREVIEW,
    Attribute.SUPPORTS_DELETE_THREAD,
  ]),
  loginMode: 'browser',
  browserLogins: [
    {
      url: 'https://texts.com/api/tumblr/auth/start',
      runJSOnClose: 'window.tumblrLoginResult',
      // When user denies the OAuth access to Texts.com the auth flow simply
      // redirects to tumblr.com. We close if we detect that redirect.
      // eslint-disable-next-line no-useless-escape
      closeOnRedirectRegex: '^http(s):\/\/(www\.)tumblr\.com(\/)$',
      runJSOnNavigate: `
      try {
        const iframe = document.createElement('iframe')
        document.head.append(iframe)
        const i = setInterval(() => {
          const t = iframe.contentWindow.localStorage['tumblr-login-result']
          if (t) {
            window.tumblrLoginResult = t
            clearInterval(i)
            setTimeout(() => window.close(), 500)
          }
        }, 200)
      } finally {}
    `,
      // hide the header, the mobile app badges and the Sign Up link
      runJSOnLaunch: `
        try {
          document.querySelector('header').parentElement.style.display = "none";
          document.querySelector('[data-app-type="apple"]').parentElement.parentElement.style.display = "none";
          document.querySelector('a[href^="/register"]').parentElement.style.display = "none";
        } catch {}
      `,
    },
  ],
  reactions: {
    supported: {},
    canReactWithAllEmojis: false,
    allowsMultipleReactionsToSingleMessage: false,
  },
  attachments: {
    noSupportForVideo: true,
    noSupportForAudio: true,
    noSupportForFiles: true,
    gifMimeType: 'image/gif',
  },
}

export default info
