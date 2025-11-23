import { useLanguage, getBilingualContent, getBilingualArray } from '@/lib/i18n';
import { usePublishedExperiences } from '@/hooks/useExperiences';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin } from 'lucide-react';

const Experience = () => {
  const { language } = useLanguage();
  const { data: experiences, isLoading } = usePublishedExperiences();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            {language === 'en' ? 'Professional Experience' : 'Kinh nghiệm làm việc'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'en'
              ? 'A journey of growth, leadership, and impactful contributions across various organizations.'
              : 'Hành trình phát triển, lãnh đạo và đóng góp có ý nghĩa tại các tổ chức khác nhau.'}
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center text-muted-foreground">
              {language === 'en' ? 'Loading...' : 'Đang tải...'}
            </div>
          ) : experiences && experiences.length > 0 ? (
            <div className="space-y-8">
              {experiences.map((exp, index) => (
                <Card key={exp.id} className="hover-scale animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Date & Location */}
                      <div className="md:col-span-1 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar size={16} className="text-primary" />
                          <span>
                            {new Date(exp.start_date).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN', {
                              year: 'numeric',
                              month: 'short'
                            })}
                            {' - '}
                            {exp.end_date
                              ? new Date(exp.end_date).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN', {
                                  year: 'numeric',
                                  month: 'short'
                                })
                              : language === 'en' ? 'Present' : 'Hiện tại'}
                          </span>
                        </div>
                        {exp.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin size={16} className="text-primary" />
                            <span>{exp.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="md:col-span-3 space-y-4">
                        <div>
                          <h3 className="font-serif text-2xl font-bold mb-1">
                            {getBilingualContent(exp, language, 'title')}
                          </h3>
                          <p className="text-lg text-primary font-medium">
                            {getBilingualContent(exp, language, 'company')}
                          </p>
                        </div>

                        {(exp.description_en || exp.description_vi) && (
                          <p className="text-muted-foreground leading-relaxed">
                            {getBilingualContent(exp, language, 'description')}
                          </p>
                        )}

                        {/* Achievements */}
                        {(exp.achievements_en || exp.achievements_vi) && (
                          <div>
                            <h4 className="font-semibold mb-3">
                              {language === 'en' ? 'Key Achievements' : 'Thành tựu nổi bật'}
                            </h4>
                            <ul className="space-y-2">
                              {getBilingualArray(exp, language, 'achievements').map((achievement, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                  <span className="text-muted-foreground">{achievement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              {language === 'en' ? 'No experience data available.' : 'Chưa có dữ liệu kinh nghiệm.'}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Experience;
