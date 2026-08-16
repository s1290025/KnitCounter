import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  HistoryItem,
  HistoryType,
  Language,
  Project,
  loadAppData,
  saveAppData,
  updateProject,
} from '../../storage/appStorage';

import {
  themes,
} from '../../theme/themes';

export default function CounterScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [
    project,
    setProject,
  ] =
    useState<Project | null>(
      null
    );

  const [
    language,
    setLanguage,
  ] =
    useState<Language>('ja');

  const [
    themeName,
    setThemeName,
  ] =
    useState<
      keyof typeof themes
    >('pink');

  const [
    historyModalVisible,
    setHistoryModalVisible,
  ] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load =
        async () => {
          if (!id) return;

          const data =
            await loadAppData();

          const savedProject =
            data.projects.find(
              (project) =>
                project.id ===
                id
            ) ?? null;

          if (active) {
            setProject(
              savedProject
            );

            setLanguage(
              data.language
            );

            setThemeName(
              data.theme
            );
          }
        };

      load();

      return () => {
        active = false;
      };
    }, [id])
  );

  if (!project) {
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
    themes[themeName];

  const isJapanese =
    language === 'ja';

  const changeLanguage =
    async (
      nextLanguage: Language
    ) => {
      const data =
        await loadAppData();

      const nextData = {
        ...data,
        language:
          nextLanguage,
      };

      await saveAppData(
        nextData
      );

      setLanguage(
        nextLanguage
      );
    };

  const persistProject =
    async (
      nextProject:
        Project
    ) => {
      setProject(
        nextProject
      );

      await updateProject(
        nextProject
      );
    };

  const saveUndo = (
    current: Project
  ) => ({
    row: current.row,
    stitch:
      current.stitch,
    history: [
      ...current.history,
    ],
  });

  const addRow =
    async () => {
      const previous =
        saveUndo(project);

      let history = [
        ...project.history,
      ];

      if (
        project.stitch > 0
      ) {
        const item:
          HistoryItem = {
          id: `${Date.now()}-${Math.random()}`,
          row:
            project.row,
          stitch:
            project.stitch,
          type: 'row',
        };

        history = [
          item,
          ...history,
        ];
      }

      await persistProject({
        ...project,
        row:
          project.row + 1,
        stitch: 0,
        history,

        undoStack: [
          ...project.undoStack,
          previous,
        ],
      });
    };

  const addStitch =
    async () => {
      const previous =
        saveUndo(project);

      await persistProject({
        ...project,

        stitch:
          project.stitch +
          1,

        undoStack: [
          ...project.undoStack,
          previous,
        ],
      });
    };

  const startNewRow =
    async () => {
      const previous =
        saveUndo(project);

      let history = [
        ...project.history,
      ];

      if (
        project.stitch > 0
      ) {
        history = [
          {
            id: `${Date.now()}-${Math.random()}`,
            row:
              project.row,
            stitch:
              project.stitch,
            type:
              'row' as const,
          },
          ...history,
        ];
      }

      await persistProject({
        ...project,
        row: 0,
        stitch: 0,
        history,

        undoStack: [
          ...project.undoStack,
          previous,
        ],
      });
    };

  const startNewStitch =
    async () => {
      const previous =
        saveUndo(project);

      let history = [
        ...project.history,
      ];

      if (
        project.stitch > 0
      ) {
        history = [
          {
            id: `${Date.now()}-${Math.random()}`,
            row:
              project.row,
            stitch:
              project.stitch,
            type:
              'stitch' as const,
          },
          ...history,
        ];
      }

      await persistProject({
        ...project,
        stitch: 0,
        history,

        undoStack: [
          ...project.undoStack,
          previous,
        ],
      });
    };

  const addMark =
    async () => {
      const previous =
        saveUndo(project);

      const item:
        HistoryItem = {
        id: `${Date.now()}-${Math.random()}`,
        row:
          project.row,
        stitch:
          project.stitch,
        type: 'mark',
      };

      await persistProject({
        ...project,

        history: [
          item,
          ...project.history,
        ],

        undoStack: [
          ...project.undoStack,
          previous,
        ],
      });
    };

  const undo =
    async () => {
      if (
        project.undoStack
          .length === 0
      ) {
        return;
      }

      const previous =
        project.undoStack[
          project.undoStack
            .length - 1
        ];

      await persistProject({
        ...project,

        row:
          previous.row,

        stitch:
          previous.stitch,

        history:
          previous.history,

        undoStack:
          project.undoStack.slice(
            0,
            -1
          ),
      });
    };

  const recentHistory =
    useMemo(() => {
      return project.history.slice(
        0,
        3
      );
    }, [project.history]);

  const getHistoryTypeLabel =
    (
      type: HistoryType
    ) => {
      if (
        type === 'mark'
      ) {
        return isJapanese
          ? '途中'
          : 'Paused';
      }

      if (
        type === 'row'
      ) {
        return isJapanese
          ? '新しい段'
          : 'New Row';
      }

      return isJapanese
        ? '新しい目'
        : 'New Stitch';
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
              styles.projectName,

              {
                color:
                  currentTheme.text,
              },
            ]}
            numberOfLines={1}
          >
            {project.name}
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
                日
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

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* History */}
          <TouchableOpacity
            style={[
              styles.historyArea,

              {
                backgroundColor:
                  currentTheme.surface,

                borderColor:
                  currentTheme.border,
              },
            ]}
            onPress={() =>
              setHistoryModalVisible(
                true
              )
            }
          >
            <View
              style={
                styles.historyHeader
              }
            >
              <Text
                style={[
                  styles.sectionTitle,

                  {
                    color:
                      currentTheme.text,
                  },
                ]}
              >
                {isJapanese
                  ? '最近の履歴'
                  : 'Recent History'}
              </Text>

              <Text
                style={{
                  color:
                    currentTheme.subText,

                  fontSize: 28,
                }}
              >
                ›
              </Text>
            </View>

            <View
              style={
                styles.recentHistoryList
              }
            >
              {recentHistory.map(
                (item) => (
                  <View
                    key={item.id}
                    style={
                      styles.historyRow
                    }
                  >
                    <Text
                      style={{
                        color:
                          currentTheme.text,
                      }}
                    >
                      {isJapanese
                        ? `${item.row}段　${item.stitch}目`
                        : `${item.row} Row　${item.stitch} Stitches`}
                    </Text>

                    {item.type ===
                      'mark' && (
                      <View
                        style={[
                          styles.pausedBadge,

                          {
                            backgroundColor:
                              currentTheme.soft,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              currentTheme.text,

                            fontSize:
                              12,
                          }}
                        >
                          {isJapanese
                            ? '途中'
                            : 'Paused'}
                        </Text>
                      </View>
                    )}
                  </View>
                )
              )}
            </View>
          </TouchableOpacity>

          {/* Row */}
          <View
            style={
              styles.counterSection
            }
          >
            <View
              style={
                styles.counterValueRow
              }
            >
              <Text
                style={[
                  styles.counterNumber,

                  {
                    color:
                      currentTheme.text,
                  },
                ]}
              >
                {project.row}
              </Text>

              <Text
                style={[
                  styles.counterUnit,

                  {
                    color:
                      currentTheme.text,
                  },
                ]}
              >
                {isJapanese
                  ? '段'
                  : 'Row'}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.plusButton,

                {
                  backgroundColor:
                    currentTheme.accent,
                },
              ]}
              onPress={
                addRow
              }
            >
              <Text
                style={[
                  styles.plusText,

                  {
                    color:
                      currentTheme.text,
                  },
                ]}
              >
                ＋
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.newCountButton
              }
              onPress={
                startNewRow
              }
            >
              <Text
                style={{
                  color:
                    currentTheme.subText,
                }}
              >
                {isJapanese
                  ? '新しい段'
                  : 'New Row'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stitch */}
          <View
            style={
              styles.counterSection
            }
          >
            <View
              style={
                styles.counterValueRow
              }
            >
              <Text
                style={[
                  styles.counterNumber,

                  {
                    color:
                      currentTheme.text,
                  },
                ]}
              >
                {project.stitch}
              </Text>

              <Text
                style={[
                  styles.counterUnit,

                  {
                    color:
                      currentTheme.text,
                  },
                ]}
              >
                {isJapanese
                  ? '目'
                  : 'Stitch'}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.plusButton,

                {
                  backgroundColor:
                    currentTheme.accent,
                },
              ]}
              onPress={
                addStitch
              }
            >
              <Text
                style={[
                  styles.plusText,

                  {
                    color:
                      currentTheme.text,
                  },
                ]}
              >
                ＋
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.newCountButton
              }
              onPress={
                startNewStitch
              }
            >
              <Text
                style={{
                  color:
                    currentTheme.subText,
                }}
              >
                {isJapanese
                  ? '新しい目'
                  : 'New Stitch'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mark / Undo */}
          <View
            style={
              styles.actionRow
            }
          >
            <TouchableOpacity
              style={[
                styles.markButton,

                {
                  backgroundColor:
                    currentTheme.soft,
                },
              ]}
              onPress={
                addMark
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
                  ? '区切り'
                  : 'Mark'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.undoButton,

                {
                  backgroundColor:
                    currentTheme.soft,
                },

                project
                  .undoStack
                  .length ===
                  0 &&
                  styles.undoDisabled,
              ]}
              onPress={undo}
              disabled={
                project
                  .undoStack
                  .length ===
                0
              }
            >
              <Text
                style={{
                  color:
                    currentTheme.text,

                  fontSize: 28,
                }}
              >
                ↶
              </Text>
            </TouchableOpacity>
          </View>

          {/* Memo */}
          <View
            style={[
              styles.memoArea,

              {
                backgroundColor:
                  currentTheme.surface,

                borderColor:
                  currentTheme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,

                {
                  color:
                    currentTheme.text,
                },
              ]}
            >
              {isJapanese
                ? 'メモ'
                : 'Note'}
            </Text>

            <Text
              style={[
                styles.memoText,

                {
                  color:
                    project.memo
                      ? currentTheme.text
                      : currentTheme.subText,
                },
              ]}
            >
              {project.memo ||
                (isJapanese
                  ? 'メモなし'
                  : 'No note')}
            </Text>
          </View>
        </ScrollView>

        {/* History modal */}
        <Modal
          visible={
            historyModalVisible
          }
          transparent
          animationType="fade"
          onRequestClose={() =>
            setHistoryModalVisible(
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
                styles.historyModal,

                {
                  backgroundColor:
                    currentTheme.surface,
                },
              ]}
            >
              <View
                style={
                  styles.modalHeader
                }
              >
                <Text
                  style={[
                    styles.modalTitle,

                    {
                      color:
                        currentTheme.text,
                    },
                  ]}
                >
                  {isJapanese
                    ? '履歴'
                    : 'History'}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setHistoryModalVisible(
                      false
                    )
                  }
                >
                  <Text
                    style={{
                      color:
                        currentTheme.text,

                      fontSize: 30,
                    }}
                  >
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView>
                {project.history.map(
                  (item) => (
                    <View
                      key={item.id}
                      style={[
                        styles.fullHistoryRow,

                        {
                          borderBottomColor:
                            currentTheme.border,
                        },
                      ]}
                    >
                      <View>
                        <Text
                          style={[
                            styles.fullHistoryCount,

                            {
                              color:
                                currentTheme.text,
                            },
                          ]}
                        >
                          {isJapanese
                            ? `${item.row}段　${item.stitch}目`
                            : `${item.row} Row　${item.stitch} Stitches`}
                        </Text>

                        <Text
                          style={[
                            styles.fullHistoryType,

                            {
                              color:
                                currentTheme.subText,
                            },
                          ]}
                        >
                          {getHistoryTypeLabel(
                            item.type
                          )}
                        </Text>
                      </View>

                      {item.type ===
                        'mark' && (
                        <View
                          style={[
                            styles.pausedBadge,

                            {
                              backgroundColor:
                                currentTheme.soft,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color:
                                currentTheme.text,

                              fontSize:
                                12,
                            }}
                          >
                            {isJapanese
                              ? '途中'
                              : 'Paused'}
                          </Text>
                        </View>
                      )}
                    </View>
                  )
                )}
              </ScrollView>
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
      paddingBottom: 12,
    },

    backButton: {
      width: 44,
    },

    backText: {
      fontSize: 40,
    },

    projectName: {
      flex: 1,
      fontSize: 22,
      fontWeight: '700',
    },

    languageSwitch: {
      flexDirection: 'row',
      borderRadius: 22,
      padding: 3,
    },

    languageOption: {
      minWidth: 38,
      height: 36,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 18,
    },

    content: {
      flex: 1,
      paddingHorizontal: 24,
    },

    historyArea: {
      minHeight: 145,
      borderRadius: 22,
      padding: 18,
      marginBottom: 26,
      borderWidth: 1,
    },

    historyHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
    },

    recentHistoryList: {
      marginTop: 14,
      gap: 8,
    },

    historyRow: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    pausedBadge: {
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 12,
    },

    counterSection: {
      alignItems: 'center',
      marginBottom: 32,
    },

    counterValueRow: {
      flexDirection: 'row',
      alignItems:
        'flex-end',
      marginBottom: 14,
    },

    counterNumber: {
      fontSize: 62,
      fontWeight: '700',
    },

    counterUnit: {
      fontSize: 20,
      marginLeft: 6,
      marginBottom: 8,
    },

    plusButton: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    plusText: {
      fontSize: 58,
    },

    newCountButton: {
      padding: 12,
    },

    actionRow: {
      flexDirection: 'row',
      justifyContent:
        'center',
      gap: 18,
      marginBottom: 30,
    },

    markButton: {
      minWidth: 112,
      padding: 14,
      borderRadius: 22,
      alignItems: 'center',
    },

    undoButton: {
      width: 54,
      height: 54,
      borderRadius: 27,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    undoDisabled: {
      opacity: 0.4,
    },

    memoArea: {
      borderRadius: 22,
      padding: 20,
      marginBottom: 30,
      borderWidth: 1,
    },

    memoText: {
      marginTop: 12,
    },

    modalOverlay: {
      flex: 1,
      justifyContent:
        'center',
      paddingHorizontal: 24,
      backgroundColor:
        'rgba(0,0,0,0.35)',
    },

    historyModal: {
      maxHeight: '75%',
      borderRadius: 28,
      padding: 22,
    },

    modalHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      marginBottom: 16,
    },

    modalTitle: {
      fontSize: 26,
      fontWeight: '700',
    },

    fullHistoryRow: {
      minHeight: 70,
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      paddingVertical: 12,
    },

    fullHistoryCount: {
      fontSize: 18,
      fontWeight: '600',
    },

    fullHistoryType: {
      marginTop: 4,
    },
  });