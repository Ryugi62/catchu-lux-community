import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
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
import { useAuth } from '../../src/modules/auth';
import { usePostsFeed } from '../../src/modules/posts';
import { TagChip } from '../../src/components/ui/TagChip';
import { colors, radii, shadows, spacing, typography } from '../../src/theme';

const FeedScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    posts,
    isLoading,
    errorMessage,
    loadMore,
    hasMore,
    isFetchingMore,
    refresh,
    brandFilter,
    setBrandFilter,
    categoryFilter,
    setCategoryFilter,
    hasActiveFilter,
    clearFilters,
  } = usePostsFeed();

  const brandOptions = useMemo(() => BRANDS.slice().sort(), []);
  const profileInitial = (user?.displayName || user?.email || 'C').charAt(0).toUpperCase();
  const isRefreshing = isLoading && posts.length > 0;

  useEffect(() => {
    const previewUrls = posts
      .map((post) => post.imageUrls?.[0])
      .filter((url): url is string => typeof url === 'string');
    previewUrls.slice(0, 20).forEach((url) => {
      Image.prefetch(url).catch(() => undefined);
    });
  }, [posts]);

  const renderFooter = () => {
    if (!posts.length) {
      return null;
    }
    if (isFetchingMore) {
      return (
        <View style={styles.listFooter}>
          <ActivityIndicator color={colors.textPrimary} />
        </View>
      );
    }
    if (!hasMore) {
      return (
        <View style={styles.listFooter}>
          <Text style={styles.footerText}>모든 소식을 확인했어요.</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Catchu Luxury</Text>
          <Text style={styles.subtitle}>프리미엄 아이템 인사이트 커뮤니티</Text>
        </View>
        <Pressable
          onPress={() => router.push('/(app)/account')}
          style={styles.profileButton}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>{profileInitial}</Text>
          </View>
          <Text style={styles.profileLabel}>{user?.displayName ?? '계정 설정'}</Text>
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
          <ActivityIndicator size="large" color={colors.textPrimary} />
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
          refreshing={isRefreshing}
          onRefresh={refresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/(app)/post/[id]', params: { id: item.id } })}
              style={styles.card}
            >
              {item.imageUrls?.[0] ? (
                <Image
                  source={{ uri: item.imageUrls[0] }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
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
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>아직 게시글이 없어요. 첫 글을 작성해보세요!</Text>
            </View>
          }
          ListFooterComponent={renderFooter}
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
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    paddingHorizontal: spacing(5),
    paddingTop: spacing(3),
    paddingBottom: spacing(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    ...typography.heading1,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 13,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },
  profileAvatar: {
    width: spacing(6),
    height: spacing(6),
    borderRadius: radii.pill,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: colors.surfacePrimary,
    fontWeight: '700',
  },
  profileLabel: {
    color: colors.accent,
    fontWeight: '600',
  },
  filterSection: {
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(3),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.backgroundSecondary,
    gap: spacing(3),
  },
  sectionTitle: {
    ...typography.label,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  clearButton: {
    alignSelf: 'flex-end',
  },
  clearText: {
    color: colors.accent,
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
    paddingHorizontal: spacing(8),
    gap: spacing(3),
  },
  errorTitle: {
    ...typography.heading2,
    textAlign: 'center',
  },
  errorBody: {
    ...typography.body,
    textAlign: 'center',
  },
  listContent: {
    padding: spacing(5),
    paddingBottom: spacing(30),
    gap: spacing(4),
  },
  listFooter: {
    paddingVertical: spacing(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadows.card,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.borderSubtle,
  },
  cardImageFallbackText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  cardContent: {
    padding: spacing(4),
    gap: spacing(1.5),
  },
  cardBrand: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 14,
  },
  cardTitle: {
    ...typography.heading2,
  },
  cardAuthor: {
    ...typography.caption,
    fontSize: 13,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    fontSize: 12,
    backgroundColor: colors.textPrimary,
    color: colors.surfacePrimary,
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
    borderRadius: radii.pill,
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: 12,
  },
  cardExcerpt: {
    ...typography.body,
  },
  fab: {
    position: 'absolute',
    right: spacing(6),
    bottom: spacing(6),
    width: spacing(14),
    height: spacing(14),
    borderRadius: radii.pill,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.overlay,
  },
  fabText: {
    color: colors.surfacePrimary,
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '400',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing(12),
    gap: spacing(2),
  },
  emptyStateText: {
    ...typography.body,
    textAlign: 'center',
  },
});

export default FeedScreen;
