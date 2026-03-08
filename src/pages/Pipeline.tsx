import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import LeadCard from '@/components/LeadCard';
import LeadDetailDrawer from '@/components/LeadDetailDrawer';
import AddLeadDialog from '@/components/AddLeadDialog';
import { useLeads, useUpdateLead } from '@/hooks/useCrmData';
import { PIPELINE_STAGES, type PipelineStage } from '@/types/crm';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { toast } from 'sonner';
import type { LeadWithRelations } from '@/hooks/useCrmData';

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[60px] space-y-2 transition-colors rounded-lg ${isOver ? 'bg-primary/10 ring-1 ring-primary/30' : ''}`}
    >
      {children}
    </div>
  );
}

function DraggableCard({ lead, onClick }: { lead: LeadWithRelations; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-30' : ''}`}
      onDoubleClick={onClick}
    >
      <LeadCard lead={{
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
    </div>
  );
}

const Pipeline = () => {
  const { data: leads, isLoading } = useLeads();
  const updateLead = useUpdateLead();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadWithRelations | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeLead = leads?.find(l => l.id === activeId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as PipelineStage;
    const lead = leads?.find(l => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    try {
      await updateLead.mutateAsync({ id: leadId, status: newStatus });
      toast.success(`Moved to ${PIPELINE_STAGES.find(s => s.key === newStatus)?.label}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update lead');
    }
  };

  const openDetail = (lead: LeadWithRelations) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

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
    <AppLayout title="Lead Pipeline" subtitle="Track leads through every stage" actions={<AddLeadDialog />}>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
                  <DroppableColumn id={stage.key}>
                    {stageLeads.map(lead => (
                      <DraggableCard key={lead.id} lead={lead} onClick={() => openDetail(lead)} />
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="text-center py-8 text-xs text-muted-foreground">No leads</div>
                    )}
                  </DroppableColumn>
                </div>
              );
            })}
          </div>
        </div>

        <DragOverlay>
          {activeLead ? (
            <div className="rotate-2 opacity-90">
              <LeadCard lead={{
                id: activeLead.id,
                name: activeLead.name,
                phone: activeLead.phone,
                source: activeLead.source as any,
                status: activeLead.status as any,
                assignedAgent: activeLead.agents?.name || 'Unassigned',
                createdAt: activeLead.created_at,
                lastActivity: activeLead.last_activity_at,
                firstResponseTime: activeLead.first_response_time_min ?? undefined,
                budget: activeLead.budget ?? undefined,
                preferredLocation: activeLead.preferred_location ?? undefined,
                property: activeLead.properties?.name ?? undefined,
              }} compact />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <LeadDetailDrawer lead={selectedLead} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </AppLayout>
  );
};

export default Pipeline;
