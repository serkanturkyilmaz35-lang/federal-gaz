import { useState, useEffect } from 'react';
import { homePageConfig, aboutPageConfig, contactPageConfig, PageConfig, SectionContent } from '@/lib/cms/page-defaults';

interface PageContentState {
    content: Record<string, SectionContent>;
    loading: boolean;
    error: string | null;
}

// Map page slugs to their configs for client-side default fallback
const pageConfigMap: Record<string, PageConfig> = {
    '/': homePageConfig,
    '/hakkimizda': aboutPageConfig,
    '/iletisim': contactPageConfig,
};

/**
 * Hook to fetch page content from CMS API with automatic fallback to defaults.
 * 
 * @param pageSlug - The page slug (e.g., '/', '/hakkimizda', '/iletisim')
 * @param language - The language to fetch content for ('TR' | 'EN')
 * @returns Object containing content record, loading state, and error
 * 
 * @example
 * const { content, loading } = usePageContent('/', language);
 * // Access sections:
 * content.hero?.title
 * content.about?.description
 */
export function usePageContent(
    pageSlug: string,
    language: 'TR' | 'EN' = 'TR'
): PageContentState {
    const [state, setState] = useState<PageContentState>({
        content: {},
        loading: true,
        error: null,
    });

    useEffect(() => {
        const fetchContent = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                // Convert page slug to API slug format
                const apiSlug = pageSlug === '/' ? 'home' : pageSlug.slice(1);
                const res = await fetch(`/api/page-content/${apiSlug}?lang=${language}`);

                if (res.ok) {
                    const data = await res.json();
                    setState({
                        content: data.content || {},
                        loading: false,
                        error: null,
                    });
                } else {
                    // API failed, fall back to defaults
                    const pageConfig = pageConfigMap[pageSlug];
                    if (pageConfig) {
                        const defaultContent: Record<string, SectionContent> = {};
                        pageConfig.sections.forEach(section => {
                            defaultContent[section.key] = section.defaultContent[language];
                        });
                        setState({
                            content: defaultContent,
                            loading: false,
                            error: null,
                        });
                    } else {
                        setState({
                            content: {},
                            loading: false,
                            error: 'Page not found',
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching page content:', error);
                // Fall back to defaults on error
                const pageConfig = pageConfigMap[pageSlug];
                if (pageConfig) {
                    const defaultContent: Record<string, SectionContent> = {};
                    pageConfig.sections.forEach(section => {
                        defaultContent[section.key] = section.defaultContent[language];
                    });
                    setState({
                        content: defaultContent,
                        loading: false,
                        error: null,
                    });
                } else {
                    setState({
                        content: {},
                        loading: false,
                        error: String(error),
                    });
                }
            }
        };

        fetchContent();
    }, [pageSlug, language]);

    return state;
}

/**
 * Helper to safely get a section value
 */
export function getSectionValue<T>(
    content: Record<string, SectionContent>,
    sectionKey: string,
    fieldKey: string,
    fallback: T
): T {
    const section = content[sectionKey];
    if (!section) return fallback;
    const value = section[fieldKey];
    if (value === undefined || value === null) return fallback;
    return value as T;
}
