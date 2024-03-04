import { json, type LoaderFunctionArgs } from '@remix-run/node'
import cuid from 'cuid'
import invariant from 'tiny-invariant'

import { requireUserId } from '~/jwt.server'

async function getChapters(asin: string): Promise<AudibleContentResponse> {
  const urlSearchParams = new URLSearchParams({
    response_groups: 'chapter_info',
  })

  return fetch(
    `https://api.audible.com/1.0/content/${asin}/metadata?${urlSearchParams}`,
  ).then(res => res.json())
}

async function getDetails(asin: string): Promise<AudibleDetailsResponse> {
  const urlSearchParams = new URLSearchParams({
    response_groups: 'contributors,media',
    image_sizes: '720',
  })

  return fetch(
    `https://api.audible.com/1.0/catalog/products/${asin}?${urlSearchParams}`,
  ).then(res => res.json())
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request)
  invariant(params.bookId, 'expected book id')

  const [chapters, details] = await Promise.all([
    getChapters(params.bookId),
    getDetails(params.bookId),
  ])

  const audibleCover = details.product.product_images?.[720]
  const cover = audibleCover
    ? `/soulcast/${encodeURI(audibleCover)}`
    : '/images/no-cover.png'

  return json({
    book: {
      chapters:
        chapters?.content_metadata?.chapter_info.chapters.map(c => {
          return {
            id: cuid(),
            ...c,
          }
        }) ?? [],
      id: details.product.asin,
      title: details.product.title,
      subtitle: details.product.subtitle,
      description: details.product.merchandising_summary,
      image: cover,
      publishDate: details.product.release_date,
      authors: details.product.authors.map(a => a.name),
    },
  })
}

interface AudibleContentResponse {
  content_metadata: ContentMetadata
  response_groups: string[]
}

interface ContentMetadata {
  chapter_info: ChapterInfo
}

interface ChapterInfo {
  brandIntroDurationMs: number
  brandOutroDurationMs: number
  chapters: Chapter[]
  is_accurate: boolean
  runtime_length_ms: number
  runtime_length_sec: number
}

interface Chapter {
  length_ms: number
  start_offset_ms: number
  start_offset_sec: number
  title: string
}

export interface AudibleDetailsResponse {
  product: Product
  response_groups: string[]
}

export interface Product {
  asin: string
  authors: Author[]
  available_codecs: AvailableCodec[]
  content_delivery_type: string
  content_type: string
  format_type: string
  has_children: boolean
  is_adult_product: boolean
  is_listenable: boolean
  is_purchasability_suppressed: boolean
  is_vvab: boolean
  issue_date: string
  language: string
  merchandising_summary: string
  narrators: Narrator[]
  product_images: ProductImages
  publication_datetime: string
  publication_name: string
  publisher_name: string
  release_date: string
  runtime_length_min: number
  sku: string
  sku_lite: string
  social_media_images: SocialMediaImages
  thesaurus_subject_keywords: string[]
  title: string
  subtitle?: string
}

export interface Author {
  asin: string
  name: string
}

export interface AvailableCodec {
  enhanced_codec: string
  format: string
  is_kindle_enhanced: boolean
  name: string
}

export interface Narrator {
  name: string
}

export interface ProductImages {
  '720': string
}

export interface SocialMediaImages {
  facebook: string
  ig_static_with_bg: string
  twitter: string
}
