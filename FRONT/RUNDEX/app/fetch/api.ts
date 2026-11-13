export function apiUrl(path: string) {
    if (/^https?:\/\//i.test(path)) return path;

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return `/api${normalizedPath}`;
}

export function apiFetch(path: string, options?: RequestInit) {
    return fetch(apiUrl(path), options);
}
