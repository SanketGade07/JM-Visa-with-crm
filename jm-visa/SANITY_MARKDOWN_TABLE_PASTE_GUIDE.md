# Sanity Markdown Table Copy-Paste Implementation Guide

This guide explains how to implement a table copy-paste system in Sanity CMS using markdown. Users can paste tables directly from Excel, Google Sheets, or markdown format, and they will be automatically converted and stored as markdown tables.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Install Dependencies](#install-dependencies)
3. [Create MarkdownTableInput Component](#create-markdowntableinput-component)
4. [Update Block Content Schema](#update-block-content-schema)
5. [Frontend Rendering](#frontend-rendering)
6. [Usage Instructions](#usage-instructions)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Next.js 13+ application with Sanity CMS
- Sanity Studio already configured
- Basic knowledge of React and TypeScript

---

## Install Dependencies

Install the required packages:

```bash
npm install sanity-plugin-markdown react-markdown remark-gfm
```

**Required packages:**
- `sanity-plugin-markdown` - Enables markdown field type in Sanity
- `react-markdown` - Renders markdown content in React
- `remark-gfm` - Adds GitHub Flavored Markdown support (including tables)

---

## Create MarkdownTableInput Component

Create the file: `src/sanity/components/MarkdownTableInput.tsx`

**Full Component Code:**

```typescript
import React, { useState, useCallback } from 'react';
import { Stack, Card, Text, Button, Flex, TextArea, Box } from '@sanity/ui';
import { set, unset } from 'sanity';
import { ClipboardIcon, TrashIcon } from '@sanity/icons';

interface MarkdownTableInputProps {
    value: string | undefined;
    onChange: (patch: any) => void;
    renderDefault: (props: any) => React.ReactElement;
    [key: string]: any;
}

/**
 * Convert tab-separated or comma-separated data to markdown table
 */
function convertToMarkdownTable(text: string): string {
    if (!text.trim()) return '';

    const lines = text.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) return '';

    // Detect delimiter
    let delimiter = '\t';
    if (!lines[0].includes('\t')) {
        if (lines[0].includes(',')) {
            delimiter = ',';
        } else if (lines[0].includes('|')) {
            // Already markdown table, clean it up
            return cleanMarkdownTable(text);
        }
    }

    // Parse rows
    const rows = lines.map(line => {
        const cells = line.split(delimiter).map(cell => cell.trim());
        return cells;
    });

    if (rows.length === 0) return '';

    // Normalize column count
    const maxCols = Math.max(...rows.map(row => row.length));
    const normalizedRows = rows.map(row => {
        while (row.length < maxCols) {
            row.push('');
        }
        return row;
    });

    // Build markdown table
    const headerRow = normalizedRows[0];
    const headerLine = '| ' + headerRow.join(' | ') + ' |';
    const separatorLine = '| ' + headerRow.map(() => '---').join(' | ') + ' |';

    const dataRows = normalizedRows.slice(1).map(row => {
        return '| ' + row.join(' | ') + ' |';
    });

    if (normalizedRows.length === 1) {
        // Only header, add empty row
        return headerLine + '\n' + separatorLine;
    }

    return [headerLine, separatorLine, ...dataRows].join('\n');
}

/**
 * Clean up an existing markdown table
 */
function cleanMarkdownTable(text: string): string {
    const lines = text.trim().split('\n').filter(line => line.trim());

    // Remove separator lines and rebuild
    const dataLines = lines.filter(line => {
        const cleaned = line.replace(/\|/g, '').trim();
        return !(/^[-–—\s]+$/.test(cleaned));
    });

    if (dataLines.length === 0) return '';

    const rows = dataLines.map(line => {
        return line.split('|')
            .map(cell => cell.trim())
            .filter(cell => cell !== '');
    });

    if (rows.length === 0) return '';

    // Normalize and rebuild
    const maxCols = Math.max(...rows.map(row => row.length));
    const normalizedRows = rows.map(row => {
        while (row.length < maxCols) {
            row.push('');
        }
        return row;
    });

    const headerRow = normalizedRows[0];
    const headerLine = '| ' + headerRow.join(' | ') + ' |';
    const separatorLine = '| ' + headerRow.map(() => '---').join(' | ') + ' |';

    const dataRows = normalizedRows.slice(1).map(row => {
        return '| ' + row.join(' | ') + ' |';
    });

    if (normalizedRows.length === 1) {
        return headerLine + '\n' + separatorLine;
    }

    return [headerLine, separatorLine, ...dataRows].join('\n');
}

/**
 * Parse markdown table to preview data
 */
function parseMarkdownTableForPreview(markdown: string): string[][] | null {
    if (!markdown.trim()) return null;

    const lines = markdown.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) return null;

    const dataLines = lines.filter(line => {
        const cleaned = line.replace(/\|/g, '').trim();
        return !(/^[-–—\s]+$/.test(cleaned));
    });

    return dataLines.map(line => {
        return line.split('|')
            .map(cell => cell.trim())
            .filter(cell => cell !== '');
    });
}

/**
 * Markdown Table Input with Paste Support
 * 
 * This component allows pasting table data from Excel/Google Sheets
 * and automatically converts it to markdown format.
 */
export function MarkdownTableInput(props: MarkdownTableInputProps) {
    const { value, onChange, renderDefault } = props;
    const [pasteText, setPasteText] = useState('');
    const [showPasteArea, setShowPasteArea] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<string[][] | null>(null);

    // Handle paste text change with preview
    const handlePasteTextChange = useCallback((text: string) => {
        setPasteText(text);
        setParseError(null);

        if (text.trim()) {
            try {
                const markdown = convertToMarkdownTable(text);
                if (markdown) {
                    const preview = parseMarkdownTableForPreview(markdown);
                    setPreviewData(preview);
                } else {
                    setPreviewData(null);
                    setParseError('Could not parse table data.');
                }
            } catch (e) {
                setPreviewData(null);
                setParseError('Error parsing table data.');
            }
        } else {
            setPreviewData(null);
        }
    }, []);

    // Apply paste - convert to markdown and save
    const handleApplyPaste = useCallback(() => {
        if (!pasteText.trim()) return;

        try {
            const markdown = convertToMarkdownTable(pasteText);
            if (markdown) {
                onChange(set(markdown));
                setPasteText('');
                setShowPasteArea(false);
                setPreviewData(null);
                setParseError(null);
            } else {
                setParseError('Could not convert to markdown table.');
            }
        } catch (e) {
            setParseError('Error converting table.');
        }
    }, [pasteText, onChange]);

    // Quick paste from clipboard
    const handleQuickPaste = useCallback(async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();

            if (!clipboardText.trim()) {
                setShowPasteArea(true);
                setParseError('Clipboard is empty');
                return;
            }

            const markdown = convertToMarkdownTable(clipboardText);

            if (markdown) {
                // Apply directly
                onChange(set(markdown));
            } else {
                // Show manual paste area
                setShowPasteArea(true);
                setPasteText(clipboardText);
                setParseError('Could not parse clipboard data. Please check format.');
            }
        } catch (err) {
            console.error('Clipboard error:', err);
            setShowPasteArea(true);
            setParseError('Could not access clipboard. Please paste manually.');
        }
    }, [onChange]);

    // Clear the table
    const handleClear = useCallback(() => {
        onChange(unset());
    }, [onChange]);

    // Preview of current value
    const currentPreview = value ? parseMarkdownTableForPreview(value) : null;

    return (
        <Stack space={3}>
            {/* Paste Controls */}
            <Card padding={3} tone="transparent" radius={2} border>
                <Stack space={3}>
                    <Flex gap={2} wrap="wrap" align="center">
                        <Button
                            icon={ClipboardIcon}
                            text="Quick Paste Table"
                            tone="primary"
                            onClick={handleQuickPaste}
                            mode="ghost"
                            fontSize={1}
                        />
                        <Button
                            text={showPasteArea ? "Hide Paste Area" : "Manual Paste"}
                            onClick={() => {
                                setShowPasteArea(!showPasteArea);
                                if (!showPasteArea) {
                                    setPasteText('');
                                    setPreviewData(null);
                                    setParseError(null);
                                }
                            }}
                            mode="ghost"
                            fontSize={1}
                        />
                        {value && (
                            <Button
                                icon={TrashIcon}
                                text="Clear Table"
                                tone="critical"
                                onClick={handleClear}
                                mode="ghost"
                                fontSize={1}
                            />
                        )}
                        <Text size={1} muted>
                            📋 Paste from Excel, Google Sheets, or Markdown
                        </Text>
                    </Flex>

                    {showPasteArea && (
                        <Card padding={3} tone="primary" radius={2}>
                            <Stack space={3}>
                                <Text size={1} weight="semibold">
                                    Paste Your Table Data
                                </Text>
                                <Text size={1} muted>
                                    Copy from Excel/Sheets (tab-separated) or paste markdown table
                                </Text>
                                <TextArea
                                    value={pasteText}
                                    onChange={(e) => handlePasteTextChange(e.currentTarget.value)}
                                    placeholder="Paste table here...

Example (from Excel):
Header1    Header2    Header3
Value1     Value2     Value3

Or markdown:
| Header1 | Header2 |
| ------- | ------- |
| Value1  | Value2  |"
                                    rows={6}
                                    style={{ fontFamily: 'monospace', fontSize: '12px' }}
                                />

                                {parseError && (
                                    <Card padding={2} tone="critical" radius={2}>
                                        <Text size={1}>⚠️ {parseError}</Text>
                                    </Card>
                                )}

                                {previewData && previewData.length > 0 && (
                                    <Card padding={2} tone="positive" radius={2}>
                                        <Stack space={2}>
                                            <Text size={1} weight="semibold">
                                                ✓ Preview: {previewData.length} rows × {previewData[0]?.length || 0} columns
                                            </Text>
                                            <Box style={{ overflowX: 'auto', maxHeight: '120px' }}>
                                                <table style={{ fontSize: '11px', borderCollapse: 'collapse', width: '100%' }}>
                                                    <tbody>
                                                        {previewData.slice(0, 4).map((row, idx) => (
                                                            <tr key={idx}>
                                                                {row.map((cell, cellIdx) => (
                                                                    <td
                                                                        key={cellIdx}
                                                                        style={{
                                                                            padding: '4px 8px',
                                                                            border: '1px solid #ccc',
                                                                            backgroundColor: idx === 0 ? '#e3f2fd' : 'white',
                                                                            maxWidth: '150px',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap'
                                                                        }}
                                                                    >
                                                                        {cell || '(empty)'}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                {previewData.length > 4 && (
                                                    <Text size={0} muted style={{ marginTop: '4px' }}>
                                                        ... and {previewData.length - 4} more rows
                                                    </Text>
                                                )}
                                            </Box>
                                        </Stack>
                                    </Card>
                                )}

                                <Flex gap={2}>
                                    <Button
                                        text="Apply Table"
                                        tone="positive"
                                        onClick={handleApplyPaste}
                                        disabled={!previewData || previewData.length === 0}
                                    />
                                    <Button
                                        text="Cancel"
                                        mode="ghost"
                                        onClick={() => {
                                            setShowPasteArea(false);
                                            setPasteText('');
                                            setPreviewData(null);
                                            setParseError(null);
                                        }}
                                    />
                                </Flex>
                            </Stack>
                        </Card>
                    )}
                </Stack>
            </Card>

            {/* Current Table Preview */}
            {currentPreview && currentPreview.length > 0 && (
                <Card padding={3} tone="positive" radius={2} border>
                    <Stack space={2}>
                        <Text size={1} weight="semibold">
                            ✓ Table ({currentPreview.length} rows × {currentPreview[0]?.length || 0} columns)
                        </Text>
                        <Box style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '13px'
                            }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#2276fc', color: 'white' }}>
                                        {currentPreview[0]?.map((cell, idx) => (
                                            <th key={idx} style={{
                                                padding: '10px',
                                                border: '1px solid #1d4ed8',
                                                textAlign: 'left'
                                            }}>
                                                {cell || '(empty)'}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentPreview.slice(1).map((row, rowIdx) => (
                                        <tr key={rowIdx} style={{
                                            backgroundColor: rowIdx % 2 === 0 ? '#f9fafb' : 'white'
                                        }}>
                                            {row.map((cell, cellIdx) => (
                                                <td key={cellIdx} style={{
                                                    padding: '10px',
                                                    border: '1px solid #e5e7eb'
                                                }}>
                                                    {cell || '(empty)'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>
                    </Stack>
                </Card>
            )}

            {/* Raw Markdown Editor (optional, hidden by default for power users) */}
            <details style={{ marginTop: '8px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#666' }}>
                    📝 Edit Raw Markdown
                </summary>
                <Card padding={2} tone="transparent" radius={2} style={{ marginTop: '8px' }}>
                    {renderDefault(props)}
                </Card>
            </details>
        </Stack>
    );
}
```

---

## Update Block Content Schema

Update your `src/sanity/schemaTypes/blockContentType.ts` file to include the markdown table block:

```typescript
import { defineType, defineArrayMember, defineField } from 'sanity'
import { ImageIcon } from '@sanity/icons'

export const blockContentType = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    // ... your existing block types ...
    
    // Markdown Table block - stores as markdown string (Paste Supported)
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
  ],
})
```

**Important:** Make sure `markdownSchema()` is added to your `sanity.config.ts` plugins:

```typescript
import { markdownSchema } from 'sanity-plugin-markdown'

export default defineConfig({
  // ... other config
  plugins: [
    // ... other plugins
    markdownSchema(),
  ],
})
```

---

## Frontend Rendering

In your blog post page (or wherever you render PortableText), add the markdown table renderer:

**File:** `src/app/(home)/blog/[slug]/page.js` (or your blog post component)

```javascript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const portableTextComponents = {
  types: {
    // ... other types ...
    
    // Markdown Table - renders markdown tables from the markdownTable block type
    markdownTable: ({ value }) => {
      if (!value || !value.tableContent) return null;
      return (
        <div className="overflow-x-auto my-6 shadow-sm rounded-lg -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle markdown-table-wrapper">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ children }) => (
                  <table className="min-w-full border border-gray-300 text-sm">
                    {children}
                  </table>
                ),
                thead: ({ children }) => <thead>{children}</thead>,
                tbody: ({ children }) => <tbody>{children}</tbody>,
                tr: ({ children, ...props }) => {
                  // Check if this is in thead or tbody for styling
                  const isHeader = props.node?.parentNode?.tagName === 'thead';
                  return (
                    <tr className={isHeader ? "bg-blue-500" : "even:bg-white odd:bg-gray-50"}>
                      {children}
                    </tr>
                  );
                },
                th: ({ children }) => (
                  <th className="px-2 sm:px-3 py-2 text-white font-semibold border border-blue-500 text-left text-xs sm:text-sm whitespace-nowrap">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border px-2 sm:px-3 py-2 align-top text-xs sm:text-sm text-gray-700 leading-relaxed max-w-xs break-words">
                    {children}
                  </td>
                ),
              }}
            >
              {value.tableContent}
            </ReactMarkdown>
          </div>
        </div>
      );
    },
  },
  // ... rest of your components
};

// Use in your component:
<PortableText value={blog.body} components={portableTextComponents} />
```

**Alternative Tailwind CSS Styling (if you prefer different colors):**

```javascript
markdownTable: ({ value }) => {
  if (!value || !value.tableContent) return null;
  return (
    <div className="overflow-x-auto my-6 shadow-sm rounded-lg">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <table className="min-w-full border border-gray-300 text-sm">
              {children}
            </table>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-800 text-white">
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children, ...props }) => {
            const isHeader = props.node?.parentNode?.tagName === 'thead';
            return (
              <tr className={isHeader ? "" : "even:bg-gray-50 odd:bg-white"}>
                {children}
              </tr>
            );
          },
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-semibold border border-gray-300">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 border border-gray-300 text-gray-700">
              {children}
            </td>
          ),
        }}
      >
        {value.tableContent}
      </ReactMarkdown>
    </div>
  );
},
```

---

## Usage Instructions

### For Content Editors:

1. **In Sanity Studio**, when editing a blog post:
   - Click the "+" button in the content editor
   - Select "Table (Paste Supported)" from the block types

2. **Quick Paste Method:**
   - Copy a table from Excel, Google Sheets, or any spreadsheet
   - Click "Quick Paste Table" button
   - The table will be automatically converted and inserted

3. **Manual Paste Method:**
   - Click "Manual Paste" button
   - Paste your table data in the text area
   - Preview will show automatically
   - Click "Apply Table" to save

4. **Supported Formats:**
   - **Tab-separated** (from Excel/Sheets): `Header1    Header2    Header3`
   - **Comma-separated**: `Header1, Header2, Header3`
   - **Markdown format**: 
     ```
     | Header1 | Header2 |
     | ------- | ------- |
     | Value1  | Value2  |
     ```

5. **Edit Existing Table:**
   - Click "📝 Edit Raw Markdown" to edit the markdown directly
   - Or click "Clear Table" to remove it

### Example Data Formats:

**From Excel/Google Sheets (Tab-separated):**
```
Name        Age    City
John Doe    30     New York
Jane Smith  25     Los Angeles
```

**From CSV (Comma-separated):**
```
Name, Age, City
John Doe, 30, New York
Jane Smith, 25, Los Angeles
```

**Markdown Format:**
```
| Name      | Age | City         |
| --------- | --- | ------------ |
| John Doe  | 30  | New York     |
| Jane Smith| 25  | Los Angeles  |
```

---

## Troubleshooting

### Issue: "Module not found: MarkdownTableInput"

**Solution:**
- Make sure the file is at: `src/sanity/components/MarkdownTableInput.tsx`
- Check the import path in `blockContentType.ts` matches your file structure
- Restart your development server

### Issue: Tables not rendering on frontend

**Solution:**
- Verify `react-markdown` and `remark-gfm` are installed
- Check that `remarkPlugins={[remarkGfm]}` is included in ReactMarkdown
- Verify the `markdownTable` component is added to `portableTextComponents.types`

### Issue: Paste button not working

**Solution:**
- Check browser console for errors
- Ensure clipboard permissions are granted (HTTPS required for clipboard API)
- Use "Manual Paste" as fallback

### Issue: Table preview not showing

**Solution:**
- Check that the pasted data has proper delimiters (tabs or commas)
- Verify the data has at least 2 rows (header + data)
- Try using "Manual Paste" to see error messages

### Issue: Tables look broken on mobile

**Solution:**
- The `overflow-x-auto` class should handle horizontal scrolling
- Check that your Tailwind CSS is properly configured
- Verify responsive classes are applied

---

## File Structure Summary

After implementation, your file structure should look like:

```
your-project/
├── src/
│   ├── sanity/
│   │   ├── components/
│   │   │   └── MarkdownTableInput.tsx  ← NEW FILE
│   │   └── schemaTypes/
│   │       └── blockContentType.ts    ← UPDATED
│   └── app/
│       └── (home)/
│           └── blog/
│               └── [slug]/
│                   └── page.js        ← UPDATED (add markdownTable renderer)
├── sanity.config.ts                   ← UPDATED (add markdownSchema plugin)
└── package.json                       ← UPDATED (add dependencies)
```

---

## Complete Code Checklist

✅ Install dependencies:
- `sanity-plugin-markdown`
- `react-markdown`
- `remark-gfm`

✅ Create `MarkdownTableInput.tsx` component

✅ Update `blockContentType.ts` to include `markdownTable` block

✅ Add `markdownSchema()` to `sanity.config.ts` plugins

✅ Add `markdownTable` renderer to PortableText components

✅ Test in Sanity Studio

✅ Test frontend rendering

---

## Summary

This implementation allows content editors to:

1. **Paste tables directly** from Excel/Google Sheets
2. **See live preview** before applying
3. **Edit markdown directly** if needed
4. **Render beautifully** on the frontend with proper styling

The system automatically:
- Detects tab-separated, comma-separated, or markdown formats
- Converts to proper markdown table syntax
- Validates and previews before saving
- Renders with responsive, styled tables on the frontend

**That's it!** Your Sanity CMS now supports easy table copy-paste functionality. 🎉

