import Constants from 'expo-constants';
import {
    router,
    useFocusEffect,
} from 'expo-router';

import {
    useCallback,
    useState,
} from 'react';

import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    AppData,
    Language,
    loadAppData,
    saveAppData,
} from '../storage/appStorage';

import {
    ThemeName,
    themeNames,
    themes,
} from '../theme/themes';

export default function SettingsScreen() {
  const [
    appData,
    setAppData,
  ] = useState<AppData | null>(null);

  const [
    themeModalVisible,
    setThemeModalVisible,
  ] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        const data =
          await loadAppData();

        if (active) {
          setAppData(data);
        }
      };

      load();

      return () => {
        active = false;
      };
    }, [])
  );

  if (!appData) {
    return (
      <SafeAreaView
        style={
          styles.loadingSafeArea
        }
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
          />
        </View>
      </SafeAreaView>
    );
  }

  const currentTheme =
    themes[appData.theme];

  const isJapanese =
    appData.language === 'ja';

  const version =
    Constants.expoConfig?.version ??
    '1.0.0';

  const changeLanguage =
    async (
      language: Language
    ) => {
      const nextData: AppData = {
        ...appData,
        language,
      };

      setAppData(nextData);

      await saveAppData(
        nextData
      );
    };

  const changeTheme =
    async (
      theme: ThemeName
    ) => {
      const nextData: AppData = {
        ...appData,
        theme,
      };

      setAppData(nextData);

      await saveAppData(
        nextData
      );

      setThemeModalVisible(false);
    };

  const themeLabels:
    Record<ThemeName, string> = {
    pink: 'Pink',
    red: 'Red',
    blue: 'Blue',
    yellow: 'Yellow',
    black: 'Black',
  };

  const openPrivacyPolicy =
    () => {
      Alert.alert(
        isJapanese
          ? 'プライバシーポリシー'
          : 'Privacy Policy',

        isJapanese
          ? '公開前にプライバシーポリシーを接続します。'
          : 'The privacy policy will be added before release.'
      );
    };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            currentTheme.background,
        },
      ]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              currentTheme.background,
          },
        ]}
      >
        {/* Header */}
        <View
          style={styles.header}
        >
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={[
                styles.backText,
                {
                  color:
                    currentTheme.text,
                },
              ]}
            >
              ‹
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.title,
              {
                color:
                  currentTheme.text,
              },
            ]}
          >
            {isJapanese
              ? '設定'
              : 'Settings'}
          </Text>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        <ScrollView
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* 表示 */}
          <Text
            style={[
              styles.sectionLabel,
              {
                color:
                  currentTheme.subText,
              },
            ]}
          >
            {isJapanese
              ? '表示'
              : 'Appearance'}
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  currentTheme.surface,
                borderColor:
                  currentTheme.border,
              },
            ]}
          >
            {/* Language */}
            <View
              style={[
                styles.settingRow,
                {
                  borderBottomColor:
                    currentTheme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.settingTitle,
                  {
                    color:
                      currentTheme.text,
                  },
                ]}
              >
                {isJapanese
                  ? '言語'
                  : 'Language'}
              </Text>

              <View
                style={[
                  styles.languageSwitch,
                  {
                    backgroundColor:
                      currentTheme.soft,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.languageOption,

                    isJapanese && {
                      backgroundColor:
                        currentTheme.surface,
                    },
                  ]}
                  onPress={() =>
                    changeLanguage(
                      'ja'
                    )
                  }
                >
                  <Text
                    style={{
                      color:
                        isJapanese
                          ? currentTheme.text
                          : currentTheme.subText,

                      fontWeight:
                        isJapanese
                          ? '700'
                          : '400',
                    }}
                  >
                    日本語
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.languageOption,

                    !isJapanese && {
                      backgroundColor:
                        currentTheme.surface,
                    },
                  ]}
                  onPress={() =>
                    changeLanguage(
                      'en'
                    )
                  }
                >
                  <Text
                    style={{
                      color:
                        !isJapanese
                          ? currentTheme.text
                          : currentTheme.subText,

                      fontWeight:
                        !isJapanese
                          ? '700'
                          : '400',
                    }}
                  >
                    EN
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Theme */}
            <TouchableOpacity
              style={
                styles.settingRowLast
              }
              activeOpacity={0.7}
              onPress={() =>
                setThemeModalVisible(
                  true
                )
              }
            >
              <Text
                style={[
                  styles.settingTitle,
                  {
                    color:
                      currentTheme.text,
                  },
                ]}
              >
                {isJapanese
                  ? 'テーマ'
                  : 'Theme'}
              </Text>

              <View
                style={
                  styles.rowRight
                }
              >
                <View
                  style={[
                    styles.themeDot,
                    {
                      backgroundColor:
                        currentTheme.accent,
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.settingValue,
                    {
                      color:
                        currentTheme.subText,
                    },
                  ]}
                >
                  {
                    themeLabels[
                      appData.theme
                    ]
                  }
                </Text>

                <Text
                  style={[
                    styles.chevron,
                    {
                      color:
                        currentTheme.subText,
                    },
                  ]}
                >
                  ›
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Support */}
          <Text
            style={[
              styles.sectionLabel,
              {
                color:
                  currentTheme.subText,
              },
            ]}
          >
            {isJapanese
              ? 'サポート'
              : 'Support'}
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  currentTheme.surface,
                borderColor:
                  currentTheme.border,
              },
            ]}
          >
            <TouchableOpacity
              style={
                styles.settingRowLast
              }
              activeOpacity={0.7}
              onPress={
                openPrivacyPolicy
              }
            >
              <Text
                style={[
                  styles.settingTitle,
                  {
                    color:
                      currentTheme.text,
                  },
                ]}
              >
                {isJapanese
                  ? 'プライバシーポリシー'
                  : 'Privacy Policy'}
              </Text>

              <Text
                style={[
                  styles.chevron,
                  {
                    color:
                      currentTheme.subText,
                  },
                ]}
              >
                ›
              </Text>
            </TouchableOpacity>
          </View>

          {/* App info */}
          <Text
            style={[
              styles.sectionLabel,
              {
                color:
                  currentTheme.subText,
              },
            ]}
          >
            {isJapanese
              ? 'アプリ情報'
              : 'App Info'}
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  currentTheme.surface,
                borderColor:
                  currentTheme.border,
              },
            ]}
          >
            <View
              style={
                styles.settingRowLast
              }
            >
              <Text
                style={[
                  styles.settingTitle,
                  {
                    color:
                      currentTheme.text,
                  },
                ]}
              >
                {isJapanese
                  ? 'バージョン'
                  : 'Version'}
              </Text>

              <Text
                style={[
                  styles.settingValue,
                  {
                    color:
                      currentTheme.subText,
                  },
                ]}
              >
                {version}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Theme modal */}
        <Modal
          visible={
            themeModalVisible
          }
          transparent
          animationType="fade"
          onRequestClose={() =>
            setThemeModalVisible(
              false
            )
          }
        >
          <View
            style={
              styles.modalOverlay
            }
          >
            <View
              style={[
                styles.themeModal,
                {
                  backgroundColor:
                    currentTheme.surface,
                },
              ]}
            >
              <Text
                style={[
                  styles.themeModalTitle,
                  {
                    color:
                      currentTheme.text,
                  },
                ]}
              >
                {isJapanese
                  ? 'テーマ'
                  : 'Theme'}
              </Text>

              <View
                style={
                  styles.themeChoices
                }
              >
                {themeNames.map(
                  (themeName) => {
                    const option =
                      themes[
                        themeName
                      ];

                    const selected =
                      appData.theme ===
                      themeName;

                    return (
                      <TouchableOpacity
                        key={themeName}
                        style={[
                          styles.themeChoice,
                          {
                            borderColor:
                              selected
                                ? option.accent
                                : currentTheme.border,
                          },
                        ]}
                        onPress={() =>
                          changeTheme(
                            themeName
                          )
                        }
                      >
                        <View
                          style={[
                            styles.themeColorCircle,
                            {
                              backgroundColor:
                                option.accent,
                            },
                          ]}
                        />

                        <Text
                          style={[
                            styles.themeChoiceText,
                            {
                              color:
                                currentTheme.text,
                            },
                          ]}
                        >
                          {
                            themeLabels[
                              themeName
                            ]
                          }
                        </Text>

                        {selected && (
                          <Text
                            style={[
                              styles.check,
                              {
                                color:
                                  currentTheme.text,
                              },
                            ]}
                          >
                            ✓
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.closeButton,
                  {
                    backgroundColor:
                      currentTheme.soft,
                  },
                ]}
                onPress={() =>
                  setThemeModalVisible(
                    false
                  )
                }
              >
                <Text
                  style={{
                    color:
                      currentTheme.text,
                    fontWeight:
                      '600',
                  }}
                >
                  {isJapanese
                    ? '閉じる'
                    : 'Close'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    loadingSafeArea: {
      flex: 1,
      backgroundColor:
        '#FFF9F3',
    },

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    safeArea: {
      flex: 1,
    },

    container: {
      flex: 1,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 14,
    },

    backButton: {
      width: 44,
    },

    backText: {
      fontSize: 40,
      lineHeight: 42,
    },

    title: {
      flex: 1,
      textAlign: 'center',
      fontSize: 24,
      fontWeight: '700',
    },

    headerSpacer: {
      width: 44,
    },

    content: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },

    sectionLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginTop: 22,
      marginBottom: 8,
      marginLeft: 4,
    },

    card: {
      borderRadius: 20,
      borderWidth: 1,
      overflow: 'hidden',
    },

    settingRow: {
      minHeight: 66,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      borderBottomWidth: 1,
    },

    settingRowLast: {
      minHeight: 66,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      flexShrink: 1,
    },

    settingValue: {
      fontSize: 15,
    },

    rowRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    chevron: {
      fontSize: 26,
      marginLeft: 2,
    },

    languageSwitch: {
      flexDirection: 'row',
      borderRadius: 18,
      padding: 3,
    },

    languageOption: {
      minHeight: 34,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 15,
    },

    themeDot: {
      width: 18,
      height: 18,
      borderRadius: 9,
    },

    modalOverlay: {
      flex: 1,
      justifyContent:
        'center',
      paddingHorizontal: 28,
      backgroundColor:
        'rgba(0,0,0,0.35)',
    },

    themeModal: {
      borderRadius: 28,
      padding: 24,
    },

    themeModalTitle: {
      fontSize: 26,
      fontWeight: '700',
      marginBottom: 22,
    },

    themeChoices: {
      gap: 10,
    },

    themeChoice: {
      minHeight: 58,
      borderWidth: 2,
      borderRadius: 18,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },

    themeColorCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      marginRight: 14,
    },

    themeChoiceText: {
      flex: 1,
      fontSize: 17,
      fontWeight: '600',
    },

    check: {
      fontSize: 20,
      fontWeight: '700',
    },

    closeButton: {
      minHeight: 52,
      marginTop: 20,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent:
        'center',
    },
  });