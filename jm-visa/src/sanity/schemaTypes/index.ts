import { type SchemaTypeDefinition } from 'sanity'

import { blockContentType } from './blockContentType'
// import {categoryType} from './categoryType'
import { postType } from './postType'
import { authorType } from './authorType'
import { tableOfContentsType } from './tableOfContentsType'

export const schema: { types: SchemaTypeDefinition[] } = {
  // The table type is provided by the @sanity/table plugin in sanity.config.ts,
  // so we avoid defining it here to prevent duplicate type errors.
  types: [blockContentType, postType, authorType, tableOfContentsType],
}
