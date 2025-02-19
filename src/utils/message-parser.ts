import { Message } from '~/models'
import { getImageSourceAsync } from '~/utils/dom-helper'

const getBackgroundColor = (el: HTMLElement): string => {
  return getComputedStyle(el).backgroundColor
}

const parseCommonElements = async (
  el: HTMLElement
): Promise<{
  message: string | undefined
  author: string | undefined
  authorType: string | undefined
  avatarUrl: string | undefined
}> => {
  const author = el.querySelector('#author-name')?.textContent ?? undefined
  const authorType = el.getAttribute('author-type') ?? undefined
  const avatorImage = el.querySelector('#img') as HTMLImageElement | null
  const avatarUrl =
    (avatorImage && (await getImageSourceAsync(avatorImage))) ?? undefined
  const message = el.querySelector('#message')?.textContent ?? undefined

  return { message, author, authorType, avatarUrl }
}

const parseTextMessage = async (
  el: HTMLElement
): Promise<{
  html: string | undefined
  messageType: string
  message: string | undefined
  author: string | undefined
  authorType: string | undefined
  avatarUrl: string | undefined
}> => {
  const params = await parseCommonElements(el)

  const html = el.querySelector('#message')?.innerHTML

  return {
    ...params,
    html,
    messageType: 'text-message',
  }
}

const parsePaidMessage = async (
  el: HTMLElement
): Promise<{
  html: string | undefined
  backgroundColor: string | undefined
  subText: string | undefined
  messageType: string
  message: string | undefined
  author: string | undefined
  authorType: string | undefined
  avatarUrl: string | undefined
}> => {
  const params = await parseCommonElements(el)

  const html = el.querySelector('#message')?.innerHTML
  const subText = el.querySelector('#purchase-amount')?.textContent ?? undefined
  const card = el.querySelector('#card > #header') as HTMLElement | null
  const backgroundColor = (card && getBackgroundColor(card)) ?? undefined

  return {
    ...params,
    html,
    backgroundColor,
    subText,
    messageType: 'paid-message',
  }
}

const parsePaidSticker = async (
  el: HTMLElement
): Promise<{
  stickerUrl: string | undefined
  backgroundColor: string | undefined
  subText: string
  messageType: string
  message: string | undefined
  author: string | undefined
  authorType: string | undefined
  avatarUrl: string | undefined
}> => {
  const params = await parseCommonElements(el)

  const subText = el.querySelector('#purchase-amount-chip')?.textContent ?? ''
  const card = el.querySelector('#card') as HTMLElement | null
  const backgroundColor = (card && getBackgroundColor(card)) ?? undefined
  const stickerImage = el.querySelector(
    '#sticker > #img'
  ) as HTMLImageElement | null
  const stickerUrl =
    (stickerImage && (await getImageSourceAsync(stickerImage))) ?? undefined

  return {
    ...params,
    stickerUrl,
    backgroundColor,
    subText,
    messageType: 'paid-sticker',
  }
}

const parseMembershipItem = async (
  el: HTMLElement
): Promise<{
  html: string | undefined
  backgroundColor: string | undefined
  messageType: string
  message: string | undefined
  author: string | undefined
  authorType: string | undefined
  avatarUrl: string | undefined
}> => {
  const params = await parseCommonElements(el)

  const detailText =
    el.querySelector('#header-subtext')?.textContent ?? undefined
  const header = el.querySelector('#card > #header') as HTMLElement | null
  const backgroundColor = (header && getBackgroundColor(header)) ?? undefined

  return {
    ...params,
    html: detailText,
    backgroundColor,
    messageType: 'membership-item',
  }
}

export const parse = async (el: HTMLElement): Promise<Message | undefined> => {
  const tagName = el.tagName.toLowerCase()
  switch (tagName) {
    case 'yt-live-chat-text-message-renderer':
      return await parseTextMessage(el)
    case 'yt-live-chat-paid-message-renderer':
      return await parsePaidMessage(el)
    case 'yt-live-chat-paid-sticker-renderer':
      return await parsePaidSticker(el)
    case 'yt-live-chat-membership-item-renderer':
      return await parseMembershipItem(el)
  }
}
