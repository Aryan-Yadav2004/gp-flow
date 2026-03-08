import AppLayout from '@/components/AppLayout';
import { useVisits } from '@/hooks/useCrmData';
import { format } from 'date-fns';
import { CalendarCheck, CheckCircle, XCircle, HelpCircle, Clock, MapPin, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const outcomeIcons: Record<string, JSX.Element> = {
  booked: <CheckCircle size={14} className="text-emerald-500" />,
  considering: <HelpCircle size={14} className="text-amber-500" />,
  not_interested: <XCircle size={14} className="text-red-500" />,
};

const Visits = () => {
  const { data: visits, isLoading } = useVisits();

  const upcoming = visits?.filter(v => !v.outcome) || [];
  const past = visits?.filter(v => v.outcome) || [];

  if (isLoading) {
    return (
      <AppLayout title="Visit Scheduling" subtitle="Manage property visits and track outcomes">
        <Skeleton className="h-[400px] rounded-xl" />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Visit Scheduling" subtitle="Manage property visits and track outcomes">
      <div className="mb-8">
        <h2 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
          <CalendarCheck size={16} className="text-primary" /> Upcoming Visits ({upcoming.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {upcoming.map(visit => (
            <div key={visit.id} className="kpi-card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-sm text-foreground">{visit.leads?.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {visit.properties?.name}
                  </p>
                </div>
                {visit.confirmed ? (
                  <span className="badge-pipeline bg-emerald-100 text-emerald-700 text-[10px]">Confirmed</span>
                ) : (
                  <span className="badge-pipeline bg-amber-100 text-amber-700 text-[10px]">Pending</span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock size={11} /> {format(new Date(visit.scheduled_at), 'MMM d, h:mm a')}</span>
                <span className="flex items-center gap-1"><User size={11} /> {visit.agents?.name?.split(' ')[0] || 'TBD'}</span>
              </div>
            </div>
          ))}
          {upcoming.length === 0 && <p className="text-sm text-muted-foreground col-span-3 text-center py-8">No upcoming visits</p>}
        </div>
      </div>

      <div>
        <h2 className="font-display font-semibold text-sm text-foreground mb-3">Completed Visits</h2>
        <div className="kpi-card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Lead</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Property</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Staff</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {past.map(visit => (
                <tr key={visit.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{visit.leads?.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{visit.properties?.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(visit.scheduled_at), 'MMM d, h:mm a')}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{visit.agents?.name}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs capitalize">
                      {visit.outcome && outcomeIcons[visit.outcome]}
                      {visit.outcome?.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {past.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-sm text-muted-foreground">No completed visits yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Visits;
