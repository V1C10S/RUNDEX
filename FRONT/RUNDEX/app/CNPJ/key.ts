"use client";

import { useEffect } from "react";

// As regras abaixo definem quais elementos entram na navegação.
export type KeyRules = {
    links: boolean;
    buttons: boolean;
    fields: boolean;
    custom: boolean;
};

export const keyRules: KeyRules = {
    links: true,
    buttons: true,
    fields: true,
    custom: true,
};

type KeyEvent = { key: string };
type ModifierEvent = { altKey: boolean; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean };

export const arrowTop = (event: KeyEvent) => event.key === "ArrowUp";
export const arrowDown = (event: KeyEvent) => event.key === "ArrowDown";
export const arrowLeft = (event: KeyEvent) => event.key === "ArrowLeft";
export const arrowRight = (event: KeyEvent) => event.key === "ArrowRight";

export function hasModifier(event: ModifierEvent) {
    return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

export function Key(event: KeyboardEvent, rules: KeyRules = keyRules) {
    if (event.defaultPrevented || hasModifier(event)) return;
    if (!arrowTop(event) && !arrowDown(event) && !arrowLeft(event) && !arrowRight(event)) return;

    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) {
        event.preventDefault();
        return;
    }

    // Controles que usam setas para edição ou seleção mantêm seu comportamento.
    if (active.isContentEditable || active.matches('textarea, select, input[type="range"], input[type="number"], input[type="date"], input[type="time"], input[type="radio"], [role="slider"], [role="listbox"], [role="menu"], [role="tablist"], [role="radiogroup"]')) return;
    if (active instanceof HTMLInputElement && (arrowLeft(event) || arrowRight(event)) && ["text", "search", "email", "url", "tel", "password"].includes(active.type)) return;

    // As setas não rolam a página mesmo quando não existe próximo elemento.
    event.preventDefault();

    const selectors: string[] = [];
    if (rules.links) selectors.push('a[href]');
    if (rules.buttons) selectors.push('button');
    if (rules.fields) selectors.push('input:not([type="hidden"])', 'select', 'textarea');
    if (rules.custom) selectors.push('[data-key-nav]');
    if (!selectors.length) return;

    const visible = (element: HTMLElement) => !element.closest('[hidden], [inert], [aria-hidden="true"], [data-key-ignore]') &&
        element.getClientRects().length > 0 && getComputedStyle(element).visibility === "visible";
    const modals = Array.from(document.querySelectorAll<HTMLElement>('dialog[open], [role="dialog"][aria-modal="true"]')).filter(visible);
    const scope: ParentNode = modals.at(-1) ?? document;
    if (scope !== document && !scope.contains(active)) return;
    if (!active.matches(selectors.join(","))) {
        // Um link de capítulo pode transferir o foco para o título de destino.
        // A próxima seta devolve o foco ao link correspondente.
        if (rules.links && active.id && active.tabIndex === -1) {
            const link = Array.from(scope.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
                .find((element) => element.getAttribute("href") === `#${active.id}` && visible(element));
            link?.focus();
        }
        return;
    }
    if (!visible(active)) return;

    const current = active.getBoundingClientRect();
    const candidates = Array.from(scope.querySelectorAll<HTMLElement>(selectors.join(",")))
        .filter((element) => element !== active && element.tabIndex >= 0 && !element.matches(':disabled, [aria-disabled="true"]') && visible(element));
    let next: HTMLElement | undefined;
    let best = Infinity;

    for (const candidate of candidates) {
        const rect = candidate.getBoundingClientRect();
        let distance: number;
        let cross: number;
        if (arrowRight(event)) {
            distance = rect.left - current.right;
            cross = Math.max(0, rect.top - current.bottom, current.top - rect.bottom);
        } else if (arrowLeft(event)) {
            distance = current.left - rect.right;
            cross = Math.max(0, rect.top - current.bottom, current.top - rect.bottom);
        } else if (arrowDown(event)) {
            distance = rect.top - current.bottom;
            cross = Math.max(0, rect.left - current.right, current.left - rect.right);
        } else {
            distance = current.top - rect.bottom;
            cross = Math.max(0, rect.left - current.right, current.left - rect.right);
        }
        if (distance < -1) continue;
        const score = Math.max(0, distance) + cross * 2;
        if (score < best) {
            best = score;
            next = candidate;
        }
    }

    next?.focus();
}

// Ativa a mesma lógica em todas as páginas.
export function KeyNavigation() {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => Key(event);
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);
    return null;
}
