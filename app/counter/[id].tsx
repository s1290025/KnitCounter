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
  KeyboardAvoidingView,
  Modal,
  Platform,
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
  Language,
  loadAppData,
  Project,
  updateProject,
} from '../../storage/appStorage';

import { themes } from '../../theme/themes';

export default function CounterScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;

  const shortSide = Math.min(width, height);
  const longSide = Math.max(width, height);

  const isSmallScreen =
    shortSide < 380 ||
    longSide < 700;

  const isTablet =
    shortSide >= 600;

  const counterNumberSize =
    isSmallScreen
      ? 44
      : isTablet
        ? 72
        : 56;

  const counterUnitSize =
    isSmallScreen
      ? 15
      : isTablet
        ? 22
        : 18;

  const plusTextSize =
    isSmallScreen
      ? 58
      : isTablet
        ? 88
        : 72;

  const nextButtonHeight =
    isSmallScreen ? 36 : 42;

  const landscapeLeftWidth = '20%';

  const recentHistoryScrollRef =
    useRef<ScrollView | null>(null);

  const fullHistoryScrollRef =
    useRef<ScrollView | null>(null);

  const [project, setProject] =
    useState<Project | null>(null);

  const [language, setLanguage] =
    useState<Language>('ja');

  const [themeName, setThemeName] =
    useState<keyof typeof themes>('pink');

  const [
    historyModalVisible,
    setHistoryModalVisible,
  ] = useState(false);

  const [
    memoModalVisible,
    setMemoModalVisible,
  ] = useState(false);

  const [
    memoEditing,
    setMemoEditing,
  ] = useState(false);

  const [
    memoDraft,
    setMemoDraft,
  ] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        if (!id) return;

        const data =
          await loadAppData();

        const savedProject =
          data.projects.find(
            (project) =>
              project.id === id
          ) ?? null;

        if (active) {
          setProject(savedProject);
          setLanguage(data.language);
          setThemeName(data.theme);
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
      setProject(nextProject);

      await updateProject(
        nextProject
      );
    };

  const saveUndo = (
    current: Project
  ) => ({
    row: current.row,
    stitch: current.stitch,
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
      nextHistory.length > 0 &&
      nextHistory[0].type === 'mark'
    ) {
      nextHistory.shift();
    }

    return nextHistory;
  };

  const addRow = async () => {
    const previous =
      saveUndo(project);

    let history = [
      ...project.history,
    ];

    if (project.stitch > 0) {
      history =
        removePausedHistory(
          history
        );

      const item: HistoryItem = {
        id: `${Date.now()}-${Math.random()}`,
        row: project.row,
        stitch: project.stitch,
        type: 'row',
      };

      history = [
        item,
        ...history,
      ];
    }

    await persistProject({
      ...project,
      row: project.row + 1,
      stitch: 0,
      history,
      undoStack: [
        ...project.undoStack,
        previous,
      ],
    });
  };

  const addStitch = async () => {
    const previous =
      saveUndo(project);

    await persistProject({
      ...project,
      stitch:
        project.stitch + 1,
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

      if (project.stitch > 0) {
        history =
          removePausedHistory(
            history
          );

        history = [
          {
            id: `${Date.now()}-${Math.random()}`,
            row: project.row,
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

      if (project.stitch > 0) {
        history =
          removePausedHistory(
            history
          );

        history = [
          {
            id: `${Date.now()}-${Math.random()}`,
            row: project.row,
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

  const addMark = async () => {
    const previous =
      saveUndo(project);

    const history =
      removePausedHistory(
        project.history
      );

    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random()}`,
      row: project.row,
      stitch: project.stitch,
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

  const undo = async () => {
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
      row: previous.row,
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

  const openMemoViewer =
    () => {
      setMemoDraft(
        project.memo ?? ''
      );

      setMemoEditing(false);

      setMemoModalVisible(
        true
      );
    };

  const startMemoEditing =
    () => {
      setMemoDraft(
        project.memo ?? ''
      );

      setMemoEditing(true);
    };

  const cancelMemoEditing =
    () => {
      setMemoDraft(
        project.memo ?? ''
      );

      setMemoEditing(false);
    };

  const saveMemo =
    async () => {
      await persistProject({
        ...project,
        memo: memoDraft,
      });

      setMemoEditing(false);
    };

  const closeMemoModal =
    () => {
      setMemoDraft(
        project.memo ?? ''
      );

      setMemoEditing(false);

      setMemoModalVisible(
        false
      );
    };

  const openHistoryModal =
    () => {
      setHistoryModalVisible(
        true
      );

      setTimeout(() => {
        fullHistoryScrollRef
          .current
          ?.scrollToEnd({
            animated: false,
          });
      }, 100);
    };

  const displayHistory =
    useMemo(() => {
      return [
        ...project.history,
      ].reverse();
    }, [project.history]);

  const renderHistoryItem = (
    item: HistoryItem,
    isNewest: boolean
  ) => {
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
                  fontSize: 10,
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
          onPress={
            openHistoryModal
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
              styles.openArrow,
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
            style={
              styles.recentHistoryScroll
            }
            contentContainerStyle={
              styles.recentHistoryContent
            }
            nestedScrollEnabled
            showsVerticalScrollIndicator
            onContentSizeChange={() => {
              recentHistoryScrollRef
                .current
                ?.scrollToEnd({
                  animated: false,
                });
            }}
          >
            {displayHistory.map(
              (
                item,
                index
              ) =>
                renderHistoryItem(
                  item,
                  index ===
                    displayHistory.length -
                      1
                )
            )}
          </ScrollView>
        )}
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
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={
            openMemoViewer
          }
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
              styles.openArrow,
              {
                color:
                  currentTheme.subText,
              },
            ]}
          >
            ›
          </Text>
        </TouchableOpacity>

        <ScrollView
          style={
            styles.memoPreviewScroll
          }
          contentContainerStyle={
            styles.memoPreviewContent
          }
          nestedScrollEnabled
          showsVerticalScrollIndicator
        >
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
          >
            {project.memo ||
              (isJapanese
                ? 'メモはまだありません'
                : 'No note yet')}
          </Text>
        </ScrollView>
      </View>
    );

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
          onPress={addMark}
        >
          <Text
            style={[
              styles.markButtonText,

              landscape &&
                styles.markButtonTextLandscape,

              {
                color:
                  currentTheme.text,
              },
            ]}
            numberOfLines={1}
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

            project.undoStack
              .length === 0 &&
              styles.undoDisabled,
          ]}
          activeOpacity={0.8}
          onPress={undo}
          disabled={
            project.undoStack
              .length === 0
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
            style={[
              styles.counterTopRow,

              landscape &&
                styles.counterTopRowLandscape,
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

                  !landscape && {
                    fontSize:
                      counterNumberSize,
                    lineHeight:
                      counterNumberSize +
                      4,
                  },

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

                  !landscape && {
                    fontSize:
                      counterUnitSize,
                  },

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
                styles.nextButton,

                landscape &&
                  styles.nextButtonLandscape,

                !landscape && {
                  height:
                    nextButtonHeight,
                },

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

                !landscape && {
                  fontSize:
                    plusTextSize,
                  lineHeight:
                    plusTextSize +
                    6,
                },

                {
                  color:
                    currentTheme.text,
                },
              ]}
            >
              ＋
            </Text>
          </TouchableOpacity>
        </View>
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
        <View
          style={[
            styles.header,

            isSmallScreen &&
              styles.headerSmall,

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

              isSmallScreen &&
                styles.projectNameSmall,

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

        {/* 縦画面 */}
        {!isLandscape && (
          <View
            style={
              styles.portraitContent
            }
          >
            {/* 必要な分だけ使う */}
            <View
              style={
                styles.portraitTopArea
              }
            >
              <View
                style={
                  styles.portraitActionBox
                }
              >
                {renderActions()}
              </View>

              <View
                style={
                  styles.portraitMemoBox
                }
              >
                {renderMemo()}
              </View>

              <View
                style={
                  styles.portraitHistoryBox
                }
              >
                {renderHistory()}
              </View>
            </View>

            {/* 残りを全部カウンターへ */}
            <View
              style={
                styles.portraitCounters
              }
            >
              <View
                style={
                  styles.portraitCounterItem
                }
              >
                {renderCounter(
                  'row'
                )}
              </View>

              <View
                style={
                  styles.portraitCounterItem
                }
              >
                {renderCounter(
                  'stitch'
                )}
              </View>
            </View>
          </View>
        )}

        {/* 横画面 */}
        {isLandscape && (
          <View
            style={
              styles.landscapeContent
            }
          >
            <View
              style={[
                styles.landscapeLeft,
                {
                  width:
                    landscapeLeftWidth,
                },
              ]}
            >
              <View
                style={
                  styles.landscapeActionBox
                }
              >
                {renderActions(
                  true
                )}
              </View>

              <View
                style={
                  styles.landscapeMemoBox
                }
              >
                {renderMemo(
                  true
                )}
              </View>

              <View
                style={
                  styles.landscapeHistoryBox
                }
              >
                {renderHistory(
                  true
                )}
              </View>
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
            </View>
          </View>
        )}

        {/* メモ全文表示・編集 */}
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
          onRequestClose={
            closeMemoModal
          }
        >
          <KeyboardAvoidingView
            style={
              styles.keyboardAvoidingView
            }
            behavior={
              Platform.OS ===
              'ios'
                ? 'padding'
                : 'height'
            }
            keyboardVerticalOffset={0}
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
                <View
                  style={
                    styles.modalHeader
                  }
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
                      ? 'メモ'
                      : 'Note'}
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.modalCloseButton
                    }
                    onPress={
                      closeMemoModal
                    }
                  >
                    <Text
                      style={[
                        styles.modalCloseText,
                        {
                          color:
                            currentTheme.text,
                        },
                      ]}
                    >
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>

                {!memoEditing ? (
                  <>
                    <View
                      style={[
                        styles.memoViewer,
                        {
                          borderColor:
                            currentTheme.border,
                          backgroundColor:
                            currentTheme.background,
                        },
                      ]}
                    >
                      <ScrollView
                        showsVerticalScrollIndicator
                        nestedScrollEnabled
                      >
                        <Text
                          style={[
                            styles.memoViewerText,
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
                              ? 'メモはまだありません'
                              : 'No note yet')}
                        </Text>
                      </ScrollView>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.memoEditButton,
                        {
                          backgroundColor:
                            currentTheme.accent,
                        },
                      ]}
                      onPress={
                        startMemoEditing
                      }
                    >
                      <Text
                        style={[
                          styles.memoEditButtonText,
                          {
                            color:
                              currentTheme.text,
                          },
                        ]}
                      >
                        {isJapanese
                          ? '編集'
                          : 'Edit'}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <ScrollView
                    style={
                      styles.memoEditScroll
                    }
                    contentContainerStyle={
                      styles.memoEditContent
                    }
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={
                      false
                    }
                  >
                    <TextInput
                      value={
                        memoDraft
                      }
                      onChangeText={
                        setMemoDraft
                      }
                      multiline
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
                        onPress={
                          cancelMemoEditing
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
                  </ScrollView>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* 全履歴 */}
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
                  style={
                    styles.modalCloseButton
                  }
                  onPress={() =>
                    setHistoryModalVisible(
                      false
                    )
                  }
                >
                  <Text
                    style={[
                      styles.modalCloseText,
                      {
                        color:
                          currentTheme.text,
                      },
                    ]}
                  >
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                ref={
                  fullHistoryScrollRef
                }
                style={
                  styles.fullHistoryScroll
                }
                showsVerticalScrollIndicator
                nestedScrollEnabled
                onContentSizeChange={() => {
                  if (
                    historyModalVisible
                  ) {
                    fullHistoryScrollRef
                      .current
                      ?.scrollToEnd({
                        animated: false,
                      });
                  }
                }}
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
      height: 58,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
    },

    headerSmall: {
      height: 48,
    },

    headerLandscape: {
      height: 42,
      paddingHorizontal: 12,
    },

    backButton: {
      width: 44,
      height: 40,
      justifyContent:
        'center',
    },

    backText: {
      fontSize: 38,
      lineHeight: 40,
    },

    projectName: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '700',
    },

    projectNameSmall: {
      fontSize: 15,
    },

    projectNameLandscape: {
      fontSize: 17,
    },

    headerSpacer: {
      width: 44,
    },

    /*
     * 縦画面
     * 上部を割合ではなく必要な高さだけ使う
     */
    portraitContent: {
      flex: 1,
      minHeight: 0,
      paddingHorizontal: 16,
      paddingBottom: 6,
      gap: 6,
    },

    portraitTopArea: {
      gap: 5,
    },

    portraitActionBox: {
      height: 44,
    },

    /*
     * メモ本文が約1行見える高さ
     */
    portraitMemoBox: {
      height: 58,
      minHeight: 58,
    },

    /*
     * 最近の履歴が約2行見える高さ
     */
    portraitHistoryBox: {
      height: 78,
      minHeight: 78,
    },

    /*
     * 残りを全部カウンターへ
     */
    portraitCounters: {
      flex: 1,
      minHeight: 0,
      gap: 5,
    },

    portraitCounterItem: {
      flex: 1,
      minHeight: 0,
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
    },

    sectionTitleLandscape: {
      fontSize: 16,
      fontWeight: '700',
    },

    openArrow: {
      fontSize: 23,
      lineHeight: 23,
    },

    actionRow: {
      flex: 1,
      flexDirection: 'row',
      justifyContent:
        'center',
      alignItems: 'center',
      gap: 12,
    },

    actionRowLandscape: {
      width: '100%',
      gap: 6,
    },

    markButton: {
      minWidth: 135,
      height: '90%',
      maxHeight: 46,
      paddingHorizontal: 14,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    markButtonLandscape: {
      flex: 1,
      minWidth: 0,
      height: 44,
      paddingHorizontal: 4,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    markButtonText: {
      fontWeight: '600',
      fontSize: 13,
    },

    markButtonTextLandscape: {
      fontSize: 12,
      fontWeight: '700',
    },

    undoButton: {
      height: '90%',
      maxHeight: 46,
      aspectRatio: 1,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    undoButtonLandscape: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },

    undoDisabled: {
      opacity: 0.4,
    },

    undoText: {
      fontSize: 25,
    },

    undoTextLandscape: {
      fontSize: 26,
      lineHeight: 28,
    },

    memoArea: {
      flex: 1,
      minHeight: 0,
      borderRadius: 17,
      paddingHorizontal: 13,
      paddingTop: 6,
      paddingBottom: 5,
      borderWidth: 1,
    },

    memoAreaLandscape: {
      borderRadius: 13,
      paddingHorizontal: 8,
      paddingTop: 4,
      paddingBottom: 3,
    },

    memoHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    memoPreviewScroll: {
      flex: 1,
      minHeight: 0,
      marginTop: 1,
    },

    memoPreviewContent: {
      paddingBottom: 2,
    },

    memoText: {
      fontSize: 15,
      lineHeight: 20,
      paddingRight: 3,
    },

    memoTextLandscape: {
      fontSize: 15,
      lineHeight: 18,
      paddingRight: 3,
    },

    historyArea: {
      flex: 1,
      minHeight: 0,
      borderRadius: 17,
      paddingHorizontal: 13,
      paddingTop: 6,
      paddingBottom: 4,
      borderWidth: 1,
    },

    historyAreaLandscape: {
      borderRadius: 13,
      paddingHorizontal: 8,
      paddingTop: 4,
      paddingBottom: 3,
    },

    historyHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    recentHistoryScroll: {
      flex: 1,
      minHeight: 0,
      marginTop: 1,
    },

    recentHistoryContent: {
      gap: 2,
      paddingBottom: 2,
    },

    emptyHistoryText: {
      marginTop: 3,
      fontSize: 11,
    },

    historyRow: {
      minHeight: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      gap: 3,
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
      fontSize: 15,
      lineHeight: 18,
    },

    pausedBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 9,
    },

    newLabel: {
      fontSize: 9,
      fontWeight: '800',
      marginLeft: 3,
    },

    counterSection: {
      flex: 1,
      minHeight: 0,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    counterSectionLandscape: {
      flex: 1,
      minHeight: 0,
      marginBottom: 0,
    },

    counterTopRow: {
      width: '82%',
      maxWidth: 340,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 10,
      marginBottom: 4,
    },

    counterTopRowLandscape: {
      width: '86%',
      maxWidth: 350,
      gap: 12,
      marginBottom: 5,
    },

    counterValueRow: {
      flexDirection: 'row',
      alignItems:
        'flex-end',
    },

    counterNumber: {
      fontWeight: '700',
    },

    counterNumberLandscape: {
      fontSize: 64,
      lineHeight: 68,
    },

    counterUnit: {
      marginLeft: 5,
      marginBottom: 6,
    },

    counterUnitLandscape: {
      fontSize: 17,
      marginBottom: 7,
    },

    plusButton: {
      flex: 1,
      minHeight: 56,
      maxHeight: 170,
      width: '82%',
      maxWidth: 340,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    plusButtonLandscape: {
      flex: 1,
      minHeight: 95,
      maxHeight: 185,
      width: '86%',
      maxWidth: 350,
      borderRadius: 32,
    },

    plusText: {
      fontWeight: '400',
    },

    plusTextLandscape: {
      fontSize: 88,
      lineHeight: 94,
    },

    nextButton: {
      minWidth: 58,
      borderRadius: 14,
      paddingHorizontal: 10,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    nextButtonLandscape: {
      minWidth: 62,
      height: 38,
      borderRadius: 14,
    },

    nextButtonText: {
      fontSize: 19,
      fontWeight: '600',
    },

    nextButtonTextLandscape: {
      fontSize: 20,
    },

    /*
     * 横画面
     */
    landscapeContent: {
      flex: 1,
      minHeight: 0,
      flexDirection: 'row',
      paddingHorizontal: 8,
      paddingBottom: 5,
      gap: 8,
    },

    landscapeLeft: {
      minWidth: 120,
      maxWidth: 260,
      gap: 5,
    },

    landscapeActionBox: {
      height: 46,
    },

    /*
     * 横メモも約1行分
     */
    landscapeMemoBox: {
      height: 50,
      minHeight: 50,
    },

    /*
     * 横履歴は約2行分
     */
    landscapeHistoryBox: {
      height: 78,
      minHeight: 78,
    },

    landscapeMain: {
      flex: 1,
      minWidth: 0,
    },

    landscapeCounters: {
      flex: 1,
      minHeight: 0,
      flexDirection: 'row',
      alignItems: 'stretch',
    },

    landscapeCounterColumn: {
      flex: 1,
      minWidth: 0,
    },

    landscapeDivider: {
      width: 1,
      marginVertical: 8,
    },

    keyboardAvoidingView: {
      flex: 1,
    },

    modalOverlay: {
      flex: 1,
      justifyContent:
        'center',
      paddingHorizontal: 20,
      backgroundColor:
        'rgba(0,0,0,0.35)',
    },

    modalHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },

    modalCloseButton: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    modalCloseText: {
      fontSize: 29,
    },

    memoModal: {
      width: '100%',
      maxWidth: 560,
      maxHeight: '78%',
      alignSelf: 'center',
      borderRadius: 24,
      padding: 20,
    },

    memoModalLandscape: {
      width: '65%',
      maxHeight: '90%',
    },

    memoModalTitle: {
      fontSize: 21,
      fontWeight: '700',
    },

    memoViewer: {
      height: 240,
      maxHeight: '65%',
      borderWidth: 1,
      borderRadius: 17,
      padding: 14,
    },

    memoViewerText: {
      fontSize: 15,
      lineHeight: 23,
    },

    memoEditButton: {
      alignSelf: 'flex-end',
      minWidth: 100,
      height: 44,
      marginTop: 14,
      paddingHorizontal: 18,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    memoEditButtonText: {
      fontWeight: '700',
    },

    memoEditScroll: {
      flexGrow: 0,
    },

    memoEditContent: {
      paddingBottom: 8,
    },

    memoInput: {
      minHeight: 100,
      maxHeight: 200,
      borderWidth: 1,
      borderRadius: 17,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
    },

    memoModalButtons: {
      flexDirection: 'row',
      justifyContent:
        'flex-end',
      gap: 10,
      marginTop: 14,
    },

    memoCancelButton: {
      minWidth: 95,
      height: 44,
      paddingHorizontal: 15,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    memoSaveButton: {
      minWidth: 95,
      height: 44,
      paddingHorizontal: 15,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    memoSaveText: {
      fontWeight: '700',
    },

    historyModal: {
      height: '75%',
      width: '100%',
      maxWidth: 600,
      alignSelf: 'center',
      borderRadius: 24,
      padding: 20,
    },

    historyModalLandscape: {
      height: '88%',
      width: '65%',
    },

    fullHistoryScroll: {
      flex: 1,
      minHeight: 0,
    },

    modalTitle: {
      fontSize: 24,
      fontWeight: '700',
    },

    fullHistoryRow: {
      minHeight: 52,
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      paddingVertical: 8,
    },

    fullHistoryLeft: {
      flex: 1,
    },

    fullHistoryRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginLeft: 10,
    },

    fullHistoryCount: {
      fontSize: 17,
      fontWeight: '600',
    },

    newLabelFull: {
      fontSize: 10,
      fontWeight: '800',
    },
  });