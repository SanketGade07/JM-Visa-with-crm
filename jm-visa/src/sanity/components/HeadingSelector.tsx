import React, { useState, useEffect, useCallback } from 'react';
import { Stack, Card, Text, Switch, Box, Flex, Button } from '@sanity/ui';
import { set, unset } from 'sanity';
import { useFormValue } from 'sanity';

export function HeadingSelector(props) {
    const { value = [], onChange } = props;

    // Access the entire document using useFormValue hook
    const document = useFormValue([]) as any;

    const [allHeadings, setAllHeadings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Extract headings from the document body
    useEffect(() => {
        const extractHeadings = () => {
            setLoading(true);

            // Get the body from the root document
            const bodyContent = document?.body;

            if (!bodyContent || !Array.isArray(bodyContent)) {
                console.log('No body content found', document);
                setLoading(false);
                return;
            }

            const headings = [];

            // Process all blocks in the body
            bodyContent.forEach((block) => {
                // Check if it's a block type with a style property
                if (block._type === 'block' && block.style) {
                    const style = block.style;

                    // Check if it's a heading style (h1, h2, h3, h4, h5, h6)
                    if (/^h[1-6]$/.test(style)) {
                        // Extract text from children
                        let text = '';
                        if (Array.isArray(block.children)) {
                            text = block.children
                                .map((child) => {
                                    if (child.text) {
                                        return child.text;
                                    }
                                    return '';
                                })
                                .join('')
                                .trim();
                        }

                        if (text) {
                            headings.push({
                                text,
                                style: style.toUpperCase(),
                                level: parseInt(style.charAt(1)),
                            });
                        }
                    }
                }
            });

            console.log('Found headings:', headings);
            setAllHeadings(headings);
            setLoading(false);
        };

        extractHeadings();
    }, [document]);

    const handleToggle = useCallback(
        (headingText) => {
            const currentExcluded = value || [];
            const isExcluded = currentExcluded.includes(headingText);

            if (isExcluded) {
                // Remove from excluded list (show in TOC)
                const newValue = currentExcluded.filter((h) => h !== headingText);
                onChange(newValue.length > 0 ? set(newValue) : unset());
            } else {
                // Add to excluded list (hide from TOC)
                onChange(set([...currentExcluded, headingText]));
            }
        },
        [value, onChange]
    );

    const handleShowAll = useCallback(() => {
        onChange(unset());
    }, [onChange]);

    const handleHideAll = useCallback(() => {
        const allTexts = allHeadings.map(h => h.text);
        onChange(set(allTexts));
    }, [allHeadings, onChange]);

    if (loading) {
        return (
            <Card padding={3}>
                <Text size={1}>Loading headings...</Text>
            </Card>
        );
    }

    if (allHeadings.length === 0) {
        return (
            <Card padding={3} tone="caution" radius={2}>
                <Stack space={3}>
                    <Text size={1} weight="medium">
                        No headings found in this article
                    </Text>
                    <Text size={1} muted>
                        Add H1, H2, H3, or H4 headings to your article content, then come back here to manage which ones appear in the Table of Contents.
                    </Text>
                    <Text size={0} muted>
                        Debug: {document?.body ? `Found ${document.body.length} blocks in body` : 'No body array found'}
                    </Text>
                </Stack>
            </Card>
        );
    }

    return (
        <Stack space={3}>
            <Card padding={3} tone="primary" radius={2}>
                <Stack space={2}>
                    <Text size={1} weight="semibold">
                        Select which headings to show in Table of Contents
                    </Text>
                    <Text size={1} muted>
                        Toggle each heading ON (visible) or OFF (hidden). By default, all headings are shown.
                    </Text>
                    <Flex gap={2}>
                        <Button
                            mode="ghost"
                            text="Show All"
                            onClick={handleShowAll}
                            fontSize={1}
                        />
                        <Button
                            mode="ghost"
                            text="Hide All"
                            onClick={handleHideAll}
                            fontSize={1}
                            tone="critical"
                        />
                    </Flex>
                </Stack>
            </Card>

            <Stack space={2}>
                {allHeadings.map((heading, index) => {
                    const isShown = !value?.includes(heading.text);

                    return (
                        <Card
                            key={`${heading.text}-${index}`}
                            padding={3}
                            radius={2}
                            shadow={1}
                            tone={isShown ? 'default' : 'transparent'}
                            style={{
                                borderLeft: isShown ? '4px solid #2276fc' : '4px solid #e2e8f0',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <Flex align="center" justify="space-between" gap={3}>
                                <Box flex={1}>
                                    <Text size={1} weight={isShown ? 'semibold' : 'regular'}>
                                        {heading.text}
                                    </Text>
                                    <Text size={0} muted style={{ marginTop: '0.25rem' }}>
                                        {heading.style} • Level {heading.level}
                                    </Text>
                                </Box>
                                <Flex align="center" gap={2}>
                                    <Text
                                        size={1}
                                        weight="medium"
                                        style={{
                                            color: isShown ? '#10b981' : '#6b7280',
                                            minWidth: '60px',
                                            textAlign: 'right',
                                        }}
                                    >
                                        {isShown ? '✓ Visible' : '✗ Hidden'}
                                    </Text>
                                    <Switch
                                        checked={isShown}
                                        onChange={() => handleToggle(heading.text)}
                                    />
                                </Flex>
                            </Flex>
                        </Card>
                    );
                })}
            </Stack>

            <Card padding={3} radius={2} tone={value && value.length > 0 ? 'caution' : 'positive'}>
                <Flex align="center" justify="space-between">
                    <Text size={1} weight="semibold">
                        📊 Total headings: {allHeadings.length}
                    </Text>
                    {value && value.length > 0 ? (
                        <Text size={1} weight="medium" style={{ color: '#f59e0b' }}>
                            ⚠️ {value.length} hidden from TOC
                        </Text>
                    ) : (
                        <Text size={1} weight="medium" style={{ color: '#10b981' }}>
                            ✓ All visible in TOC
                        </Text>
                    )}
                </Flex>
            </Card>
        </Stack>
    );
}
