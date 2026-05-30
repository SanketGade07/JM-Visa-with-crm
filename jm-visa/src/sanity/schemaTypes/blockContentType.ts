import { defineType, defineArrayMember, defineField } from 'sanity'
import { ImageIcon } from '@sanity/icons'

/**
 * This is the schema type for block content used in the post document type
 * Importing this type into the studio configuration's `schema` property
 * lets you reuse it in other document types with:
 *  {
 *    name: 'someName',
 *    title: 'Some title',
 *    type: 'blockContent'
 *  }
 */

export const blockContentType = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      // Styles let you define what blocks can be marked up as. The default
      // set corresponds with HTML tags, but you can set any title or value
      // you want, and decide how you want to deal with it where you want to
      // use your content.
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [{ title: 'Bullet', value: 'bullet' }],
      // Marks let you mark up inline text in the Portable Text Editor
      marks: {
        // Decorators usually describe a single property – e.g. a typographic
        // preference or highlighting
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
        ],
        // Annotations can be any object structure – e.g. a link or a footnote.
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
            ],
          },
        ],
      },
    }),
    // You can add additional types here. Note that you can't use
    // primitive types such as 'string' and 'number' in the same array
    // as a block type.
    defineArrayMember({
      type: 'image',
      icon: ImageIcon,
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        }
      ]
    }),
    // Table of Contents block
    defineArrayMember({
      type: 'tableOfContents',
      name: 'tableOfContents',
      title: 'Table of Contents',
    }),
    // Existing Table block (KEEPING THIS FOR BACKWARDS COMPATIBILITY)
    defineArrayMember({
      type: 'table',
      name: 'table',
      title: '🚫 Legacy Table (Do Not Use)',
      // We remove the custom input component to avoid crashes on old tables
      // components: {
      //   input: require('../components/TablePasteInput').TablePasteInput,
      // },
    }),
    // NEW: Markdown Table block - stores as markdown string (Paste Supported)
    defineArrayMember({
      type: 'object',
      name: 'markdownTable',
      title: 'Table (Paste Supported)',
      icon: () => '📊',
      fields: [
        defineField({
          name: 'tableContent',
          title: 'Table Content',
          type: 'markdown',
          components: {
            input: require('../components/MarkdownTableInput').MarkdownTableInput,
          },
        }),
      ],
      preview: {
        select: {
          content: 'tableContent',
        },
        prepare({ content }) {
          // Count rows from markdown
          const lines = (content || '').split('\n').filter((l: string) => l.trim() && !l.includes('---'));
          const rowCount = lines.length;
          return {
            title: `Table (${rowCount} rows)`,
            subtitle: lines[0]?.substring(0, 50) || 'Empty table',
          };
        },
      },
    }),
    // YouTube embed block
    defineArrayMember({
      type: 'object',
      name: 'youtube',
      title: 'YouTube Video',
      fields: [
        {
          name: 'url',
          type: 'url',
          title: 'YouTube Video URL',
        },
        {
          name: 'thumbnail',
          type: 'image',
          title: 'Custom Thumbnail',
        },
      ],
    }),
  ],
})
