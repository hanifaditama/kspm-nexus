import { client } from './sanity'

export async function getPosts() {
  const query = `*[_type == "post"]{
    _id,
    title,
    slug,
    mainImage,
    publishedAt
  }`

  const data = await client.fetch(query)
  return data
}