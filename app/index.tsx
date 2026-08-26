import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';

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
  useWindowDimensions,
  View,
} from 'react-native';

import {
  AppData,
  loadAppData,
  Project,
  saveAppData,
} from '../storage/appStorage';

import {
  themes,
} from '../theme/themes';

export default function ProjectListScreen() {
  const { width, height } =
    useWindowDimensions();

  const isLandscape =
    width > height;

  const shortSide =
    Math.min(width, height);

  const longSide =
    Math.max(width, height);

  const isSmallScreen =
    shortSide < 380 ||
    longSide < 700;

  const isTablet =
    shortSide >= 600;

  const useGrid =
    isTablet ||
    (isLandscape &&
      width >= 650);

  const horizontalPadding =
    isSmallScreen
      ? 14
      : isTablet
        ? 28
        : 20;

  const projectCardWidth =
    useGrid
      ? '48.5%'
      : '100%';

  const [
    appData,
    setAppData,
  ] =
    useState<AppData | null>(
      null
    );

  const [
    createModalVisible,
    setCreateModalVisible,
  ] = useState(false);

  const [
    editModalVisible,
    setEditModalVisible,
  ] = useState(false);

  const [
    projectName,
    setProjectName,
  ] = useState('');

  const [
    memo,
    setMemo,
  ] = useState('');

  const [
    editingProject,
    setEditingProject,
  ] =
    useState<Project | null>(
      null
    );

  const [
    editName,
    setEditName,
  ] = useState('');

  const [
    editMemo,
    setEditMemo,
  ] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load =
        async () => {
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

  const openCreateModal =
    () => {
      setProjectName('');
      setMemo('');

      setCreateModalVisible(
        true
      );
    };

  const closeCreateModal =
    () => {
      Keyboard.dismiss();

      setCreateModalVisible(
        false
      );

      setProjectName('');
      setMemo('');
    };

  const createProject =
    async () => {
      const name =
        projectName.trim();

      if (!name) {
        return;
      }

      if (
        appData.projects
          .length >= 5
      ) {
        return;
      }

      const project:
        Project = {
        id: `${Date.now()}-${Math.random()}`,
        name,
        memo: memo.trim(),
        row: 0,
        stitch: 0,
        history: [],
        undoStack: [],
      };

      const nextData:
        AppData = {
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

  const openSettings =
    () => {
      router.push(
        '/settings'
      );
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

    setEditModalVisible(
      true
    );
  };

  const closeEditModal =
    () => {
      Keyboard.dismiss();

      setEditModalVisible(
        false
      );

      setEditingProject(
        null
      );

      setEditName('');
      setEditMemo('');
    };

  const saveEditedProject =
    async () => {
      if (
        !editingProject
      ) {
        return;
      }

      const name =
        editName.trim();

      if (!name) {
        return;
      }

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

      const nextData:
        AppData = {
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
    };

  const deleteProject =
    () => {
      if (
        !editingProject
      ) {
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

            style:
              'cancel',
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
                    (
                      project
                    ) =>
                      project.id !==
                      editingProject.id
                  );

                const nextData:
                  AppData = {
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

  const renderProjectForm =
    (
      mode:
        | 'create'
        | 'edit'
    ) => {
      const isCreate =
        mode === 'create';

      const name =
        isCreate
          ? projectName
          : editName;

      const note =
        isCreate
          ? memo
          : editMemo;

      const setName =
        isCreate
          ? setProjectName
          : setEditName;

      const setNote =
        isCreate
          ? setMemo
          : setEditMemo;

      const close =
        isCreate
          ? closeCreateModal
          : closeEditModal;

      const save =
        isCreate
          ? createProject
          : saveEditedProject;

      return (
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
            accessible={
              false
            }
          >
            <View
              style={[
                styles.modalOverlay,

                isLandscape &&
                  styles.modalOverlayLandscape,
              ]}
            >
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.modalContent,

                    isLandscape
                      ? styles.modalContentLandscape
                      : styles.modalContentPortrait,

                    isTablet &&
                      styles.modalContentTablet,

                    {
                      backgroundColor:
                        currentTheme.surface,
                    },
                  ]}
                >
                  <ScrollView
                    style={
                      styles.modalScroll
                    }
                    contentContainerStyle={
                      styles.modalScrollContent
                    }
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={
                      false
                    }
                  >
                    <Text
                      style={[
                        styles.modalTitle,

                        isSmallScreen &&
                          styles.modalTitleSmall,

                        {
                          color:
                            currentTheme.text,
                        },
                      ]}
                    >
                      {isCreate
                        ? isJapanese
                          ? '新しい作品'
                          : 'New Project'
                        : isJapanese
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

                        isSmallScreen &&
                          styles.inputSmall,

                        {
                          color:
                            currentTheme.text,

                          backgroundColor:
                            currentTheme.surface,

                          borderColor:
                            currentTheme.border,
                        },
                      ]}
                      value={name}
                      onChangeText={
                        setName
                      }
                      placeholder={
                        isJapanese
                          ? '作品名'
                          : 'Project Name'
                      }
                      placeholderTextColor={
                        currentTheme.subText
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

                        isLandscape &&
                          styles.memoInputLandscape,

                        isSmallScreen &&
                          styles.inputSmall,

                        {
                          color:
                            currentTheme.text,

                          backgroundColor:
                            currentTheme.surface,

                          borderColor:
                            currentTheme.border,
                        },
                      ]}
                      value={note}
                      onChangeText={
                        setNote
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
                      textAlignVertical="top"
                    />

                    <View
                      style={
                        styles.modalButtons
                      }
                    >
                      <TouchableOpacity
                        style={[
                          styles.cancelButton,

                          isSmallScreen &&
                            styles.modalActionButtonSmall,

                          {
                            backgroundColor:
                              currentTheme.soft,
                          },
                        ]}
                        onPress={
                          close
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

                          isSmallScreen &&
                            styles.modalActionButtonSmall,

                          {
                            backgroundColor:
                              currentTheme.accent,
                          },

                          name.trim() ===
                            '' &&
                            styles.disabledButton,
                        ]}
                        onPress={
                          save
                        }
                        disabled={
                          name.trim() ===
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
                          {isCreate
                            ? isJapanese
                              ? '作成'
                              : 'Create'
                            : isJapanese
                              ? '保存'
                              : 'Save'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {!isCreate && (
                      <TouchableOpacity
                        style={[
                          styles.deleteButton,

                          isSmallScreen &&
                            styles.deleteButtonSmall,

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
                    )}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
            paddingHorizontal:
              horizontalPadding,

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
          <Text
            style={[
              styles.title,

              isSmallScreen &&
                styles.titleSmall,

              isTablet &&
                styles.titleTablet,

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

          <TouchableOpacity
            style={[
              styles.settingsButton,

              isSmallScreen &&
                styles.settingsButtonSmall,

              {
                backgroundColor:
                  currentTheme.soft,
              },
            ]}
            onPress={
              openSettings
            }
          >
            <Ionicons
              name="settings-outline"
              size={
                isSmallScreen
                  ? 22
                  : 25
              }
              color={
                currentTheme.text
              }
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={
            styles.projectList
          }
          contentContainerStyle={[
            styles.projectListContent,

            useGrid &&
              styles.projectListGrid,

            {
              paddingBottom:
                isSmallScreen
                  ? 85
                  : 105,
            },
          ]}
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

                  isSmallScreen &&
                    styles.projectCardSmall,

                  isLandscape &&
                    styles.projectCardLandscape,

                  isTablet &&
                    styles.projectCardTablet,

                  {
                    width:
                      projectCardWidth,

                    backgroundColor:
                      currentTheme.surface,

                    borderColor:
                      currentTheme.border,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.projectInfoButton,

                    isSmallScreen &&
                      styles.projectInfoButtonSmall,
                  ]}
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

                        isSmallScreen &&
                          styles.projectNameSmall,

                        isTablet &&
                          styles.projectNameTablet,

                        {
                          color:
                            currentTheme.text,
                        },
                      ]}
                      numberOfLines={
                        1
                      }
                    >
                      {project.name}
                    </Text>

                    <Text
                      style={[
                        styles.projectCount,

                        isSmallScreen &&
                          styles.projectCountSmall,

                        {
                          color:
                            currentTheme.subText,
                        },
                      ]}
                      numberOfLines={
                        1
                      }
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

                          isSmallScreen &&
                            styles.projectMemoSmall,

                          {
                            color:
                              currentTheme.subText,
                          },
                        ]}
                        numberOfLines={
                          1
                        }
                      >
                        {project.memo}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.editButton,

                    isSmallScreen &&
                      styles.editButtonSmall,
                  ]}
                  onPress={() =>
                    openEditModal(
                      project
                    )
                  }
                >
                  <FontAwesome
                    name="pencil-square-o"
                    size={
                      isSmallScreen
                        ? 21
                        : isTablet
                          ? 27
                          : 24
                    }
                    color={
                      currentTheme.text
                    }
                  />
                </TouchableOpacity>
              </View>
            )
          )}
        </ScrollView>

        {appData.projects.length <
          5 && (
          <TouchableOpacity
            style={[
              styles.addButton,

              isSmallScreen &&
                styles.addButtonSmall,

              isLandscape &&
                styles.addButtonLandscape,

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

                isSmallScreen &&
                  styles.addButtonTextSmall,

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

        <Modal
          visible={
            createModalVisible
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
            closeCreateModal
          }
        >
          {renderProjectForm(
            'create'
          )}
        </Modal>

        <Modal
          visible={
            editModalVisible
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
            closeEditModal
          }
        >
          {renderProjectForm(
            'edit'
          )}
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
      justifyContent:
        'space-between',
      alignItems: 'center',
      paddingTop: 20,
      paddingBottom: 16,
    },

    headerSmall: {
      paddingTop: 12,
      paddingBottom: 10,
    },

    headerLandscape: {
      paddingTop: 8,
      paddingBottom: 8,
    },

    title: {
      fontSize: 28,
      fontWeight: '700',
    },

    titleSmall: {
      fontSize: 23,
    },

    titleTablet: {
      fontSize: 32,
    },

    settingsButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    settingsButtonSmall: {
      width: 42,
      height: 42,
      borderRadius: 21,
    },

    projectList: {
      flex: 1,
    },

    projectListContent: {
      paddingTop: 6,
    },

    projectListGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent:
        'space-between',
      alignItems:
        'flex-start',
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

    projectCardSmall: {
      minHeight: 86,
      borderRadius: 18,
      marginBottom: 10,
    },

    projectCardLandscape: {
      minHeight: 88,
    },

    projectCardTablet: {
      minHeight: 112,
      borderRadius: 24,
    },

    projectInfoButton: {
      flex: 1,
      justifyContent:
        'center',
      paddingLeft: 20,
      paddingVertical: 16,
      minWidth: 0,
    },

    projectInfoButtonSmall: {
      paddingLeft: 15,
      paddingVertical: 11,
    },

    projectInfo: {
      flex: 1,
      minWidth: 0,
      justifyContent:
        'center',
    },

    projectName: {
      fontSize: 20,
      fontWeight: '700',
    },

    projectNameSmall: {
      fontSize: 17,
    },

    projectNameTablet: {
      fontSize: 22,
    },

    projectCount: {
      marginTop: 6,
      fontSize: 15,
    },

    projectCountSmall: {
      marginTop: 4,
      fontSize: 13,
    },

    projectMemo: {
      marginTop: 5,
      fontSize: 14,
    },

    projectMemoSmall: {
      marginTop: 3,
      fontSize: 12,
    },

    editButton: {
      width: 68,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    editButtonSmall: {
      width: 54,
    },

    addButton: {
      position: 'absolute',
      right: 24,
      bottom: 28,
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    addButtonSmall: {
      right: 16,
      bottom: 18,
      width: 56,
      height: 56,
      borderRadius: 28,
    },

    addButtonLandscape: {
      bottom: 14,
    },

    addButtonText: {
      fontSize: 42,
      lineHeight: 46,
    },

    addButtonTextSmall: {
      fontSize: 36,
      lineHeight: 40,
    },

    modalKeyboardView: {
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

    modalOverlayLandscape: {
      paddingVertical: 8,
    },

    modalContent: {
      borderRadius: 28,
      padding: 24,
      alignSelf: 'center',
    },

    modalContentPortrait: {
      width: '100%',
      maxWidth: 560,
      maxHeight: '82%',
    },

    modalContentLandscape: {
      width: '68%',
      maxWidth: 620,
      maxHeight: '86%',
    },

    modalContentTablet: {
      maxWidth: 620,
    },

    modalScroll: {
      flexGrow: 0,
    },

    modalScrollContent: {
      paddingBottom: 8,
    },

    modalTitle: {
      fontSize: 26,
      fontWeight: '700',
      marginBottom: 26,
    },

    modalTitleSmall: {
      fontSize: 22,
      marginBottom: 18,
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
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 22,
      fontSize: 17,
    },

    inputSmall: {
      minHeight: 48,
      marginBottom: 14,
      fontSize: 15,
    },

    memoInput: {
      minHeight: 72,
      maxHeight: 150,
    },

    memoInputLandscape: {
      minHeight: 62,
      maxHeight: 100,
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

    modalActionButtonSmall: {
      minHeight: 48,
      borderRadius: 16,
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

    deleteButtonSmall: {
      marginTop: 18,
      minHeight: 46,
    },
  });