import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Share,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import { ThemedText } from '@/components/ThemedText';
import { useStatistics } from '@/hooks/useStatistics';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BorderRadius, Spacing, Typography } from '@/constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type StoryCard = {
  id: string;
  type: 'intro' | 'stat' | 'insight' | 'title' | 'finale';
  gradient: [string, string];
  showConfetti?: boolean;
};

function AnimatedNumber({ value, duration = 1500, delay = 300, style }: {
  value: number;
  duration?: number;
  delay?: number;
  style?: any;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Add listener first
    const listenerId = animatedValue.addListener(({ value: v }) => {
      setDisplayValue(Math.round(v));
    });

    // Then start animation after delay
    const timeout = setTimeout(() => {
      Animated.timing(animatedValue, {
        toValue: value,
        duration,
        useNativeDriver: false,
      }).start();
    }, delay);

    return () => {
      clearTimeout(timeout);
      animatedValue.removeListener(listenerId);
    };
  }, [value, duration, delay, animatedValue]);

  return <ThemedText style={style}>{displayValue}</ThemedText>;
}

function FadeInView({ delay = 0, duration = 600, children, style }: {
  delay?: number;
  duration?: number;
  children: React.ReactNode;
  style?: any;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay, duration, fadeAnim, slideAnim]);

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {children}
    </Animated.View>
  );
}

