import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BRANDS, CATEGORIES } from '../../constants/brands';
import { useAuth } from '../../src/hooks/useAuth';
import { usePostsFeed } from '../../src/hooks/usePostsFeed';
import { TagChip } from '../../src/components/ui/TagChip';

const FeedScreen = () => {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const {
    posts,
    isLoading,
    errorMessage,
    brandFilter,
    setBrandFilter,
    categoryFilter,
    setCategoryFilter,
    hasActiveFilter,
    clearFilters,
  } = usePostsFeed();

  const brandOptions = useMemo(() => BRANDS.slice().sort(), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Catchu Luxury</Text>
          <Text style={styles.subtitle}>프리미엄 아이템 인사이트 커뮤니티</Text>
        </View>
        <Pressable onPress={signOut}>
          <Text style={styles.logout}>로그아웃</Text>
        </Pressable>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>브랜드</Text>
        <View style={styles.chipWrap}>
          {brandOptions.map((brand) => (
            <TagChip
              key={brand}
              label={brand}
              selected={brandFilter === brand}
              onPress={() => setBrandFilter(brandFilter === brand ? null : brand)}
            />
          ))}
        </View>
        <Text style={styles.sectionTitle}>카테고리</Text>
        <View style={styles.chipWrap}>
          {CATEGORIES.map((category) => (
            <TagChip
              key={category}
              label={category}
              selected={categoryFilter === category}
              onPress={() =>
                setCategoryFilter(categoryFilter === category ? null : category)
              }
            />
          ))}
        </View>
        {hasActiveFilter ? (
          <Pressable onPress={clearFilters} style={styles.clearButton}>
            <Text style={styles.clearText}>필터 초기화</Text>
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#1f1b16" />
        </View>
      ) : errorMessage ? (
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>피드를 불러오는 중 문제가 발생했어요.</Text>
          <Text style={styles.errorBody}>{errorMessage}</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/(app)/post/[id]', params: { id: item.id } })}
              style={styles.card}
            >
              {item.imageUrls?.[0] ? (
                <Image source={{ uri: item.imageUrls[0] }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImage, styles.cardImageFallback]}> 
                  <Text style={styles.cardImageFallbackText}>이미지 준비중</Text>
                </View>
              )}
              <View style={styles.cardContent}>
                <Text style={styles.cardBrand}>{item.brand}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardAuthor}>{item.authorName ?? '익명'}</Text>
                <View style={styles.tagRow}>
                  <Text style={styles.categoryTag}>{item.category}</Text>
                  <Text style={styles.timestamp}>
                    {item.createdAt ? item.createdAt.toLocaleDateString('ko-KR') : '방금 전'}
                  </Text>
                </View>
                <Text numberOfLines={2} style={styles.cardExcerpt}>
                  {item.content}
                </Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: 48 }}>
              <Text style={{ color: '#5c524b', fontSize: 16 }}>아직 게시글이 없어요. 첫 글을 작성해보세요!</Text>
            </View>
          }
        />
      )}

      <Pressable
        onPress={() => router.push('/(app)/post/new')}
        style={styles.fab}
      >
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2ece5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f1b16',
  },
  subtitle: {
    color: '#5c524b',
    fontSize: 13,
  },
  logout: {
    color: '#9a7b50',
    fontWeight: '600',
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ded4c8',
    backgroundColor: '#f6efe8',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3a3127',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  clearButton: {
    alignSelf: 'flex-end',
  },
  clearText: {
    color: '#9a7b50',
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3a3127',
    textAlign: 'center',
  },
  errorBody: {
    fontSize: 14,
    color: '#5c524b',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  card: {
    backgroundColor: '#fffaf2',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eadfce',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ded4c8',
  },
  cardImageFallbackText: {
    color: '#746a63',
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
    gap: 6,
  },
  cardBrand: {
    color: '#9a7b50',
    fontWeight: '700',
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f1b16',
  },
  cardAuthor: {
    color: '#5c524b',
    fontSize: 13,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    fontSize: 12,
    backgroundColor: '#1f1b16',
    color: '#fdf9f4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  timestamp: {
    color: '#746a63',
    fontSize: 12,
  },
  cardExcerpt: {
    color: '#3a3127',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: '#1f1b16',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  fabText: {
    color: '#fdf9f4',
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '400',
  },
});

export default FeedScreen;
