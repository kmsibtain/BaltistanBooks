import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Expense {
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    description?: string;
}

const Expenses = () => {
    const { user, isAdmin } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Rent');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const token = user?.token;
            const res = await fetch(`${API_URL}/expenses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch expenses');
            const data = await res.json();
            setExpenses(data);
        } catch (error) {
            console.error(error);
            toast.error('Could not load expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = user?.token;
            const res = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    amount,
                    category,
                    date,
                    description
                })
            });

            if (!res.ok) throw new Error('Failed to add expense');

            toast.success('Expense added');
            setTitle('');
            setAmount('');
            setIsAddOpen(false);
            fetchExpenses();
        } catch (error) {
            console.error(error);
            toast.error('Failed to add expense');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const token = user?.token;
            const res = await fetch(`${API_URL}/expenses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Expense deleted');
            setExpenses(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete expense');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AppLayout>
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">Expenses</h1>
                    <p className="page-subtitle">Track business expenses</p>
                </div>
                {isAdmin && (
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Expense
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Expense</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div>
                                    <Label>Title</Label>
                                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Shop Rent" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Amount</Label>
                                        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
                                    </div>
                                    <div>
                                        <Label>Category</Label>
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Rent">Rent</SelectItem>
                                                <SelectItem value="Utilities">Utilities</SelectItem>
                                                <SelectItem value="Salary">Salary</SelectItem>
                                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <Label>Date</Label>
                                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Input value={description} onChange={e => setDescription(e.target.value)} />
                                </div>
                                <Button type="submit" className="w-full">Save Expense</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Title</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                            <th className="text-right p-4 font-medium text-muted-foreground">Amount</th>
                            {isAdmin && <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
                        ) : expenses.length === 0 ? (
                            <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No expenses recorded</td></tr>
                        ) : (
                            expenses.map(expense => (
                                <tr key={expense.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                                    <td className="p-4">{format(new Date(expense.date), 'MMM dd, yyyy')}</td>
                                    <td className="p-4 font-medium">{expense.title}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-medium text-destructive">
                                        -{formatCurrency(expense.amount)}
                                    </td>
                                    {isAdmin && (
                                        <td className="p-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(expense.id)}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
};

export default Expenses;
