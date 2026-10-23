import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { destinations } from '@/data/destinations';
import AppIcon from '@/components/ui/AppIcon';
import AnimalThumbnail from '@/components/ui/AnimalThumbnail';
import { useI18n, type TranslationKey } from '@/context/I18nContext';

const zones = ['Tất cả', 'Thú lớn', 'Chim', 'Linh trưởng'];
const zoneTranslationKeys: Record<string, TranslationKey> = {
  'Tất cả': 'all',
  'Thú lớn': 'largeAnimals',
  Chim: 'birds',
  'Linh trưởng': 'primates',
};
const destinationTranslationKeys: Record<string, { title: TranslationKey; subtitle: TranslationKey }> = {
  giraffe: { title: 'giraffeTitle', subtitle: 'giraffeSubtitle' },
  birds_lake: { title: 'birds_lakeTitle', subtitle: 'birds_lakeSubtitle' },
  monkey_primate: { title: 'monkey_primateTitle', subtitle: 'monkey_primateSubtitle' },
  tiger: { title: 'tigerTitle', subtitle: 'tigerSubtitle' },
} as const;
const languageOptions = [
  { code: 'vi', flag: '🇻🇳', translationKey: 'vietnamese' },
  { code: 'en', flag: '🇬🇧', translationKey: 'english' },
  { code: 'zh', flag: '🇨🇳', translationKey: 'chinese' },
] as const;

const highlights = destinations;

const feedingTimes = [
  { time: '09:30', animal: 'Hà mã', place: 'Hồ nước ngọt', emoji: '🦛' },
  { time: '10:15', animal: 'Hổ Bengal', place: 'Khu thú lớn', emoji: '🐅' },
];

