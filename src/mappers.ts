import { CurrentUser } from '@textshq/platform-sdk'
import { TumblrUserInfo } from './types'
import { UNTITLED_BLOG } from './constants'

export const mapUserInfo = (user: TumblrUserInfo): CurrentUser => {
  const primaryBlog = user.blogs.find(({ primary }) => primary)
  const primaryBlogTitle = primaryBlog.title && primaryBlog.title !== UNTITLED_BLOG
    ? primaryBlog.title
    : user.name
  const avatarUrl = primaryBlog.avatar[0]?.url
  return {
    ...user,
    displayText: primaryBlogTitle,
    id: user.userUuid,
    username: user.name,
    email: user.email,
    fullName: user.name,
    nickname: user.name,
    imgURL: avatarUrl,
    isVerified: user.isEmailVerified,
    social: {
      coverImgURL: avatarUrl,
      website: primaryBlog.url,
      followers: {
        count: primaryBlog.followers,
      },
    },
  }
}
