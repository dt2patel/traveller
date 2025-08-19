
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvents, addEvent, updateEvent, deleteEvent } from '@/lib/api';
import { NewTravelEvent, TravelEvent, UpdateTravelEvent } from '@/types';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

const EVENTS_QUERY_KEY = 'events';

export const useEvents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.uid;

  const { data: events = [], isLoading, isError, error } = useQuery({
    queryKey: [EVENTS_QUERY_KEY, userId],
    queryFn: () => {
      if (!userId) return Promise.resolve([]);
      return getEvents(userId, true); // Force fetch on initial load
    },
    enabled: !!userId,
  });

  const sortedEvents = [...events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const latestEvent = sortedEvents.length > 0 ? sortedEvents[0] : null;
  const nextEventType = latestEvent?.type === 'ENTRY' ? 'EXIT' : 'ENTRY';

  const addEventMutation = useMutation({
    mutationFn: (newEventData: NewTravelEvent) => {
      if (!userId) throw new Error("User not authenticated");
      return addEvent(newEventData, userId);
    },
    onMutate: async (newEventData) => {
      await queryClient.cancelQueries({ queryKey: [EVENTS_QUERY_KEY, userId] });
      const previousEvents = queryClient.getQueryData<TravelEvent[]>([EVENTS_QUERY_KEY, userId]) || [];
      
      const optimisticEvent: TravelEvent = {
        id: newEventData.id || `temp-${Date.now()}`,
        userId: userId!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'queued',
        ...newEventData
      };

      queryClient.setQueryData<TravelEvent[]>([EVENTS_QUERY_KEY, userId], [...previousEvents, optimisticEvent]);
      return { previousEvents };
    },
    onError: (_err, _newEvent, context) => {
      toast.error('Failed to add event.');
      if (context?.previousEvents) {
        queryClient.setQueryData([EVENTS_QUERY_KEY, userId], context.previousEvents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY, userId] });
      queryClient.invalidateQueries({ queryKey: ['summary', userId] });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: (eventData: UpdateTravelEvent) => {
      if (!userId) throw new Error("User not authenticated");
      return updateEvent(eventData, userId);
    },
    onMutate: async (updatedEventData) => {
      await queryClient.cancelQueries({ queryKey: [EVENTS_QUERY_KEY, userId] });
      const previousEvents = queryClient.getQueryData<TravelEvent[]>([EVENTS_QUERY_KEY, userId]) || [];
      
      queryClient.setQueryData<TravelEvent[]>(
        [EVENTS_QUERY_KEY, userId],
        previousEvents.map(event => event.id === updatedEventData.id ? { ...event, ...updatedEventData } : event)
      );

      return { previousEvents };
    },
    onError: (_err, _vars, context) => {
      toast.error('Failed to update event.');
      if (context?.previousEvents) {
        queryClient.setQueryData([EVENTS_QUERY_KEY, userId], context.previousEvents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY, userId] });
      queryClient.invalidateQueries({ queryKey: ['summary', userId] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => {
      if (!userId) throw new Error("User not authenticated");
      return deleteEvent(eventId, userId);
    },
    onMutate: async (eventId) => {
        await queryClient.cancelQueries({ queryKey: [EVENTS_QUERY_KEY, userId] });
        const previousEvents = queryClient.getQueryData<TravelEvent[]>([EVENTS_QUERY_KEY, userId]) || [];
        
        queryClient.setQueryData<TravelEvent[]>(
            [EVENTS_QUERY_KEY, userId],
            previousEvents.filter(event => event.id !== eventId)
        );
        return { previousEvents };
    },
    onError: (_err, _vars, context) => {
        toast.error('Failed to delete event.');
        if (context?.previousEvents) {
            queryClient.setQueryData([EVENTS_QUERY_KEY, userId], context.previousEvents);
        }
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY, userId] });
        queryClient.invalidateQueries({ queryKey: ['summary', userId] });
    },
  });

  return { 
    events: sortedEvents, 
    isLoading, 
    isError, 
    error,
    latestEvent,
    nextEventType,
    addEvent: addEventMutation.mutateAsync,
    updateEvent: updateEventMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync
  };
};
