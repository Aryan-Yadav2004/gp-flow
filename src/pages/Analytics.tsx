import AppLayout from '@/components/AppLayout';
import { useAgentStats, useLeads } from '@/hooks/useCrmData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const Analytics = () => {
  const { data: agentStats, isLoading: agentsLoading } = useAgentStats();
  const { data: leads, isLoading: leadsLoading } = useLeads();

  if (agentsLoading || leadsLoading) {
    return (
      <AppLayout title="Analytics" subtitle="Performance metrics and insights">
        <Skeleton className="h-[300px] rounded-xl mb-6" />
        <Skeleton className="h-[260px] rounded-xl" />
      </AppLayout>
    );
  }

  // Group leads by day for trend
  const dayMap: Record<string, { leads: number; booked: number }> = {};
  (leads || []).forEach(l => {
    const day = new Date(l.created_at).toLocaleDateString('en-US', { weekday: 'short' });
    if (!dayMap[day]) dayMap[day] = { leads: 0, booked: 0 };
    dayMap[day].leads++;
    if (l.status === 'booked') dayMap[day].booked++;
  });
  const trendData = Object.entries(dayMap).map(([day, val]) => ({ day, ...val }));

  const agentChartData = (agentStats || []).map(a => ({
    name: a.name.split(' ')[0],
    leads: a.totalLeads,
    conversions: a.conversions,
  }));

  return (
    <AppLayout title="Analytics" subtitle="Performance metrics and insights">
      <div className="kpi-card mb-6">
        <h3 className="font-display font-semibold text-sm text-foreground mb-4">Leads by Day</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
            <Bar dataKey="leads" fill="hsl(24, 95%, 53%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="booked" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="kpi-card">
        <h3 className="font-display font-semibold text-sm text-foreground mb-4">Agent Comparison</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={agentChartData}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
            <Bar dataKey="leads" fill="hsl(24, 95%, 53%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="conversions" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AppLayout>
  );
};

export default Analytics;
