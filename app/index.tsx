import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
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
  loadAppData,
  Project,
  saveAppData,
} from '../storage/appStorage';

export default function ProjectListScreen() {
  const [appData, setAppData] = useState<AppData | null>(null);

  // 新規作成モーダル
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [memo, setMemo] = useState('');

  // 編集モーダル
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProject, setEditingProject] =
    useState<Project | null>(null);
  const [editName, setEditName] = useState('');
  const [editMemo, setEditMemo] = useState('');

  // 画面を開くたびに最新データを読み込む
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        const data = await loadAppData();

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

  const createProject = async () => {
    if (!appData) return;

    const name = projectName.trim();

    if (!name) return;
    if (appData.projects.length >= 5) return;

    const project: Project = {
      id: `${Date.now()}-${Math.random()}`,
      name,
      memo: memo.trim(),
      row: 0,
      stitch: 0,
      history: [],
      undoStack: [],
    };

    const newData: AppData = {
      ...appData,
      projects: [...appData.projects, project],
    };

    await saveAppData(newData);
    setAppData(newData);

    closeCreateModal();
  };

  const openProject = (project: Project) => {
    router.push({
      pathname: '/counter/[id]',
      params: {
        id: project.id,
      },
    });
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setEditName(project.name);
    setEditMemo(project.memo);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    Keyboard.dismiss();

    setEditModalVisible(false);
    setEditingProject(null);
    setEditName('');
    setEditMemo('');
  };

  const saveEditedProject = async () => {
    if (!appData || !editingProject) return;

    const name = editName.trim();

    if (!name) return;

    const updatedProjects = appData.projects.map((project) =>
      project.id === editingProject.id
        ? {
            ...project,
            name,
            memo: editMemo.trim(),
          }
        : project
    );

    const newData: AppData = {
      ...appData,
      projects: updatedProjects,
    };

    await saveAppData(newData);
    setAppData(newData);

    closeEditModal();
  };

  const deleteProject = () => {
    if (!appData || !editingProject) return;

    Alert.alert(
      '作品を削除',
      `「${editingProject.name}」を削除しますか？\n履歴もすべて削除されます。`,
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',

          onPress: async () => {
            const updatedProjects = appData.projects.filter(
              (project) => project.id !== editingProject.id
            );

            const newData: AppData = {
              ...appData,
              projects: updatedProjects,
            };

            await saveAppData(newData);
            setAppData(newData);

            closeEditModal();
          },
        },
      ]
    );
  };

  if (!appData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>作品一覧</Text>

          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.languageButton}
              activeOpacity={0.8}
            >
              <Text style={styles.languageText}>
                日 / EN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.themeButton}
              activeOpacity={0.8}
            >
              <Text style={styles.themeText}>
                ◐
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 作品一覧 */}
        <ScrollView
          style={styles.projectList}
          contentContainerStyle={styles.projectListContent}
          showsVerticalScrollIndicator={false}
        >
          {appData.projects.map((project) => (
            <View
              key={project.id}
              style={styles.projectCard}
            >
              {/* 左側：カウンター画面を開く */}
              <TouchableOpacity
                style={styles.projectInfoButton}
                activeOpacity={0.8}
                onPress={() => openProject(project)}
              >
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>
                    {project.name}
                  </Text>

                  <Text style={styles.projectCount}>
                    {project.row}段 / {project.stitch}目
                  </Text>

                  {project.memo !== '' && (
                    <Text
                      style={styles.projectMemo}
                      numberOfLines={1}
                    >
                      {project.memo}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* 右側：編集 */}
              <TouchableOpacity
                style={styles.editButton}
                activeOpacity={0.8}
                onPress={() => openEditModal(project)}
              >
                <Text style={styles.editButtonText}>
                  ✎
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* 作品追加 */}
        {appData.projects.length < 5 && (
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={openCreateModal}
          >
            <Text style={styles.addButtonText}>
              ＋
            </Text>
          </TouchableOpacity>
        )}

        {/* 新規作成モーダル */}
        <Modal
          visible={createModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeCreateModal}
        >
          <KeyboardAvoidingView
            style={styles.modalKeyboardView}
            behavior={
              Platform.OS === 'ios'
                ? 'padding'
                : 'height'
            }
          >
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}
            >
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    <ScrollView
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
                    >
                      <Text style={styles.modalTitle}>
                        新しい作品
                      </Text>

                      <Text style={styles.label}>
                        作品名
                      </Text>

                      <TextInput
                        style={styles.input}
                        value={projectName}
                        onChangeText={setProjectName}
                        placeholder="作品名"
                        autoFocus
                      />

                      <Text style={styles.label}>
                        メモ
                      </Text>

                      <TextInput
                        style={[
                          styles.input,
                          styles.memoInput,
                        ]}
                        value={memo}
                        onChangeText={setMemo}
                        placeholder="任意"
                        multiline
                        textAlignVertical="top"
                      />

                      <View style={styles.modalButtons}>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={closeCreateModal}
                        >
                          <Text style={styles.cancelButtonText}>
                            キャンセル
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.createButton,
                            projectName.trim() === '' &&
                              styles.createButtonDisabled,
                          ]}
                          onPress={createProject}
                          disabled={projectName.trim() === ''}
                        >
                          <Text style={styles.createButtonText}>
                            作成
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

        {/* 編集モーダル */}
        <Modal
          visible={editModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeEditModal}
        >
          <KeyboardAvoidingView
            style={styles.modalKeyboardView}
            behavior={
              Platform.OS === 'ios'
                ? 'padding'
                : 'height'
            }
          >
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}
            >
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    <ScrollView
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
                    >
                      <Text style={styles.modalTitle}>
                        作品を編集
                      </Text>

                      <Text style={styles.label}>
                        作品名
                      </Text>

                      <TextInput
                        style={styles.input}
                        value={editName}
                        onChangeText={setEditName}
                        placeholder="作品名"
                        autoFocus
                      />

                      <Text style={styles.label}>
                        メモ
                      </Text>

                      <TextInput
                        style={[
                          styles.input,
                          styles.memoInput,
                        ]}
                        value={editMemo}
                        onChangeText={setEditMemo}
                        placeholder="任意"
                        multiline
                        textAlignVertical="top"
                      />

                      <View style={styles.modalButtons}>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={closeEditModal}
                        >
                          <Text style={styles.cancelButtonText}>
                            キャンセル
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.createButton,
                            editName.trim() === '' &&
                              styles.createButtonDisabled,
                          ]}
                          onPress={saveEditedProject}
                          disabled={editName.trim() === ''}
                        >
                          <Text style={styles.createButtonText}>
                            保存
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        activeOpacity={0.8}
                        onPress={deleteProject}
                      >
                        <Text style={styles.deleteButtonText}>
                          この作品を削除
                        </Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9F3',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFF9F3',
    paddingHorizontal: 24,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    gap: 12,
  },

  languageButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#F2E7DC',
  },

  languageText: {
    fontSize: 16,
  },

  themeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2E7DC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  themeText: {
    fontSize: 24,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginBottom: 14,
    overflow: 'hidden',

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  projectInfoButton: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 20,
    paddingVertical: 16,
  },

  projectInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  projectName: {
    fontSize: 20,
    fontWeight: '700',
  },

  projectCount: {
    marginTop: 6,
    fontSize: 15,
    color: '#77706B',
  },

  projectMemo: {
    marginTop: 5,
    fontSize: 14,
    color: '#9A918B',
  },

  editButton: {
    width: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editButtonText: {
    fontSize: 24,
    color: '#333333',
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
    backgroundColor: '#D9A3A3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonText: {
    fontSize: 42,
  },

  modalKeyboardView: {
    flex: 1,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  modalContent: {
    backgroundColor: '#FFFDFC',
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
    borderColor: '#DED4CC',
    borderRadius: 18,
    padding: 14,
    marginBottom: 22,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F1EBE6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontWeight: '600',
  },

  createButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: '#D9A3A3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  createButtonDisabled: {
    opacity: 0.4,
  },

  createButtonText: {
    fontWeight: '700',
  },

  deleteButton: {
    marginTop: 28,
    minHeight: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCE9E7',
  },

  deleteButtonText: {
    color: '#B64035',
    fontWeight: '700',
  },
});