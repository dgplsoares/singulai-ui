import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
  computed,
  input,
  signal,
} from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroAdjustmentsHorizontal,
  heroArrowLongRight,
  heroArrowUp,
  heroArrowsPointingIn,
  heroArrowsPointingOut,
  heroChatBubbleLeft,
  heroChevronDown,
  heroClock,
  heroCog6Tooth,
  heroCurrencyDollar,
  heroDocumentDuplicate,
  heroHandThumbDown,
  heroHandThumbUp,
  heroPlusCircle,
  heroSparkles,
  heroTrash,
  heroXMark,
} from '@ng-icons/heroicons/outline';

import { IconNeumorphicComponent } from '../icon-neumorphic';
import { SegmentedTabItem, SegmentedTabsComponent } from '../segmented-tabs';
import {
  AiCreativityLevel,
  AiMessage,
  AiMessageParagraph,
  AiMessageSegment,
  AiPromptConfig,
  AiTab,
  AiVoiceTone,
  DEFAULT_AI_PROMPT_CONFIG,
} from './ai-assistant-panel.types';

/**
 * AI Assistant Panel — painel completo do agente IA.
 *
 * Estrutura interna unificada para mobile e desktop (Figma 1149:14553 mobile /
 * 1160:16956 desktop):
 *
 *   ┌─────────────────────────────────────────────────────────┐
 *   │ Header: [icon Agente IA] [settings] [creditos ▼] [⛶] [×]│
 *   ├─────────────────────────────────────────────────────────┤
 *   │ Tabs: [Chat atual] [Novo chat] [Chats]                  │
 *   ├─────────────────────────────────────────────────────────┤
 *   │ Timeline: msgs AI (esquerda) + user (direita)           │
 *   │   (scrollavel)                                          │
 *   ├─────────────────────────────────────────────────────────┤
 *   │ Action prompts: ↳ Criar curso, ↳ Tirar duvidas, ...    │
 *   ├─────────────────────────────────────────────────────────┤
 *   │ Form prompt: [textarea           ]  [↑ send]            │
 *   └─────────────────────────────────────────────────────────┘
 *
 * Adapta-se ao container via flex 100% width/height. Pode ser projetado em:
 *   - Mobile inline:  slot [nav-footer-panel-ai] do <ds-nav-footer>
 *   - Desktop normal: slot [page-layout-ai] (lateral 400px)
 *   - Maximizado:     slot [page-layout-ai] com aiAssistantState='open' (full)
 */
