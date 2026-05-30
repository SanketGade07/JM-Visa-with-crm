import React, { useState, useCallback } from 'react';
import { Stack, Card, Text, Button, Flex, TextArea, Box } from '@sanity/ui';
import { set } from 'sanity';
import { ClipboardIcon } from '@sanity/icons';

// Generate unique key for Sanity - using crypto for better uniqueness
function generateKey(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 11);
    return `row_${timestamp}_${randomPart}`;
}

// Type definitions
interface TableRow {
    _key: string;
    _type?: string;
    cells: string[];
}

interface TableValue {
    _type?: string;
    rows?: TableRow[];
}

interface TablePasteInputProps {
    value: TableValue | undefined;
    onChange: (patch: any) => void;
    renderDefault: (props: any) => React.ReactElement;
    [key: string]: any; // Allow other props to be passed through
}

/**
 * Enhanced Table Input Component
 * 
 * This component wraps the default @sanity/table input with paste functionality.
 * It uses renderDefault to keep all native table behavior intact.
 */
export function TablePasteInput(props: TablePasteInputProps) {
    const { onChange, renderDefault } = props;
    const [pasteText, setPasteText] = useState('');
    const [showPasteArea, setShowPasteArea] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<TableRow[] | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Parse pasted table data - returns rows array or null
    const parseTableText = useCallback((text: string): TableRow[] | null => {
        if (!text.trim()) return null;

        try {
            let lines = text.trim().split('\n').map(line => line.trim()).filter(line => line);

            if (lines.length === 0) return null;

            const isMarkdown = lines[0].startsWith('|');
            let delimiter = '\t';

            if (isMarkdown) {
                // Filter out separator lines in markdown tables
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

            const rows: TableRow[] = lines.map((line) => {
                let cells: string[];

                if (delimiter === '|') {
                    cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
                } else {
                    cells = line.split(delimiter).map(cell => cell.trim());
                }

                return {
                    _key: generateKey(),
                    _type: 'tableRow', // Important: Match the @sanity/table row type
                    cells
                };
            });

            // Filter out empty rows
            const validRows = rows.filter(row => row.cells.length > 0);

            if (validRows.length === 0) {
                return null;
            }

            // Normalize column count
            const maxColumns = Math.max(...validRows.map(row => row.cells.length));
            const normalizedRows = validRows.map(row => ({
                _key: row._key,
                _type: 'tableRow',
                cells: [
                    ...row.cells,
                    ...Array(Math.max(0, maxColumns - row.cells.length)).fill('')
                ]
            }));

            return normalizedRows;
        } catch (error) {
            console.error('Error parsing table:', error);
            return null;
        }
    }, []);

    // Handle paste text change with preview
    const handlePasteTextChange = useCallback((text: string) => {
        setPasteText(text);

        if (text.trim()) {
            const parsed = parseTableText(text);
            if (parsed && parsed.length > 0) {
                setPreviewData(parsed);
                setParseError(null);
            } else {
                setPreviewData(null);
                setParseError('Could not parse table data. Check the format.');
            }
        } else {
            setPreviewData(null);
            setParseError(null);
        }
    }, [parseTableText]);

    // Apply the parsed data to Sanity
    const handleApplyPaste = useCallback(() => {
        if (!previewData || previewData.length === 0 || isProcessing) {
            setParseError('No valid data to apply');
            return;
        }

        setIsProcessing(true);

        // Create a completely new table object with fresh keys
        // Match the @sanity/table plugin's expected structure
        const newTable: TableValue = {
            _type: 'table',
            rows: previewData.map(row => ({
                _key: generateKey(), // Generate fresh keys on apply
                _type: 'tableRow',
                cells: [...row.cells]
            }))
        };

        // Apply the change
        onChange(set(newTable));

        // Reset UI state
        setPasteText('');
        setShowPasteArea(false);
        setPreviewData(null);
        setParseError(null);
        setIsProcessing(false);
    }, [previewData, onChange, isProcessing]);

    // Handle quick paste from clipboard
    const handleQuickPaste = useCallback(async () => {
        if (isProcessing) return;

        try {
            const clipboardText = await navigator.clipboard.readText();

            if (!clipboardText.trim()) {
                setShowPasteArea(true);
                setParseError('Clipboard is empty');
                return;
            }

            const parsed = parseTableText(clipboardText);

            if (parsed && parsed.length > 0) {
                setIsProcessing(true);

                // Create a completely new table object with fresh keys
                const newTable: TableValue = {
                    _type: 'table',
                    rows: parsed.map(row => ({
                        _key: generateKey(),
                        _type: 'tableRow',
                        cells: [...row.cells]
                    }))
                };

                // Apply the change directly
                onChange(set(newTable));
                setIsProcessing(false);
            } else {
                // Show manual paste area if quick paste fails
                setShowPasteArea(true);
                setPasteText(clipboardText);
                setParseError('Could not parse clipboard data. Please check the format.');
            }
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            setShowPasteArea(true);
            setParseError('Could not access clipboard. Please paste manually.');
        }
    }, [parseTableText, onChange, isProcessing]);

    return (
        <Stack space={3}>
            {/* Paste controls - our custom addition */}
            <Card padding={3} tone="transparent" radius={2} border>
                <Stack space={3}>
                    <Flex gap={2} wrap="wrap" align="center">
                        <Button
                            icon={ClipboardIcon}
                            text="Quick Paste from Clipboard"
                            tone="primary"
                            onClick={handleQuickPaste}
                            mode="ghost"
                            fontSize={1}
                            disabled={isProcessing}
                        />
                        <Button
                            text={showPasteArea ? "Hide Paste Area" : "Manual Paste"}
                            onClick={() => {
                                if (showPasteArea) {
                                    setShowPasteArea(false);
                                    setPasteText('');
                                    setPreviewData(null);
                                    setParseError(null);
                                } else {
                                    setShowPasteArea(true);
                                    setPasteText('');
                                    setPreviewData(null);
                                    setParseError(null);
                                }
                            }}
                            mode="ghost"
                            fontSize={1}
                        />
                        <Text size={1} muted>
                            📋 Paste tables from Excel, Google Sheets, or Markdown
                        </Text>
                    </Flex>

                    {showPasteArea && (
                        <Card padding={3} tone="primary" radius={2}>
                            <Stack space={3}>
                                <Text size={1} weight="semibold">
                                    Paste Your Table Data
                                </Text>
                                <Text size={1} muted>
                                    Supports: Markdown tables (| ... |), Tab-separated (Excel), Comma-separated (CSV)
                                </Text>
                                <TextArea
                                    value={pasteText}
                                    onChange={(e) => handlePasteTextChange(e.currentTarget.value)}
                                    placeholder="Paste table here...

Example Markdown:
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |

Or tab/comma-separated data from Excel"
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
                                                ✓ Preview: {previewData.length} rows × {previewData[0]?.cells?.length || 0} columns
                                            </Text>
                                            <Box style={{ overflowX: 'auto', maxHeight: '120px' }}>
                                                <table style={{ fontSize: '11px', borderCollapse: 'collapse', width: '100%' }}>
                                                    <tbody>
                                                        {previewData.slice(0, 4).map((row, idx) => (
                                                            <tr key={row._key}>
                                                                {row.cells.map((cell, cellIdx) => (
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
                                        disabled={!previewData || previewData.length === 0 || isProcessing}
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

            {/* Render the default @sanity/table input component */}
            {/* This preserves all native table editing functionality */}
            {renderDefault(props)}
        </Stack>
    );
}