export default function RecapScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const confettiRef = useRef<ConfettiCannon>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState<{ [key: number]: boolean }>({});

  const { totalBabies, totalDeliveries, yearlyBabyCounts, genderCounts, deliveryCounts } = useStatistics();

  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const maleColor = useThemeColor({}, 'male');
  const femaleColor = useThemeColor({}, 'female');
  const errorColor = useThemeColor({}, 'error');

  const recapYear = new Date().getFullYear() - 1;
  const recapEntry = yearlyBabyCounts.find((entry) => entry.year === recapYear);
  const babiesThisYear = recapEntry?.babies ?? 0;
  const deliveriesThisYear = recapEntry?.deliveries.total ?? 0;

  // Calculate insights
  const getBusiestMonth = () => {
    // We don't have monthly data, so we'll skip this for now
    return null;
  };

  const getYearComparison = () => {
    const lastYear = yearlyBabyCounts.find((e) => e.year === recapYear - 1);
    if (!lastYear || lastYear.babies === 0) return null;
    const diff = babiesThisYear - lastYear.babies;
    const percentChange = Math.round((diff / lastYear.babies) * 100);
    return { diff, percentChange, increased: diff > 0 };
  };

  const getFunFact = () => {
    if (babiesThisYear === 0) return null;
    const facts = [
      `If all ${babiesThisYear} babies cried at once, you'd need serious earplugs!`,
      `${babiesThisYear} babies = approximately ${babiesThisYear * 8} tiny fingers and toes you helped bring into the world!`,
      `You've witnessed ${babiesThisYear} first breaths this year. That's magical!`,
      `${babiesThisYear} new humans started their journey with your help!`,
    ];
    return facts[babiesThisYear % facts.length];
  };

  const getUserTitle = () => {
    if (totalBabies === 0) return { title: 'The Beginning', subtitle: 'Your journey starts now' };

    const boysRatio = genderCounts.boys / (totalBabies || 1);
    const girlsRatio = genderCounts.girls / (totalBabies || 1);
    const cSectionRatio = deliveryCounts.cSection / (totalDeliveries || 1);

    if (totalBabies >= 100) return { title: 'The Centurion', subtitle: '100+ babies delivered' };
    if (totalBabies >= 50) return { title: 'The Veteran', subtitle: '50+ babies and counting' };
    if (genderCounts.angels > 5) return { title: 'The Guardian Angel', subtitle: 'Compassion in difficult moments' };
    if (boysRatio > 0.7) return { title: 'The Boy Whisperer', subtitle: 'Boys love arriving on your watch' };
    if (girlsRatio > 0.7) return { title: 'The Girl Magnet', subtitle: 'Girls prefer your care' };
    if (cSectionRatio > 0.6) return { title: 'The Surgical Star', subtitle: 'C-section specialist' };
    if (deliveryCounts.vaginal > deliveryCounts.cSection * 2) return { title: 'The Natural', subtitle: 'Champion of vaginal deliveries' };
    if (totalBabies >= 25) return { title: 'The Rising Star', subtitle: 'Making your mark' };
    if (totalBabies >= 10) return { title: 'The Dedicated', subtitle: 'Building your legacy' };
    return { title: 'The Newcomer', subtitle: 'Every expert was once a beginner' };
  };

  const yearComparison = getYearComparison();
  const funFact = getFunFact();
  const userTitle = getUserTitle();
  const hasDataThisYear = babiesThisYear > 0;

  const cards: StoryCard[] = hasDataThisYear
    ? [
        { id: 'intro', type: 'intro', gradient: [primaryColor, successColor] },
        { id: 'babies', type: 'stat', gradient: [successColor, '#2DD4BF'], showConfetti: babiesThisYear >= 10 },
        { id: 'deliveries', type: 'stat', gradient: [primaryColor, '#8B5CF6'] },
        { id: 'gender', type: 'stat', gradient: [maleColor, femaleColor] },
        ...(yearComparison ? [{ id: 'comparison', type: 'insight' as const, gradient: [warningColor, '#F97316'] as [string, string] }] : []),
        ...(funFact ? [{ id: 'funfact', type: 'insight' as const, gradient: ['#EC4899', '#F43F5E'] as [string, string] }] : []),
        { id: 'title', type: 'title', gradient: ['#7C3AED', '#4F46E5'], showConfetti: true },
        { id: 'finale', type: 'finale', gradient: [primaryColor, successColor] },
      ]
    : [
        { id: 'intro', type: 'intro', gradient: [primaryColor, successColor] },
        { id: 'nodata', type: 'insight', gradient: ['#6B7280', '#4B5563'] },
        ...(totalBabies > 0 ? [{ id: 'title', type: 'title' as const, gradient: ['#7C3AED', '#4F46E5'] as [string, string] }] : []),
        { id: 'finale', type: 'finale', gradient: [primaryColor, successColor] },
      ];

  const handleScroll = (event: any) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (page !== currentPage) {
      setCurrentPage(page);

      // Trigger confetti for specific pages
      const card = cards[page];
      if (card?.showConfetti && !hasTriggeredConfetti[page]) {
        setHasTriggeredConfetti((prev) => ({ ...prev, [page]: true }));
        confettiRef.current?.start();
      }
    }
  };

  const goToPage = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  const handleShare = async (cardId: string) => {
    try {
      let message = '';
      switch (cardId) {
        case 'babies':
          message = `In ${recapYear}, I welcomed ${babiesThisYear} babies into the world! 👶✨`;
          break;
        case 'deliveries':
          message = `I completed ${deliveriesThisYear} deliveries in ${recapYear}! 🏥💪`;
          break;
        case 'gender':
          message = `My ${recapYear} stats: ${recapEntry?.genders.boys ?? 0} boys 👦 and ${recapEntry?.genders.girls ?? 0} girls 👧`;
          break;
        case 'title':
          message = `My ${recapYear} title is "${userTitle.title}" - ${userTitle.subtitle}! 🏆`;
          break;
        default:
          message = `Check out my ${recapYear} Baby Wrap from MiracleMeter! I helped deliver ${babiesThisYear} babies this year! 👶✨`;
      }
      message += `\n\n#MiracleMeter #BabyWrap${recapYear}`;

      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderProgressDots = () => (
    <View style={[styles.progressContainer, { top: insets.top + Spacing.md }]}>
      {cards.map((_, index) => (
        <Pressable key={index} onPress={() => goToPage(index)}>
          <View
            style={[
              styles.progressDot,
              currentPage === index && styles.progressDotActive,
            ]}
          />
        </Pressable>
      ))}
    </View>
  );

  const renderIntroCard = () => (
    <View style={styles.cardContent}>
      <FadeInView delay={200}>
        <ThemedText style={styles.eyebrow}>MIRACLE METER</ThemedText>
      </FadeInView>
      <FadeInView delay={400}>
        <ThemedText style={styles.heroTitle}>Your {recapYear}{'\n'}Baby Wrap</ThemedText>
      </FadeInView>
      <FadeInView delay={600}>
        <ThemedText style={styles.heroSubtitle}>
          Let's celebrate the lives you helped bring into this world
        </ThemedText>
      </FadeInView>
      <FadeInView delay={800}>
        <Pressable style={styles.startButton} onPress={() => goToPage(1)}>
          <ThemedText style={styles.startButtonText}>Let's Go</ThemedText>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </Pressable>
      </FadeInView>
    </View>
  );

  const renderBabiesCard = () => (
    <View style={styles.cardContent}>
      <FadeInView delay={200}>
        <ThemedText style={styles.statLabel}>In {recapYear}, you welcomed</ThemedText>
      </FadeInView>
      <FadeInView delay={400}>
        <View style={styles.bigNumberContainer}>
          <AnimatedNumber value={babiesThisYear} style={styles.bigNumber} delay={600} />
          <ThemedText style={styles.bigNumberUnit}>babies</ThemedText>
        </View>
      </FadeInView>
      <FadeInView delay={1000}>
        <ThemedText style={styles.statSubtext}>into the world</ThemedText>
      </FadeInView>
    </View>
  );

  const renderDeliveriesCard = () => (
    <View style={styles.cardContent}>
      <FadeInView delay={200}>
        <ThemedText style={styles.statLabel}>Across</ThemedText>
      </FadeInView>
      <FadeInView delay={400}>
        <View style={styles.bigNumberContainer}>
          <AnimatedNumber value={deliveriesThisYear} style={styles.bigNumber} delay={600} />
          <ThemedText style={styles.bigNumberUnit}>deliveries</ThemedText>
        </View>
      </FadeInView>
      <FadeInView delay={1000}>
        <View style={styles.deliveryBreakdown}>
          {(recapEntry?.deliveries.vaginal ?? 0) > 0 && (
            <View style={styles.deliveryItem}>
              <Ionicons name="fitness-outline" size={20} color="rgba(255,255,255,0.9)" />
              <ThemedText style={styles.deliveryItemText}>
                {recapEntry?.deliveries.vaginal} vaginal
              </ThemedText>
            </View>
          )}
          {(recapEntry?.deliveries.cSection ?? 0) > 0 && (
            <View style={styles.deliveryItem}>
              <Ionicons name="medical-outline" size={20} color="rgba(255,255,255,0.9)" />
              <ThemedText style={styles.deliveryItemText}>
                {recapEntry?.deliveries.cSection} c-section
              </ThemedText>
            </View>
          )}
        </View>
      </FadeInView>
    </View>
  );

  const renderGenderCard = () => (
    <View style={styles.cardContent}>
      <FadeInView delay={200}>
        <ThemedText style={styles.statLabel}>The gender split</ThemedText>
      </FadeInView>
      <FadeInView delay={400}>
        <View style={styles.genderContainer}>
          <View style={styles.genderItem}>
            <Ionicons name="male" size={36} color="white" />
            <AnimatedNumber value={recapEntry?.genders.boys ?? 0} style={styles.genderNumber} delay={600} />
            <ThemedText style={styles.genderLabel}>boys</ThemedText>
          </View>
          <View style={styles.genderItem}>
            <Ionicons name="female" size={36} color="white" />
            <AnimatedNumber value={recapEntry?.genders.girls ?? 0} style={styles.genderNumber} delay={800} />
            <ThemedText style={styles.genderLabel}>girls</ThemedText>
          </View>
          {(recapEntry?.genders.angels ?? 0) > 0 && (
            <View style={styles.genderItem}>
              <Ionicons name="star" size={36} color="white" />
              <AnimatedNumber value={recapEntry?.genders.angels ?? 0} style={styles.genderNumber} delay={1000} />
              <ThemedText style={styles.genderLabel}>angels</ThemedText>
            </View>
          )}
        </View>
      </FadeInView>
    </View>
  );

  const renderComparisonCard = () => {
    if (!yearComparison) return null;
    return (
      <View style={styles.cardContent}>
        <FadeInView delay={200}>
          <ThemedText style={styles.statLabel}>Compared to {recapYear - 1}</ThemedText>
        </FadeInView>
        <FadeInView delay={400}>
          <View style={styles.comparisonContainer}>
            <Ionicons
              name={yearComparison.increased ? 'trending-up' : 'trending-down'}
              size={60}
              color="white"
            />
            <ThemedText style={styles.comparisonNumber}>
              {yearComparison.increased ? '+' : ''}{yearComparison.percentChange}%
            </ThemedText>
          </View>
        </FadeInView>
        <FadeInView delay={800}>
          <ThemedText style={styles.comparisonText}>
            {yearComparison.increased
              ? `You delivered ${yearComparison.diff} more babies than last year!`
              : `${Math.abs(yearComparison.diff)} fewer babies, but every one matters`
            }
          </ThemedText>
        </FadeInView>
      </View>
    );
  };

  const renderFunFactCard = () => {
    if (!funFact) return null;
    return (
      <View style={styles.cardContent}>
        <FadeInView delay={200}>
          <Ionicons name="bulb-outline" size={50} color="white" style={{ marginBottom: Spacing.lg }} />
        </FadeInView>
        <FadeInView delay={400}>
          <ThemedText style={styles.funFactText}>{funFact}</ThemedText>
        </FadeInView>
      </View>
    );
  };

  const renderNoDataCard = () => (
    <View style={styles.cardContent}>
      <FadeInView delay={200}>
        <Ionicons name="calendar-outline" size={60} color="white" style={{ marginBottom: Spacing.lg }} />
      </FadeInView>
      <FadeInView delay={400}>
        <ThemedText style={styles.noDataTitle}>No {recapYear} data yet</ThemedText>
      </FadeInView>
      <FadeInView delay={600}>
        <ThemedText style={styles.noDataText}>
          Start recording your deliveries to see your personalized {recapYear} Wrap!
        </ThemedText>
      </FadeInView>
      {totalBabies > 0 && (
        <FadeInView delay={800}>
          <ThemedText style={styles.noDataSubtext}>
            But don't worry — you have {totalBabies} babies recorded overall. Swipe to see your all-time title!
          </ThemedText>
        </FadeInView>
      )}
    </View>
  );

  const renderTitleCard = () => (
    <View style={styles.cardContent}>
      <FadeInView delay={200}>
        <ThemedText style={styles.titleCardLabel}>Your {recapYear} title is...</ThemedText>
      </FadeInView>
      <FadeInView delay={600}>
        <ThemedText style={styles.userTitle} numberOfLines={2} adjustsFontSizeToFit>
          {userTitle.title}
        </ThemedText>
      </FadeInView>
      <FadeInView delay={1000}>
        <ThemedText style={styles.userSubtitle} numberOfLines={2} adjustsFontSizeToFit>
          {userTitle.subtitle}
        </ThemedText>
      </FadeInView>
      <View style={styles.allTimeStats}>
        <View style={styles.allTimeStat}>
          <Text style={styles.allTimeValue}>{totalBabies ?? 0}</Text>
          <Text style={styles.allTimeLabel}>babies total</Text>
        </View>
        <View style={styles.allTimeDivider} />
        <View style={styles.allTimeStat}>
          <Text style={styles.allTimeValue}>{totalDeliveries ?? 0}</Text>
          <Text style={styles.allTimeLabel}>deliveries</Text>
        </View>
      </View>
    </View>
  );

  const renderFinaleCard = () => (
    <View style={styles.cardContent}>
      <FadeInView delay={200}>
        <Ionicons name="heart" size={50} color="white" style={{ marginBottom: Spacing.md }} />
      </FadeInView>
      <FadeInView delay={400}>
        <ThemedText style={styles.finaleTitle} numberOfLines={1} adjustsFontSizeToFit>
          Thank you
        </ThemedText>
      </FadeInView>
      <FadeInView delay={600}>
        <ThemedText style={styles.finaleText} numberOfLines={4}>
          For every life you've welcomed, every family you've helped create, and every moment of care you've given.
        </ThemedText>
      </FadeInView>
      <FadeInView delay={1000}>
        <View style={styles.finaleButtons}>
          <Pressable
            style={({ pressed }) => [styles.shareButton, pressed && styles.shareButtonPressed]}
            onPress={() => handleShare('title')}
          >
            <View style={styles.shareButtonInner}>
              <Ionicons name="share-outline" size={22} color={primaryColor} />
              <ThemedText style={[styles.shareButtonText, { color: primaryColor }]}>
                Share Your Wrap
              </ThemedText>
            </View>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.doneButton, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.doneButtonText}>Done</ThemedText>
          </Pressable>
        </View>
      </FadeInView>
    </View>
  );

  const renderCard = (card: StoryCard, index: number) => {
    let content;
    switch (card.id) {
      case 'intro': content = renderIntroCard(); break;
      case 'babies': content = renderBabiesCard(); break;
      case 'deliveries': content = renderDeliveriesCard(); break;
      case 'gender': content = renderGenderCard(); break;
      case 'comparison': content = renderComparisonCard(); break;
      case 'funfact': content = renderFunFactCard(); break;
      case 'nodata': content = renderNoDataCard(); break;
      case 'title': content = renderTitleCard(); break;
      case 'finale': content = renderFinaleCard(); break;
      default: content = null;
    }

    return (
      <View key={card.id} style={styles.cardWrapper}>
        <LinearGradient
          colors={card.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { paddingTop: insets.top + 50, paddingBottom: insets.bottom + Spacing.xl }]}
        >
          {content}
        </LinearGradient>

        {card.id !== 'intro' && card.id !== 'finale' && (
          <Pressable
            style={[styles.cardShareButton, { top: insets.top + 60 }]}
            onPress={() => handleShare(card.id)}
          >
            <Ionicons name="share-outline" size={22} color="white" />
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          bounces={false}
        >
          {cards.map((card, index) => renderCard(card, index))}
        </ScrollView>

        {renderProgressDots()}

        <Pressable
          style={[styles.closeButton, { top: insets.top + Spacing.md }]}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color="white" />
        </Pressable>

        <ConfettiCannon
          ref={confettiRef}
          count={100}
          origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
          autoStart={false}
          fadeOut
          explosionSpeed={400}
          fallSpeed={3000}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cardWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  card: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
    zIndex: 10,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  progressDotActive: {
    backgroundColor: 'white',
    width: 24,
  },
  closeButton: {
    position: 'absolute',
    right: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cardShareButton: {
    position: 'absolute',
    right: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: Typography.sm,
    fontWeight: Typography.weights.semibold,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: Typography.letterSpacing.wide,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: Typography.weights.bold,
    color: 'white',
    textAlign: 'center',
    lineHeight: 54,
  },
  heroSubtitle: {
    fontSize: Typography.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: Typography.lineHeights.lg,
    paddingHorizontal: Spacing.lg,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xxl,
  },
  startButtonText: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.semibold,
    color: 'white',
  },
  statLabel: {
    fontSize: Typography.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  bigNumberContainer: {
    alignItems: 'center',
  },
  bigNumber: {
    fontSize: 88,
    fontWeight: Typography.weights.bold,
    color: 'white',
    lineHeight: 110,
  },
  bigNumberUnit: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.weights.semibold,
    color: 'white',
    marginTop: -Spacing.md,
  },
  statSubtext: {
    fontSize: Typography.xl,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: Spacing.lg,
  },
  deliveryBreakdown: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginTop: Spacing.xl,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  deliveryItemText: {
    fontSize: Typography.base,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: Spacing.xxl,
    marginTop: Spacing.xl,
  },
  genderItem: {
    alignItems: 'center',
  },
  genderNumber: {
    fontSize: 44,
    fontWeight: Typography.weights.bold,
    color: 'white',
    marginTop: Spacing.xs,
    lineHeight: 56,
  },
  genderLabel: {
    fontSize: Typography.base,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  comparisonContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  comparisonNumber: {
    fontSize: 56,
    fontWeight: Typography.weights.bold,
    color: 'white',
    marginTop: Spacing.md,
    lineHeight: 72,
  },
  comparisonText: {
    fontSize: Typography.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  funFactText: {
    fontSize: Typography.xl,
    color: 'white',
    textAlign: 'center',
    lineHeight: Typography.lineHeights.xl,
    paddingHorizontal: Spacing.md,
  },
  noDataTitle: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: 'white',
    textAlign: 'center',
    lineHeight: 36,
  },
  noDataText: {
    fontSize: Typography.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: Typography.lineHeights.lg,
    paddingHorizontal: Spacing.lg,
  },
  noDataSubtext: {
    fontSize: Typography.base,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: Typography.lineHeights.base,
    paddingHorizontal: Spacing.lg,
  },
  titleCardLabel: {
    fontSize: Typography.lg,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: Spacing.lg,
  },
  userTitle: {
    fontSize: 32,
    fontWeight: Typography.weights.bold,
    color: 'white',
    textAlign: 'center',
    lineHeight: 44,
  },
  userSubtitle: {
    fontSize: Typography.xl,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  allTimeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minHeight: 70,
  },
  allTimeStat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allTimeValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    lineHeight: 32,
    textAlign: 'center' as const,
  },
  allTimeLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    lineHeight: 18,
    textAlign: 'center' as const,
  },
  allTimeDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: Spacing.md,
  },
  finaleTitle: {
    fontSize: 38,
    fontWeight: Typography.weights.bold,
    color: 'white',
    lineHeight: 52,
  },
  finaleText: {
    fontSize: Typography.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: Typography.lineHeights.lg,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  finaleButtons: {
    gap: Spacing.md,
    marginTop: Spacing.xl,
    width: '100%',
    paddingHorizontal: Spacing.md,
  },
  shareButton: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  shareButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  shareButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl,
  },
  shareButtonText: {
    fontSize: Typography.lg,
    fontWeight: Typography.weights.bold,
  },
  doneButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  doneButtonText: {
    fontSize: Typography.base,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
