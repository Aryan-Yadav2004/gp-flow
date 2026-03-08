import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Shield, MapPin, Bed, Wifi, Coffee, Shirt, ShieldCheck, Sparkles, Users, Phone, MessageCircle, Video, CalendarCheck, CreditCard, Clock, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePublicProperty, useCreateReservation, useConfirmReservation } from '@/hooks/usePublicData';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const AMENITY_ICONS: Record<string, any> = {
  WiFi: Wifi, Food: Coffee, Laundry: Shirt, Security: ShieldCheck, Cleaning: Sparkles,
};

type ActionMode = null | 'chat' | 'virtual_tour' | 'schedule_visit' | 'pre_book';

export default function PropertyDetail() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { data: property, isLoading } = usePublicProperty(propertyId);
  const createReservation = useCreateReservation();
  const confirmReservation = useConfirmReservation();

  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', email: '', moveInDate: '' });
  const [reservationResult, setReservationResult] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading property...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Property not found</h2>
          <Button onClick={() => navigate('/explore')}>Back to Explore</Button>
        </div>
      </div>
    );
  }

  const allRooms = property.rooms || [];
  const vacantBeds = allRooms.flatMap((r: any) => (r.beds || []).filter((b: any) => b.status === 'vacant'));
  const totalBeds = allRooms.reduce((s: number, r: any) => s + (r.beds?.length || 0), 0);

  const handlePreBook = async () => {
    if (!selectedBed || !selectedRoom || !customerForm.name || !customerForm.phone) {
      toast.error('Please fill in all required fields and select a bed.');
      return;
    }
    try {
      const result = await createReservation.mutateAsync({
        property_id: property.id,
        bed_id: selectedBed.id,
        room_id: selectedRoom.id,
        customer_name: customerForm.name,
        customer_phone: customerForm.phone,
        customer_email: customerForm.email || undefined,
        move_in_date: customerForm.moveInDate || undefined,
        room_type: selectedRoom.room_type || undefined,
        monthly_rent: selectedRoom.rent_per_bed || selectedRoom.expected_rent || undefined,
      });
      setReservationResult(result);
      toast.success('Bed reserved! Complete payment within 10 minutes.');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleConfirmPayment = async () => {
    if (!reservationResult?.reservation_id) return;
    try {
      await confirmReservation.mutateAsync({
        reservation_id: reservationResult.reservation_id,
        payment_reference: 'SIM_' + Date.now(),
      });
      toast.success('Booking confirmed! Our team will contact you shortly.');
      setActionMode(null);
      setReservationResult(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/explore')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} /> Back to search
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-xs">G</span>
            </div>
            <span className="font-semibold text-sm">Gharpayy</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Gallery */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl overflow-hidden">
            <div className="aspect-[4/3] bg-muted relative">
              {property.photos?.length > 0 ? (
                <img src={property.photos[0]} alt={property.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Bed size={64} className="text-muted-foreground/20" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                  {property.photos?.[i] ? (
                    <img src={property.photos[i]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Bed size={24} className="text-muted-foreground/15" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {(property as any).is_verified && (
                  <Badge variant="secondary" className="text-2xs gap-1"><Shield size={11} className="text-success" /> Verified</Badge>
                )}
                {property.gender_allowed && property.gender_allowed !== 'any' && (
                  <Badge variant="secondary" className="text-2xs capitalize">{property.gender_allowed} only</Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-1">{property.name}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin size={14} /> {[property.area, property.city].filter(Boolean).join(', ')}</span>
                {(property as any).rating && (
                  <span className="flex items-center gap-1"><Star size={14} className="fill-accent text-accent" /> {(property as any).rating} ({(property as any).total_reviews || 0} reviews)</span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card><CardContent className="p-4 text-center">
                <p className="text-2xl font-semibold text-foreground">{vacantBeds.length}</p>
                <p className="text-2xs text-muted-foreground">Beds Available</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <p className="text-2xl font-semibold text-foreground">{allRooms.length}</p>
                <p className="text-2xs text-muted-foreground">Rooms</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <p className="text-2xl font-semibold text-foreground">{totalBeds}</p>
                <p className="text-2xs text-muted-foreground">Total Beds</p>
              </CardContent></Card>
            </div>

            <Separator />

            {/* Description */}
            {(property as any).description && (
              <>
                <div>
                  <h2 className="text-lg font-semibold mb-3">About this property</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{(property as any).description}</p>
                </div>
                <Separator />
              </>
            )}

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <>
                <div>
                  <h2 className="text-lg font-semibold mb-4">What this place offers</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {property.amenities.map((amenity: string) => {
                      const Icon = AMENITY_ICONS[amenity] || Check;
                      return (
                        <div key={amenity} className="flex items-center gap-3 py-2">
                          <Icon size={18} className="text-muted-foreground" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Rooms */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Available rooms</h2>
              <div className="space-y-3">
                {allRooms.map((room: any) => {
                  const roomVacant = (room.beds || []).filter((b: any) => b.status === 'vacant').length;
                  const rent = room.rent_per_bed || room.expected_rent;
                  return (
                    <Card key={room.id} className={`transition-all ${selectedRoom?.id === room.id ? 'ring-2 ring-accent' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm">Room {room.room_number}</h3>
                            {room.room_type && <Badge variant="secondary" className="text-2xs capitalize">{room.room_type}</Badge>}
                          </div>
                          <Badge variant={roomVacant > 0 ? 'default' : 'secondary'} className="text-2xs">
                            {roomVacant} / {room.bed_count} beds free
                          </Badge>
                        </div>
                        <div className="flex items-baseline justify-between mb-3">
                          <span className="text-xl font-semibold">{rent ? `₹${rent.toLocaleString()}` : '—'}</span>
                          <span className="text-2xs text-muted-foreground">/bed/month</span>
                        </div>
                        {/* Bed selection */}
                        {roomVacant > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {(room.beds || []).filter((b: any) => b.status === 'vacant').map((bed: any) => (
                              <button
                                key={bed.id}
                                onClick={() => { setSelectedRoom(room); setSelectedBed(bed); }}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                  selectedBed?.id === bed.id
                                    ? 'bg-accent text-accent-foreground border-accent'
                                    : 'bg-secondary text-secondary-foreground border-border hover:border-muted-foreground/30'
                                }`}
                              >
                                <Bed size={12} className="inline mr-1" />{bed.bed_number}
                              </button>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Confidence Signals */}
            <div className="rounded-xl bg-secondary/50 p-5 flex flex-wrap gap-6">
              {(property as any).is_verified && (
                <div className="flex items-center gap-2 text-sm"><Shield size={16} className="text-success" /> Verified by Gharpayy</div>
              )}
              <div className="flex items-center gap-2 text-sm"><Clock size={16} className="text-muted-foreground" /> Updated recently</div>
              <div className="flex items-center gap-2 text-sm"><Users size={16} className="text-muted-foreground" /> {vacantBeds.length} beds remaining</div>
            </div>
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card className="shadow-md">
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-semibold text-base mb-1">Interested in this PG?</h3>
                  <p className="text-2xs text-muted-foreground mb-4">Choose how you'd like to proceed</p>

                  <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => setActionMode('chat')}>
                    <MessageCircle size={18} className="text-info" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Chat with Gharpayy</p>
                      <p className="text-2xs text-muted-foreground">Get instant answers</p>
                    </div>
                  </Button>

                  <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => setActionMode('virtual_tour')}>
                    <Video size={18} className="text-accent" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Book a Virtual Tour</p>
                      <p className="text-2xs text-muted-foreground">See it from home</p>
                    </div>
                  </Button>

                  <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => setActionMode('schedule_visit')}>
                    <CalendarCheck size={18} className="text-success" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Schedule a Visit</p>
                      <p className="text-2xs text-muted-foreground">Visit in person</p>
                    </div>
                  </Button>

                  <Separator />

                  <Button className="w-full h-12 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setActionMode('pre_book')}>
                    <CreditCard size={18} />
                    Pre-Book Now — ₹1,000
                  </Button>
                  <p className="text-2xs text-muted-foreground text-center">Reserve a bed instantly. Fully refundable within 24h.</p>
                </CardContent>
              </Card>

              {/* Similar Properties */}
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Nearby areas</h4>
                <div className="flex flex-wrap gap-2">
                  {['Bellandur', 'Brookefield', 'Whitefield', 'Marathahalli'].map(area => (
                    <Badge key={area} variant="secondary" className="cursor-pointer text-2xs" onClick={() => navigate(`/explore?area=${area}`)}>
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Book Dialog */}
      <Dialog open={actionMode === 'pre_book'} onOpenChange={(o) => { if (!o) { setActionMode(null); setReservationResult(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{reservationResult ? 'Complete Payment' : 'Pre-Book a Bed'}</DialogTitle>
          </DialogHeader>

          {!reservationResult ? (
            <div className="space-y-4">
              {selectedBed ? (
                <div className="p-3 rounded-lg bg-secondary text-sm">
                  <strong>{property.name}</strong> · Room {selectedRoom?.room_number} · Bed {selectedBed.bed_number}
                  <br /><span className="text-muted-foreground">₹{(selectedRoom?.rent_per_bed || selectedRoom?.expected_rent || 0).toLocaleString()}/month</span>
                </div>
              ) : (
                <p className="text-sm text-destructive">Please select a bed from the rooms section first.</p>
              )}
              <div className="space-y-3">
                <div><Label>Full Name *</Label><Input value={customerForm.name} onChange={e => setCustomerForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div><Label>Phone *</Label><Input value={customerForm.phone} onChange={e => setCustomerForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div><Label>Email</Label><Input value={customerForm.email} onChange={e => setCustomerForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div><Label>Move-in Date</Label><Input type="date" value={customerForm.moveInDate} onChange={e => setCustomerForm(f => ({ ...f, moveInDate: e.target.value }))} /></div>
              </div>
              <DialogFooter>
                <Button onClick={handlePreBook} disabled={!selectedBed || !customerForm.name || !customerForm.phone || createReservation.isPending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  {createReservation.isPending ? 'Reserving...' : 'Reserve Bed — ₹1,000'}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-center">
                <Check size={32} className="mx-auto text-success mb-2" />
                <p className="font-medium text-sm">Bed Reserved!</p>
                <p className="text-2xs text-muted-foreground mt-1">Complete payment within 10 minutes to confirm.</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold mb-1">₹1,000</p>
                <p className="text-2xs text-muted-foreground">Reservation Fee (adjusted against first month rent)</p>
              </div>
              <DialogFooter>
                <Button onClick={handleConfirmPayment} disabled={confirmReservation.isPending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  {confirmReservation.isPending ? 'Processing...' : 'Simulate Payment ₹1,000'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={actionMode === 'chat'} onOpenChange={(o) => !o && setActionMode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Chat with Gharpayy</DialogTitle></DialogHeader>
          <div className="min-h-[200px] flex items-center justify-center text-sm text-muted-foreground">
            <div className="text-center">
              <MessageCircle size={32} className="mx-auto mb-3 text-muted-foreground/40" />
              <p>Our agents typically respond within 2 minutes.</p>
              <p className="text-2xs mt-1">Or call us: <a href="tel:+919876543210" className="text-accent font-medium">+91 98765 43210</a></p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Visit Dialog */}
      <Dialog open={actionMode === 'schedule_visit'} onOpenChange={(o) => !o && setActionMode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Schedule a Visit</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Your Name</Label><Input placeholder="Full name" /></div>
            <div><Label>Phone</Label><Input placeholder="+91..." /></div>
            <div><Label>Preferred Date</Label><Input type="date" /></div>
            <div><Label>Preferred Time</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select time slot" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10am">10:00 AM</SelectItem>
                  <SelectItem value="12pm">12:00 PM</SelectItem>
                  <SelectItem value="2pm">2:00 PM</SelectItem>
                  <SelectItem value="4pm">4:00 PM</SelectItem>
                  <SelectItem value="6pm">6:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => { toast.success('Visit request submitted! We\'ll confirm shortly.'); setActionMode(null); }}>
              Request Visit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Virtual Tour Dialog */}
      <Dialog open={actionMode === 'virtual_tour'} onOpenChange={(o) => !o && setActionMode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Book a Virtual Tour</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">See the property from the comfort of your home. A Gharpayy agent will give you a live video walkthrough.</p>
            <div><Label>Your Name</Label><Input placeholder="Full name" /></div>
            <div><Label>Phone / WhatsApp</Label><Input placeholder="+91..." /></div>
            <div><Label>Preferred Slot</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today_now">Today - As soon as possible</SelectItem>
                  <SelectItem value="today_eve">Today - Evening (5-7 PM)</SelectItem>
                  <SelectItem value="tomorrow_morn">Tomorrow - Morning (10-12 PM)</SelectItem>
                  <SelectItem value="tomorrow_eve">Tomorrow - Evening (5-7 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => { toast.success('Virtual tour booked! Check WhatsApp for the link.'); setActionMode(null); }}>
              Book Virtual Tour
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
