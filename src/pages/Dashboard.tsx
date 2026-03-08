import AppLayout from '@/components/AppLayout';
import KpiCard from '@/components/KpiCard';
import { useDashboardStats, useLeads, useAgentStats } from '@/hooks/useCrmData';
import { useAllReminders, useCompleteFollowUp } from '@/hooks/useLeadDetails';
import { PIPELINE_STAGES, SOURCE_LABELS } from '@/types/crm';
import { Users, Clock, CalendarCheck, CheckCircle, TrendingUp, AlertTriangle, Timer, Bell, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { format, isPast } from 'date-fns';
import { toast } from 'sonner';

const PIE_COLORS = [
  'hsl(142, 71%, 45%)', 'hsl(217, 91%, 60%)', 'hsl(330, 80%, 60%)',
  'hsl(262, 83%, 58%)', 'hsl(38, 92%, 50%)', 'hsl(173, 80%, 40%)',
];

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { data: agentStats, isLoading: agentsLoading } = useAgentStats();
  const { data: reminders } = useAllReminders();
  const completeFollowUp = useCompleteFollowUp();

  const pipelineData = PIPELINE_STAGES.map(stage => ({
    name: stage.label,
    count: leads?.filter(l => l.status === stage.key).length || 0,
  }));

  const sourceData = leads
    ? Object.entries(
        leads.reduce((acc, l) => {
          acc[l.source] = (acc[l.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([key, value]) => ({ name: SOURCE_LABELS[key as keyof typeof SOURCE_LABELS] || key, value }))
    : [];

  const newLeads = leads?.filter(l => l.status === 'new') || [];
  const hotLeads = leads?.filter(l => ((l as any).lead_score ?? 0) >= 70).slice(0, 5) || [];
  const overdueReminders = reminders?.filter(r => isPast(new Date(r.reminder_date))) || [];

  const handleComplete = async (id: string) => {
    try {
      await completeFollowUp.mutateAsync(id);
      toast.success('Follow-up marked as done');
    } catch (err: any) { toast.error(err.message); }
  };

  if (statsLoading || leadsLoading) {
    return (
      <AppLayout title="Dashboard" subtitle="Real-time overview of your sales pipeline">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-[120px] rounded-xl" />)}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard" subtitle="Real-time overview of your sales pipeline">
      {/* Overdue alert */}
      {overdueReminders.length > 0 && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 flex-wrap">
          <AlertTriangle size={16} className="text-destructive shrink-0" />
          <span className="text-xs font-medium text-destructive">{overdueReminders.length} overdue follow-up{overdueReminders.length > 1 ? 's' : ''} need attention!</span>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Total Leads" value={stats?.totalLeads ?? 0} change={12} icon={<Users size={18} />} />
        <KpiCard title="Avg Response Time" value={stats?.avgResponseTime ?? 0} suffix="min" change={-8} icon={<Clock size={18} />} color="hsl(38, 92%, 50%)" />
        <KpiCard title="Visits Scheduled" value={stats?.visitsScheduled ?? 0} change={15} icon={<CalendarCheck size={18} />} color="hsl(173, 80%, 40%)" />
        <KpiCard title="Bookings Closed" value={stats?.bookingsClosed ?? 0} change={22} icon={<CheckCircle size={18} />} color="hsl(142, 71%, 45%)" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Conversion Rate" value={stats?.conversionRate ?? 0} suffix="%" change={5} icon={<TrendingUp size={18} />} color="hsl(262, 83%, 58%)" />
        <KpiCard title="SLA Compliance" value={stats?.slaCompliance ?? 0} suffix="%" change={-3} icon={<Timer size={18} />} color="hsl(217, 91%, 60%)" />
        <KpiCard title="New Today" value={stats?.newToday ?? 0} icon={<Users size={18} />} color="hsl(330, 80%, 60%)" />
        <KpiCard title="SLA Breaches" value={stats?.slaBreaches ?? 0} icon={<AlertTriangle size={18} />} color="hsl(0, 72%, 51%)" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 kpi-card">
          <h3 className="font-display font-semibold text-sm text-foreground mb-4">Pipeline Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pipelineData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(220, 10%, 46%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(220, 10%, 46%)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
              <Bar dataKey="count" fill="hsl(24, 95%, 53%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="kpi-card">
          <h3 className="font-display font-semibold text-sm text-foreground mb-4">Lead Sources</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={sourceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {sourceData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {sourceData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row - 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Needs Attention */}
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-sm text-foreground">🔴 Needs Attention</h3>
            <span className="text-xs text-muted-foreground">{newLeads.length}</span>
          </div>
          <div className="space-y-2">
            {newLeads.slice(0, 5).map(lead => (
              <div key={lead.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{lead.name}</p>
                  <p className="text-[10px] text-muted-foreground">{lead.preferred_location} • {lead.budget}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">{lead.agents?.name}</p>
                  <p className="text-[10px] text-destructive font-medium">Awaiting</p>
                </div>
              </div>
            ))}
            {newLeads.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">All leads responded ✅</p>}
          </div>
        </div>

        {/* Hot Leads */}
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-sm text-foreground">🔥 Hot Leads</h3>
            <span className="text-xs text-muted-foreground">Score ≥70</span>
          </div>
          <div className="space-y-2">
            {hotLeads.map(lead => (
              <div key={lead.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{lead.name}</p>
                  <p className="text-[10px] text-muted-foreground">{lead.preferred_location}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <Star size={10} /> {(lead as any).lead_score}
                </span>
              </div>
            ))}
            {hotLeads.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No hot leads yet</p>}
          </div>
        </div>

        {/* Follow-up Reminders */}
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-sm text-foreground">🔔 Follow-ups</h3>
            <span className="text-xs text-muted-foreground">{reminders?.length || 0} pending</span>
          </div>
          <div className="space-y-2">
            {(reminders || []).slice(0, 5).map(r => (
              <div key={r.id} className={`flex items-center justify-between p-2.5 rounded-lg ${isPast(new Date(r.reminder_date)) ? 'bg-destructive/5 border border-destructive/20' : 'bg-secondary/50'}`}>
                <div>
                  <p className="text-sm font-medium text-foreground">{(r as any).leads?.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(r.reminder_date), 'MMM d, h:mm a')}
                    {isPast(new Date(r.reminder_date)) && <span className="text-destructive ml-1">OVERDUE</span>}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => handleComplete(r.id)}>
                  Done
                </Button>
              </div>
            ))}
            {(reminders?.length || 0) === 0 && <p className="text-xs text-muted-foreground text-center py-4">No pending follow-ups</p>}
          </div>
        </div>
      </div>

      {/* Agent Performance */}
      <div className="kpi-card mt-4">
        <h3 className="font-display font-semibold text-sm text-foreground mb-3">Agent Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {(agentStats || []).map(agent => (
            <div key={agent.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{agent.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{agent.name}</p>
                <div className="flex gap-3 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{agent.activeLeads} active</span>
                  <span className="text-[10px] text-muted-foreground">{agent.avgResponseTime}m avg</span>
                  <span className="text-[10px] text-emerald-600">{agent.conversions} booked</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-display font-bold text-foreground">
                  {agent.totalLeads ? Math.round((agent.conversions / agent.totalLeads) * 100) : 0}%
                </p>
                <p className="text-[9px] text-muted-foreground">conversion</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
