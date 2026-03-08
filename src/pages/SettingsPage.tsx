import AppLayout from '@/components/AppLayout';
import { Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsPage = () => (
  <AppLayout title="Settings" subtitle="System configuration">
    <div className="flex items-center justify-center h-[60vh]">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
          <SettingsIcon size={28} className="text-accent" />
        </div>
        <h2 className="font-display font-semibold text-base text-foreground mb-2">Settings</h2>
        <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
          Configure lead assignment rules, SLA thresholds, notification preferences, and team management.
        </p>
      </motion.div>
    </div>
  </AppLayout>
);

export default SettingsPage;
