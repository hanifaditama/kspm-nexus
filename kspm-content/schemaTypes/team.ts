export default {
  name: 'team',
  title: 'Team Member',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'role',
      title: 'Role / Position',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'division',
      title: 'Division',
      type: 'string',
      options: {
        list: [
          { title: 'Board', value: 'Board' },
          { title: 'Research', value: 'Research' },
          { title: 'Event', value: 'Event' },
          { title: 'CMP', value: 'CMP' },
        ]
      }
    },
    {
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'text'
    },
    {
      name: 'linkedin',
      title: 'LinkedIn URL',
      type: 'url'
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower number = appears first'
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'photo'
    }
  }
}