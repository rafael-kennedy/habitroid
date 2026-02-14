import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db, initializeDB } from '../services/db';
import { useTodoStore } from './todoStore';
import { useEconomyStore } from './economyStore';

// Reset DB and Zustand stores between tests
beforeEach(async () => {
    await db.delete();
    await db.open();
    await initializeDB();
    // Reset Zustand stores
    useTodoStore.setState({ todos: [], loading: true });
    useEconomyStore.setState({ coinBalance: 0, transactions: [], settings: null, loading: true });
    await useEconomyStore.getState().loadEconomy();
});

afterEach(async () => {
    await db.delete();
});

describe('TodoStore', () => {

    describe('loadTodos', () => {
        it('should load empty list when no todos exist', async () => {
            await useTodoStore.getState().loadTodos();
            expect(useTodoStore.getState().todos).toEqual([]);
            expect(useTodoStore.getState().loading).toBe(false);
        });

        it('should load todos sorted by createdAt (newest first)', async () => {
            await db.todos.put({
                id: 't1', text: 'Old task', coinReward: 10,
                completed: false, createdAt: '2025-01-01T00:00:00.000Z',
            });
            await db.todos.put({
                id: 't2', text: 'New task', coinReward: 15,
                completed: false, createdAt: '2025-06-01T00:00:00.000Z',
            });

            await useTodoStore.getState().loadTodos();
            const todos = useTodoStore.getState().todos;
            expect(todos).toHaveLength(2);
            expect(todos[0].text).toBe('New task');
            expect(todos[1].text).toBe('Old task');
        });
    });

    describe('addTodo', () => {
        it('should add a new todo with correct properties', async () => {
            await useTodoStore.getState().addTodo('Buy groceries', 25);

            const todos = useTodoStore.getState().todos;
            expect(todos).toHaveLength(1);
            expect(todos[0].text).toBe('Buy groceries');
            expect(todos[0].coinReward).toBe(25);
            expect(todos[0].completed).toBe(false);
            expect(todos[0].id).toBeTruthy();
            expect(todos[0].createdAt).toBeTruthy();
        });

        it('should persist todo to IndexedDB', async () => {
            await useTodoStore.getState().addTodo('Clean garage', 30);

            const dbTodos = await db.todos.toArray();
            expect(dbTodos).toHaveLength(1);
            expect(dbTodos[0].text).toBe('Clean garage');
            expect(dbTodos[0].coinReward).toBe(30);
        });

        it('should prepend new todos to the list', async () => {
            await useTodoStore.getState().addTodo('First task', 10);
            await useTodoStore.getState().addTodo('Second task', 20);

            const todos = useTodoStore.getState().todos;
            expect(todos).toHaveLength(2);
            expect(todos[0].text).toBe('Second task');
            expect(todos[1].text).toBe('First task');
        });
    });

    describe('toggleTodo', () => {
        it('should mark incomplete todo as completed', async () => {
            await useTodoStore.getState().addTodo('Test task', 20);
            const todo = useTodoStore.getState().todos[0];

            await useTodoStore.getState().toggleTodo(todo.id, todo.coinReward);

            const updated = useTodoStore.getState().todos[0];
            expect(updated.completed).toBe(true);
            expect(updated.completedAt).toBeTruthy();
        });

        it('should award coins when completing a todo', async () => {
            const initialBalance = useEconomyStore.getState().coinBalance;
            await useTodoStore.getState().addTodo('Coin task', 50);
            const todo = useTodoStore.getState().todos[0];

            await useTodoStore.getState().toggleTodo(todo.id, todo.coinReward);

            expect(useEconomyStore.getState().coinBalance).toBe(initialBalance + 50);
        });

        it('should un-complete a completed todo', async () => {
            await useTodoStore.getState().addTodo('Toggle task', 15);
            const todo = useTodoStore.getState().todos[0];

            // Complete
            await useTodoStore.getState().toggleTodo(todo.id, todo.coinReward);
            expect(useTodoStore.getState().todos[0].completed).toBe(true);

            // Un-complete
            await useTodoStore.getState().toggleTodo(todo.id, todo.coinReward);
            expect(useTodoStore.getState().todos[0].completed).toBe(false);
        });

        it('should deduct coins when un-completing a todo', async () => {
            await useTodoStore.getState().addTodo('Deduct task', 30);
            const todo = useTodoStore.getState().todos[0];

            // Complete → earn 30
            await useTodoStore.getState().toggleTodo(todo.id, todo.coinReward);
            const balanceAfterComplete = useEconomyStore.getState().coinBalance;

            // Un-complete → deduct 30
            await useTodoStore.getState().toggleTodo(todo.id, todo.coinReward);
            expect(useEconomyStore.getState().coinBalance).toBe(balanceAfterComplete - 30);
        });

        it('should persist completion state to IndexedDB', async () => {
            await useTodoStore.getState().addTodo('Persist task', 10);
            const todo = useTodoStore.getState().todos[0];

            await useTodoStore.getState().toggleTodo(todo.id, todo.coinReward);

            const dbTodo = await db.todos.get(todo.id);
            expect(dbTodo?.completed).toBe(true);
            expect(dbTodo?.completedAt).toBeTruthy();
        });

        it('should do nothing for non-existent todo', async () => {
            // Should not throw
            await useTodoStore.getState().toggleTodo('nonexistent', 10);
            expect(useTodoStore.getState().todos).toHaveLength(0);
        });
    });

    describe('deleteTodo', () => {
        it('should remove todo from store and DB', async () => {
            await useTodoStore.getState().addTodo('To delete', 10);
            const todo = useTodoStore.getState().todos[0];

            await useTodoStore.getState().deleteTodo(todo.id);

            expect(useTodoStore.getState().todos).toHaveLength(0);
            const dbTodos = await db.todos.toArray();
            expect(dbTodos).toHaveLength(0);
        });

        it('should only delete the specified todo', async () => {
            await useTodoStore.getState().addTodo('Keep this', 10);
            await useTodoStore.getState().addTodo('Delete this', 20);

            const toDelete = useTodoStore.getState().todos.find(t => t.text === 'Delete this')!;
            await useTodoStore.getState().deleteTodo(toDelete.id);

            const remaining = useTodoStore.getState().todos;
            expect(remaining).toHaveLength(1);
            expect(remaining[0].text).toBe('Keep this');
        });
    });

    describe('Integration: Todo + Economy', () => {
        it('should create a transaction record when completing a todo', async () => {
            await useTodoStore.getState().addTodo('Transaction test', 25);
            const todo = useTodoStore.getState().todos[0];

            await useTodoStore.getState().toggleTodo(todo.id, todo.coinReward);

            const transactions = await db.transactions.toArray();
            const taskTx = transactions.find(tx => tx.description.includes('Transaction test'));
            expect(taskTx).toBeTruthy();
            expect(taskTx!.amount).toBe(25);
            expect(taskTx!.source).toBe('habit');
        });

        it('should handle multiple completions and track coin balance', async () => {
            await useTodoStore.getState().addTodo('Task A', 10);
            await useTodoStore.getState().addTodo('Task B', 20);

            const todos = useTodoStore.getState().todos;

            await useTodoStore.getState().toggleTodo(todos[0].id, todos[0].coinReward);
            await useTodoStore.getState().toggleTodo(todos[1].id, todos[1].coinReward);

            // Initial balance is 100 (from initializeDB) + 10 + 20 = 130
            expect(useEconomyStore.getState().coinBalance).toBe(130);
        });
    });
});
