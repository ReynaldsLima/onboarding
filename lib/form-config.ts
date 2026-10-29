export type FieldType =
  | "text"
  | "text-repeatable"
  | "yes-no"
  | "single-select"
  | "multi-select"
  | "weekday-schedule";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: FieldOption[];
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

const OTHER_OPTION: FieldOption = { value: "other", label: "Outro" };

export const FORM_SECTIONS: FormSection[] = [
  {
    id: "empresa",
    title: "Empresa",
    fields: [
      { id: "company_name", label: "Nome da empresa", type: "text", required: true },
      {
        id: "segment",
        label: "Segmento",
        type: "single-select",
        required: true,
        options: [
          { value: "retail", label: "Varejo" },
          { value: "health", label: "Saúde" },
          { value: "real_estate", label: "Imobiliário" },
          { value: "education", label: "Educação" },
          { value: "professional_services", label: "Serviços profissionais" },
          { value: "food", label: "Alimentação" },
          { value: "beauty", label: "Beleza/Estética" },
          OTHER_OPTION,
        ],
      },
      { id: "website", label: "Site/Instagram", type: "text" },
      {
        id: "contact",
        label: "Contato responsável (nome, e-mail, telefone)",
        type: "text",
        required: true,
      },
      {
        id: "business_hours",
        label: "Horário de atendimento humano",
        type: "weekday-schedule",
      },
    ],
  },
  {
    id: "persona",
    title: "Persona do agente",
    fields: [
      { id: "agent_name", label: "Nome do agente", type: "text" },
      {
        id: "tone",
        label: "Tom de voz",
        type: "single-select",
        options: [
          { value: "formal", label: "Formal" },
          { value: "friendly_informal", label: "Informal e amigável" },
          { value: "technical", label: "Técnico" },
          { value: "casual", label: "Descontraído" },
          OTHER_OPTION,
        ],
      },
      { id: "greeting_example", label: "Saudação exemplo", type: "text" },
      {
        id: "languages",
        label: "Idiomas",
        type: "multi-select",
        options: [
          { value: "pt", label: "Português" },
          { value: "en", label: "Inglês" },
          { value: "es", label: "Espanhol" },
          OTHER_OPTION,
        ],
      },
    ],
  },
  {
    id: "atendimento",
    title: "Atendimento",
    fields: [
      { id: "products_services", label: "Produtos/serviços principais", type: "text-repeatable" },
      { id: "faqs", label: "Dúvidas frequentes", type: "text-repeatable" },
      {
        id: "can_quote_price",
        label: "Pode informar preço",
        type: "yes-no",
        required: true,
      },
      {
        id: "human_handoff_triggers",
        label: "Quando transferir para humano",
        type: "multi-select",
        options: [
          { value: "customer_request", label: "Cliente pede" },
          { value: "complaint", label: "Reclamação/insatisfação" },
          { value: "out_of_scope", label: "Pergunta fora do escopo" },
          { value: "price_negotiation", label: "Negociação de valor" },
          OTHER_OPTION,
        ],
      },
    ],
  },
  {
    id: "agendamento",
    title: "Agendamento",
    fields: [
      { id: "uses_scheduling", label: "Usa agendamento", type: "yes-no", required: true },
      {
        id: "scheduling_tool",
        label: "Ferramenta usada",
        type: "single-select",
        options: [
          { value: "google_calendar", label: "Google Calendar" },
          { value: "calendly", label: "Calendly" },
          { value: "custom_system", label: "Sistema próprio" },
          { value: "none_yet", label: "Ainda não tem" },
          OTHER_OPTION,
        ],
      },
      {
        id: "schedulable_services",
        label: "Serviços agendáveis + duração",
        type: "text-repeatable",
      },
      {
        id: "min_notice",
        label: "Antecedência mínima",
        type: "single-select",
        options: [
          { value: "30min", label: "30min" },
          { value: "1h", label: "1h" },
          { value: "2h", label: "2h" },
          { value: "1day", label: "1 dia" },
          OTHER_OPTION,
        ],
      },
      { id: "auto_confirmation", label: "Confirmação automática", type: "yes-no" },
    ],
  },
  {
    id: "qualificacao",
    title: "Qualificação de leads e Segmentação",
    fields: [
      {
        id: "qualification_criteria",
        label: "Critérios de qualificação",
        type: "multi-select",
        options: [
          { value: "min_budget", label: "Orçamento/ticket mínimo" },
          { value: "urgency", label: "Urgência/prazo" },
          { value: "location", label: "Localização" },
          { value: "product_type", label: "Tipo de produto/serviço" },
          { value: "decision_maker", label: "Decisor presente" },
          OTHER_OPTION,
        ],
      },
      {
        id: "size_segmentation",
        label: "Critérios de segmentação por porte/tamanho",
        type: "text",
      },
      {
        id: "location_segmentation",
        label: "Critérios de segmentação por localização",
        type: "text",
      },
      {
        id: "client_type_segmentation",
        label: "Critérios de segmentação por tipo de cliente/projeto",
        type: "text",
      },
      {
        id: "qualified_action",
        label: "O que fazer com lead qualificado vs não qualificado",
        type: "text",
      },
    ],
  },
  {
    id: "followup",
    title: "Follow-up",
    fields: [
      { id: "needs_followup", label: "Precisa de follow-up automático", type: "yes-no", required: true },
      {
        id: "followup_delay",
        label: "Disparar follow-up após",
        type: "single-select",
        options: [
          { value: "1day", label: "1 dia" },
          { value: "2days", label: "2 dias" },
          { value: "3days", label: "3 dias" },
          { value: "7days", label: "7 dias" },
          OTHER_OPTION,
        ],
      },
      {
        id: "followup_attempts",
        label: "Número de tentativas",
        type: "single-select",
        options: [
          { value: "1", label: "1" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          OTHER_OPTION,
        ],
      },
      { id: "reengagement_message", label: "Mensagem de reengajamento", type: "text" },
    ],
  },
  {
    id: "integracoes",
    title: "Integrações e restrições",
    fields: [
      {
        id: "crm",
        label: "CRM usado",
        type: "single-select",
        options: [
          { value: "rd_station", label: "RD Station" },
          { value: "hubspot", label: "HubSpot" },
          { value: "pipedrive", label: "Pipedrive" },
          { value: "spreadsheet", label: "Planilha" },
          { value: "none_yet", label: "Nenhum ainda" },
          OTHER_OPTION,
        ],
      },
      {
        id: "has_whatsapp_business_api",
        label: "Já tem número de WhatsApp Business API ativo",
        type: "yes-no",
        required: true,
      },
      { id: "never_say", label: "O que o agente nunca deve dizer", type: "text" },
      { id: "final_notes", label: "Observações finais", type: "text" },
    ],
  },
  {
    id: "equipe",
    title: "Equipe e Roteamento",
    fields: [
      {
        id: "default_attendants",
        label: "Atendentes/vendedores padrão (nome + WhatsApp/usuário do CRM)",
        type: "text-repeatable",
        required: true,
      },
      {
        id: "specialist_attendants",
        label: "Atendente(s) especialista(s) para segmento diferenciado",
        type: "text-repeatable",
      },
      {
        id: "attendant_availability",
        label: "Disponibilidade de cada atendente (dias/horário, almoço, folgas)",
        type: "text-repeatable",
      },
      { id: "fallback_rule", label: "Regra de fallback", type: "text" },
    ],
  },
];

export const REQUIRED_FIELD_IDS: string[] = FORM_SECTIONS.flatMap((section) =>
  section.fields.filter((field) => field.required).map((field) => field.id),
);
