import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: 'bdlvgv6o',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(client)
export function urlFor(source: any) {
  return builder.image(source)
}

// ─── Articles ────────────────────────────────────────────────────────────────

export async function getArticles() {
  return client.fetch(`
    *[_type == "article"] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      category,
      publishedAt,
      author,
      "mainImage": coverImage.asset->url
    }
  `)
}

export async function getArticleBySlug(slug: string) {
  return client.fetch(`
    *[_type == "article" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      category,
      publishedAt,
      author,
      "mainImage": coverImage.asset->url,
      content
    }
  `, { slug })
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function getEvents() {
  return client.fetch(`
    *[_type == "event"] | order(date asc) {
      _id,
      title,
      "slug": slug.current,
      type,
      date,
      time,
      location,
      description,
      "image": image.asset->url
    }
  `)
}

// ─── Team ────────────────────────────────────────────────────────────────────

export async function getTeam() {
  return client.fetch(`
    *[_type == "team"] | order(order asc, name asc) {
      _id,
      name,
      role,
      division,
      linkedin,
      bio,
      "image": photo.asset->url
    }
  `)
}

// ─── Programs ────────────────────────────────────────────────────────────────

export async function getPrograms() {
  return client.fetch(`
    *[_type == "program"] | order(order asc) {
      _id,
      title,
      description,
      icon,
      features,
      "image": image.asset->url
    }
  `)
}