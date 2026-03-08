import AppLayout from '@/components/AppLayout';
import LeadCard from '@/components/LeadCard';
import { useLeads } from '@/hooks/useCrmData';
import { PIPELINE_STAGES } from '@/types/crm';
import { Skeleton } from '@/components/ui/skeleton';

const Pipeline = () => {
  const { data: leads, isLoading } = useLeads();

  if (isLoading) {
    return (
      <AppLayout title="Lead Pipeline" subtitle="Track leads through every stage">
        <div className="flex gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[400px] w-[290px] rounded-xl" />)}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Lead Pipeline" subtitle="Track leads through every stage">
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {PIPELINE_STAGES.map(stage => {
            const stageLeads = leads?.filter(l => l.status === stage.key) || [];
            return (
              <div key={stage.key} className="pipeline-column bg-secondary/50 w-[290px]">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                    <h3 className="font-display font-semibold text-xs text-foreground">{stage.label}</h3>
                  </div>
                  <span className="text-[10px] font-medium bg-card px-2 py-0.5 rounded-full text-muted-foreground border border-border">
                    {stageLeads.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {stageLeads.map(lead => (
                    <LeadCard key={lead.id} lead={{
                      id: lead.id,
                      name: lead.name,
                      phone: lead.phone,
                      source: lead.source as any,
                      status: lead.status as any,
                      assignedAgent: lead.agents?.name || 'Unassigned',
                      createdAt: lead.created_at,
                      lastActivity: lead.last_activity_at,
                      firstResponseTime: lead.first_response_time_min ?? undefined,
                      budget: lead.budget ?? undefined,
                      preferredLocation: lead.preferred_location ?? undefined,
                      property: lead.properties?.name ?? undefined,
                    }} />
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="text-center py-8 text-xs text-muted-foreground">No leads</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Pipeline;
