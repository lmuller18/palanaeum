import invariant from 'tiny-invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'

import { requireUserId } from '~/jwt.server'

async function searchOpenLibrary(
  search: string,
): Promise<OpenLibrarySearchResponse> {
  const urlSearchParams = new URLSearchParams({
    mode: 'works',
    title: search,
  })

  return fetch(`http://openlibrary.org/search.json?${urlSearchParams}`)
    .then(res => res.json())
    .catch(() => null)
}

async function getOpenLibraryWork(
  workId: string,
): Promise<OpenLibraryWorkResponse> {
  return fetch(`http://openlibrary.org${workId}.json`).then(res => res.json())
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request)

  const search = new URL(request.url).searchParams.get('q')

  invariant(search, 'expected search params')

  const books = await searchOpenLibrary(search)

  if (!books?.docs?.length)
    throw new Response(null, { status: 404, statusText: 'Book not found' })

  const results = books.docs.map(b => b.key)

  const bookId = results[0]

  const book = await getOpenLibraryWork(bookId)

  if (!book?.covers)
    throw new Response(null, { status: 404, statusText: 'Book not found' })

  return json({
    covers: book.covers.map(
      c => `https://covers.openlibrary.org/b/id/${c}-M.jpg`,
    ),
  })
}

export interface OpenLibrarySearchResponse {
  numFound: number
  start: number
  numFoundExact: boolean
  docs: Doc[]
  num_found: number
  q: string
  offset: any
}

export interface Doc {
  author_alternative_name?: string[]
  author_key: string[]
  author_name: string[]
  contributor?: string[]
  cover_edition_key?: string
  cover_i?: number
  ddc?: string[]
  ebook_access: string
  ebook_count_i: number
  edition_count: number
  edition_key: string[]
  first_publish_year: number
  first_sentence?: string[]
  has_fulltext: boolean
  ia?: string[]
  ia_collection?: string[]
  ia_collection_s?: string
  isbn?: string[]
  key: string
  language?: string[]
  last_modified_i: number
  lcc?: string[]
  lccn?: string[]
  lending_edition_s?: string
  lending_identifier_s?: string
  number_of_pages_median?: number
  oclc?: string[]
  printdisabled_s?: string
  public_scan_b: boolean
  publish_date: string[]
  publish_place?: string[]
  publish_year: number[]
  publisher?: string[]
  seed: string[]
  title: string
  title_sort: string
  title_suggest: string
  type: string
  id_isfdb?: string[]
  id_amazon?: string[]
  id_librarything?: string[]
  id_goodreads?: string[]
  id_overdrive?: string[]
  id_dnb?: string[]
  subject?: string[]
  ia_loaded_id?: string[]
  ia_box_id?: string[]
  ratings_average?: number
  ratings_sortable?: number
  ratings_count?: number
  ratings_count_1?: number
  ratings_count_2?: number
  ratings_count_3?: number
  ratings_count_4?: number
  ratings_count_5?: number
  readinglog_count?: number
  want_to_read_count?: number
  currently_reading_count?: number
  already_read_count?: number
  publisher_facet?: string[]
  subject_facet?: string[]
  _version_: number
  lcc_sort?: string
  author_facet: string[]
  subject_key?: string[]
  ddc_sort?: string
  id_better_world_books?: string[]
  id_wikidata?: string[]
  person?: string[]
  place?: string[]
  person_key?: string[]
  place_key?: string[]
  person_facet?: string[]
  place_facet?: string[]
  time?: string[]
  time_facet?: string[]
  time_key?: string[]
  subtitle?: string
  id_google?: string[]
  id_ean?: string[]
}

export interface OpenLibraryWorkResponse {
  description: Description
  covers: number[]
  key: string
  authors: Author[]
  title: string
  subjects: string[]
  type: Type2
  latest_revision: number
  revision: number
  created: Created
  last_modified: LastModified
}

export interface Description {
  type: string
  value: string
}

export interface Author {
  type: Type
  author: Author2
}

export interface Type {
  key: string
}

export interface Author2 {
  key: string
}

export interface Type2 {
  key: string
}

export interface Created {
  type: string
  value: string
}

export interface LastModified {
  type: string
  value: string
}
