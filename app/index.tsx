import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
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

  const [modalVisible, setModalVisible] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [memo, setMemo] = useState('');

  // この画面に戻るたびに最新データを読む
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
    setModalVisible(true);
  };

  const closeCreateModal = () => {
    Keyboard.dismiss();
    setModalVisible(false);
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
        <View style={styles.header}>
          <Text style={styles.title}>作品一覧</Text>

          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.languageButton}>
              <Text style={styles.languageText}>日 / EN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.themeButton}>
              <Text style={styles.themeText}>◐</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.projectList}
          contentContainerStyle={styles.projectListContent}
          showsVerticalScrollIndicator={false}
        >
          {appData.projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={styles.projectCard}
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

              <TouchableOpacity
                style={styles.editButton}
                onPress={(event) => {
                  event.stopPropagation();
                }}
              >
                <Text style={styles.editButtonText}>✎</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          <View style={styles.bottomSpace} />
        </ScrollView>

        {appData.projects.length < 5 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={openCreateModal}
          >
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        )}

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeCreateModal}
        >
          <KeyboardAvoidingView
            style={styles.modalKeyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
            >
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    <ScrollView keyboardShouldPersistTaps="handled">
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
                        style={[styles.input, styles.memoInput]}
                        value={memo}
                        onChangeText={setMemo}
                        placeholder="任意"
                        multiline
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
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
  },

  projectInfo: {
    flex: 1,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5ECE5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  editButtonText: {
    fontSize: 22,
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
});