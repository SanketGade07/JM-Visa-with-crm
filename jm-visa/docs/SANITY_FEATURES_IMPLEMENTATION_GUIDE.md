# Sanity Studio: TOC & Table Features Implementation Guide

**Purpose:** This guide provides complete instructions to add two powerful features to any Sanity Studio blog:
1. **Dynamic Table of Contents** with heading exclusion control
2. **Enhanced Table Input** with paste, edit, and inline editing capabilities

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Feature 1: Dynamic TOC with Heading Exclusion](#feature-1-dynamic-toc-with-heading-exclusion)
- [Feature 2: Enhanced Table Paste & Edit](#feature-2-enhanced-table-paste--edit)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Your Sanity project should have:
- Sanity Studio v3+
- A blog post schema with `blockContent` type
- React-based frontend for rendering blog posts
- `@sanity/ui` and `@sanity/icons` packages installed

---

## Feature 1: Dynamic TOC with Heading Exclusion

### Overview
Allows authors to selectively exclude specific headings from the Table of Contents using a visual toggle interface in Sanity Studio.

### Architecture

```
Sanity Studio (Backend)
├── tableOfContentsType.ts    → Schema with excludedHeadings field
├── HeadingSelector.tsx        → Custom input for selecting headings to hide
└── blockContentType.ts        → Includes TOC in allowed blocks

Frontend
├── TableOfContents.jsx        → Renders TOC with filtering
└── page.js                    → Blog page that passes excludedHeadings
```

### Step 1: Create Table of Contents Schema

**File:** `src/sanity/schemaTypes/tableOfContentsType.ts`

```typescript
import { defineType } from 'sanity';

export const tableOfContentsType = defineType({
  name: 'tableOfContents',
  title: 'Table of Contents',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Table of Contents',
    },
    {
      name: 'showInline',
      title: 'Show Inline (in article)',
      type: 'boolean',
      description: 'Display TOC within the article content',
      initialValue: true,
    },
    {
      name: 'includeFAQ',
      title: 'Include FAQ Section',
      type: 'boolean',
      description: 'Add FAQ section link in TOC',
      initialValue: true,
    },
    {
      name: 'faqTitle',
      title: 'FAQ Section Title',
      type: 'string',
      initialValue: 'Frequently Asked Questions',
      hidden: ({ parent }) => !parent?.includeFAQ,
    },
    {
      name: 'excludedHeadings',
      title: 'Hidden Headings',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Select which headings to hide from the Table of Contents',
      components: {
        input: require('../components/HeadingSelector').HeadingSelector,
      },
    },
  ],
  preview: {
    select: {
      title: 'title',
      showInline: 'showInline',
    },
    prepare({ title, showInline }) {
      return {
        title: title || 'Table of Contents',
        subtitle: showInline ? 'Inline' : 'Sidebar',
      };
    },
  },
});
```

### Step 2: Create Heading Selector Component

**File:** `src/sanity/components/HeadingSelector.tsx`

```typescript
import React, { useMemo } from 'react';
import { Stack, Card, Text, Button, Flex, Switch, Box } from '@sanity/ui';
import { set, unset, useFormValue } from 'sanity';

export function HeadingSelector(props) {
  const { value = [], onChange } = props;
  
  // Access the entire document to get all headings
  const document = useFormValue([]) as any;
  
  // Extract all H1-H6 headings from the document body
  const allHeadings = useMemo(() => {
    if (!document?.body) return [];
    
    const headings: Array<{ text: string; style: string; level: number }> = [];
    
    document.body.forEach((block: any) => {
      if (block._type === 'block' && block.style && /^h[1-6]$/.test(block.style)) {
        // Extract text from children
        const text = block.children
          ?.filter((child: any) => child._type === 'span')
          .map((child: any) => child.text)
          .join('') || '';
        
        if (text.trim()) {
          headings.push({
            text: text.trim(),
            style: block.style,
            level: parseInt(block.style.replace('h', '')),
          });
        }
      }
    });
    
    return headings;
  }, [document?.body]);

  const handleToggle = (headingText: string) => {
    const currentValue = value || [];
    const isExcluded = currentValue.includes(headingText);
    
    if (isExcluded) {
      // Remove from excluded list
      const newValue = currentValue.filter((h: string) => h !== headingText);
      onChange(newValue.length > 0 ? set(newValue) : unset());
    } else {
      // Add to excluded list
      onChange(set([...currentValue, headingText]));
    }
  };

  const handleShowAll = () => {
    onChange(unset());
  };

  const handleHideAll = () => {
    onChange(set(allHeadings.map(h => h.text)));
  };

  if (allHeadings.length === 0) {
    return (
      <Card padding={4} tone="transparent" border radius={2}>
        <Text size={1} muted>
          No headings found in the document. Add some H1-H6 headings to your content first.
        </Text>
      </Card>
    );
  }

  const excludedCount = value?.length || 0;
  const visibleCount = allHeadings.length - excludedCount;

  return (
    <Stack space={3}>
      {/* Summary Card */}
      <Card padding={3} tone="primary" radius={2}>
        <Flex justify="space-between" align="center">
          <Text size={1} weight="semibold">
            📊 {allHeadings.length} headings • {visibleCount} visible • {excludedCount} hidden
          </Text>
          <Flex gap={2}>
            <Button text="Show All" onClick={handleShowAll} mode="ghost" fontSize={1} />
            <Button text="Hide All" onClick={handleHideAll} mode="ghost" fontSize={1} />
          </Flex>
        </Flex>
      </Card>

      {/* Headings List */}
      <Stack space={2}>
        {allHeadings.map((heading, index) => {
          const isExcluded = value?.includes(heading.text) || false;
          const borderColor = isExcluded ? '#ef4444' : '#10b981';
          
          return (
            <Card
              key={`${heading.text}-${index}`}
              padding={3}
              radius={2}
              tone="transparent"
              border
              style={{ borderLeft: `4px solid ${borderColor}` }}
            >
              <Flex align="center" justify="space-between" gap={3}>
                <Box flex={1}>
                  <Flex align="center" gap={2}>
                    <Text size={0} muted style={{ minWidth: '30px' }}>
                      {heading.style.toUpperCase()}
                    </Text>
                    <Text
                      size={1}
                      weight={heading.level <= 2 ? 'semibold' : 'regular'}
                      style={{
                        paddingLeft: `${(heading.level - 1) * 12}px`,
                        opacity: isExcluded ? 0.5 : 1,
                        textDecoration: isExcluded ? 'line-through' : 'none',
                      }}
                    >
                      {heading.text}
                    </Text>
                  </Flex>
                </Box>
                <Flex align="center" gap={2}>
                  <Text size={1} weight="medium" style={{ color: borderColor }}>
                    {isExcluded ? 'HIDDEN' : 'VISIBLE'}
                  </Text>
                  <Switch
                    checked={!isExcluded}
                    onChange={() => handleToggle(heading.text)}
                  />
                </Flex>
              </Flex>
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
}
```

### Step 3: Add TOC to Block Content Schema

**File:** `src/sanity/schemaTypes/blockContentType.ts`

```typescript
import { defineArrayMember, defineType } from 'sanity';

export const blockContentType = defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [{ title: 'Bullet', value: 'bullet' }],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
    }),
    defineArrayMember({
      type: 'table',
    }),
    defineArrayMember({
      type: 'tableOfContents',  // ← ADD THIS
    }),
  ],
});
```

### Step 4: Frontend TableOfContents Component

**File:** `src/components/blog/TableOfContents.jsx`

```jsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function TableOfContents({ 
  title = "Table of Contents", 
  includeFAQ = false, 
  faqTitle = "FAQ",
  excludedHeadings = []  // ← NEW PROP
}) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const articleHeadings = Array.from(
      document.querySelectorAll('.article-blog h1, .article-blog h2, .article-blog h3, .article-blog h4')
    );

    const headingsData = articleHeadings
      .filter((heading) => {
        const text = heading.textContent?.trim() || '';
        // Filter out excluded headings
        return !excludedHeadings.includes(text);
      })
      .map((heading) => {
        let id = heading.id;
        if (!id) {
          id = heading.textContent?.trim().toLowerCase().replace(/\s+/g, '-') || '';
          heading.id = id;
        }
        return {
          id,
          text: heading.textContent?.trim() || '',
          level: parseInt(heading.tagName.substring(1)),
        };
      });

    setHeadings(headingsData);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    articleHeadings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [excludedHeadings]);  // ← Re-run when excludedHeadings changes

  if (headings.length === 0 && !includeFAQ) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      <nav>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <motion.li
              key={heading.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
            >
              <a
                href={`#${heading.id}`}
                className={`block py-1 text-sm transition-colors ${
                  activeId === heading.id
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                {heading.text}
              </a>
            </motion.li>
          ))}
          {includeFAQ && (
            <motion.li
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <a
                href="#faq-section"
                className={`block py-1 text-sm transition-colors ${
                  activeId === 'faq-section'
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                {faqTitle}
              </a>
            </motion.li>
          )}
        </ul>
      </nav>
    </div>
  );
}
```

### Step 5: Update Blog Page to Pass excludedHeadings

**File:** `src/app/(home)/blog/[slug]/page.js`

```javascript
const portableTextComponents = {
  types: {
    image: ({ value }) => (
      <div className="my-8">
        <Image
          src={urlFor(value).url()}
          alt={value.alt || 'Blog image'}
          width={800}
          height={450}
          className="rounded-lg"
        />
      </div>
    ),
    tableOfContents: ({ value }) => (
      <TableOfContents
        title={value.title}
        includeFAQ={value.includeFAQ}
        faqTitle={value.faqTitle}
        excludedHeadings={value.excludedHeadings || []}  // ← PASS THIS
      />
    ),
    // ... other types
  },
};
```

---

## Feature 2: Enhanced Table Paste & Edit

### Overview
Allows pasting tables from ChatGPT, Perplexity, Excel, or websites with automatic parsing, inline cell editing, and row management.

### Step 1: Create Table Schema

**File:** `src/sanity/schemaTypes/tableType.ts`

```typescript
import { defineType } from 'sanity';

