import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

  const recentHistoryScrollRef =
    useRef<ScrollView | null>(
      null
    );

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

  const [
    memoModalVisible,
    setMemoModalVisible,
  ] = useState(false);

  const [
    memoDraft,
    setMemoDraft,
  ] = useState('');

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
      nextProject: Project
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

  const removePausedHistory = (
    history: HistoryItem[]
  ) => {
    const nextHistory = [
      ...history,
    ];

    while (
      nextHistory.length >
        0 &&
      nextHistory[0].type ===
        'mark'
    ) {
      nextHistory.shift();
    }

    return nextHistory;
  };

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
        history =
          removePausedHistory(
            history
          );

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
        history =
          removePausedHistory(
            history
          );

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
        history =
          removePausedHistory(
            history
          );

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

      const history =
        removePausedHistory(
          project.history
        );

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
          ...history,
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

  const openMemoEditor =
    () => {
      setMemoDraft(
        project.memo ?? ''
      );

      setMemoModalVisible(
        true
      );
    };

  const saveMemo =
    async () => {
      await persistProject({
        ...project,
        memo: memoDraft,
      });

      setMemoModalVisible(
        false
      );
    };

  const displayHistory =
    useMemo(() => {
      return [
        ...project.history,
      ].reverse();
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
          ? '段'
          : 'Row';
      }

      return isJapanese
        ? '目'
        : 'Stitch';
    };

  const renderHistoryItem = (
    item: HistoryItem,
    index: number
  ) => {
    const isNewest =
      index ===
      displayHistory.length - 1;

    return (
      <View
        key={item.id}
        style={
          styles.historyRow
        }
      >
        <View
          style={
            styles.historyLeft
          }
        >
          <Text
            style={[
              styles.historyCountText,

              {
                color:
                  currentTheme.text,
              },
            ]}
            numberOfLines={1}
          >
            {isJapanese
              ? `${item.row}段 ${item.stitch}目`
              : `${item.row} Row ${item.stitch} Stitches`}
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

                  fontSize: 11,
                }}
              >
                {isJapanese
                  ? '途中'
                  : 'Paused'}
              </Text>
            </View>
          )}
        </View>

        {isNewest && (
          <Text
            style={[
              styles.newLabel,

              {
                color:
                  currentTheme.accent,
              },
            ]}
          >
            NEW
          </Text>
        )}
      </View>
    );
  };

  const renderHistory =
    (
      landscape = false
    ) => (
      <View
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
      >
        <TouchableOpacity
          style={
            styles.historyHeader
          }
          activeOpacity={0.7}
          onPress={() =>
            setHistoryModalVisible(
              true
            )
          }
        >
          <Text
            style={[
              styles.sectionTitle,

              landscape &&
                styles.sectionTitleLandscape,

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
            style={[
              styles.historyArrow,

              {
                color:
                  currentTheme.subText,
              },
            ]}
          >
            ›
          </Text>
        </TouchableOpacity>

        {displayHistory.length ===
        0 ? (
          <Text
            style={[
              styles.emptyHistoryText,

              {
                color:
                  currentTheme.subText,
              },
            ]}
          >
            {isJapanese
              ? '履歴はまだありません'
              : 'No history yet'}
          </Text>
        ) : (
          <ScrollView
            ref={
              recentHistoryScrollRef
            }
            style={[
              styles.recentHistoryScroll,

              landscape &&
                styles.recentHistoryScrollLandscape,
            ]}
            contentContainerStyle={
              styles.recentHistoryContent
            }
            nestedScrollEnabled
            showsVerticalScrollIndicator
            onContentSizeChange={() => {
              recentHistoryScrollRef
                .current
                ?.scrollToEnd({
                  animated: true,
                });
            }}
          >
            {displayHistory.map(
              renderHistoryItem
            )}
          </ScrollView>
        )}
      </View>
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
            activeOpacity={0.8}
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

          <View
            style={
              styles.nextButtonRow
            }
          >
            <TouchableOpacity
              style={[
                styles.nextButton,

                landscape &&
                  styles.nextButtonLandscape,

                {
                  backgroundColor:
                    currentTheme.soft,
                },
              ]}
              activeOpacity={0.7}
              onPress={
                isRow
                  ? startNewRow
                  : startNewStitch
              }
            >
              <Text
                style={[
                  styles.nextButtonText,

                  landscape &&
                    styles.nextButtonTextLandscape,

                  {
                    color:
                      currentTheme.subText,
                  },
                ]}
              >
                │→
              </Text>
            </TouchableOpacity>
          </View>
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
          activeOpacity={0.8}
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
              ? '途中を記録'
              : 'Save Progress'}
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
          activeOpacity={0.8}
          onPress={undo}
          disabled={
            project
              .undoStack
              .length ===
            0
          }
        >
          <Text
            style={[
              styles.undoText,

              landscape &&
                styles.undoTextLandscape,

              {
                color:
                  currentTheme.text,
              },
            ]}
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
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={
          openMemoEditor
        }
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
        <View
          style={
            styles.memoHeader
          }
        >
          <Text
            style={[
              styles.sectionTitle,

              landscape &&
                styles.sectionTitleLandscape,

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
              styles.memoEditLabel,

              {
                color:
                  currentTheme.accent,
              },
            ]}
          >
            {isJapanese
              ? '編集'
              : 'Edit'}
          </Text>
        </View>

        <Text
          style={[
            styles.memoText,

            landscape &&
              styles.memoTextLandscape,

            {
              color:
                project.memo
                  ? currentTheme.text
                  : currentTheme.subText,
            },
          ]}
          numberOfLines={
            landscape ? 4 : undefined
          }
        >
          {project.memo ||
            (isJapanese
              ? 'タップしてメモを書く'
              : 'Tap to add a note')}
        </Text>
      </TouchableOpacity>
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

        {isLandscape && (
          <View
            style={
              styles.landscapeContent
            }
          >
            <View
              style={
                styles.landscapeLeft
              }
            >
              {renderHistory(
                true
              )}

              <ScrollView
                style={
                  styles.landscapeMemoScroll
                }
                showsVerticalScrollIndicator={
                  false
                }
              >
                {renderMemo(
                  true
                )}
              </ScrollView>
            </View>

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

        {/* メモ編集モーダル */}
        <Modal
          visible={
            memoModalVisible
          }
          transparent
          animationType="fade"
          supportedOrientations={[
            'portrait',
            'portrait-upside-down',
            'landscape',
            'landscape-left',
            'landscape-right',
          ]}
          onRequestClose={() =>
            setMemoModalVisible(
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
                styles.memoModal,

                isLandscape &&
                  styles.memoModalLandscape,

                {
                  backgroundColor:
                    currentTheme.surface,
                },
              ]}
            >
              <Text
                style={[
                  styles.memoModalTitle,

                  {
                    color:
                      currentTheme.text,
                  },
                ]}
              >
                {isJapanese
                  ? 'メモを編集'
                  : 'Edit Note'}
              </Text>

              <TextInput
                value={
                  memoDraft
                }
                onChangeText={
                  setMemoDraft
                }
                multiline
                autoFocus
                textAlignVertical="top"
                placeholder={
                  isJapanese
                    ? 'メモを入力'
                    : 'Enter a note'
                }
                placeholderTextColor={
                  currentTheme.subText
                }
                style={[
                  styles.memoInput,

                  {
                    color:
                      currentTheme.text,

                    borderColor:
                      currentTheme.border,

                    backgroundColor:
                      currentTheme.background,
                  },
                ]}
              />

              <View
                style={
                  styles.memoModalButtons
                }
              >
                <TouchableOpacity
                  style={[
                    styles.memoCancelButton,

                    {
                      backgroundColor:
                        currentTheme.soft,
                    },
                  ]}
                  onPress={() =>
                    setMemoModalVisible(
                      false
                    )
                  }
                >
                  <Text
                    style={{
                      color:
                        currentTheme.text,
                    }}
                  >
                    {isJapanese
                      ? 'キャンセル'
                      : 'Cancel'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.memoSaveButton,

                    {
                      backgroundColor:
                        currentTheme.accent,
                    },
                  ]}
                  onPress={
                    saveMemo
                  }
                >
                  <Text
                    style={[
                      styles.memoSaveText,

                      {
                        color:
                          currentTheme.text,
                      },
                    ]}
                  >
                    {isJapanese
                      ? '保存'
                      : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* 全履歴モーダル */}
        <Modal
          visible={
            historyModalVisible
          }
          transparent
          animationType="fade"
          supportedOrientations={[
            'portrait',
            'portrait-upside-down',
            'landscape',
            'landscape-left',
            'landscape-right',
          ]}
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

              <ScrollView
                showsVerticalScrollIndicator
              >
                {displayHistory.map(
                  (
                    item,
                    index
                  ) => {
                    const isNewest =
                      index ===
                      displayHistory.length -
                        1;

                    return (
                      <View
                        key={
                          item.id
                        }
                        style={[
                          styles.fullHistoryRow,

                          {
                            borderBottomColor:
                              currentTheme.border,
                          },
                        ]}
                      >
                        <View
                          style={
                            styles.fullHistoryLeft
                          }
                        >
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
                              ? `${item.row}段 ${item.stitch}目`
                              : `${item.row} Row ${item.stitch} Stitches`}
                          </Text>

                          {item.type !==
                            'mark' && (
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
                          )}
                        </View>

                        <View
                          style={
                            styles.fullHistoryRight
                          }
                        >
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

                          {isNewest && (
                            <Text
                              style={[
                                styles.newLabelFull,

                                {
                                  color:
                                    currentTheme.accent,
                                },
                              ]}
                            >
                              NEW
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  }
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
      paddingTop: 4,
      paddingBottom: 4,
      paddingHorizontal: 14,
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
      height: 180,
      borderRadius: 22,
      padding: 18,
      marginBottom: 28,
      borderWidth: 1,
    },

    historyAreaLandscape: {
      height: 128,
      padding: 9,
      marginBottom: 7,
      borderRadius: 15,
    },

    historyHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    historyArrow: {
      fontSize: 27,
      lineHeight: 27,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
    },

    sectionTitleLandscape: {
      fontSize: 14,
    },

    recentHistoryScroll: {
      flex: 1,
      marginTop: 10,
    },

    recentHistoryScrollLandscape: {
      marginTop: 4,
    },

    recentHistoryContent: {
      gap: 8,
      paddingBottom: 2,
    },

    emptyHistoryText: {
      marginTop: 18,
    },

    historyRow: {
      minHeight: 26,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      gap: 4,
    },

    historyLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      minWidth: 0,
    },

    historyCountText: {
      flexShrink: 1,
      fontSize: 13,
    },

    pausedBadge: {
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 10,
    },

    newLabel: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.3,
      marginLeft: 4,
    },

    counterSection: {
      alignItems: 'center',
      marginBottom: 40,
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
      fontSize: 68,
      fontWeight: '700',
    },

    counterNumberLandscape: {
      fontSize: 76,
      lineHeight: 82,
    },

    counterUnit: {
      fontSize: 20,
      marginLeft: 6,
      marginBottom: 9,
    },

    counterUnitLandscape: {
      fontSize: 20,
      marginBottom: 8,
    },

    plusButton: {
      width: '82%',
      maxWidth: 310,
      height: 150,
      borderRadius: 34,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    plusButtonLandscape: {
      width: '84%',
      maxWidth: 330,
      height: 185,
      borderRadius: 38,
    },

    plusText: {
      fontSize: 82,
      lineHeight: 90,
      fontWeight: '400',
    },

    plusTextLandscape: {
      fontSize: 96,
      lineHeight: 104,
    },

    nextButtonRow: {
      width: '82%',
      maxWidth: 310,
      alignItems:
        'flex-end',
      marginTop: 14,
    },

    nextButton: {
      minWidth: 74,
      height: 46,
      borderRadius: 18,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    nextButtonLandscape: {
      minWidth: 82,
      height: 46,
      borderRadius: 18,
    },

    nextButtonText: {
      fontSize: 22,
      fontWeight: '600',
    },

    nextButtonTextLandscape: {
      fontSize: 23,
    },

    actionRow: {
      flexDirection: 'row',
      justifyContent:
        'center',
      alignItems: 'center',
      gap: 18,
      marginTop: 4,
      marginBottom: 30,
    },

    actionRowLandscape: {
      marginTop: 2,
      marginBottom: 5,
    },

    markButton: {
      minWidth: 145,
      height: 52,
      paddingHorizontal: 18,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    markButtonLandscape: {
      minWidth: 155,
      height: 48,
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

    undoText: {
      fontSize: 28,
    },

    undoTextLandscape: {
      fontSize: 25,
    },

    memoArea: {
      borderRadius: 22,
      padding: 20,
      marginBottom: 30,
      borderWidth: 1,
    },

    memoAreaLandscape: {
      padding: 9,
      borderRadius: 15,
      marginBottom: 5,
    },

    memoHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    memoEditLabel: {
      fontSize: 13,
      fontWeight: '600',
    },

    memoText: {
      marginTop: 12,
    },

    memoTextLandscape: {
      marginTop: 5,
      fontSize: 12,
    },

    landscapeContent: {
      flex: 1,
      flexDirection: 'row',
      paddingHorizontal: 10,
      paddingBottom: 5,
      gap: 10,
    },

    landscapeLeft: {
      width: '19%',
    },

    landscapeMemoScroll: {
      flex: 1,
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
      marginVertical: 10,
    },

    modalOverlay: {
      flex: 1,
      justifyContent:
        'center',
      paddingHorizontal: 24,
      backgroundColor:
        'rgba(0,0,0,0.35)',
    },

    memoModal: {
      width: '100%',
      maxWidth: 520,
      alignSelf: 'center',
      borderRadius: 26,
      padding: 22,
    },

    memoModalLandscape: {
      width: '65%',
    },

    memoModalTitle: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 16,
    },

    memoInput: {
      minHeight: 150,
      maxHeight: 280,
      borderWidth: 1,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
    },

    memoModalButtons: {
      flexDirection: 'row',
      justifyContent:
        'flex-end',
      gap: 12,
      marginTop: 18,
    },

    memoCancelButton: {
      minWidth: 100,
      height: 48,
      paddingHorizontal: 18,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    memoSaveButton: {
      minWidth: 100,
      height: 48,
      paddingHorizontal: 18,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    memoSaveText: {
      fontWeight: '700',
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

    fullHistoryLeft: {
      flex: 1,
    },

    fullHistoryRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginLeft: 12,
    },

    fullHistoryCount: {
      fontSize: 18,
      fontWeight: '600',
    },

    fullHistoryType: {
      marginTop: 4,
    },

    newLabelFull: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
  });