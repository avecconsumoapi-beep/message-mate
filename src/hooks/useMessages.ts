import { useState, useEffect } from 'react';
import { Message } from '@/types/Message';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = 'user_messages';

export const useMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMessages();
    }
    setLoading(false);
  }, [user]);

  const loadMessages = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allMessages: Message[] = JSON.parse(stored);
      const userMessages = allMessages.filter(m => m.user_id === user?.id);
      setMessages(userMessages);
    }
  };

  const saveMessage = (nome: string, tipo_servico: string, mensagem: string): Message => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      user_id: user?.id || '',
      nome,
      tipo_servico,
      mensagem,
      created_at: new Date().toISOString(),
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    const allMessages: Message[] = stored ? JSON.parse(stored) : [];
    allMessages.push(newMessage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allMessages));
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const deleteMessage = (id: string) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allMessages: Message[] = JSON.parse(stored);
      const filtered = allMessages.filter(m => m.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      setMessages(prev => prev.filter(m => m.id !== id));
    }
  };

  return { messages, loading, saveMessage, deleteMessage, refetch: loadMessages };
};
