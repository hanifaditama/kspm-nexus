export default {
  name: 'team',
  title: 'Team Member',
  type: 'document',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'role', type: 'string' },
    { name: 'photo', type: 'image' },
    { name: 'bio', type: 'text' }
  ]
}