import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CounterScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name?: string;
    memo?: string;
    row?: string;
    stitch?: string;
  }>();

  const [row, setRow] = useState(Number(params.row ?? 0));
  const [stitch, setStitch] = useState(
    Number(params.stitch ?? 0)
  );

  const name = params.name ?? '';
  const memo = params.memo ?? '';

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

          <Text style={styles.projectName} numberOfLines={1}>
            {name}
          </Text>

          <TouchableOpacity style={styles.languageButton}>
            <Text style={styles.languageText}>日 / EN</Text>
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
          >
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>
                最近の履歴
              </Text>

              <Text style={styles.historyArrow}>›</Text>
            </View>

            <Text style={styles.emptyHistory}>
              まだ履歴はありません
            </Text>
          </TouchableOpacity>

          {/* 段 */}
          <View style={styles.counterSection}>
            <Text style={styles.counterNumber}>
              {row}
            </Text>

            <Text style={styles.counterLabel}>
              段
            </Text>

            <TouchableOpacity
              style={styles.plusButton}
              activeOpacity={0.75}
              onPress={() => setRow((current) => current + 1)}
            >
              <Text style={styles.plusText}>＋</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newCountButton}
              activeOpacity={0.8}
            >
              <Text style={styles.newCountText}>
                新しい段
              </Text>
            </TouchableOpacity>
          </View>

          {/* 目 */}
          <View style={styles.counterSection}>
            <Text style={styles.counterNumber}>
              {stitch}
            </Text>

            <Text style={styles.counterLabel}>
              目
            </Text>

            <TouchableOpacity
              style={styles.plusButton}
              activeOpacity={0.75}
              onPress={() =>
                setStitch((current) => current + 1)
              }
            >
              <Text style={styles.plusText}>＋</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newCountButton}
              activeOpacity={0.8}
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
            >
              <Text style={styles.markText}>
                区切り
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.undoButton}
              activeOpacity={0.8}
            >
              <Text style={styles.undoText}>↶</Text>
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
    minHeight: 130,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 18,
    marginTop: 12,
    marginBottom: 24,
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

  emptyHistory: {
    fontSize: 14,
    color: '#AAA19A',
    marginTop: 20,
  },

  counterSection: {
    alignItems: 'center',
    marginBottom: 32,
  },

  counterNumber: {
    fontSize: 62,
    fontWeight: '700',
    lineHeight: 70,
  },

  counterLabel: {
    fontSize: 20,
    marginBottom: 14,
  },

  plusButton: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#D9A3A3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  plusText: {
    fontSize: 56,
    lineHeight: 60,
    fontWeight: '300',
  },

  newCountButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },

  newCountText: {
    fontSize: 15,
    color: '#766E68',
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 30,
  },

  markButton: {
    minWidth: 110,
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
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F2E7DC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  undoText: {
    fontSize: 28,
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
});