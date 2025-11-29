import React, { useState, useEffect } from 'react';

interface SingleMessageProps {
  onSendMessage: (phones: string[], message: string) => void;
  isRunning: boolean;
}

interface ContactList {
  id: string;
  name: string;
  contacts: string[];
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}

interface ContactManagerProps {
  lists: ContactList[];
  setLists: React.Dispatch<React.SetStateAction<ContactList[]>>;
  onClose: () => void;
}

interface TemplateManagerProps {
  templates: MessageTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<MessageTemplate[]>>;
  onSelect: (content: string) => void;
}

export default function SingleMessage({ onSendMessage, isRunning }: SingleMessageProps) {
  const [mode, setMode] = useState<'phone' | 'list'>('phone');
  const [phone, setPhone] = useState('');
  const [lists, setLists] = useState<ContactList[]>([]);
  const [selectedList, setSelectedList] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('contactLists');
    if (saved) setLists(JSON.parse(saved));
    const savedTemplates = localStorage.getItem('messageTemplates');
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
  }, []);

  const send = async () => {
    if (!msg.trim()) return alert('Enter message');
    let phones;
        if (mode === 'phone') {
              phones = phone ? [phone] : [];
                 } else {
               phones = selected;
               }

    if (phones.length === 0) return alert('Select contacts');
    setSending(true);
    try {
   
      onSendMessage(phones, msg);
         alert(`✅ Sent to ${phones.length}`);
    } catch (e) {
        if (e instanceof Error) {
          alert(`❌ Failed: ${e.message}`);
            } else {
             alert('❌ Failed');
             }
               } finally {
              setSending(false);
}
  };

  const currentList = lists.find(l => l.id === selectedList);

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff', marginBottom: '10px' }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#25d366' }}>📱 Send Message</div>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button onClick={() => setMode('phone')} style={{ flex: 1, padding: '6px', fontSize: '18px', background: mode === 'phone' ? '#25d366' : '#e9ecef', color: mode === 'phone' ? '#fff' : '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>📱 Phone</button>
        <button onClick={() => setMode('list')} style={{ flex: 1, padding: '6px', fontSize: '18px', background: mode === 'list' ? '#25d366' : '#e9ecef', color: mode === 'list' ? '#fff' : '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>📋 List</button>
      </div>

      {mode === 'phone' ? (
        <input type="text" placeholder="+919876543210" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '6px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '8px' }} />
      ) : (
        <>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            <select value={selectedList} onChange={(e) => { setSelectedList(e.target.value); setSelected([]); }} style={{ flex: 1, padding: '6px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="">Select List</option>
              {lists.map(l => <option key={l.id} value={l.id}>{l.name} ({l.contacts.length})</option>)}
            </select>
            <button onClick={() => setShow(!show)} style={{ padding: '6px 12px', fontSize: '18px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>⚙️</button>
          </div>
          
          {currentList && !show && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px', fontWeight: 'bold' }}>
                <span>{selected.length} selected</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => setSelected(currentList.contacts)} style={{ padding: '4px 8px', fontSize: '14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>All</button>
                  <button onClick={() => setSelected([])} style={{ padding: '4px 8px', fontSize: '14px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>None</button>
                </div>
              </div>
              <div style={{ maxHeight: '80px', overflow: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '6px', background: '#f8f9fa' }}>
                {currentList.contacts.map((c) => (
                  <label key={c} style={{ display: 'flex', alignItems: 'center', padding: '4px', fontSize: '15px', background: selected.includes(c) ? '#d4edda' : '#fff', marginBottom: '2px', borderRadius: '3px', cursor: 'pointer', border: '1px solid #dee2e6' }}>
                    <input type="checkbox" checked={selected.includes(c)} onChange={() => setSelected(selected.includes(c) ? selected.filter(x => x !== c) : [...selected, c])} style={{ marginRight: '8px', width: '16px', height: '16px' }} />
                    {c}
                  </label>
                ))}
              </div>
            </div>
          )}

          {show && <ContactManager lists={lists} setLists={setLists} onClose={() => setShow(false)} />}
        </>
      )}

      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <label htmlFor="message" style={{ fontSize: '16px', fontWeight: 'bold' }}>Message:</label>
          <button onClick={() => setShowTemplates(!showTemplates)} style={{ padding: '4px 10px', fontSize: '14px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>
            {showTemplates ? '✕ Close' : '📄 Templates'}
          </button>
        </div>

        {showTemplates && <TemplateManager templates={templates} setTemplates={setTemplates} onSelect={(content: string) => { setMsg(content); setShowTemplates(false); }} />}

        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type your message..." style={{ width: '100%', height: '70px', padding: '8px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px', resize: 'none' }} />
      </div>
      
      <button onClick={send} disabled={!isRunning || sending || !msg} style={{ width: '100%', padding: '8px', fontSize: '18px', background: (!isRunning || sending || !msg) ? '#999' : '#25d366', color: '#fff', border: 'none', borderRadius: '4px', cursor: (!isRunning || sending || !msg) ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
        {sending ? '⏳ Sending...' : `📤 Send to ${mode === 'phone' ? '1' : selected.length} Contact(s)`}
      </button>
    </div>
  );
}

function ContactManager(props: Readonly<ContactManagerProps>) {
  const { lists, setLists, onClose } = props;
  const [name, setName] = useState('');
  const [contacts, setContacts] = useState('');
  const [editingListId, setEditingListId] = useState('');
  const [editingContacts, setEditingContacts] = useState<string[]>([]);
  const [newNumber, setNewNumber] = useState('');

  const save = () => {
    if (!name || !contacts) return alert('Fill all fields');
    const arr = contacts.split('\n').map(c => c.trim()).filter(c => c);
    if (arr.length === 0) return alert('Add at least one contact');
    const newList: ContactList = { id: Date.now().toString(), name, contacts: arr };
    const updated = [...lists, newList];
    setLists(updated);
    localStorage.setItem('contactLists', JSON.stringify(updated));
    setName('');
    setContacts('');
    alert('✅ Saved successfully');
  };

  const startEditing = (list: ContactList) => {
    setEditingListId(list.id);
    setEditingContacts([...list.contacts]);
  };

  const cancelEditing = () => {
    setEditingListId('');
    setEditingContacts([]);
    setNewNumber('');
  };

  const saveEditing = () => {
    if (editingContacts.length === 0) return alert('Add at least one contact');
    const updated = lists.map(l => 
      l.id === editingListId ? { ...l, contacts: editingContacts } : l
    );
    setLists(updated);
    localStorage.setItem('contactLists', JSON.stringify(updated));
    cancelEditing();
    alert('✅ List updated');
  };

  const addNumber = () => {
    if (!newNumber.trim()) return alert('Enter a phone number');
    if (!newNumber.startsWith('+')) return alert('Number must start with + (e.g., +919876543210)');
    setEditingContacts([...editingContacts, newNumber.trim()]);
    setNewNumber('');
  };

  const deleteNumber = (index: number) => {
    setEditingContacts(editingContacts.filter((_, i) => i !== index));
  };

  const deleteList = (id: string) => {
    if (!confirm('Delete this entire list?')) return;
    const updated = lists.filter(l => l.id !== id);
    setLists(updated);
    localStorage.setItem('contactLists', JSON.stringify(updated));
  };

  return (
    <div style={{ padding: '10px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px', marginBottom: '8px' }}>
      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '6px' }}>📋 Manage Contact Lists</div>
      
      {editingListId ? (
        <>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px', color: '#007bff' }}>
            ✏️ Editing: {lists.find(l => l.id === editingListId)?.name}
          </div>
          
          <div style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              <input 
                type="text" 
                placeholder="+919876543210" 
                value={newNumber} 
                onChange={(e) => setNewNumber(e.target.value)} 
                style={{ flex: 1, padding: '6px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '3px' }} 
              />
              <button onClick={addNumber} style={{ padding: '6px 12px', fontSize: '14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>
                ➕ Add
              </button>
            </div>
          </div>

          <div style={{ maxHeight: '150px', overflow: 'auto', marginBottom: '6px', border: '1px solid #ddd', borderRadius: '3px', padding: '4px', background: '#fff' }}>
            {editingContacts.map((contact, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px', marginBottom: '2px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '3px' }}>
                <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>{contact}</span>
                <button onClick={() => deleteNumber(index)} style={{ padding: '2px 6px', fontSize: '12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={saveEditing} style={{ flex: 1, padding: '6px', fontSize: '16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              💾 Save Changes
            </button>
            <button onClick={cancelEditing} style={{ padding: '6px 12px', fontSize: '16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              ✕ Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <input type="text" placeholder="List Name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '6px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '6px' }} />
          <textarea placeholder="Phone numbers (one per line)&#10;+919876543210&#10;+918765432109" value={contacts} onChange={(e) => setContacts(e.target.value)} style={{ width: '100%', height: '60px', padding: '6px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '6px', fontFamily: 'monospace', resize: 'none' }} />
          <button onClick={save} style={{ width: '100%', padding: '6px', fontSize: '16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
            ➕ Add New List
          </button>

          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>Existing Lists:</div>
          <div style={{ maxHeight: '120px', overflow: 'auto' }}>
            {lists.map(list => (
              <div key={list.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px', marginBottom: '4px', background: '#fff', border: '1px solid #dee2e6', borderRadius: '3px' }}>
                <span style={{ fontSize: '14px' }}><strong>{list.name}</strong> ({list.contacts.length})</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => startEditing(list)} style={{ padding: '4px 8px', fontSize: '12px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => deleteList(list.id)} style={{ padding: '4px 8px', fontSize: '12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={onClose} style={{ width: '100%', padding: '6px', fontSize: '16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '6px' }}>
            ✕ Close
          </button>
        </>
      )}
    </div>
  );
}

function TemplateManager({ templates, setTemplates, onSelect }: TemplateManagerProps) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  const save = () => {
    if (!name || !content) return alert('Fill all fields');
    const newTemplate: MessageTemplate = { id: Date.now().toString(), name, content };
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    localStorage.setItem('messageTemplates', JSON.stringify(updated));
    setName('');
    setContent('');
    alert('✅ Template saved');
  };

  const del = (id: string) => {
    if (!confirm('Delete?')) return;
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    localStorage.setItem('messageTemplates', JSON.stringify(updated));
  };

  return (
    <div style={{ padding: '8px', background: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '4px', marginBottom: '8px' }}>
      <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px' }}>📄 Templates</div>
      
      <div style={{ marginBottom: '8px', maxHeight: '100px', overflow: 'auto' }}>
        {templates.map((t) => (
          <div key={t.id} style={{ padding: '4px', marginBottom: '3px', background: '#fff', border: '1px solid #ccc', borderRadius: '3px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => onSelect(t.content)}
              style={{
                cursor: 'pointer',
                flex: 1,
                background: 'none',
                border: 'none',
                textAlign: 'left',
                font: 'inherit',
                padding: 0,
                outline: 'none'
              }}
            >
              <strong>{t.name}</strong>
            </button>
            <button onClick={() => del(t.id)} style={{ padding: '2px 6px', fontSize: '12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>🗑️</button>
          </div>
        ))}
      </div>

      <input type="text" placeholder="Template name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '4px', marginBottom: '4px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '3px' }} />
      <textarea placeholder="Template content" value={content} onChange={(e) => setContent(e.target.value)} style={{ width: '100%', height: '50px', padding: '4px', marginBottom: '4px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '3px', resize: 'none' }} />
      <button onClick={save} style={{ width: '100%', padding: '4px', fontSize: '14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>
        ➕ Save Template
      </button>
    </div>
  );
}
