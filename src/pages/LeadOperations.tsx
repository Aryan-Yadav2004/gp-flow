import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useLeads, useAgents, useCreateLead, useVisits, useUpdateLead } from '@/hooks/useCrmData';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Users, AlertTriangle, CalendarCheck, Kanban } from 'lucide-react';
import { SOURCE_LABELS, PIPELINE_STAGES } from '@/types/crm';
import { format, differenceInDays } from 'date-fns';

const LeadOperations = () => {
  const { data: leads } = useLeads();
  const { data: agents } = useAgents();
  const { data: visits } = useVisits();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const [form, setForm] = useState({ name: '', phone: '', source: 'website' });
  const [activeTab, setActiveTab] = useState<'capture' | 'assignment' | 'reminders'>('capture');

  // --- 1. & 2. Lead Capture & Round Robin Assignment ---
  const handleCaptureLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return toast.error('Name and Phone are required.');

    // Mock Round Robin Logic (find agent with least leads or sequential)
    let assignedAgentId = null;
    let assignedAgentName = 'Unassigned';
    if (agents && agents.length > 0) {
      // Basic round robin or workload balancing: Assign to agent with fewest new leads
      const agentLoads = agents.map(agent => {
        const agentLeadsCount = leads?.filter(l => l.assigned_agent_id === agent.id && l.status === 'new').length || 0;
        return { ...agent, load: agentLeadsCount };
      }).sort((a, b) => a.load - b.load);
      
      assignedAgentId = agentLoads[0].id;
      assignedAgentName = agentLoads[0].name;
    }

    try {
      await createLead.mutateAsync({
        name: form.name,
        phone: form.phone,
        source: form.source as any,
        status: 'new',
        assigned_agent_id: assignedAgentId,
      });
      toast.success(`Lead captured & assigned automatically to ${assignedAgentName}`);
      setForm({ name: '', phone: '', source: 'website' });
    } catch (err: any) {
      toast.error('Failed to capture lead: ' + err.message);
    }
  };

  // --- 5. Follow-up Reminders (Day 1 logic) ---
  const inactiveLeads = leads?.filter(l => {
    // Lead is inactive if last_activity is more than 1 day ago and status is not booked/lost
    if (l.status === 'booked' || l.status === 'lost') return false;
    const daysInactive = differenceInDays(new Date(), new Date(l.last_activity_at || l.created_at));
    return daysInactive >= 1;
  });

  const handleReminderAction = async (leadId: string) => {
    try {
      await updateLead.mutateAsync({
        id: leadId,
        last_activity_at: new Date().toISOString()
      });
      toast.success('Follow-up recorded. Lead marked as active.');
    } catch(err) {
      toast.error('Failed to update lead');
    }
  };

  // --- 6. Quick Dashboard Stats ---
  const totalLeads = leads?.length || 0;
  const newLeads = leads?.filter(l => l.status === 'new').length || 0;
  const scheduledVisits = visits?.filter(v => !v.outcome).length || 0;
  const confirmedBookings = leads?.filter(l => l.status === 'booked').length || 0;

  return (
    <AppLayout title="Lead Operations" subtitle="Central Hub for Lead Capture, Assignment, and Follow-ups">
      
      {/* 6. Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex flex-col gap-1 text-primary">
            <span className="text-xs uppercase font-bold tracking-wider">Total Leads</span>
            <span className="text-2xl font-bold">{totalLeads}</span>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4 flex flex-col gap-1 text-destructive">
            <span className="text-xs uppercase font-bold tracking-wider">New Pipeline</span>
            <span className="text-2xl font-bold">{newLeads}</span>
          </CardContent>
        </Card>
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="p-4 flex flex-col gap-1 text-accent">
            <span className="text-xs uppercase font-bold tracking-wider">Visits Scheduled</span>
            <span className="text-2xl font-bold">{scheduledVisits}</span>
          </CardContent>
        </Card>
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-4 flex flex-col gap-1 text-success">
            <span className="text-xs uppercase font-bold tracking-wider">Bookings</span>
            <span className="text-2xl font-bold">{confirmedBookings}</span>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <Button variant={activeTab === 'capture' ? 'default' : 'outline'} onClick={() => setActiveTab('capture')} className="rounded-xl">1-2. Capture & Assign</Button>
        <Button variant={activeTab === 'reminders' ? 'default' : 'outline'} onClick={() => setActiveTab('reminders')} className="rounded-xl">5. Follow-up Reminders</Button>
      </div>

      {activeTab === 'capture' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Lead Capture (Auto-Assign)</CardTitle>
              <CardDescription>Simulates webhook from Tally/Calendly.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCaptureLead} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Name</label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-10 rounded-xl" placeholder="John Doe" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Phone</label>
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="h-10 rounded-xl" placeholder="9876543210" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Source</label>
                  <Select value={form.source} onValueChange={v => setForm({...form, source: v})}>
                    <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full h-10 rounded-xl mt-2">Simulate Integration</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 shadow-sm bg-secondary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2"><Users size={18} /> Assignment Engine</CardTitle>
              <CardDescription>Visualizing workload logic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
               {agents?.map(agent => {
                 const currentLoad = leads?.filter(l => l.assigned_agent_id === agent.id && l.status === 'new').length || 0;
                 return (
                   <div key={agent.id} className="flex justify-between items-center bg-card p-3 rounded-xl border shadow-sm">
                     <div>
                       <p className="text-sm font-medium">{agent.name}</p>
                       <p className="text-xs text-muted-foreground">{agent.role}</p>
                     </div>
                     <div className="text-right">
                       <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg font-bold">{currentLoad} New Leads</span>
                     </div>
                   </div>
                 );
               })}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'reminders' && (
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive"><AlertTriangle size={18} /> Day 1 Follow-up Reminders</CardTitle>
            <CardDescription>Leads inactive for more than 24 hours.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {inactiveLeads && inactiveLeads.length > 0 ? inactiveLeads.map(lead => (
                <div key={lead.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                  <div>
                    <h4 className="font-semibold text-sm">{lead.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{lead.phone} • Assigned to: {lead.agents?.name || 'Unassigned'}</p>
                    <p className="text-[10px] text-destructive mt-1 font-medium">Inactive since: {format(new Date(lead.last_activity_at), 'MMM d, h:mm a')}</p>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-lg h-8 text-xs shrink-0" onClick={() => handleReminderAction(lead.id)}>
                    Log Action & Reset
                  </Button>
                </div>
              )) : (
                <div className="p-8 text-center text-sm text-muted-foreground">No inactive leads matching Day 1 criteria. All good!</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3 & 4. Pipeline and Visits are natively accessible via Sidebar, but we can call them out here */}
      <div className="mt-8 border-t pt-8 grid grid-cols-2 gap-4">
         <Card className="bg-secondary/30 border-dashed cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => window.location.href='/pipeline'}>
           <CardContent className="p-6 text-center">
             <Kanban size={24} className="mx-auto mb-2 text-primary" />
             <h3 className="font-semibold text-sm">3. Sales Pipeline</h3>
             <p className="text-xs text-muted-foreground mt-1">Click to view the Kanban board logic</p>
           </CardContent>
         </Card>
         <Card className="bg-secondary/30 border-dashed cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => window.location.href='/visits'}>
           <CardContent className="p-6 text-center">
             <CalendarCheck size={24} className="mx-auto mb-2 text-primary" />
             <h3 className="font-semibold text-sm">4. Visit Scheduling</h3>
             <p className="text-xs text-muted-foreground mt-1">Click to view scheduling features</p>
           </CardContent>
         </Card>
      </div>

    </AppLayout>
  );
};

export default LeadOperations;
