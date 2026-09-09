import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { EventCard } from '../components/EventCard';
import { organizerApi } from '../services/organizerApi';
import { Loader2, Calendar, Facebook, Twitter, Instagram, Globe, ArrowLeft, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

const OrganizerProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [organizerData, setOrganizerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadOrganizerProfile();
  }, [userId]);

  useEffect(() => {
    if (organizerData) {
      document.title = `${organizerData.organizer.name} - Organizer Profile | TurnApp`;
    }
  }, [organizerData]);

  const loadOrganizerProfile = async () => {
    setLoading(true);
    try {
      const response = await organizerApi.getOrganizerProfile(userId);
      
      if (response.success) {
        setOrganizerData(response.data);
      } else {
        toast.error('Organizer not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading organizer profile:', error);
      toast.error('Failed to load organizer profile');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-5 w-5" />;
      case 'twitter':
        return <Twitter className="h-5 w-5" />;
      case 'instagram':
        return <Instagram className="h-5 w-5" />;
      case 'website':
        return <Globe className="h-5 w-5" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        </div>
      </div>
    );
  }

  if (!organizerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Organizer not found</h1>
          <Button onClick={() => navigate('/')}>Back to Events</Button>
        </div>
      </div>
    );
  }

  const { organizer, upcoming_events, past_events } = organizerData;

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-8 hover:bg-white/5 transition-all duration-300 group text-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>

        {/* Organizer Header */}
        <div className="glass rounded-2xl p-6 sm:p-10 mb-8">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              {organizer.profile_photo_url ? (
                <img
                  src={organizer.profile_photo_url}
                  alt={organizer.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-primary/20 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20 shadow-lg">
                  <User className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                </div>
              )}
            </div>

            {/* Organizer Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 break-words">
                {organizer.name}
              </h1>
              
              {organizer.bio && (
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4 max-w-3xl">
                  {organizer.bio}
                </p>
              )}

              {/* Social Links */}
              {organizer.social_links && Object.keys(organizer.social_links).length > 0 && (
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  {Object.entries(organizer.social_links).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 text-white transition-all hover:scale-105 active:scale-95"
                      title={`Visit ${platform}`}
                    >
                      {getSocialIcon(platform)}
                      <span className="text-sm capitalize font-medium">{platform}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Events</h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full sm:w-auto grid-cols-2 mb-8 bg-white/5">
              <TabsTrigger value="upcoming" className="text-base data-[state=active]:bg-primary data-[state=active]:text-white">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="past" className="text-base data-[state=active]:bg-primary data-[state=active]:text-white">
                Past
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-0">
              {upcoming_events && upcoming_events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcoming_events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-10 w-10 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Upcoming Events
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    This organizer doesn't have any upcoming events at the moment. Check back later!
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-0">
              {past_events && past_events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {past_events.map((event) => (
                    <EventCard key={event.id} event={event} isPast={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-10 w-10 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Past Events
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    This organizer doesn't have any past events yet.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrganizerProfilePage;
