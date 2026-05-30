import { defineType, defineField } from 'sanity'
import { DocumentIcon } from '@sanity/icons'

export const tableOfContentsType = defineType({
  name: 'tableOfContents',
  title: 'Table of Contents',
  type: 'object',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'IN THIS ARTICLE',
      description: 'The title displayed above the table of contents'
    }),
    defineField({
      name: 'showInlineTOC',
      title: 'Show Inline TOC',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle to show/hide the inline table of contents'
    }),
    defineField({
      name: 'excludedHeadings',
      title: 'Select Headings to Show/Hide',
      type: 'array',
      description: 'Toggle headings on/off for the Table of Contents',
      of: [{ type: 'string' }],
      components: {
        input: require('../components/HeadingSelector').HeadingSelector,
      },
    }),
    defineField({
      name: 'includeFAQSection',
      title: 'Include FAQ Section',
      type: 'boolean',
      initialValue: false,
      description: 'Include FAQ section in the table of contents'
    }),
    defineField({
      name: 'faqSectionTitle',
      title: 'FAQ Section Title',
      type: 'string',
      initialValue: 'FAQ Section',
      description: 'Title for the FAQ section in TOC',
      hidden: ({ parent }) => !parent?.includeFAQSection
    })
  ],
  preview: {
    select: {
      title: 'title',
      showInlineTOC: 'showInlineTOC'
    },
    prepare({ title, showInlineTOC }) {
      return {
        title: title || 'Table of Contents',
        subtitle: showInlineTOC ? 'Visible' : 'Hidden',
        media: DocumentIcon
      }
    }
  }
})