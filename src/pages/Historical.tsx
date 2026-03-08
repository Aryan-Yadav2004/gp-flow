import AppLayout from '@/components/AppLayout';
import { History, Upload, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Historical = () => (
  <AppLayout title="Historical Leads" subtitle="Import and re-engage past leads">
    <div className="flex items-center justify-center h-[60vh]">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
          <History size={28} className="text-accent" />
        </div>
        <h2 className="font-display font-semibold text-base text-foreground mb-2">Historical Lead Database</h2>
        <p className="text-xs text-muted-foreground max-w-sm mb-8 leading-relaxed">
          Import past lead data to segment and re-engage customers. Filter by location, budget, and last interaction.
        </p>
        <div className="flex gap-3 justify-center">
          <Button className="gap-2 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
            <Upload size={15} /> Import CSV
          </Button>
          <Button variant="outline" className="gap-2 rounded-xl">
            <Search size={15} /> Search Leads
          </Button>
        </div>
      </motion.div>
    </div>
  </AppLayout>
);

export default Historical;
