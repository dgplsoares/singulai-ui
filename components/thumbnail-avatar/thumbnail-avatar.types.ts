/**
 * ThumbnailAvatar — tipos.
 *
 * REDASH-FASE-A A.7 (Figma 875-21663).
 * Pattern: rounded-square com gradiente top-down + iniciais (fallback) ou imagem.
 */

export type ThumbnailAvatarSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * ⭐ `LEAD-ABAS` `LA.2` / `DEC-LEAD-G` — a FORMA do avatar.
 *
 * ⛔ **`'rounded'` é o default, e isso não é estilo — é a garantia de que a extensão NÃO
 * muda nenhum dos usos que já existem.** A regra do projeto é literal: *"se o Figma pedir um
 * arranjo que o DS não tem, ESTENDER o DS com input novo (default preservando o comportamento
 * atual) — não montar o controle por fora."*
 *
 * `'circle'` nasceu do timeline do `Chat IA` no offcanvas do lead (Figma `932:17802`), onde o
 * avatar de 26px é `rounded-[100px]`. 📌 O `<app-data-table>` já desenhava círculo **por
 * conta própria**, com outro gradiente — o docblock do componente registra essa divergência
 * desde a `REDASH-FASE-A`. Este input é o primeiro passo para ela ter um dono só.
 */
export type ThumbnailAvatarShape = 'rounded' | 'circle';
