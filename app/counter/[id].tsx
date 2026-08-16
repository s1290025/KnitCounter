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
  updateProject
} from '../../storage/appStorage';

export default function CounterScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [project, setProject] =
    useState<Project | null>(
      null
    );

  const [
    language,
    setLanguage,
  ] =
    useState<Language>('ja');

  const [
    historyModalVisible,
    setHistoryModalVisible,
  ] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        if (!id) return;

        const data =
          await loadAppData();

        const savedProject =
          data.projects.find(
            (item) =>
              item.id === id
          ) ?? null;

        if (active) {
          setProject(
            savedProject
          );

          setLanguage(
            data.language
          );
        }
      };

      load();

      return () => {
        active = false;
      };
    }, [id])
  );

  const isJapanese =
    language === 'ja';

  const changeLanguage =
    async (
      nextLanguage:
        Language
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
      if (!project) return;

      const previousState =
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
          previousState,
        ],
      });
    };

  const addStitch =
    async () => {
      if (!project) return;

      const previousState =
        saveUndo(project);

      await persistProject({
        ...project,

        stitch:
          project.stitch +
          1,

        undoStack: [
          ...project.undoStack,
          previousState,
        ],
      });
    };

  const startNewRow =
    async () => {
      if (!project) return;

      const previousState =
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
          previousState,
        ],
      });
    };

  const startNewStitch =
    async () => {
      if (!project) return;

      const previousState =
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
          previousState,
        ],
      });
    };

  const addMark =
    async () => {
      if (!project) return;

      const previousState =
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
          previousState,
        ],
      });
    };

  const undo =
    async () => {
      if (!project) return;

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
      return (
        project?.history.slice(
          0,
          3
        ) ?? []
      );
    }, [project]);

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

  if (!project) {
    return (
      <SafeAreaView
        style={
          styles.safeArea
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

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View
        style={styles.container}
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
              style={
                styles.backText
              }
            >
              ‹
            </Text>
          </TouchableOpacity>

          <Text
            style={
              styles.projectName
            }
            numberOfLines={1}
          >
            {project.name}
          </Text>

          <View
            style={
              styles.languageSwitch
            }
          >
            <TouchableOpacity
              style={[
                styles.languageOption,

                isJapanese &&
                  styles.languageOptionActive,
              ]}
              onPress={() =>
                changeLanguage(
                  'ja'
                )
              }
            >
              <Text
                style={[
                  styles.languageOptionText,

                  isJapanese &&
                    styles.languageOptionTextActive,
                ]}
              >
                日
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,

                !isJapanese &&
                  styles.languageOptionActive,
              ]}
              onPress={() =>
                changeLanguage(
                  'en'
                )
              }
            >
              <Text
                style={[
                  styles.languageOptionText,

                  !isJapanese &&
                    styles.languageOptionTextActive,
                ]}
              >
                EN
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* History */}
          <TouchableOpacity
            style={
              styles.historyArea
            }
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
                style={
                  styles.sectionTitle
                }
              >
                {isJapanese
                  ? '最近の履歴'
                  : 'Recent History'}
              </Text>

              <Text
                style={
                  styles.historyArrow
                }
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
                    key={
                      item.id
                    }
                    style={
                      styles.historyRow
                    }
                  >
                    <Text>
                      {isJapanese
                        ? `${item.row}段　${item.stitch}目`
                        : `${item.row} Row　${item.stitch} Stitches`}
                    </Text>

                    {item.type ===
                      'mark' && (
                      <View
                        style={
                          styles.pausedBadge
                        }
                      >
                        <Text
                          style={
                            styles.pausedBadgeText
                          }
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

          {/* Rows */}
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
                style={
                  styles.counterNumber
                }
              >
                {project.row}
              </Text>

              <Text
                style={
                  styles.counterUnit
                }
              >
                {isJapanese
                  ? '段'
                  : 'Row'}
              </Text>
            </View>

            <TouchableOpacity
              style={
                styles.plusButton
              }
              onPress={
                addRow
              }
            >
              <Text
                style={
                  styles.plusText
                }
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
                style={
                  styles.newCountText
                }
              >
                {isJapanese
                  ? '新しい段'
                  : 'New Row'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stitches */}
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
                style={
                  styles.counterNumber
                }
              >
                {project.stitch}
              </Text>

              <Text
                style={
                  styles.counterUnit
                }
              >
                {isJapanese
                  ? '目'
                  : 'Stitch'}
              </Text>
            </View>

            <TouchableOpacity
              style={
                styles.plusButton
              }
              onPress={
                addStitch
              }
            >
              <Text
                style={
                  styles.plusText
                }
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
                style={
                  styles.newCountText
                }
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
              style={
                styles.markButton
              }
              onPress={
                addMark
              }
            >
              <Text
                style={
                  styles.markText
                }
              >
                {isJapanese
                  ? '区切り'
                  : 'Mark'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.undoButton,

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
                style={
                  styles.undoText
                }
              >
                ↶
              </Text>
            </TouchableOpacity>
          </View>

          {/* Note */}
          <View
            style={
              styles.memoArea
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              {isJapanese
                ? 'メモ'
                : 'Note'}
            </Text>

            <Text
              style={
                styles.memoText
              }
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
              style={
                styles.historyModal
              }
            >
              <View
                style={
                  styles.modalHeader
                }
              >
                <Text
                  style={
                    styles.modalTitle
                  }
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
                    style={
                      styles.closeText
                    }
                  >
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView>
                {project.history.map(
                  (item) => (
                    <View
                      key={
                        item.id
                      }
                      style={
                        styles.fullHistoryRow
                      }
                    >
                      <View>
                        <Text
                          style={
                            styles.fullHistoryCount
                          }
                        >
                          {isJapanese
                            ? `${item.row}段　${item.stitch}目`
                            : `${item.row} Row　${item.stitch} Stitches`}
                        </Text>

                        <Text
                          style={
                            styles.fullHistoryType
                          }
                        >
                          {getHistoryTypeLabel(
                            item.type
                          )}
                        </Text>
                      </View>

                      {item.type ===
                        'mark' && (
                        <View
                          style={
                            styles.pausedBadge
                          }
                        >
                          <Text
                            style={
                              styles.pausedBadgeText
                            }
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
    safeArea: {
      flex: 1,
      backgroundColor:
        '#FFF9F3',
    },

    container: {
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
      backgroundColor:
        '#F2E7DC',
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

    languageOptionActive: {
      backgroundColor:
        '#FFFFFF',
    },

    languageOptionText: {
      fontSize: 14,
      color: '#837A74',
    },

    languageOptionTextActive: {
      color: '#111111',
      fontWeight: '700',
    },

    content: {
      flex: 1,
      paddingHorizontal: 24,
    },

    historyArea: {
      minHeight: 145,
      borderRadius: 22,
      backgroundColor:
        '#FFFFFF',
      padding: 18,
      marginBottom: 26,
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

    historyArrow: {
      fontSize: 28,
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
      backgroundColor:
        '#F0DDD5',
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 12,
    },

    pausedBadgeText: {
      fontSize: 12,
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
      backgroundColor:
        '#D9A3A3',
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

    newCountText: {
      color: '#766E68',
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
      backgroundColor:
        '#F2E7DC',
      alignItems: 'center',
    },

    markText: {
      fontWeight: '600',
    },

    undoButton: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor:
        '#F2E7DC',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    undoDisabled: {
      opacity: 0.4,
    },

    undoText: {
      fontSize: 28,
    },

    memoArea: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 22,
      padding: 20,
      marginBottom: 30,
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
        'rgba(0,0,0,0.28)',
    },

    historyModal: {
      maxHeight: '75%',
      backgroundColor:
        '#FFFDFC',
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

    closeText: {
      fontSize: 30,
    },

    fullHistoryRow: {
      minHeight: 70,
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor:
        '#EEE6E0',
      paddingVertical: 12,
    },

    fullHistoryCount: {
      fontSize: 18,
      fontWeight: '600',
    },

    fullHistoryType: {
      marginTop: 4,
      color: '#9A918B',
    },
  });