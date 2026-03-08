import AppLayout from '@/components/AppLayout';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Conversations = () => (
  <AppLayout title="Conversations" subtitle="WhatsApp & messaging hub">
    <div className="flex items-center justify-center h-[60vh]">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
          <MessageCircle size={28} className="text-accent" />
        </div>
        <h2 className="font-display font-semibold text-base text-foreground mb-2">Conversations Coming Soon</h2>
        <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
          WhatsApp integration will enable direct messaging with leads from within the CRM. Connect your WhatsApp Business API to get started.
        </p>
      </motion.div>
    </div>
  </AppLayout>
);

export default Conversations;
