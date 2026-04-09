export default {
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    {
      name: 'title',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'slug',
      type: 'slug',
      options: { source: 'title' }
    },

    // 🔥 ADD THIS
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text'
    },

    // 🔥 ADD THIS
    {
      name: 'category',
      title: 'Category',
      type: 'string'
    },

    {
      name: 'coverImage',
      type: 'image'
    },
    {
      name: 'content',
      type: 'array',
      of: [{ type: 'block' }]
    },
    {
      name: 'publishedAt',
      type: 'datetime'
    }
  ]
}