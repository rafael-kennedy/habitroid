import { create } from 'zustand';
import { db, type Todo } from '../services/db';
import { useEconomyStore } from './economyStore';

interface TodoState {
    todos: Todo[];
    loading: boolean;
    loadTodos: () => Promise<void>;
    addTodo: (text: string, coinReward: number) => Promise<void>;
    toggleTodo: (id: string, coinReward: number) => Promise<void>;
    deleteTodo: (id: string) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set) => ({
    todos: [],
    loading: true,

    loadTodos: async () => {
        const todos = await db.todos.toArray();
        // Sort by created at, but put completed ones at the bottom? 
        // For now just sort by createdAt
        todos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        set({ todos, loading: false });
    },

    addTodo: async (text, coinReward) => {
        const todo: Todo = {
            id: crypto.randomUUID(),
            text,
            coinReward,
            completed: false,
            createdAt: new Date().toISOString(),
        };
        await db.todos.put(todo);
        set(state => ({ todos: [todo, ...state.todos] }));
    },

    toggleTodo: async (id, coinReward) => {
        const todo = await db.todos.get(id);
        if (!todo) return;

        const isCompleted = !todo.completed;
        const updates: Partial<Todo> = {
            completed: isCompleted,
            completedAt: isCompleted ? new Date().toISOString() : undefined
        };

        await db.todos.update(id, updates);

        // If completing, award coins
        if (isCompleted) {
            await useEconomyStore.getState().earnCoins(coinReward, 'habit', `Completed task: ${todo.text}`);
        } else {
            // Remove coins if un-completing? 
            // For one-off tasks, maybe we shouldn't allow un-completing easily or just deduct?
            // Let's just deduct for now to prevent exploit
            await useEconomyStore.getState().spendCoins(coinReward, 'habit', `Un-completed task: ${todo.text}`);
        }

        set(state => ({
            todos: state.todos.map(t => t.id === id ? { ...t, ...updates } : t)
        }));
    },

    deleteTodo: async (id) => {
        await db.todos.delete(id);
        set(state => ({ todos: state.todos.filter(t => t.id !== id) }));
    },
}));