export const tableType = defineType({
  name: 'table',
  title: 'Table',
  type: 'object',
  fields: [
    {
      name: 'rows',
      title: 'Table Rows',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'tableRow',
          fields: [
            {
              name: 'cells',
              title: 'Cells',
              type: 'array',
              of: [{ type: 'string' }],
            },
          ],
        },
      ],
    },
  ],
  components: {
    input: require('../components/TablePasteInput').TablePasteInput,
  },
  preview: {
    select: {
      rows: 'rows',
    },
    prepare({ rows }) {
      const rowCount = rows?.length || 0;
      const colCount = rows?.[0]?.cells?.length || 0;
      return {
        title: 'Table',
        subtitle: `${rowCount} rows × ${colCount} columns`,
      };
    },
  },
});
```

### Step 2: Create TablePasteInput Component

**File:** `src/sanity/components/TablePasteInput.tsx`

> [!IMPORTANT]
> This is a large component. See the complete code in the section below.

```typescript
import React, { useState, useCallback } from 'react';
import { Stack, Card, Text, Button, Box, Flex, TextArea } from '@sanity/ui';
import { set, unset } from 'sanity';
import { ClipboardIcon, TrashIcon, EditIcon } from '@sanity/icons';

function generateKey() {
    return `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function TablePasteInput(props) {
    const { value, onChange } = props;
    const [pasteText, setPasteText] = useState('');
    const [showPasteArea, setShowPasteArea] = useState(false);
    const [editingCell, setEditingCell] = useState<{ row: number, col: number } | null>(null);
    const [editValue, setEditValue] = useState('');
    const [parseError, setParseError] = useState<string | null>(null);

    const parseTable = useCallback((text: string) => {
        if (!text.trim()) return null;
        setParseError(null);

        try {
            let lines = text.trim().split('\n').map(line => line.trim()).filter(line => line);
            if (lines.length === 0) return null;

            const isMarkdown = lines[0].startsWith('|');
            let delimiter = '\t';

            if (isMarkdown) {
                lines = lines.filter(line => {
                    const cleaned = line.replace(/\|/g, '').trim();
                    return !(/^[-–—\s]+$/.test(cleaned));
                });
                delimiter = '|';
            } else if (lines[0].includes('\t')) {
                delimiter = '\t';
            } else if (lines[0].includes(',')) {
                delimiter = ',';
            }

            const rows = lines.map((line) => {
                let cells: string[];
                if (delimiter === '|') {
                    cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
                } else {
                    cells = line.split(delimiter).map(cell => cell.trim());
                }
                return { _key: generateKey(), cells };
            });

            const validRows = rows.filter(row => row.cells.length > 0);
            if (validRows.length === 0) {
                setParseError('No valid rows found');
                return null;
            }

            const maxColumns = Math.max(...validRows.map(row => row.cells.length));
            const normalizedRows = validRows.map(row => ({
                _key: row._key,
                cells: [...row.cells, ...Array(maxColumns - row.cells.length).fill('')]
            }));

            return { _type: 'table', rows: normalizedRows };
        } catch (error) {
            setParseError('Failed to parse table');
            return null;
        }
    }, []);

    const handlePaste = useCallback(() => {
        const parsedTable = parseTable(pasteText);
        if (parsedTable) {
            onChange(set(parsedTable));
            setPasteText('');
            setShowPasteArea(false);
        }
    }, [pasteText, parseTable, onChange]);

    const handleQuickPaste = useCallback(async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            const parsedTable = parseTable(clipboardText);
            if (parsedTable) {
                onChange(set(parsedTable));
            } else {
                setPasteText(clipboardText);
                setShowPasteArea(true);
            }
        } catch (err) {
            setShowPasteArea(true);
        }
    }, [parseTable, onChange]);

    const handleCellClick = useCallback((rowIdx: number, colIdx: number, currentValue: string) => {
        setEditingCell({ row: rowIdx, col: colIdx });
        setEditValue(currentValue);
    }, []);

    const handleCellSave = useCallback(() => {
        if (!editingCell || !value) return;
        const newRows = [...value.rows];
        newRows[editingCell.row].cells[editingCell.col] = editValue;
        onChange(set({ _type: 'table', ...value, rows: newRows }));
        setEditingCell(null);
        setEditValue('');
    }, [editingCell, editValue, value, onChange]);

    const handleCellCancel = useCallback(() => {
        setEditingCell(null);
        setEditValue('');
    }, []);

    const handleAddRow = useCallback(() => {
        if (!value || !value.rows || value.rows.length === 0) return;
        const columnCount = value.rows[0].cells.length;
        const newRow = { _key: generateKey(), cells: Array(columnCount).fill('') };
        onChange(set({ _type: 'table', ...value, rows: [...value.rows, newRow] }));
    }, [value, onChange]);

    const handleDeleteRow = useCallback((rowIdx: number) => {
        if (!value || !value.rows) return;
        const newRows = value.rows.filter((_, idx) => idx !== rowIdx);
        if (newRows.length === 0) {
            onChange(unset());
        } else {
            onChange(set({ _type: 'table', ...value, rows: newRows }));
        }
    }, [value, onChange]);

    const handleFixKeys = useCallback(() => {
        if (!value || !value.rows) return;
        const fixedRows = value.rows.map(row => ({ ...row, _key: row._key || generateKey() }));
        onChange(set({ _type: 'table', ...value, rows: fixedRows }));
    }, [value, onChange]);

    const hasMissingKeys = value?.rows?.some(row => !row._key) || !value?._type;

    return (
        <Stack space={3}>
            {hasMissingKeys && (
                <Card padding={3} tone="caution">
                    <Flex align="center" justify="space-between">
                        <Text size={1}>⚠️ Table has validation issues</Text>
                        <Button text="Fix Table Issues" tone="primary" onClick={handleFixKeys} fontSize={1} />
                    </Flex>
                </Card>
            )}

            <Flex gap={2} wrap="wrap">
                <Button icon={ClipboardIcon} text="Quick Paste" tone="primary" onClick={handleQuickPaste} />
                {value && (
                    <>
                        <Button icon={EditIcon} text="Add Row" tone="positive" onClick={handleAddRow} mode="ghost" />
                        <Button icon={TrashIcon} text="Clear" tone="critical" onClick={() => onChange(unset())} mode="ghost" />
                    </>
                )}
                <Button text={showPasteArea ? "Hide" : "Manual Paste"} onClick={() => setShowPasteArea(!showPasteArea)} mode="ghost" />
            </Flex>

            {parseError && <Card padding={3} tone="critical"><Text size={1}>⚠️ {parseError}</Text></Card>}

            {showPasteArea && (
                <Card padding={3} tone="primary">
                    <Stack space={3}>
                        <TextArea
                            value={pasteText}
                            onChange={(e) => setPasteText(e.currentTarget.value)}
                            placeholder="Paste table here (Markdown, CSV, TSV)..."
                            rows={10}
                        />
                        <Flex gap={2}>
                            <Button text="Parse & Insert" tone="positive" onClick={handlePaste} disabled={!pasteText.trim()} />
                            <Button text="Cancel" mode="ghost" onClick={() => { setShowPasteArea(false); setPasteText(''); }} />
                        </Flex>
                    </Stack>
                </Card>
            )}

            {value && value.rows && value.rows.length > 0 && (
                <Card padding={3} border>
                    <Stack space={2}>
                        <Text size={1} weight="semibold">
                            ✓ Table ({value.rows.length} rows × {value.rows[0]?.cells?.length || 0} cols)
                        </Text>
                        <Box style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#2276fc', color: 'white' }}>
                                        {value.rows[0]?.cells?.map((cell: string, idx: number) => (
                                            <th key={idx} style={{ padding: '10px', border: '1px solid #ccc', cursor: 'pointer' }} onClick={() => handleCellClick(0, idx, cell)}>
                                                {editingCell?.row === 0 && editingCell?.col === idx ? (
                                                    <input
                                                        type="text"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleCellSave();
                                                            if (e.key === 'Escape') handleCellCancel();
                                                        }}
                                                        autoFocus
                                                        style={{ padding: '6px', border: '2px solid yellow', borderRadius: '4px', width: '100%' }}
                                                    />
                                                ) : (cell || '(empty)')}
                                            </th>
                                        ))}
                                        <th style={{ padding: '10px', width: '70px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {value.rows.slice(1).map((row: any, rowIdx: number) => (
                                        <tr key={row._key || rowIdx}>
                                            {row.cells?.map((cell: string, cellIdx: number) => (
                                                <td key={cellIdx} style={{ padding: '10px', border: '1px solid #ccc', cursor: 'pointer' }} onClick={() => handleCellClick(rowIdx + 1, cellIdx, cell)}>
                                                    {editingCell?.row === rowIdx + 1 && editingCell?.col === cellIdx ? (
                                                        <input
                                                            type="text"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleCellSave();
                                                                if (e.key === 'Escape') handleCellCancel();
                                                            }}
                                                            autoFocus
                                                            style={{ padding: '6px', border: '2px solid blue', borderRadius: '4px', width: '100%' }}
                                                        />
                                                    ) : (cell || '(empty)')}
                                                </td>
                                            ))}
                                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                                <button onClick={() => handleDeleteRow(rowIdx + 1)} style={{ background: '#fee', color: '#c00', padding: '4px 8px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>
                    </Stack>
                </Card>
            )}
        </Stack>
    );
}
```

### Step 3: Register Schemas

**File:** `src/sanity/schemaTypes/index.ts`

```typescript
import { tableOfContentsType } from './tableOfContentsType';
import { tableType } from './tableType';
import { blockContentType } from './blockContentType';

export const schemaTypes = [
  blockContentType,
  tableOfContentsType,
  tableType,
  // ... other types
];
```

---

## Testing

### TOC Feature
1. Create a blog post in Sanity Studio
2. Add a TOC block
3. Add several headings (H1-H4)
4. Open the TOC block settings
5. Toggle headings on/off
6. Publish and check the frontend

### Table Feature
1. Copy a table from ChatGPT/Excel
2. Click "Quick Paste from Clipboard"
3. Table appears instantly
4. Click any cell to edit
5. Press Enter to save, Escape to cancel
6. Test "Add Row" and delete row buttons

---

## Troubleshooting

### TOC Not Updating
- **Issue:** Heading changes don't appear
- **Fix:** Click out of the TOC block and back in to refresh

### Table Validation Errors
- **Issue:** "missing type name" error
- **Fix:** Click "Fix Table Issues" button

### Clipboard Permission Denied
- **Issue:** Quick paste doesn't work
- **Fix:** Use "Manual Paste" instead

---

## Summary

You now have:
✅ Dynamic TOC with visual heading exclusion control  
✅ Enhanced table paste from any source  
✅ Inline cell editing  
✅ Row management (add/delete)  
✅ Automatic key generation and validation

## File Checklist

Ensure you have created/modified these files:

**Sanity Studio:**
- [ ] `src/sanity/schemaTypes/tableOfContentsType.ts`
- [ ] `src/sanity/schemaTypes/tableType.ts`
- [ ] `src/sanity/schemaTypes/blockContentType.ts`
- [ ] `src/sanity/schemaTypes/index.ts`
- [ ] `src/sanity/components/HeadingSelector.tsx`
- [ ] `src/sanity/components/TablePasteInput.tsx`

**Frontend:**
- [ ] `src/components/blog/TableOfContents.jsx`
- [ ] `src/app/(home)/blog/[slug]/page.js` (update portableTextComponents)

**Restart Sanity Studio after making these changes!**
