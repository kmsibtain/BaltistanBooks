import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Clock, User as UserIcon, Activity } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    action: string;
    entity: string;
    entityId: string;
    timestamp: string;
    details: any;
}

const AuditLogs = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const token = user?.token;
            const res = await fetch(`${API_URL}/audit`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch logs');
            const data = await res.json();
            setLogs(data);
        } catch (error) {
            console.error(error);
            toast.error('Could not load audit logs');
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'text-success bg-success/10 border-success/20';
            case 'UPDATE': return 'text-primary bg-primary/10 border-primary/20';
            case 'DELETE': return 'text-destructive bg-destructive/10 border-destructive/20';
            default: return 'text-muted-foreground bg-muted border-muted-foreground/20';
        }
    };

    return (
        <AppLayout>
            <div className="page-header mb-8">
                <h1 className="page-title">Audit Logs</h1>
                <p className="page-subtitle">Track system activity and user actions</p>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="text-left p-4 font-medium text-muted-foreground">Timestamp</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Entity</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading logs...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No records found</td></tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id} className="hover:bg-muted/20">
                                    <td className="p-4 whitespace-nowrap text-muted-foreground">
                                        {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                                    </td>
                                    <td className="p-4 font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs">
                                                {log.userName.charAt(0)}
                                            </div>
                                            {log.userName}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {log.entity} <span className="text-xs opacity-50">#{log.entityId?.substring(0, 6)}</span>
                                    </td>
                                    <td className="p-4 max-w-xs truncate text-muted-foreground" title={JSON.stringify(log.details, null, 2)}>
                                        {JSON.stringify(log.details)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
};

export default AuditLogs;
