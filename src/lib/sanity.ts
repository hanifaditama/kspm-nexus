export async function getArticles() {
  return await client.fetch(`*[_type == "article"]{
    _id,
    title,
    "slug": slug.current,
    excerpt,
    category,
    publishedAt,
    "author": {
      "name": "Admin"
    }
  } | order(publishedAt desc)`)
}