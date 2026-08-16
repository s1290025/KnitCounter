import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import { useCallback, useMemo, useState } from 'react';

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
  Project,
  getProjectById,
  updateProject,
} from '../../storage/appStorage';

export default function CounterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [historyModalVisible, setHistoryModalVisible] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        if (!id) return;

        const savedProject = await getProjectById(id);

        if (active) {
          setProject(savedProject);
        }
      };

      load();

      return () => {
        active = false;
      };
    }, [id])
  );

  const persistProject = async (nextProject: Project) => {
    setProject(nextProject);
    await updateProject(nextProject);
  };

  const saveUndo = (current: Project) => ({
    row: current.row,
    stitch: current.stitch,
    history: [...current.history],
  });

  const addRow = async () => {
    if (!project) return;

    const previousState = saveUndo(project);

    let history = [...project.history];

    if (project.stitch > 0) {
      const item: HistoryItem = {
        id: `${Date.now()}-${Math.random()}`,
        row: project.row,
        stitch: project.stitch,
        type: 'row',
      };

      history = [item, ...history];
    }

    const nextProject: Project = {
      ...project,
      row: project.row + 1,
      stitch: 0,
      history,
      undoStack: [...project.undoStack, previousState],
    };

    await persistProject(nextProject);
  };

  const addStitch = async () => {
    if (!project) return;

    const previousState = saveUndo(project);

    await persistProject({
      ...project,
      stitch: project.stitch + 1,
      undoStack: [...project.undoStack, previousState],
    });
  };

  const startNewRow = async () => {
    if (!project) return;

    const previousState = saveUndo(project);

    let history = [...project.history];

    if (project.stitch > 0) {
      history = [
        {
          id: `${Date.now()}-${Math.random()}`,
          row: project.row,
          stitch: project.stitch,
          type: 'row',
        },
        ...history,
      ];
    }

    await persistProject({
      ...project,
      row: 0,
      stitch: 0,
      history,
      undoStack: [...project.undoStack, previousState],
    });
  };

  const startNewStitch = async () => {
    if (!project) return;

    const previousState = saveUndo(project);

    let history = [...project.history];

    if (project.stitch > 0) {
      history = [
        {
          id: `${Date.now()}-${Math.random()}`,
          row: project.row,
          stitch: project.stitch,
          type: 'stitch',
        },
        ...history,
      ];
    }

    await persistProject({
      ...project,
      stitch: 0,
      history,
      undoStack: [...project.undoStack, previousState],
    });
  };

  const addMark = async () => {
    if (!project) return;

    const previousState = saveUndo(project);

    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random()}`,
      row: project.row,
      stitch: project.stitch,
      type: 'mark',
    };

    await persistProject({
      ...project,
      history: [item, ...project.history],
      undoStack: [...project.undoStack, previousState],
    });
  };

  const undo = async () => {
    if (!project) return;
    if (project.undoStack.length === 0) return;

    const previous =
      project.undoStack[project.undoStack.length - 1];

    await persistProject({
      ...project,
      row: previous.row,
      stitch: previous.stitch,
      history: previous.history,
      undoStack: project.undoStack.slice(0, -1),
    });
  };

  const recentHistory = useMemo(() => {
    return project?.history.slice(0, 3) ?? [];
  }, [project]);

  const getHistoryTypeLabel = (type: HistoryType) => {
    if (type === 'mark') return '途中';
    if (type === 'row') return '新しい段';
    return '新しい目';
  };

  if (!project) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />

          <TouchableOpacity
            style={styles.returnButton}
            onPress={() => router.back()}
          >
            <Text>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <Text
            style={styles.projectName}
            numberOfLines={1}
          >
            {project.name}
          </Text>

          <TouchableOpacity style={styles.languageButton}>
            <Text>日 / EN</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.historyArea}
            onPress={() => setHistoryModalVisible(true)}
          >
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>
                最近の履歴
              </Text>
              <Text style={styles.historyArrow}>›</Text>
            </View>

            <View style={styles.recentHistoryList}>
              {recentHistory.map((item) => (
                <View
                  key={item.id}
                  style={styles.historyRow}
                >
                  <Text>
                    {item.row}段　{item.stitch}目
                  </Text>

                  {item.type === 'mark' && (
                    <View style={styles.pausedBadge}>
                      <Text style={styles.pausedBadgeText}>
                        途中
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </TouchableOpacity>

          <View style={styles.counterSection}>
            <View style={styles.counterValueRow}>
              <Text style={styles.counterNumber}>
                {project.row}
              </Text>
              <Text style={styles.counterUnit}>段</Text>
            </View>

            <TouchableOpacity
              style={styles.plusButton}
              onPress={addRow}
            >
              <Text style={styles.plusText}>＋</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newCountButton}
              onPress={startNewRow}
            >
              <Text style={styles.newCountText}>
                新しい段
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.counterSection}>
            <View style={styles.counterValueRow}>
              <Text style={styles.counterNumber}>
                {project.stitch}
              </Text>
              <Text style={styles.counterUnit}>目</Text>
            </View>

            <TouchableOpacity
              style={styles.plusButton}
              onPress={addStitch}
            >
              <Text style={styles.plusText}>＋</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newCountButton}
              onPress={startNewStitch}
            >
              <Text style={styles.newCountText}>
                新しい目
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.markButton}
              onPress={addMark}
            >
              <Text style={styles.markText}>区切り</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.undoButton,
                project.undoStack.length === 0 &&
                  styles.undoDisabled,
              ]}
              onPress={undo}
              disabled={project.undoStack.length === 0}
            >
              <Text style={styles.undoText}>↶</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.memoArea}>
            <Text style={styles.sectionTitle}>メモ</Text>
            <Text style={styles.memoText}>
              {project.memo || 'メモなし'}
            </Text>
          </View>
        </ScrollView>

        <Modal
          visible={historyModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setHistoryModalVisible(false)
          }
        >
          <View style={styles.modalOverlay}>
            <View style={styles.historyModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>履歴</Text>

                <TouchableOpacity
                  onPress={() =>
                    setHistoryModalVisible(false)
                  }
                >
                  <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView>
                {project.history.map((item) => (
                  <View
                    key={item.id}
                    style={styles.fullHistoryRow}
                  >
                    <View>
                      <Text style={styles.fullHistoryCount}>
                        {item.row}段　{item.stitch}目
                      </Text>

                      <Text style={styles.fullHistoryType}>
                        {getHistoryTypeLabel(item.type)}
                      </Text>
                    </View>

                    {item.type === 'mark' && (
                      <View style={styles.pausedBadge}>
                        <Text style={styles.pausedBadgeText}>
                          途中
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
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
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  returnButton: {
    marginTop: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
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

  languageButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#F2E7DC',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  historyArea: {
    minHeight: 145,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 18,
    marginBottom: 26,
  },

  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    justifyContent: 'space-between',
  },

  pausedBadge: {
    backgroundColor: '#F0DDD5',
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
    alignItems: 'flex-end',
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
    backgroundColor: '#D9A3A3',
    alignItems: 'center',
    justifyContent: 'center',
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
    justifyContent: 'center',
    gap: 18,
    marginBottom: 30,
  },

  markButton: {
    minWidth: 112,
    padding: 14,
    borderRadius: 22,
    backgroundColor: '#F2E7DC',
    alignItems: 'center',
  },

  markText: {
    fontWeight: '600',
  },

  undoButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F2E7DC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  undoDisabled: {
    opacity: 0.4,
  },

  undoText: {
    fontSize: 28,
  },

  memoArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 30,
  },

  memoText: {
    marginTop: 12,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },

  historyModal: {
    maxHeight: '75%',
    backgroundColor: '#FFFDFC',
    borderRadius: 28,
    padding: 22,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE6E0',
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