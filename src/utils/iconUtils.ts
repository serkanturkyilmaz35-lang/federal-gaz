/**
 * Parses an icon string in the format "icon_name|hex_color" or just "icon_name".
 * Returns an object with the icon name and color.
 */
export function parseIcon(iconString: string) {
    if (!iconString) return { name: 'help_outline', color: undefined };

    const parts = iconString.split('|');
    return {
        name: parts[0],
        color: parts[1] || undefined // undefined means inherit/default
    };
}

/**
 * Combines an icon name and color into the storage format "icon_name|hex_color".
 */
export function formatIcon(name: string, color?: string) {
    if (!color) return name;
    return `${name}|${color}`;
}
