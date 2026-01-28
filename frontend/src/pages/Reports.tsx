import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { format, subDays } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface PnLReport {
    period: { startDate: string; endDate: string };
    totalRevenue: number;
    totalCOGS: number;
    totalExpenses: number;
    grossProfit: number;
    netProfit: number;
}

const Reports = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<PnLReport | null>(null);

    // Default to last 30 days
    const [startDate, setStartDate] = useState(subDays(new Date(), 30).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const token = user?.token;
            const res = await fetch(`${API_URL}/reports/pnl?startDate=${startDate}&endDate=${endDate}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch report');
            const data = await res.json();
            setReport(data);
        } catch (error) {
            console.error(error);
            toast.error('Could not load report');
        } finally {
            setLoading(false);
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
            <div className="page-header mb-8">
                <h1 className="page-title">Financial Reports</h1>
                <p className="page-subtitle">Profit & Loss Statement</p>
            </div>

            {/* Filter */}
            <div className="bg-card p-4 rounded-xl border border-border mb-8 flex flex-wrap items-end gap-4">
                <div>
                    <Label>Start Date</Label>
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                    <Label>End Date</Label>
                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <Button onClick={fetchReport} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Report'}
                </Button>
            </div>

            {/* Results */}
            {report && (
                <div className="space-y-6 animate-fade-in">

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-card p-6 rounded-xl border border-border">
                            <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                                <DollarSign className="w-5 h-5" />
                                <span>Total Revenue</span>
                            </div>
                            <p className="text-2xl font-bold text-primary">{formatCurrency(report.totalRevenue)}</p>
                        </div>
                        <div className="bg-card p-6 rounded-xl border border-border">
                            <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                                <Activity className="w-5 h-5" />
                                <span>Cost of Goods</span>
                            </div>
                            <p className="text-2xl font-bold text-warning">{formatCurrency(report.totalCOGS)}</p>
                        </div>
                        <div className="bg-card p-6 rounded-xl border border-border">
                            <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                                <TrendingDown className="w-5 h-5" />
                                <span>Expenses</span>
                            </div>
                            <p className="text-2xl font-bold text-destructive">{formatCurrency(report.totalExpenses)}</p>
                        </div>
                        <div className={`bg-card p-6 rounded-xl border border-border ${report.netProfit >= 0 ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
                            <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                                <TrendingUp className="w-5 h-5" />
                                <span>Net Profit</span>
                            </div>
                            <p className={`text-2xl font-bold ${report.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                                {formatCurrency(report.netProfit)}
                            </p>
                        </div>
                    </div>

                    {/* Detailed Summary */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden max-w-2xl mx-auto">
                        <div className="p-6 border-b border-border bg-muted/30">
                            <h3 className="font-semibold text-lg">Detailed Breakdown</h3>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(report.period.startDate), 'MMM dd, yyyy')} - {format(new Date(report.period.endDate), 'MMM dd, yyyy')}
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span>Total Sales</span>
                                <span className="font-medium">{formatCurrency(report.totalRevenue)}</span>
                            </div>
                            <div className="flex justify-between items-center text-muted-foreground">
                                <span>- Cost of Goods Sold</span>
                                <span>({formatCurrency(report.totalCOGS)})</span>
                            </div>
                            <div className="border-t border-border my-2"></div>
                            <div className="flex justify-between items-center font-medium">
                                <span>Gross Profit</span>
                                <span>{formatCurrency(report.grossProfit)}</span>
                            </div>
                            <div className="flex justify-between items-center text-muted-foreground mt-4">
                                <span>- Operating Expenses</span>
                                <span>({formatCurrency(report.totalExpenses)})</span>
                            </div>
                            <div className="border-t border-border my-2"></div>
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>Net Profit</span>
                                <span className={report.netProfit >= 0 ? 'text-success' : 'text-destructive'}>
                                    {formatCurrency(report.netProfit)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default Reports;
