import { router } from 'expo-router';
import { useState } from 'react';
import {
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

type Project = {
  id: number;
  name: string;
  memo: string;
  row: number;
  stitch: number;
};

export default function ProjectListScreen() {
  const [projects, setProjects] = useState<Project[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [memo, setMemo] = useState('');

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

  const createProject = () => {
    const trimmedName = projectName.trim();

    if (!trimmedName) {
      return;
    }

    const newProject: Project = {
      id: Date.now(),
      name: trimmedName,
      memo: memo.trim(),
      row: 0,
      stitch: 0,
    };

    setProjects((currentProjects) => [
      ...currentProjects,
      newProject,
    ]);

    closeCreateModal();
  };

  const openProject = (project: Project) => {
    router.push({
      pathname: '/counter/[id]',
      params: {
        id: String(project.id),
        name: project.name,
        memo: project.memo,
        row: String(project.row),
        stitch: String(project.stitch),
      },
    });
  };

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
              <Text style={styles.languageText}>日 / EN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.themeButton}
              activeOpacity={0.8}
            >
              <Text style={styles.themeText}>◐</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 作品一覧 */}
        <ScrollView
          style={styles.projectList}
          contentContainerStyle={styles.projectListContent}
          showsVerticalScrollIndicator={false}
        >
          {projects.map((project) => (
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
                activeOpacity={0.8}
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

        {/* 作品追加 */}
        {projects.length < 5 && (
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={openCreateModal}
          >
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        )}

        {/* 新しい作品モーダル */}
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
              accessible={false}
            >
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    <ScrollView
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
                      bounces={false}
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
                        placeholderTextColor="#B8B0AA"
                        returnKeyType="next"
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
                        placeholderTextColor="#D0C9C3"
                        multiline
                        textAlignVertical="top"
                      />

                      <View style={styles.modalButtons}>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          activeOpacity={0.8}
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
                          activeOpacity={0.8}
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
    color: '#111111',
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
    color: '#111111',
  },

  themeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2E7DC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  themeText: {
    fontSize: 24,
    color: '#111111',
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
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 14,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  projectInfo: {
    flex: 1,
    paddingRight: 12,
  },

  projectName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },

  projectCount: {
    fontSize: 15,
    color: '#77706B',
    marginTop: 6,
  },

  projectMemo: {
    fontSize: 14,
    color: '#9A918B',
    marginTop: 5,
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

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  addButtonText: {
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '300',
    color: '#111111',
  },

  modalKeyboardView: {
    flex: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  modalContent: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFDFC',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },

  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 28,
  },

  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 8,
  },

  input: {
    width: '100%',
    minHeight: 56,
    borderWidth: 1.5,
    borderColor: '#DED4CC',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 17,
    color: '#111111',
    backgroundColor: '#FFFFFF',
    marginBottom: 22,
  },

  memoInput: {
    minHeight: 100,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#4E4844',
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
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
});