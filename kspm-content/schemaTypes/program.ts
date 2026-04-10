export default {
  name: 'program',
  title: 'Program',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'icon',
      title: 'Icon Name',
      type: 'string',
      description: 'Lucide icon name: BarChart3, TrendingUp, BookOpen, FileText',
      options: {
        list: [
          { title: 'Bar Chart (Market Analysis)', value: 'BarChart3' },
          { title: 'Trending Up (Investment)', value: 'TrendingUp' },
          { title: 'Book Open (Literacy)', value: 'BookOpen' },
          { title: 'File Text (Research)', value: 'FileText' },
        ]
      }
    },
    {
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of feature bullet points'
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number'
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'icon'
    }
  }
}