import { useEffect, useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

type TableName = 'veterans' | 'race_teams' | 'events' | 'veteran_team_pairings' | 'activities' | 'travel_arrangements' | 'notes' | 'file_attachments';

interface UseRealtimeProps {
  table: TableName;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export function useRealtime({ table, onInsert, onUpdate, onDelete }: UseRealtimeProps) {
  const handleChanges = useCallback((payload: any) => {
    switch (payload.eventType) {
      case 'INSERT':
        onInsert?.(payload);
        break;
      case 'UPDATE':
        onUpdate?.(payload);
        break;
      case 'DELETE':
        onDelete?.(payload);
        break;
    }
  }, [onInsert, onUpdate, onDelete]);

  useEffect(() => {
    const subscription = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        handleChanges
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table, handleChanges]);
}

// Helper hook for updating lists when real-time changes occur
export function useRealtimeList<T extends { id: string }>(
  initialData: T[],
  table: TableName
) {
  const [data, setData] = useState<T[]>(initialData);

  useRealtime({
    table,
    onInsert: (payload) => {
      setData(prev => [...prev, payload.new]);
    },
    onUpdate: (payload) => {
      setData(prev => prev.map(item =>
        item.id === payload.new.id ? payload.new : item
      ));
    },
    onDelete: (payload) => {
      setData(prev => prev.filter(item => item.id !== payload.old.id));
    }
  });

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  return data;
}