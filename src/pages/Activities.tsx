import { useLanguage, getBilingualContent, getBilingualArray } from '@/lib/i18n';
import { usePublishedActivities } from '@/hooks/useActivities';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const Activities = () => {
  const { language } = useLanguage();
  const { data: activities, isLoading } = usePublishedActivities();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            {language === 'en' ? 'Activities & Leadership' : 'Hoạt động & Lãnh đạo'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'en'
              ? 'Community involvement, leadership roles, and extracurricular contributions.'
              : 'Tham gia cộng đồng, vai trò lãnh đạo và đóng góp ngoại khóa.'}
          </p>
        </div>
      </section>

      {/* Activities Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="text-center text-muted-foreground">
              {language === 'en' ? 'Loading...' : 'Đang tải...'}
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {activities.map((activity, index) => (
                <Card key={activity.id} className="hover-scale animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  {activity.image_url && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={activity.image_url}
                        alt={getBilingualContent(activity, language, 'title')}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6 space-y-4">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar size={16} className="text-primary" />
                      <span>
                        {new Date(activity.start_date).toLocaleDateString(
                          language === 'en' ? 'en-US' : 'vi-VN',
                          { year: 'numeric', month: 'short' }
                        )}
                        {activity.end_date &&
                          ` - ${new Date(activity.end_date).toLocaleDateString(
                            language === 'en' ? 'en-US' : 'vi-VN',
                            { year: 'numeric', month: 'short' }
                          )}`}
                      </span>
                    </div>

                    {/* Title & Organization */}
                    <div>
                      <h3 className="font-serif text-xl font-bold mb-1">
                        {getBilingualContent(activity, language, 'title')}
                      </h3>
                      <p className="text-primary font-medium">
                        {getBilingualContent(activity, language, 'organization')}
                      </p>
                      {(activity.role_en || activity.role_vi) && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {getBilingualContent(activity, language, 'role')}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    {(activity.description_en || activity.description_vi) && (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {getBilingualContent(activity, language, 'description')}
                      </p>
                    )}

                    {/* Achievements */}
                    {(activity.achievements_en || activity.achievements_vi) && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          {language === 'en' ? 'Key Contributions' : 'Đóng góp chính'}
                        </h4>
                        <ul className="space-y-1">
                          {getBilingualArray(activity, language, 'achievements').map((achievement, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              {language === 'en' ? 'No activities available.' : 'Chưa có hoạt động nào.'}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Activities;