export default function HomeScreen() {
  const { language, setLanguage, t } = useI18n();
  const [selectedZone, setSelectedZone] = useState('Tất cả');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsPage, setSettingsPage] = useState<'menu' | 'language' | 'audio' | 'download' | 'font'>('menu');
  const [autoNarration, setAutoNarration] = useState(true);
  const [volume, setVolume] = useState(70);
  const [fontSize, setFontSize] = useState(16);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isPackageDownloaded, setIsPackageDownloaded] = useState(false);

  useEffect(() => {
    if (!settingsOpen || settingsPage !== 'download' || downloadProgress === 0 || downloadProgress >= 100) return;
    const timer = setTimeout(() => {
      const nextProgress = Math.min(downloadProgress + 10, 100);
      setDownloadProgress(nextProgress);
      if (nextProgress === 100) setIsPackageDownloaded(true);
    }, 140);
    return () => clearTimeout(timer);
  }, [settingsOpen, settingsPage, downloadProgress]);

  const closeSettings = () => {
    setSettingsOpen(false);
    setSettingsPage('menu');
  };

  const openSettingsPage = (page: Exclude<typeof settingsPage, 'menu'>) => setSettingsPage(page);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.date}>{t('brand')}</Text>
              <Text style={styles.greeting}>{t('greeting')}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={t('settings')} onPress={() => { setSettingsPage('menu'); setSettingsOpen(true); }} style={styles.avatar}>
              <AppIcon name="settings" size={22} />
            </Pressable>
          </View>

          {/* Hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>{t('heroTitle')}</Text>
              <Text style={styles.heroDescription}>
                {t('heroDescription')}
              </Text>
              <Pressable accessibilityRole="button" style={styles.heroButton} onPress={() => router.navigate('/explore')}>
                <Text style={styles.heroButtonText}>{t('startExploring')}</Text>
              </Pressable>
            </View>
            
          </View>

          <Text style={styles.preview}>{t('preview')}</Text>
          {/* Info */}
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <AppIcon name="sun" size={20} />
              <View>
                <Text style={styles.infoLabel}>{t('weather')}</Text>
                <Text style={styles.infoValue}>{t('weatherValue')}</Text>
              </View>
            </View>
            <View style={styles.infoCard}>
              <AppIcon name="clock" size={20} />
              <View>
                <Text style={styles.infoLabel}>{t('openingHours')}</Text>
                <Text style={styles.infoValue}>{t('openingHoursValue')}</Text>
              </View>
            </View>
          </View>

          {/* Zones */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('exploreZones')}</Text>
            <Pressable accessibilityRole="button" onPress={() => router.navigate('/map')}><Text style={styles.seeAll}>{t('seeMap')}</Text></Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}>
            {zones.map((zone) => {
              const active = selectedZone === zone;
              return (
                <Pressable
                  key={zone}
                  onPress={() => setSelectedZone(zone)}
                  style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{t(zoneTranslationKeys[zone])}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Highlights */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('highlights')}</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.destinationList}>
            {highlights.filter(item => selectedZone === 'Tất cả' || item.zone === selectedZone).map((item) => (
              <Pressable
                key={item.title}
                accessibilityRole="button"
                onPress={() => router.navigate('/explore')}
                style={[styles.destinationCard, { backgroundColor: '#F4F5F3' }]}>
                <AnimalThumbnail id={item.id} emoji={item.emoji} width={148} height={96} />
                <Text style={styles.destinationTitle}>{t(destinationTranslationKeys[item.id].title)}</Text>
                <Text style={styles.destinationSubtitle}>{t(destinationTranslationKeys[item.id].subtitle)}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Feeding schedule */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('feedingSchedule')}</Text>
          </View>
          <View style={styles.scheduleCard}>
            {feedingTimes.map((item, index) => (
              <View
                key={item.time}
                style={[styles.scheduleRow, index === 0 && styles.scheduleFirst]}>
                <Text style={styles.scheduleEmoji}>{item.emoji}</Text>
                <View style={styles.scheduleTime}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  <Text style={styles.upcoming}>{t('sampleSchedule')}</Text>
                </View>
                <View style={styles.scheduleDetail}>
                  <Text style={styles.animalText}>{t(item.time === '09:30' ? 'hippo' : 'bengalTiger')}</Text>
                  <Text style={styles.placeText}>{t(item.time === '09:30' ? 'freshwaterPond' : 'largeAnimalZone')}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
      <Modal visible={settingsOpen} transparent animationType="fade" onRequestClose={closeSettings}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('close')} onPress={closeSettings} style={styles.modalBackdrop}>
          <Pressable onPress={() => undefined} style={styles.settingsPanel}>
            <View style={styles.settingsHeader}>
              {settingsPage !== 'menu' ? (
                <Pressable accessibilityRole="button" accessibilityLabel={t('backToSettings')} onPress={() => setSettingsPage('menu')} style={styles.backButton}>
                  <Text style={styles.backButtonText}>‹</Text>
                </Pressable>
              ) : (
                <View style={styles.settingsTitleGroup}>
                  <View style={styles.settingsIcon}><AppIcon name="settings" size={19} /></View>
                  <View>
                    <Text style={styles.settingsTitle}>{t('settings')}</Text>
                    <Text style={styles.settingsSubtitle}>{t('settingsSubtitle')}</Text>
                  </View>
                </View>
              )}
              {settingsPage !== 'menu' && (
                <Text style={styles.settingsTitle}>
                  {settingsPage === 'language' ? t('language') : settingsPage === 'audio' ? t('audio') : settingsPage === 'download' ? t('downloads') : t('fontSize')}
                </Text>
              )}
              <Pressable accessibilityRole="button" accessibilityLabel={t('close')} onPress={closeSettings} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.settingsContent}>
              {settingsPage === 'menu' && (
                <View style={styles.menuList}>
                  <SettingsMenuItem icon="文" title={t('language')} subtitle={t('languageMenuSubtitle')} onPress={() => openSettingsPage('language')} />
                  <SettingsMenuItem icon="♫" title={t('audio')} subtitle={t('audioMenuSubtitle')} onPress={() => openSettingsPage('audio')} />
                  <SettingsMenuItem icon="↓" title={t('downloads')} subtitle={t('downloadsMenuSubtitle')} onPress={() => openSettingsPage('download')} />
                  <SettingsMenuItem icon="A" title={t('fontSize')} subtitle={t('fontSizeMenuSubtitle')} onPress={() => openSettingsPage('font')} />
                </View>
              )}

              {settingsPage === 'language' && (
                <View style={styles.settingSection}>
                  <Text style={styles.settingDescription}>{t('languageDescription')}</Text>
                  {languageOptions.map(option => (
                    <Pressable key={option.code} accessibilityRole="radio" accessibilityState={{ checked: language === option.code }} onPress={() => setLanguage(option.code)} style={[styles.languageOption, language === option.code && styles.languageOptionSelected]}>
                      <Text style={styles.languageFlag}>{option.flag}</Text>
                      <Text style={[styles.languageOptionText, language === option.code && styles.languageOptionTextSelected]}>{t(option.translationKey)}</Text>
                      <View style={[styles.radio, language === option.code && styles.radioSelected]}>
                        {language === option.code && <View style={styles.radioDot} />}
                      </View>
                    </Pressable>
                  ))}
                  <Pressable accessibilityRole="button" onPress={closeSettings} style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>{t('confirm')}</Text>
                  </Pressable>
                </View>
              )}

              {settingsPage === 'audio' && (
                <View style={styles.settingSection}>
                  <View style={styles.toggleCard}>
                    <View style={styles.settingCopy}>
                      <Text style={styles.settingSectionTitle}>{t('autoNarration')}</Text>
                      <Text style={styles.settingDescription}>{t('autoNarrationDescription')}</Text>
                    </View>
                    <Pressable accessibilityRole="switch" accessibilityState={{ checked: autoNarration }} accessibilityLabel={t('autoNarration')} onPress={() => setAutoNarration(value => !value)} style={[styles.toggle, autoNarration && styles.toggleOn]}>
                      <View style={[styles.toggleThumb, autoNarration && styles.toggleThumbOn]} />
                    </Pressable>
                  </View>
                  <View style={styles.volumeCard}>
                    <View style={styles.volumeHeader}>
                      <Text style={styles.volumeTitle}>{t('volume')}</Text>
                      <Text style={styles.volumeValue}>{volume}%</Text>
                    </View>
                    <View style={styles.volumeControls}>
                      <Text style={styles.volumeIcon}>−</Text>
                      <View style={styles.sliderTrack}>
                        <View style={[styles.sliderFill, { width: `${volume}%` }]} />
                        <View style={[styles.sliderThumb, { left: `${volume}%` }]} />
                      </View>
                      <Text style={styles.volumeIcon}>+</Text>
                    </View>
                    <View style={styles.volumeChoices}>
                      {[30, 50, 70, 90].map(value => (
                        <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: volume === value }} onPress={() => setVolume(value)} style={styles.volumeChoice}>
                          <View style={[styles.volumeTick, volume >= value && styles.volumeTickActive]} />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {settingsPage === 'download' && (
                <View style={styles.settingSection}>
                  <View style={styles.downloadCard}>
                    <View style={styles.downloadIcon}><Text style={styles.downloadEmoji}>🗺️</Text></View>
                    <View style={styles.downloadCopy}>
                      <Text style={styles.packageTitle}>{t('offlinePackage')}</Text>
                      <Text style={styles.packageMetadata}>{t('packageDetails')}</Text>
                    </View>
                    {isPackageDownloaded && <Text style={styles.downloadCheck}>✓</Text>}
                  </View>
                  {downloadProgress > 0 && (
                    <View style={styles.progressSection}>
                      <View style={styles.progressLabels}>
                        <Text style={styles.progressStatus}>{isPackageDownloaded ? t('downloaded') : t('downloading')}</Text>
                        <Text style={styles.progressPercent}>{downloadProgress}%</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${downloadProgress}%` }]} />
                      </View>
                    </View>
                  )}
                  {!isPackageDownloaded ? (
                    <Pressable accessibilityRole="button" disabled={downloadProgress > 0} onPress={() => setDownloadProgress(1)} style={[styles.primaryButton, downloadProgress > 0 && styles.buttonDisabled]}>
                      <Text style={styles.primaryButtonText}>{downloadProgress > 0 ? t('downloadingPackage') : t('download')}</Text>
                    </Pressable>
                  ) : (
                    <Pressable accessibilityRole="button" onPress={() => { setIsPackageDownloaded(false); setDownloadProgress(0); }} style={styles.deleteButton}>
                      <Text style={styles.deleteButtonText}>{t('deleteDownload')}</Text>
                    </Pressable>
                  )}
                  <Text style={styles.downloadNote}>{t('downloadHint')}</Text>
                </View>
              )}

              {settingsPage === 'font' && (
                <View style={styles.settingSection}>
                  <Text style={styles.settingDescription}>{t('fontSizeDescription')}</Text>
                  <View style={styles.fontOptions}>
                    {[
                      { label: t('small'), size: 14 },
                      { label: t('medium'), size: 16 },
                      { label: t('large'), size: 20 },
                    ].map(option => (
                      <Pressable key={option.size} accessibilityRole="radio" accessibilityState={{ checked: fontSize === option.size }} onPress={() => setFontSize(option.size)} style={[styles.fontOption, fontSize === option.size && styles.fontOptionSelected]}>
                        <Text style={[styles.fontOptionSample, { fontSize: option.size }]}>Aa</Text>
                        <Text style={[styles.fontOptionLabel, fontSize === option.size && styles.fontOptionLabelSelected]}>{option.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.previewCard}>
                    <Text style={styles.previewLabel}>{t('previewLabel')}</Text>
                    <Text style={[styles.previewText, { fontSize, lineHeight: fontSize * 1.55 }]}>{t('fontPreview')}</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function SettingsMenuItem({ icon, title, subtitle, onPress }: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.menuItem}>
      <View style={styles.menuItemIcon}>
        <Text style={styles.menuItemIconText}>{icon}</Text>
      </View>
      <View style={styles.menuItemCopy}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  preview: { color: '#8A928B', fontSize: 11, marginTop: 12 },
  screen: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 20,
  },
  date: { color: '#7A867D', fontSize: 10, fontWeight: '500', letterSpacing: 0.6 },
  greeting: { color: '#183A35', fontSize: 20, fontWeight: '600', marginTop: 4, flexShrink: 1 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#F1F5EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(16, 36, 30, 0.48)', padding: 20 },
  settingsPanel: { width: '100%', maxWidth: 420, maxHeight: '84%', backgroundColor: '#FFFFFF', borderRadius: 24, overflow: 'hidden', shadowColor: '#10241E', shadowOpacity: 0.2, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 12 },
  settingsHeader: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EEF1ED' },
  settingsTitleGroup: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF3ED' },
  settingsTitle: { color: '#183A35', fontSize: 19, fontWeight: '700' },
  settingsSubtitle: { color: '#7B8880', fontSize: 11, marginTop: 3 },
  backButton: { width: 36, height: 40, justifyContent: 'center' },
  backButtonText: { color: '#285A46', fontSize: 34, lineHeight: 38 },
  closeButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F5F2', marginLeft: 'auto' },
  closeButtonText: { color: '#4B5A50', fontSize: 25, lineHeight: 28 },
  settingsContent: { padding: 20, paddingBottom: 24 },
  menuList: { gap: 10 },
  menuItem: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: '#EEF1ED', backgroundColor: '#FFFFFF' },
  menuItemIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#F0F5F1' },
  menuItemIconText: { color: '#285A46', fontSize: 20, fontWeight: '700' },
  menuItemCopy: { flex: 1, gap: 3 },
  menuItemTitle: { color: '#263C32', fontSize: 14, fontWeight: '700' },
  menuItemSubtitle: { color: '#829087', fontSize: 11 },
  menuArrow: { color: '#9AA69E', fontSize: 25 },
  settingSection: { gap: 14 },
  settingDescription: { color: '#748078', fontSize: 13, lineHeight: 19 },
  languageOption: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, borderRadius: 13, borderWidth: 1, borderColor: '#E8ECE8', backgroundColor: '#FFFFFF' },
  languageOptionSelected: { borderColor: '#3F8060', backgroundColor: '#F1F7F2' },
  languageFlag: { fontSize: 20 },
  languageOptionText: { flex: 1, color: '#46554B', fontSize: 14, fontWeight: '500' },
  languageOptionTextSelected: { color: '#285A46', fontWeight: '700' },
  radio: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#B7C1B9' },
  radioSelected: { borderColor: '#327552' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#327552' },
  primaryButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: 4, borderRadius: 14, backgroundColor: '#285A46' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  toggleCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, backgroundColor: '#F5F7F4' },
  settingCopy: { flex: 1, gap: 7 },
  settingSectionTitle: { color: '#263C32', fontSize: 14, lineHeight: 20, fontWeight: '700' },
  toggle: { width: 48, height: 28, justifyContent: 'center', padding: 3, borderRadius: 15, backgroundColor: '#C8D0C9' },
  toggleOn: { backgroundColor: '#367A55' },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 3, elevation: 2 },
  toggleThumbOn: { alignSelf: 'flex-end' },
  volumeCard: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#EEF1ED' },
  volumeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  volumeTitle: { color: '#34483B', fontSize: 13, fontWeight: '600' },
  volumeValue: { color: '#285A46', fontSize: 13, fontWeight: '700' },
  volumeControls: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20 },
  volumeIcon: { color: '#76847A', fontSize: 18, fontWeight: '600' },
  sliderTrack: { flex: 1, height: 5, borderRadius: 4, backgroundColor: '#E5EBE5' },
  sliderFill: { height: 5, borderRadius: 4, backgroundColor: '#43825E' },
  sliderThumb: { position: 'absolute', top: -6, width: 17, height: 17, marginLeft: -8, borderRadius: 9, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#43825E' },
  volumeChoices: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 26, marginTop: 8 },
  volumeChoice: { width: 24, height: 16, alignItems: 'center' },
  volumeTick: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D3DAD4' },
  volumeTickActive: { backgroundColor: '#43825E' },
  downloadCard: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, borderRadius: 16, backgroundColor: '#F4F7F3' },
  downloadIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#E4EFE4' },
  downloadEmoji: { fontSize: 23 },
  downloadCopy: { flex: 1, gap: 4 },
  packageTitle: { color: '#263C32', fontSize: 14, fontWeight: '700' },
  packageMetadata: { color: '#7E8A81', fontSize: 11 },
  downloadCheck: { color: '#3E8059', fontSize: 20, fontWeight: '700' },
  progressSection: { gap: 9, marginTop: 2 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressStatus: { color: '#3B6449', fontSize: 12, fontWeight: '600' },
  progressPercent: { color: '#6D7B71', fontSize: 12 },
  progressTrack: { height: 8, overflow: 'hidden', borderRadius: 5, backgroundColor: '#E8EEE8' },
  progressFill: { height: '100%', borderRadius: 5, backgroundColor: '#43825E' },
  buttonDisabled: { opacity: 0.65 },
  deleteButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 4, borderRadius: 14, backgroundColor: '#FFF2F0', borderWidth: 1, borderColor: '#F5D9D5' },
  deleteButtonText: { color: '#A54A3F', fontSize: 14, fontWeight: '700' },
  downloadNote: { color: '#8A958C', fontSize: 11, lineHeight: 17, textAlign: 'center' },
  fontOptions: { flexDirection: 'row', gap: 9 },
  fontOption: { flex: 1, minHeight: 88, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#E8ECE8', borderRadius: 14 },
  fontOptionSelected: { borderColor: '#3F8060', backgroundColor: '#F1F7F2' },
  fontOptionSample: { color: '#285A46', fontWeight: '700' },
  fontOptionLabel: { color: '#6F7D73', fontSize: 12, fontWeight: '600' },
  fontOptionLabelSelected: { color: '#285A46' },
  previewCard: { padding: 16, gap: 10, borderRadius: 16, backgroundColor: '#F5F7F4' },
  previewLabel: { color: '#8A958C', fontSize: 10, letterSpacing: 0.8, fontWeight: '700' },
  previewText: { color: '#34483B' },
  avatarText: { color: '#FFF8E9', fontSize: 17, fontWeight: '600' },

  heroCard: {
    minHeight: 0,
    borderRadius: 10,
    backgroundColor: '#F3F5F2',
    padding: 18,
    overflow: 'hidden',
  },
  heroCopy: { width: '100%' },
  heroTitle: { color: '#202823', fontSize: 21, lineHeight: 28, fontWeight: '600' },
  heroDescription: { color: '#6D756F', fontSize: 13, lineHeight: 19, marginTop: 9 },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#285A46',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 13,
    marginTop: 17,
  },
  heroButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  heroAnimal: { position: 'absolute', right: 10, bottom: 8, fontSize: 104 },

  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  infoCard: {
    flex: 1,
    minWidth: 145,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 13,
    borderWidth: 1,
    borderColor: '#EAEDE5',
  },
  infoIcon: { fontSize: 20 },
  infoLabel: { color: '#91A39D', fontSize: 11, fontWeight: '600' },
  infoValue: { color: '#254A43', fontSize: 12, fontWeight: '500', marginTop: 2 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 11,
  },
  sectionTitle: { color: '#1F413A', fontSize: 16, fontWeight: '600' },
  seeAll: { color: '#4B8A7D', fontSize: 12, fontWeight: '500' },

  chips: { gap: 8 },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#E9EFEB',
  },
  chipActive: { backgroundColor: '#1E5A4E' },
  chipText: { color: '#6E847D', fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF' },

  destinationList: { gap: 12 },
  destinationCard: { width: 172, borderRadius: 12, padding: 12, gap: 8 },
  destinationEmoji: { fontSize: 30, marginBottom: 12 },
  destinationTitle: { color: '#26463E', fontSize: 14, fontWeight: '600' },
  destinationSubtitle: { color: '#6C817A', fontSize: 11, marginTop: 4 },

  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#EAEDE5',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#EDF0EB',
    gap: 11,
  },
  scheduleFirst: { borderTopWidth: 0 },
  scheduleEmoji: {
    width: 38,
    height: 38,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 38,
    borderRadius: 12,
    backgroundColor: '#EDF6EB',
    fontSize: 21,
    overflow: 'hidden',
  },
  scheduleTime: { width: 72 },
  timeText: { color: '#26463E', fontSize: 14, fontWeight: '600' },
  upcoming: { color: '#D6853E', fontSize: 11, fontWeight: '500', marginTop: 2 },
  scheduleDetail: { flex: 1 },
  animalText: { color: '#27463F', fontSize: 13, fontWeight: '600' },
  placeText: { color: '#83938D', fontSize: 11, marginTop: 2 },
});