@Component({
  selector: 'ds-ai-assistant-panel',
  standalone: true,
  imports: [NgIconComponent, IconNeumorphicComponent, SegmentedTabsComponent],
  providers: [
    provideIcons({
      heroAdjustmentsHorizontal,
      heroArrowLongRight,
      heroArrowUp,
      heroArrowsPointingIn,
      heroArrowsPointingOut,
      heroChatBubbleLeft,
      heroChevronDown,
      heroClock,
      heroCog6Tooth,
      heroCurrencyDollar,
      heroDocumentDuplicate,
      heroHandThumbDown,
      heroHandThumbUp,
      heroPlusCircle,
      heroSparkles,
      heroTrash,
      heroXMark,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ai-assistant-panel.component.html',
  styleUrl: './ai-assistant-panel.component.scss',
})
export class AiAssistantPanelComponent {
  /** Exibe label "Agente IA" no header. true=desktop, false=mobile. */
  readonly showTitle = input<boolean>(false);

  /** Saldo de creditos IA exibido na pill do header. */
  readonly credits = input<number>(0);

  /** Lista de mensagens renderizadas na timeline. */
  readonly messages = input<AiMessage[]>([]);

  /** Sugestoes de prompts clicaveis acima do form. */
  readonly actionPrompts = input<string[]>([]);

  /** Tab ativa no header. */
  readonly activeTab = input<AiTab>('current');

  /**
   * Indica se ha um chat ativo. Quando true, o tab "Chat atual..." (closable)
   * eh exibido como primeiro item na linha de tabs. Quando false, o tab eh
   * omitido — "Novo chat" passa a ser o primeiro item (ganha radius esquerda).
   * Default: true.
   */
  readonly hasCurrentChat = input<boolean>(true);

  /** Label do tab "Chat atual" (mostra nome do chat atual). Default: 'Chat atual...'. */
  readonly currentChatLabel = input<string>('Chat atual...');

  /** Visual do botao maximize (icon contract vs expand). */
  readonly maximized = input<boolean>(false);

  /**
   * Modo embedded — true quando o painel eh projetado em um container que
   * ja tem seu proprio card chrome (ex: [nav-footer-panel-ai] mobile inline).
   * Remove o card 2 camadas proprio do panel para evitar nesting visual.
   */
  readonly embedded = input<boolean>(false);

  /**
   * CHAT-1.3 (DEC-CHAT1-API-1): quando true, o panel substitui o bloco
   * hardcoded de timeline+actionPrompts pelo `<ng-content select="[ai-panel-body]">`
   * projetado pelo caller. Permite embedar `<app-ai-chat-timeline>` com
   * todas as features do brain (course preview, handoff modal, RAG, etc).
   *
   * Quando false (default), o panel usa o renderer interno baseado em
   * `[messages]` + `[actionPrompts]` — uso simples (showcase, telas
   * standalone sem o brain).
   */
  readonly useBodySlot = input<boolean>(false);

  /**
   * CHAT-1.3 (DEC-CHAT1-API-2): controla renderizacao do botao maximize.
   * Default true (desktop). Mobile passa false (per Figma 1149-14553 que
   * nao tem maximize).
   */
  readonly showMaximize = input<boolean>(true);

  /**
   * CHAT-1.5 fix: controla renderizacao da row de tabs no header.
   * Default true (showcase / standalone usage).
   *
   * Quando o caller usa `useBodySlot=true` projetando um body que ja
   * tem suas proprias tabs (ex: <app-ai-chat-timeline> com header-tabs
   * functional), deve passar `showTabs=false` para evitar duplicacao
   * visual de tabs. Tech debt para CHAT-2: refactor timeline para usar
   * as tabs do DS panel como source of truth.
   */
  readonly showTabs = input<boolean>(true);

  /**
   * G1 (DEC-CHAT1-API-6): configuracoes do prompt enviadas ao LLM.
   * Default = DEFAULT_AI_PROMPT_CONFIG (criatividade=medium, tomVoz=casual,
   * external=false, reasoning=false). Caller injeta config persistida.
   */
  readonly aiPromptConfig = input<AiPromptConfig>(DEFAULT_AI_PROMPT_CONFIG);

  // --------------------------------------------------------------------------
  // Asset overrides (split-ready). Defaults apontam para a biblioteca central
  // de icones DS (PREP-3.7) — mesmo arquivo close.svg e reusado pelo
  // <ds-modal-confirm> close button. Atualizar o arquivo no filesystem
  // propaga automaticamente para todos os usos.
  // --------------------------------------------------------------------------
  readonly settingsIconSrc = input<string>('branding/icons/icon-neumorphic/settings.svg');
  readonly maximizeIconSrc = input<string>('branding/icons/icon-neumorphic/maximize.svg');
  readonly minimizeIconSrc = input<string>('branding/icons/icon-neumorphic/minimize.svg');
  readonly closeIconSrc = input<string>('branding/icons/icon-neumorphic/close.svg');

  // ----- Computed: items dos tabs (segmented-tabs) -----

  /**
   * Limite de caracteres do label do tab "Chat atual..." para evitar que
   * titulos longos consumam todo o espaco do segmented-tabs (R.16,
   * 2026-05-14). Trunca em 25 chars + '...'.
   */
  private static readonly CURRENT_CHAT_LABEL_MAX_CHARS = 25;

  /**
   * Items renderizados no <ds-segmented-tabs>. "current" eh closable e so
   * aparece quando hasCurrentChat=true. Quando user fecha (X), parent recebe
   * (currentChatClose) e geralmente seta hasCurrentChat=false → array
   * recomputa sem o item → "Novo chat" vira $first → ganha radius esquerda
   * automaticamente.
   */
  protected readonly tabItems = computed<SegmentedTabItem<AiTab>[]>(() => {
    const items: SegmentedTabItem<AiTab>[] = [];
    if (this.hasCurrentChat()) {
      items.push({
        key: 'current',
        label: this.truncateCurrentChatLabel(this.currentChatLabel()),
        closable: true,
        closeAriaLabel: 'Fechar chat atual',
      });
    }
    items.push({ key: 'new', label: 'Novo chat', icon: 'heroPlusCircle' });
    items.push({ key: 'chats', label: 'Chats', icon: 'heroChatBubbleLeft' });
    return items;
  });

  /**
   * R.16 (2026-05-14): trunca o label do "Chat atual" em 25 chars + '...'.
   * Evita que titulos longos (ex: nomes completos de agents/chats) tomem
   * todo o espaco do segmented-tabs e empurrem "Novo chat"/"Chats" para
   * fora de view.
   */
  private truncateCurrentChatLabel(label: string): string {
    const max = AiAssistantPanelComponent.CURRENT_CHAT_LABEL_MAX_CHARS;
    if (label.length <= max) return label;
    return label.slice(0, max).trimEnd() + '...';
  }

  // ----- HostBindings -----

  @HostBinding('class.ds-ai-assistant-panel--embedded')
  get embeddedClass(): boolean {
    return this.embedded();
  }

  // ----- Outputs -----

  @Output() readonly settingsClick = new EventEmitter<void>();
  @Output() readonly creditsClick = new EventEmitter<void>();
  @Output() readonly maximizeToggle = new EventEmitter<void>();
  @Output() readonly closeClick = new EventEmitter<void>();
  @Output() readonly tabChange = new EventEmitter<AiTab>();
  @Output() readonly messageSubmit = new EventEmitter<string>();
  @Output() readonly promptSelect = new EventEmitter<string>();

  /** Emite quando user clica no X do tab "Chat atual" — parent decide o que fazer (geralmente set hasCurrentChat=false). */
  @Output() readonly currentChatClose = new EventEmitter<void>();

  /**
   * G1: emite quando user altera algum switcher (criatividade/tomVoz/
   * external/reasoning) no settings dropdown. Caller persiste e re-injeta
   * via `[aiPromptConfig]`.
   */
  @Output() readonly aiPromptConfigChange = new EventEmitter<AiPromptConfig>();

  // ----- Estado interno -----

  protected readonly promptValue = signal<string>('');
  protected readonly creditsDropdownOpen = signal<boolean>(false);
  protected readonly settingsDropdownOpen = signal<boolean>(false);

  // Fecha qualquer dropdown aberto quando user clica fora. Os clicks dos
  // proprios botoes param o stopPropagation e nao disparam este handler.
  @HostListener('document:click')
  protected onDocumentClick(): void {
    this.creditsDropdownOpen.set(false);
    this.settingsDropdownOpen.set(false);
  }

  protected onPromptInput(value: string): void {
    this.promptValue.set(value);
  }

  protected onSubmit(): void {
    const text = this.promptValue().trim();
    if (text) {
      this.messageSubmit.emit(text);
      this.promptValue.set('');
    }
  }

  // ----- Handlers do template -----

  protected onSettings(): void {
    this.settingsClick.emit();
  }

  protected onSettingsClick(event: MouseEvent): void {
    event.stopPropagation();
    this.settingsDropdownOpen.update((open) => !open);
    // Mutex: ao abrir settings, fecha credits dropdown (e vice-versa)
    this.creditsDropdownOpen.set(false);
    this.settingsClick.emit();
  }

  protected onSettingsAction(action: 'model' | 'tone' | 'clear'): void {
    console.log('[AI Panel] settings action:', action);
    this.settingsDropdownOpen.set(false);
  }

  // G1 handlers — atualiza o aiPromptConfig e emite ao caller
  protected onCriatividadeChange(level: AiCreativityLevel): void {
    this.aiPromptConfigChange.emit({
      ...this.aiPromptConfig(),
      criatividade: level,
    });
  }

  protected onTomVozChange(tom: AiVoiceTone): void {
    this.aiPromptConfigChange.emit({
      ...this.aiPromptConfig(),
      tomVoz: tom,
    });
  }

  protected onToggleSearchExternal(): void {
    this.aiPromptConfigChange.emit({
      ...this.aiPromptConfig(),
      searchExternal: !this.aiPromptConfig().searchExternal,
    });
  }

  protected onToggleExtendedThinking(): void {
    this.aiPromptConfigChange.emit({
      ...this.aiPromptConfig(),
      extendedThinking: !this.aiPromptConfig().extendedThinking,
    });
  }

  protected onCredits(): void {
    this.creditsClick.emit();
  }

  protected onCreditsClick(event: MouseEvent): void {
    event.stopPropagation();
    this.creditsDropdownOpen.update((open) => !open);
    // Mutex: ao abrir credits, fecha settings dropdown
    this.settingsDropdownOpen.set(false);
    this.creditsClick.emit();
  }

  protected onCreditsAction(action: 'history' | 'add' | 'plan'): void {
    // Por enquanto so loga; parent pode adicionar Output dedicado se precisar
    console.log('[AI Panel] credits action:', action);
    this.creditsDropdownOpen.set(false);
  }

  protected onMaximize(): void {
    this.maximizeToggle.emit();
  }

  protected onClose(): void {
    this.closeClick.emit();
  }

  protected onTabClick(tab: AiTab): void {
    this.tabChange.emit(tab);
  }

  protected onTabItemClose(key: AiTab): void {
    if (key === 'current') {
      this.currentChatClose.emit();
    }
  }

  protected onPromptClick(prompt: string): void {
    this.promptSelect.emit(prompt);
  }

  // ----- Helpers de template -----

  /** Normaliza paragrafo (string ou segmentos) em sempre-array-de-segmentos. */
  protected toSegments(paragraph: AiMessageParagraph): AiMessageSegment[] {
    return typeof paragraph === 'string' ? [{ text: paragraph }] : paragraph;
  }
}
