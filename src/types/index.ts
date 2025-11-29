export interface ContactList {
  id: string;
  name: string;
  contacts: string[];
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

export interface ContactListData {
  lists: ContactList[];
}

export interface TemplateData {
  templates: MessageTemplate[];
}
