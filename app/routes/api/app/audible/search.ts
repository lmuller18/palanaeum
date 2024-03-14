import { json, type LoaderFunctionArgs } from '@remix-run/node'

import { requireUserId } from '~/jwt.server'

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request)

  const search = new URL(request.url).searchParams.get('q')

  if (!search) throw new Response('Missing search param', { status: 400 })

  const urlSearchParams = new URLSearchParams({
    keywords: search,
    products_sort_by: 'Relevance',
    response_groups: 'media,contributors,series',
    image_sizes: '720',
    content_type: 'Product',
  })

  const url = `https://api.audible.com/1.0/catalog/products?${urlSearchParams}`
  // const urlSearchParams = new URLSearchParams({
  //   key_strokes: search,
  //   site_variant: 'desktop',
  // })
  // const url = `https://api.audible.com/1.0/searchsuggestions?${urlSearchParams}`

  const audibleResults = (await fetch(url).then(res =>
    res.json(),
  )) as AudibleSearchResult

  const products = audibleResults.products
    .filter(product => product.language === 'english')
    .map(product => ({
      id: product.asin,
      title: product.title,
      subtitle: product.subtitle,
      image: product.product_images?.[720] ?? '/images/no-cover.png',
      publishDate: product.release_date,
      authors: product.authors?.map(a => a.name) ?? ['Anonymous'],
      series:
        product.series?.map(s => ({
          id: s.asin,
          sequence: s.sequence,
          title: s.title,
          url: s.url,
        })) ?? null,
    }))

  return json({ products })
}

interface AudibleSearchResult {
  product_filters: any[]
  products: Product[]
  response_groups: string[]
  total_results: number
}

interface Product {
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
  series?: Series[]
  sku: string
  sku_lite: string
  social_media_images: SocialMediaImages
  thesaurus_subject_keywords: string[]
  title: string
  subtitle?: string
  voice_description?: string
}

interface Author {
  asin?: string
  name: string
}

interface AvailableCodec {
  enhanced_codec: string
  format: string
  is_kindle_enhanced: boolean
  name: string
}

interface Narrator {
  name: string
}

interface ProductImages {
  '720': string
}

interface Series {
  asin: string
  sequence?: string
  title: string
  url: string
}

interface SocialMediaImages {
  facebook: string
  ig_static_with_bg: string
  twitter: string
}
