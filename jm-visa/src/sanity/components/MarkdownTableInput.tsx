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
