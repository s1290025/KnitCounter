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
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {
  AppData,
  Language,
  loadAppData,
  Project,
  saveAppData,
} from '../storage/appStorage';

import {
  ThemeName,
  themeNames,
  themes,
} from '../theme/themes';

export default function ProjectListScreen() {
  const [appData, setAppData] =
    useState<AppData | null>(null);

  const [
    createModalVisible,
    setCreateModalVisible,
  ] = useState(false);

  const [
    editModalVisible,
    setEditModalVisible,
  ] = useState(false);

  const [
    themeModalVisible,
    setThemeModalVisible,
  ] = useState(false);

  const [projectName, setProjectName] =
    useState('');

  const [memo, setMemo] =
    useState('');

  const [
    editingProject,
    setEditingProject,
  ] = useState<Project | null>(null);

  const [editName, setEditName] =
    useState('');

  const [editMemo, setEditMemo] =
    useState('');

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
        style={styles.loadingSafeArea}
      >
        <View
          style={styles.loadingContainer}
        >
          <ActivityIndicator
            size="large"
          />
        </View>
      </SafeAreaView>
    );
  }

  const language: Language =
    appData.language;

  const isJapanese =
    language === 'ja';

  const currentTheme =
    themes[appData.theme];

  const changeLanguage =
    async (
      nextLanguage: Language
    ) => {
      const nextData: AppData = {
        ...appData,
        language: nextLanguage,
      };

      setAppData(nextData);
      await saveAppData(nextData);
    };

  const changeTheme =
    async (
      nextTheme: ThemeName
    ) => {
      const nextData: AppData = {
        ...appData,
        theme: nextTheme,
      };

      setAppData(nextData);
      await saveAppData(nextData);

      setThemeModalVisible(false);
    };

  const openCreateModal = () => {
    setProjectName('');
    setMemo('');
    setCreateModalVisible(true);
  };

  const closeCreateModal = () => {
    Keyboard.dismiss();

    setCreateModalVisible(false);

    setProjectName('');
    setMemo('');
  };

  const createProject =
    async () => {
      const name =
        projectName.trim();

      if (!name) return;

      if (
        appData.projects.length >= 5
      ) {
        return;
      }

      const project: Project = {
        id: `${Date.now()}-${Math.random()}`,

        name,
        memo: memo.trim(),

        row: 0,
        stitch: 0,

        history: [],
        undoStack: [],
      };

      const nextData: AppData = {
        ...appData,

        projects: [
          ...appData.projects,
          project,
        ],
      };

      await saveAppData(
        nextData
      );

      setAppData(nextData);

      closeCreateModal();
    };

  const openProject = (
    project: Project
  ) => {
    router.push({
      pathname:
        '/counter/[id]',

      params: {
        id: project.id,
      },
    });
  };

  const openEditModal = (
    project: Project
  ) => {
    setEditingProject(
      project
    );

    setEditName(
      project.name
    );

    setEditMemo(
      project.memo
    );

    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    Keyboard.dismiss();

    setEditModalVisible(false);

    setEditingProject(null);

    setEditName('');
    setEditMemo('');
  };

  const saveEditedProject =
    async () => {
      if (!editingProject) {
        return;
      }

      const name =
        editName.trim();

      if (!name) return;

      const projects =
        appData.projects.map(
          (project) =>
            project.id ===
            editingProject.id
              ? {
                  ...project,
                  name,
                  memo:
                    editMemo.trim(),
                }
              : project
        );

      const nextData: AppData = {
        ...appData,
        projects,
      };

      await saveAppData(
        nextData
      );

      setAppData(nextData);

      closeEditModal();
    };

  const deleteProject = () => {
    if (!editingProject) {
      return;
    }

    Alert.alert(
      isJapanese
        ? '作品を削除'
        : 'Delete Project',

      isJapanese
        ? `「${editingProject.name}」を削除しますか？\n履歴もすべて削除されます。`
        : `Delete "${editingProject.name}"?\nAll history will also be deleted.`,

      [
        {
          text:
            isJapanese
              ? 'キャンセル'
              : 'Cancel',

          style: 'cancel',
        },

        {
          text:
            isJapanese
              ? '削除'
              : 'Delete',

          style:
            'destructive',

          onPress:
            async () => {
              const projects =
                appData.projects.filter(
                  (project) =>
                    project.id !==
                    editingProject.id
                );

              const nextData: AppData = {
                ...appData,
                projects,
              };

              await saveAppData(
                nextData
              );

              setAppData(
                nextData
              );

              closeEditModal();
            },
        },
      ]
    );
  };

  const themeLabels:
    Record<
      ThemeName,
      string
    > = {
    pink: 'Pink',
    red: 'Red',
    blue: 'Blue',
    yellow: 'Yellow',
    black: 'Black',
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
              ? '作品一覧'
              : 'Projects'}
          </Text>

          <View
            style={
              styles.headerButtons
            }
          >
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

            <TouchableOpacity
              style={[
                styles.themeButton,

                {
                  backgroundColor:
                    currentTheme.soft,
                },
              ]}
              onPress={() =>
                setThemeModalVisible(
                  true
                )
              }
            >
              <View
                style={[
                  styles.themePreview,

                  {
                    backgroundColor:
                      currentTheme.accent,
                  },
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Projects */}
        <ScrollView
          style={styles.projectList}
          contentContainerStyle={
            styles.projectListContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          {appData.projects.map(
            (project) => (
              <View
                key={project.id}
                style={[
                  styles.projectCard,

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
                    styles.projectInfoButton
                  }
                  activeOpacity={
                    0.8
                  }
                  onPress={() =>
                    openProject(
                      project
                    )
                  }
                >
                  <View
                    style={
                      styles.projectInfo
                    }
                  >
                    <Text
                      style={[
                        styles.projectName,

                        {
                          color:
                            currentTheme.text,
                        },
                      ]}
                    >
                      {project.name}
                    </Text>

                    <Text
                      style={[
                        styles.projectCount,

                        {
                          color:
                            currentTheme.subText,
                        },
                      ]}
                    >
                      {isJapanese
                        ? `${project.row}段 / ${project.stitch}目`
                        : `${project.row} Rows / ${project.stitch} Stitches`}
                    </Text>

                    {project.memo !==
                      '' && (
                      <Text
                        style={[
                          styles.projectMemo,

                          {
                            color:
                              currentTheme.subText,
                          },
                        ]}
                        numberOfLines={
                          1
                        }
                      >
                        {
                          project.memo
                        }
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.editButton
                  }
                  onPress={() =>
                    openEditModal(
                      project
                    )
                  }
                >
                  <Text
                    style={[
                      styles.editButtonText,

                      {
                        color:
                          currentTheme.text,
                      },
                    ]}
                  >
                    ✎
                  </Text>
                </TouchableOpacity>
              </View>
            )
          )}

          <View
            style={
              styles.bottomSpace
            }
          />
        </ScrollView>

        {appData.projects.length <
          5 && (
          <TouchableOpacity
            style={[
              styles.addButton,

              {
                backgroundColor:
                  currentTheme.accent,
              },
            ]}
            onPress={
              openCreateModal
            }
          >
            <Text
              style={[
                styles.addButtonText,

                {
                  color:
                    currentTheme.text,
                },
              ]}
            >
              ＋
            </Text>
          </TouchableOpacity>
        )}

        {/* Create modal */}
        <Modal
          visible={
            createModalVisible
          }
          transparent
          animationType="fade"
          onRequestClose={
            closeCreateModal
          }
        >
          <KeyboardAvoidingView
            style={
              styles.modalKeyboardView
            }
            behavior={
              Platform.OS ===
              'ios'
                ? 'padding'
                : 'height'
            }
          >
            <TouchableWithoutFeedback
              onPress={
                Keyboard.dismiss
              }
            >
              <View
                style={
                  styles.modalOverlay
                }
              >
                <TouchableWithoutFeedback>
                  <View
                    style={[
                      styles.modalContent,

                      {
                        backgroundColor:
                          currentTheme.surface,
                      },
                    ]}
                  >
                    <ScrollView
                      keyboardShouldPersistTaps="handled"
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
                          ? '新しい作品'
                          : 'New Project'}
                      </Text>

                      <Text
                        style={[
                          styles.label,
                          {
                            color:
                              currentTheme.text,
                          },
                        ]}
                      >
                        {isJapanese
                          ? '作品名'
                          : 'Project Name'}
                      </Text>

                      <TextInput
                        style={[
                          styles.input,
                          {
                            color:
                              currentTheme.text,

                            backgroundColor:
                              currentTheme.surface,

                            borderColor:
                              currentTheme.border,
                          },
                        ]}
                        value={
                          projectName
                        }
                        onChangeText={
                          setProjectName
                        }
                        placeholder={
                          isJapanese
                            ? '作品名'
                            : 'Project Name'
                        }
                        placeholderTextColor={
                          currentTheme.subText
                        }
                        autoFocus
                      />

                      <Text
                        style={[
                          styles.label,
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

                      <TextInput
                        style={[
                          styles.input,
                          styles.memoInput,

                          {
                            color:
                              currentTheme.text,

                            backgroundColor:
                              currentTheme.surface,

                            borderColor:
                              currentTheme.border,
                          },
                        ]}
                        value={memo}
                        onChangeText={
                          setMemo
                        }
                        placeholder={
                          isJapanese
                            ? '任意'
                            : 'Optional'
                        }
                        placeholderTextColor={
                          currentTheme.subText
                        }
                        multiline
                      />

                      <View
                        style={
                          styles.modalButtons
                        }
                      >
                        <TouchableOpacity
                          style={[
                            styles.cancelButton,

                            {
                              backgroundColor:
                                currentTheme.soft,
                            },
                          ]}
                          onPress={
                            closeCreateModal
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
                              ? 'キャンセル'
                              : 'Cancel'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.createButton,

                            {
                              backgroundColor:
                                currentTheme.accent,
                            },

                            projectName.trim() ===
                              '' &&
                              styles.disabledButton,
                          ]}
                          onPress={
                            createProject
                          }
                          disabled={
                            projectName.trim() ===
                            ''
                          }
                        >
                          <Text
                            style={{
                              color:
                                currentTheme.text,

                              fontWeight:
                                '700',
                            }}
                          >
                            {isJapanese
                              ? '作成'
                              : 'Create'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </ScrollView>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>

        {/* Edit modal */}
        <Modal
          visible={
            editModalVisible
          }
          transparent
          animationType="fade"
          onRequestClose={
            closeEditModal
          }
        >
          <KeyboardAvoidingView
            style={
              styles.modalKeyboardView
            }
            behavior={
              Platform.OS ===
              'ios'
                ? 'padding'
                : 'height'
            }
          >
            <TouchableWithoutFeedback
              onPress={
                Keyboard.dismiss
              }
            >
              <View
                style={
                  styles.modalOverlay
                }
              >
                <TouchableWithoutFeedback>
                  <View
                    style={[
                      styles.modalContent,

                      {
                        backgroundColor:
                          currentTheme.surface,
                      },
                    ]}
                  >
                    <ScrollView
                      keyboardShouldPersistTaps="handled"
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
                          ? '作品を編集'
                          : 'Edit Project'}
                      </Text>

                      <Text
                        style={[
                          styles.label,

                          {
                            color:
                              currentTheme.text,
                          },
                        ]}
                      >
                        {isJapanese
                          ? '作品名'
                          : 'Project Name'}
                      </Text>

                      <TextInput
                        style={[
                          styles.input,

                          {
                            color:
                              currentTheme.text,

                            borderColor:
                              currentTheme.border,

                            backgroundColor:
                              currentTheme.surface,
                          },
                        ]}
                        value={
                          editName
                        }
                        onChangeText={
                          setEditName
                        }
                      />

                      <Text
                        style={[
                          styles.label,

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

                      <TextInput
                        style={[
                          styles.input,
                          styles.memoInput,

                          {
                            color:
                              currentTheme.text,

                            borderColor:
                              currentTheme.border,

                            backgroundColor:
                              currentTheme.surface,
                          },
                        ]}
                        value={
                          editMemo
                        }
                        onChangeText={
                          setEditMemo
                        }
                        placeholder={
                          isJapanese
                            ? '任意'
                            : 'Optional'
                        }
                        placeholderTextColor={
                          currentTheme.subText
                        }
                        multiline
                      />

                      <View
                        style={
                          styles.modalButtons
                        }
                      >
                        <TouchableOpacity
                          style={[
                            styles.cancelButton,

                            {
                              backgroundColor:
                                currentTheme.soft,
                            },
                          ]}
                          onPress={
                            closeEditModal
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
                              ? 'キャンセル'
                              : 'Cancel'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.createButton,

                            {
                              backgroundColor:
                                currentTheme.accent,
                            },

                            editName.trim() ===
                              '' &&
                              styles.disabledButton,
                          ]}
                          onPress={
                            saveEditedProject
                          }
                          disabled={
                            editName.trim() ===
                            ''
                          }
                        >
                          <Text
                            style={{
                              color:
                                currentTheme.text,

                              fontWeight:
                                '700',
                            }}
                          >
                            {isJapanese
                              ? '保存'
                              : 'Save'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.deleteButton,

                          {
                            backgroundColor:
                              currentTheme.dangerBackground,
                          },
                        ]}
                        onPress={
                          deleteProject
                        }
                      >
                        <Text
                          style={{
                            color:
                              currentTheme.dangerText,

                            fontWeight:
                              '700',
                          }}
                        >
                          {isJapanese
                            ? 'この作品を削除'
                            : 'Delete Project'}
                        </Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>

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
                        key={
                          themeName
                        }
                        style={[
                          styles.themeChoice,

                          {
                            borderColor:
                              selected
                                ? option.accent
                                : currentTheme.border,

                            backgroundColor:
                              currentTheme.surface,
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
                            style={{
                              color:
                                currentTheme.text,

                              fontSize:
                                20,

                              fontWeight:
                                '700',
                            }}
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
                  styles.themeCloseButton,

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
      justifyContent:
        'center',
      alignItems: 'center',
    },

    safeArea: {
      flex: 1,
    },

    container: {
      flex: 1,
      paddingHorizontal: 24,
    },

    header: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      paddingTop: 24,
      paddingBottom: 20,
    },

    title: {
      fontSize: 28,
      fontWeight: '700',
    },

    headerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
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

    themeButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    themePreview: {
      width: 22,
      height: 22,
      borderRadius: 11,
    },

    projectList: {
      flex: 1,
    },

    projectListContent: {
      paddingTop: 12,
    },

    projectCard: {
      minHeight: 100,
      flexDirection: 'row',
      alignItems: 'stretch',
      borderRadius: 22,
      marginBottom: 14,
      overflow: 'hidden',
      borderWidth: 1,
    },

    projectInfoButton: {
      flex: 1,
      justifyContent:
        'center',
      paddingLeft: 20,
      paddingVertical: 16,
    },

    projectInfo: {
      flex: 1,
      justifyContent:
        'center',
    },

    projectName: {
      fontSize: 20,
      fontWeight: '700',
    },

    projectCount: {
      marginTop: 6,
      fontSize: 15,
    },

    projectMemo: {
      marginTop: 5,
      fontSize: 14,
    },

    editButton: {
      width: 68,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    editButtonText: {
      fontSize: 24,
    },

    bottomSpace: {
      height: 110,
    },

    addButton: {
      position: 'absolute',
      right: 24,
      bottom: 32,
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    addButtonText: {
      fontSize: 42,
    },

    modalKeyboardView: {
      flex: 1,
    },

    modalOverlay: {
      flex: 1,
      justifyContent:
        'center',
      paddingHorizontal: 24,
      backgroundColor:
        'rgba(0,0,0,0.35)',
    },

    modalContent: {
      borderRadius: 28,
      padding: 24,
      maxHeight: '85%',
    },

    modalTitle: {
      fontSize: 26,
      fontWeight: '700',
      marginBottom: 28,
    },

    label: {
      fontSize: 17,
      fontWeight: '600',
      marginBottom: 8,
    },

    input: {
      minHeight: 56,
      borderWidth: 1.5,
      borderRadius: 18,
      padding: 14,
      marginBottom: 22,
      fontSize: 17,
    },

    memoInput: {
      minHeight: 100,
    },

    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },

    cancelButton: {
      flex: 1,
      minHeight: 54,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    createButton: {
      flex: 1,
      minHeight: 54,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    disabledButton: {
      opacity: 0.4,
    },

    deleteButton: {
      marginTop: 28,
      minHeight: 50,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent:
        'center',
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

    themeCloseButton: {
      minHeight: 52,
      marginTop: 20,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent:
        'center',
    },
  });