import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type HistoryType = 'row' | 'stitch' | 'mark';

type HistoryItem = {
  id: number;
  row: number;
  stitch: number;
  type: HistoryType;
};

type CounterState = {
  row: number;
  stitch: number;
  history: HistoryItem[];
};

export default function CounterScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name?: string;
    memo?: string;
    row?: string;
    stitch?: string;
  }>();

  const initialRow = Number(params.row ?? 0);
  const initialStitch = Number(params.stitch ?? 0);

  const [row, setRow] = useState(initialRow);
  const [stitch, setStitch] = useState(initialStitch);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [undoStack, setUndoStack] = useState<CounterState[]>([]);

  const [historyModalVisible, setHistoryModalVisible] =
    useState(false);

  const name = params.name ?? '';
  const memo = params.memo ?? '';

  const saveCurrentStateForUndo = () => {
    setUndoStack((currentStack) => [
      ...currentStack,
      {
        row,
        stitch,
        history: [...history],
      },
    ]);
  };

  const addHistoryItem = (type: HistoryType) => {
    const newHistoryItem: HistoryItem = {
      id: Date.now(),
      row,
      stitch,
      type,
    };

    setHistory((currentHistory) => [
      newHistoryItem,
      ...currentHistory,
    ]);
  };

  // 段の＋
  // 目が1以上なら現在状態を履歴へ追加
  // 段を1増やし、目を0にする
  const addRow = () => {
    saveCurrentStateForUndo();

    if (stitch > 0) {
      addHistoryItem('row');
    }

    setRow((current) => current + 1);
    setStitch(0);
  };

  // 目の＋
  // 目だけ1増やす
  const addStitch = () => {
    saveCurrentStateForUndo();

    setStitch((current) => current + 1);
  };

  // 新しい段
  // 目が1以上なら履歴へ追加
  // 段と目を0にする
  const startNewRow = () => {
    saveCurrentStateForUndo();

    if (stitch > 0) {
      addHistoryItem('row');
    }

    setRow(0);
    setStitch(0);
  };

  // 新しい目
  // 目が1以上なら履歴へ追加
  // 段はそのまま、目を0にする
  const startNewStitch = () => {
    saveCurrentStateForUndo();

    if (stitch > 0) {
      addHistoryItem('stitch');
    }

    setStitch(0);
  };

  // 区切り
  // 0目でも現在状態を履歴へ追加
  // カウンター値は変更しない
  const addMark = () => {
    saveCurrentStateForUndo();

    addHistoryItem('mark');
  };

  // Undo
  // 操作単位で直前の状態へ戻す
  const undo = () => {
    if (undoStack.length === 0) {
      return;
    }

    const previousState = undoStack[undoStack.length - 1];

    setRow(previousState.row);
    setStitch(previousState.stitch);
    setHistory(previousState.history);

    setUndoStack((currentStack) =>
      currentStack.slice(0, -1)
    );
  };

  const recentHistory = useMemo(() => {
    return history.slice(0, 3);
  }, [history]);

  const getHistoryTypeLabel = (type: HistoryType) => {
    if (type === 'mark') {
      return '途中';
    }

    if (type === 'row') {
      return '新しい段';
    }

    return '新しい目';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ヘッダー */}
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
            {name}
          </Text>

          <TouchableOpacity
            style={styles.languageButton}
          >
            <Text style={styles.languageText}>
              日 / EN
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* 最近の履歴 */}
          <TouchableOpacity
            style={styles.historyArea}
            activeOpacity={0.8}
            onPress={() =>
              setHistoryModalVisible(true)
            }
          >
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>
                最近の履歴
              </Text>

              <Text style={styles.historyArrow}>
                ›
              </Text>
            </View>

            {recentHistory.length === 0 ? (
              <View style={styles.emptyHistorySpace} />
            ) : (
              <View style={styles.recentHistoryList}>
                {recentHistory.map((item) => (
                  <View
                    key={item.id}
                    style={styles.historyRow}
                  >
                    <Text style={styles.historyCount}>
                      {item.row}段　{item.stitch}目
                    </Text>

                    {item.type === 'mark' && (
                      <View style={styles.pausedBadge}>
                        <Text
                          style={styles.pausedBadgeText}
                        >
                          途中
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>

          {/* 段 */}
          <View style={styles.counterSection}>
            <View style={styles.counterValueRow}>
              <Text style={styles.counterNumber}>
                {row}
              </Text>

              <Text style={styles.counterUnit}>
                段
              </Text>
            </View>

            <TouchableOpacity
              style={styles.plusButton}
              activeOpacity={0.7}
              onPress={addRow}
            >
              <Text style={styles.plusText}>
                ＋
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newCountButton}
              activeOpacity={0.8}
              onPress={startNewRow}
            >
              <Text style={styles.newCountText}>
                新しい段
              </Text>
            </TouchableOpacity>
          </View>

          {/* 目 */}
          <View style={styles.counterSection}>
            <View style={styles.counterValueRow}>
              <Text style={styles.counterNumber}>
                {stitch}
              </Text>

              <Text style={styles.counterUnit}>
                目
              </Text>
            </View>

            <TouchableOpacity
              style={styles.plusButton}
              activeOpacity={0.7}
              onPress={addStitch}
            >
              <Text style={styles.plusText}>
                ＋
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newCountButton}
              activeOpacity={0.8}
              onPress={startNewStitch}
            >
              <Text style={styles.newCountText}>
                新しい目
              </Text>
            </TouchableOpacity>
          </View>

          {/* 区切り / Undo */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.markButton}
              activeOpacity={0.8}
              onPress={addMark}
            >
              <Text style={styles.markText}>
                区切り
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.undoButton,
                undoStack.length === 0 &&
                  styles.undoButtonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={undo}
              disabled={undoStack.length === 0}
            >
              <Text
                style={[
                  styles.undoText,
                  undoStack.length === 0 &&
                    styles.undoTextDisabled,
                ]}
              >
                ↶
              </Text>
            </TouchableOpacity>
          </View>

          {/* メモ */}
          <View style={styles.memoArea}>
            <Text style={styles.sectionTitle}>
              メモ
            </Text>

            {memo ? (
              <Text style={styles.memoText}>
                {memo}
              </Text>
            ) : (
              <Text style={styles.memoPlaceholder}>
                メモなし
              </Text>
            )}
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* 履歴モーダル */}
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
                <Text style={styles.modalTitle}>
                  履歴
                </Text>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() =>
                    setHistoryModalVisible(false)
                  }
                >
                  <Text style={styles.closeButtonText}>
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              {history.length === 0 ? (
                <View style={styles.modalEmptyArea}>
                  <Text style={styles.modalEmptyText}>
                    履歴はまだありません
                  </Text>
                </View>
              ) : (
                <ScrollView
                  style={styles.fullHistoryList}
                  showsVerticalScrollIndicator={false}
                >
                  {history.map((item) => (
                    <View
                      key={item.id}
                      style={styles.fullHistoryRow}
                    >
                      <View>
                        <Text
                          style={styles.fullHistoryCount}
                        >
                          {item.row}段　{item.stitch}目
                        </Text>

                        <Text
                          style={styles.fullHistoryType}
                        >
                          {getHistoryTypeLabel(
                            item.type
                          )}
                        </Text>
                      </View>

                      {item.type === 'mark' && (
                        <View
                          style={styles.pausedBadge}
                        >
                          <Text
                            style={
                              styles.pausedBadgeText
                            }
                          >
                            途中
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              )}
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },

  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },

  backText: {
    fontSize: 40,
    lineHeight: 42,
    fontWeight: '300',
  },

  projectName: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    marginHorizontal: 8,
  },

  languageButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#F2E7DC',
  },

  languageText: {
    fontSize: 15,
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
    marginTop: 12,
    marginBottom: 26,
  },

  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  historyArrow: {
    fontSize: 28,
    color: '#9A918B',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  emptyHistorySpace: {
    height: 70,
  },

  recentHistoryList: {
    marginTop: 14,
    gap: 8,
  },

  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  historyCount: {
    fontSize: 15,
    color: '#5F5852',
  },

  pausedBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F0DDD5',
  },

  pausedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#765A50',
  },

  counterSection: {
    alignItems: 'center',
    marginBottom: 32,
  },

  counterValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 14,
  },

  counterNumber: {
    fontSize: 62,
    fontWeight: '700',
    lineHeight: 68,
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
    lineHeight: 62,
    fontWeight: '300',
  },

  newCountButton: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 18,
  },

  newCountText: {
    fontSize: 15,
    color: '#766E68',
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
    marginBottom: 30,
  },

  markButton: {
    minWidth: 112,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 22,
    backgroundColor: '#F2E7DC',
    alignItems: 'center',
  },

  markText: {
    fontSize: 16,
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

  undoButtonDisabled: {
    opacity: 0.4,
  },

  undoText: {
    fontSize: 28,
    color: '#333333',
  },

  undoTextDisabled: {
    color: '#AAA19A',
  },

  memoArea: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
  },

  memoText: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
  },

  memoPlaceholder: {
    marginTop: 12,
    fontSize: 15,
    color: '#AAA19A',
  },

  bottomSpace: {
    height: 30,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },

  historyModal: {
    width: '100%',
    maxHeight: '75%',
    backgroundColor: '#FFFDFC',
    borderRadius: 28,
    padding: 22,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
  },

  closeButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    fontSize: 30,
    fontWeight: '300',
  },

  modalEmptyArea: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalEmptyText: {
    fontSize: 15,
    color: '#AAA19A',
  },

  fullHistoryList: {
    maxHeight: 480,
  },

  fullHistoryRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE6E0',
    paddingVertical: 12,
  },

  fullHistoryCount: {
    fontSize: 18,
    fontWeight: '600',
  },

  fullHistoryType: {
    fontSize: 13,
    color: '#9A918B',
    marginTop: 4,
  },
});