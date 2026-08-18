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
  useWindowDimensions,
  View,
} from 'react-native';

import {
  HistoryItem,
  HistoryType,
  Language,
  loadAppData,
  Project,
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

  const { width, height } =
    useWindowDimensions();

  const isLandscape =
    width > height;

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
                project.id === id
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
        isLandscape ? 2 : 3
      );
    }, [
      project.history,
      isLandscape,
    ]);

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

  const renderHistory =
    (
      landscape = false
    ) => (
      <TouchableOpacity
        style={[
          styles.historyArea,

          landscape &&
            styles.historyAreaLandscape,

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
                        fontSize: 12,
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

          {recentHistory.length ===
            0 && (
            <Text
              style={{
                color:
                  currentTheme.subText,
              }}
            >
              {isJapanese
                ? '履歴はまだありません'
                : 'No history yet'}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );

  const renderCounter =
    (
      type:
        | 'row'
        | 'stitch',

      landscape = false
    ) => {
      const isRow =
        type === 'row';

      const number =
        isRow
          ? project.row
          : project.stitch;

      const unit =
        isRow
          ? isJapanese
            ? '段'
            : 'Row'
          : isJapanese
            ? '目'
            : 'Stitch';

      const newLabel =
        isRow
          ? isJapanese
            ? '新しい段'
            : 'New Row'
          : isJapanese
            ? '新しい目'
            : 'New Stitch';

      return (
        <View
          style={[
            styles.counterSection,

            landscape &&
              styles.counterSectionLandscape,
          ]}
        >
          <View
            style={
              styles.counterValueRow
            }
          >
            <Text
              style={[
                styles.counterNumber,

                landscape &&
                  styles.counterNumberLandscape,

                {
                  color:
                    currentTheme.text,
                },
              ]}
            >
              {number}
            </Text>

            <Text
              style={[
                styles.counterUnit,

                landscape &&
                  styles.counterUnitLandscape,

                {
                  color:
                    currentTheme.text,
                },
              ]}
            >
              {unit}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.plusButton,

              landscape &&
                styles.plusButtonLandscape,

              {
                backgroundColor:
                  currentTheme.accent,
              },
            ]}
            onPress={
              isRow
                ? addRow
                : addStitch
            }
          >
            <Text
              style={[
                styles.plusText,

                landscape &&
                  styles.plusTextLandscape,

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
            style={[
              styles.newCountButton,

              landscape &&
                styles.newCountButtonLandscape,
            ]}
            onPress={
              isRow
                ? startNewRow
                : startNewStitch
            }
          >
            <Text
              style={[
                styles.newCountText,
                {
                  color:
                    currentTheme.subText,
                },
              ]}
            >
              {newLabel}
            </Text>
          </TouchableOpacity>
        </View>
      );
    };

  const renderActions =
    (
      landscape = false
    ) => (
      <View
        style={[
          styles.actionRow,

          landscape &&
            styles.actionRowLandscape,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.markButton,

            landscape &&
              styles.markButtonLandscape,

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

            landscape &&
              styles.undoButtonLandscape,

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

              fontSize:
                landscape
                  ? 24
                  : 28,
            }}
          >
            ↶
          </Text>
        </TouchableOpacity>
      </View>
    );

  const renderMemo =
    (
      landscape = false
    ) => (
      <View
        style={[
          styles.memoArea,

          landscape &&
            styles.memoAreaLandscape,

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
    );

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
          style={[
            styles.header,

            isLandscape &&
              styles.headerLandscape,
          ]}
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

              isLandscape &&
                styles.projectNameLandscape,

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
            style={
              styles.headerSpacer
            }
          />
        </View>

        {/* Portrait */}
        {!isLandscape && (
          <ScrollView
            style={
              styles.content
            }
            showsVerticalScrollIndicator={
              false
            }
          >
            {renderHistory()}

            {renderCounter(
              'row'
            )}

            {renderCounter(
              'stitch'
            )}

            {renderActions()}

            {renderMemo()}
          </ScrollView>
        )}

        {/* Landscape */}
        {isLandscape && (
          <View
            style={
              styles.landscapeContent
            }
          >
            <ScrollView
              style={
                styles.landscapeLeft
              }
              contentContainerStyle={
                styles.landscapeLeftContent
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              {renderHistory(
                true
              )}

              {renderMemo(
                true
              )}
            </ScrollView>

            <View
              style={
                styles.landscapeMain
              }
            >
              <View
                style={
                  styles.landscapeCounters
                }
              >
                <View
                  style={
                    styles.landscapeCounterColumn
                  }
                >
                  {renderCounter(
                    'row',
                    true
                  )}
                </View>

                <View
                  style={[
                    styles.landscapeDivider,
                    {
                      backgroundColor:
                        currentTheme.border,
                    },
                  ]}
                />

                <View
                  style={
                    styles.landscapeCounterColumn
                  }
                >
                  {renderCounter(
                    'stitch',
                    true
                  )}
                </View>
              </View>

              {renderActions(
                true
              )}
            </View>
          </View>
        )}

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

                isLandscape &&
                  styles.historyModalLandscape,

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

    headerLandscape: {
      paddingTop: 6,
      paddingBottom: 6,
      paddingHorizontal: 16,
    },

    backButton: {
      width: 44,
    },

    backText: {
      fontSize: 40,
      lineHeight: 42,
    },

    projectName: {
      flex: 1,
      textAlign: 'center',
      fontSize: 22,
      fontWeight: '700',
    },

    projectNameLandscape: {
      fontSize: 19,
    },

    headerSpacer: {
      width: 44,
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

    historyAreaLandscape: {
      minHeight: 120,
      padding: 14,
      marginBottom: 12,
      borderRadius: 18,
    },

    historyHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
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
      gap: 8,
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

    counterSectionLandscape: {
      flex: 1,
      marginBottom: 0,
      justifyContent:
        'center',
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

    counterNumberLandscape: {
      fontSize: 52,
    },

    counterUnit: {
      fontSize: 20,
      marginLeft: 6,
      marginBottom: 8,
    },

    counterUnitLandscape: {
      fontSize: 17,
      marginBottom: 6,
    },

    plusButton: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    plusButtonLandscape: {
      width: 90,
      height: 90,
      borderRadius: 45,
    },

    plusText: {
      fontSize: 58,
      lineHeight: 65,
    },

    plusTextLandscape: {
      fontSize: 52,
      lineHeight: 58,
    },

    newCountButton: {
      padding: 12,
    },

    newCountButtonLandscape: {
      paddingTop: 8,
      paddingBottom: 6,
    },

    newCountText: {
      fontSize: 15,
    },

    actionRow: {
      flexDirection: 'row',
      justifyContent:
        'center',
      gap: 18,
      marginBottom: 30,
    },

    actionRowLandscape: {
      marginBottom: 10,
      marginTop: 4,
    },

    markButton: {
      minWidth: 112,
      padding: 14,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    markButtonLandscape: {
      minWidth: 110,
      minHeight: 44,
      paddingVertical: 10,
    },

    undoButton: {
      width: 54,
      height: 54,
      borderRadius: 27,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    undoButtonLandscape: {
      width: 48,
      height: 48,
      borderRadius: 24,
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

    memoAreaLandscape: {
      padding: 14,
      borderRadius: 18,
      marginBottom: 10,
    },

    memoText: {
      marginTop: 12,
    },

    landscapeContent: {
      flex: 1,
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingBottom: 8,
      gap: 16,
    },

    landscapeLeft: {
      width: '30%',
    },

    landscapeLeftContent: {
      paddingBottom: 10,
    },

    landscapeMain: {
      flex: 1,
    },

    landscapeCounters: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'stretch',
    },

    landscapeCounterColumn: {
      flex: 1,
    },

    landscapeDivider: {
      width: 1,
      marginVertical: 16,
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

    historyModalLandscape: {
      maxHeight: '88%',
      alignSelf: 'center',
      width: '65%',
    },

    modalHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
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