import { PlatformInfo, MessageDeletionMode, Attribute } from '@textshq/platform-sdk'

const info: PlatformInfo = {
  name: 'tumblr',
  version: '0.0.1',
  tags: ['Beta'],
  displayName: 'Tumblr',
  icon: `<svg fill="none" height="128" viewBox="0 0 128 128" width="128" xmlns="http://www.w3.org/2000/svg">
  <g clip-rule="evenodd" fill-rule="evenodd">
    <rect x="0" y="0" width="128" height="128" fill="#001935" rx="30" ry="30"></rect>
    <path d="m69.0573 78.3786c0 5.7711 2.9121 7.771 7.5453 7.771h6.5745v14.6684h-12.4476c-11.2159 0-19.5687-5.771-19.5687-19.5824v-22.1047h-10.1799v-11.9748c11.2077-2.9141 15.898-12.5624 16.4364-20.9292h11.64v18.9865h13.5815v13.9175h-13.5815z" fill="#fff"/>
  </g>
</svg>`,
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
